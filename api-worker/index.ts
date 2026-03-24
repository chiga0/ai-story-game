/**
 * AI Story Game - API Worker
 * 独立的 API Worker，处理 AI 文本生成和图片生成
 */

export interface Env {
  BAILIAN_API_KEY: string
  BAILIAN_BASE_URL: string
}

interface GenerateRequest {
  prompt: string
  maxTokens?: number
}

interface ImageRequest {
  prompt: string
  size?: string
  n?: number
  style?: string
}

// 超时配置
const TEXT_TIMEOUT = 60000 // 文本生成 60 秒超时
const IMAGE_TIMEOUT = 90000 // 图片生成 90 秒超时
const IMAGE_POLL_INTERVAL = 1500 // 图片轮询间隔 1.5 秒
const IMAGE_POLL_MAX = 30 // 最多轮询 30 次

/**
 * 带超时的 fetch
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * 调用百炼文本 API
 */
async function generateText(apiKey: string, prompt: string, maxTokens: number): Promise<Response> {
  const isCodingKey = apiKey.startsWith('sk-sp-')
  const baseURL = isCodingKey 
    ? 'https://coding.dashscope.aliyuncs.com/v1'
    : 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  const model = isCodingKey ? 'qwen-turbo' : 'qwen-plus'
  
  try {
    const response = await fetchWithTimeout(
      `${baseURL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      },
      TEXT_TIMEOUT
    )
    
    if (!response.ok) {
      const error = await response.text()
      return json({ success: false, text: '', error: `API 错误: ${response.status}` }, 500)
    }
    
    const data = await response.json() as any
    const text = data.choices?.[0]?.message?.content || ''
    return json({ success: true, text, error: '' })
  } catch (error: any) {
    // 区分超时和其他错误
    if (error?.name === 'AbortError') {
      return json({ success: false, text: '', error: '请求超时，请稍后重试' }, 504)
    }
    return json({ success: false, text: '', error: String(error) }, 500)
  }
}

/**
 * 调用通义万相图片生成 API
 */
async function generateImage(apiKey: string, req: ImageRequest): Promise<Response> {
  const { prompt, size = '720*1280', n = 1, style = '<auto>' } = req
  
  try {
    // 创建异步任务
    const response = await fetchWithTimeout(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-DashScope-Async': 'enable',
        },
        body: JSON.stringify({
          model: 'wanx2.1-t2i-turbo',
          input: { prompt },
          parameters: { size, n, style },
        }),
      },
      30000 // 创建任务 30 秒超时
    )
    
    if (!response.ok) {
      const error = await response.text()
      return json({ success: false, error: `API 错误: ${response.status}` }, 500)
    }
    
    const data = await response.json() as any
    
    // 轮询获取结果
    if (data.output?.task_id) {
      const imageUrl = await pollImageTask(apiKey, data.output.task_id)
      if (imageUrl) {
        return json({ success: true, imageUrl })
      }
      return json({ success: false, error: '图片生成超时，请稍后重试' }, 504)
    }
    
    // 同步返回
    if (data.output?.results?.[0]?.url) {
      return json({ success: true, imageUrl: data.output.results[0].url })
    }
    
    return json({ success: false, error: 'API 返回格式异常' }, 500)
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return json({ success: false, error: '请求超时，请稍后重试' }, 504)
    }
    return json({ success: false, error: String(error) }, 500)
  }
}

/**
 * 轮询图片任务
 */
async function pollImageTask(apiKey: string, taskId: string, maxAttempts = IMAGE_POLL_MAX): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, IMAGE_POLL_INTERVAL))
    
    try {
      const response = await fetchWithTimeout(
        `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
        {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        },
        10000 // 轮询请求 10 秒超时
      )
      
      if (!response.ok) continue
      
      const data = await response.json() as any
      const status = data.output?.task_status
      
      if (status === 'SUCCEEDED') {
        return data.output?.results?.[0]?.url || null
      }
      if (status === 'FAILED') {
        console.error('图片生成失败:', data.output?.message)
        return null
      }
    } catch {
      continue
    }
  }
  return null
}

/**
 * JSON 响应辅助函数
 */
function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

/**
 * Worker 入口
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }
    
    const url = new URL(request.url)
    const apiKey = env.BAILIAN_API_KEY
    
    if (!apiKey) {
      return json({ success: false, error: 'API Key 未配置' }, 500)
    }
    
    // 路由处理
    if (url.pathname === '/api/generate' && request.method === 'POST') {
      const body = await request.json() as GenerateRequest
      if (!body.prompt) {
        return json({ success: false, text: '', error: '缺少 prompt 参数' }, 400)
      }
      return generateText(apiKey, body.prompt, body.maxTokens || 2000)
    }
    
    if (url.pathname === '/api/image' && request.method === 'POST') {
      const body = await request.json() as ImageRequest
      if (!body.prompt) {
        return json({ success: false, error: '缺少 prompt 参数' }, 400)
      }
      return generateImage(apiKey, body)
    }
    
    // 健康检查
    if (url.pathname === '/health') {
      return json({ status: 'ok', hasApiKey: !!apiKey })
    }
    
    return json({ error: 'Not Found' }, 404)
  },
}