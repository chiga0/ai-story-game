/**
 * AI 剧本生成 API
 * 服务端路由，使用 Cloudflare Workers 环境变量
 */
import { createAPIFileRoute } from '@tanstack/react-start/api'

/**
 * 获取 Cloudflare 环境变量
 * Nitro 在 Cloudflare Workers 中使用 globalThis.__env__ 存储环境变量
 */
function getCloudflareEnv(): Record<string, string | undefined> {
  // @ts-ignore - Nitro 在 Cloudflare Workers 中的环境变量存储方式
  if (globalThis.__env__) {
    // @ts-ignore
    return globalThis.__env__
  }
  return process.env as Record<string, string | undefined>
}

/**
 * 直接调用百炼 API
 */
async function callBailianAPI(
  apiKey: string,
  baseURL: string,
  prompt: string,
  maxTokens: number
): Promise<{ success: boolean; text?: string; error?: string }> {
  const url = `${baseURL}/chat/completions`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.8,
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `API 错误 (${response.status}): ${errorText.substring(0, 100)}`
      }
    }
    
    const data = await response.json() as any
    const text = data.choices?.[0]?.message?.content || ''
    
    return { success: true, text }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败'
    }
  }
}

export const APIRoute = createAPIFileRoute('/api/ai/generate')({
  POST: async ({ request }) => {
    const env = getCloudflareEnv()
    
    const apiKey = env.BAILIAN_API_KEY || env.OPENAI_API_KEY
    const baseURL = env.BAILIAN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'API Key 未配置。请在 Cloudflare Dashboard 设置 BAILIAN_API_KEY secret。'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    try {
      const body = await request.json()
      const { prompt, maxTokens = 4000 } = body as { prompt: string; maxTokens?: number }
      
      if (!prompt) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少 prompt 参数'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      const result = await callBailianAPI(apiKey, baseURL, prompt, maxTokens)
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '请求处理失败'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
})