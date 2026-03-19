/**
 * AI Server Functions
 * 
 * 百炼 API 调用说明：
 * 1. Coding Plan Key (sk-sp-...): 只能用于 coding.dashscope.aliyuncs.com
 * 2. 普通 Key (sk-...): 用于 dashscope.aliyuncs.com/compatible-mode/v1
 */
import { createServerFn } from '@tanstack/react-start'

interface GenerateAIInput {
  prompt: string
  maxTokens?: number
}

/**
 * 获取 Cloudflare 环境变量
 */
function getEnv(): Record<string, string | undefined> {
  // @ts-ignore
  if (globalThis.__env__) {
    // @ts-ignore
    return globalThis.__env__
  }
  return process.env as Record<string, string | undefined>
}

/**
 * 调用百炼 AI API
 */
async function callBailianAPI(
  apiKey: string,
  prompt: string,
  maxTokens: number
): Promise<{ success: boolean; text?: string; error?: string }> {
  // 判断 API Key 类型
  const isCodingKey = apiKey.startsWith('sk-sp-')
  
  // 根据 Key 类型选择正确的 endpoint
  let baseURL: string
  let model: string
  
  if (isCodingKey) {
    // Coding Plan Key: 使用 coding endpoint
    // 尝试多种可能的模型名称
    baseURL = 'https://coding.dashscope.aliyuncs.com/v1'
    model = 'qwen-plus' // 或 'qwen-turbo', 'qwen-max'
    console.log('[AI Server] Using Coding Plan endpoint')
  } else {
    // 普通 Key: 使用 OpenAI 兼容 endpoint
    baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    model = 'qwen-plus'
    console.log('[AI Server] Using standard endpoint')
  }
  
  const url = `${baseURL}/chat/completions`
  
  console.log('[AI Server] Request config:', {
    keyType: isCodingKey ? 'coding' : 'standard',
    baseURL,
    model,
    url
  })
  
  try {
    const response = await fetch(url, {
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
    })
    
    console.log('[AI Server] Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[AI Server] API error:', errorText.substring(0, 500))
      
      // 如果 Coding Plan Key 用标准模型失败，尝试 qwen-turbo
      if (isCodingKey && response.status === 405) {
        console.log('[AI Server] Trying qwen-turbo model...')
        return await tryModelFallback(apiKey, baseURL, prompt, maxTokens, ['qwen-turbo', 'qwen-max', 'glm-5-plus'])
      }
      
      return {
        success: false,
        error: `API 错误 (${response.status}): ${errorText.substring(0, 200)}`
      }
    }
    
    const data = await response.json() as any
    const text = data.choices?.[0]?.message?.content || ''
    
    console.log('[AI Server] Success! Text length:', text.length)
    return { success: true, text }
  } catch (error) {
    console.error('[AI Server] Fetch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败'
    }
  }
}

/**
 * 尝试不同的模型作为后备
 */
async function tryModelFallback(
  apiKey: string,
  baseURL: string,
  prompt: string,
  maxTokens: number,
  models: string[]
): Promise<{ success: boolean; text?: string; error?: string }> {
  for (const model of models) {
    const url = `${baseURL}/chat/completions`
    
    console.log(`[AI Server] Trying model: ${model}`)
    
    try {
      const response = await fetch(url, {
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
      })
      
      console.log(`[AI Server] Model ${model} response:`, response.status)
      
      if (response.ok) {
        const data = await response.json() as any
        const text = data.choices?.[0]?.message?.content || ''
        console.log(`[AI Server] Success with model ${model}!`)
        return { success: true, text }
      }
    } catch (error) {
      console.log(`[AI Server] Model ${model} failed:`, error)
    }
  }
  
  return {
    success: false,
    error: 'Coding Plan Key 无法用于普通聊天。请使用普通的百炼 API Key（以 sk- 开头，不是 sk-sp-）'
  }
}

/**
 * AI 生成 Server Function
 */
export const generateAI = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const env = getEnv()
    const envKeys = Object.keys(env)
    
    console.log('[AI Server] ===== Request Start =====')
    console.log('[AI Server] Available env keys:', envKeys.join(', '))
    
    const input = ctx.data as GenerateAIInput
    const { prompt, maxTokens = 2000 } = input
    
    console.log('[AI Server] Input prompt length:', prompt?.length)
    
    if (!prompt) {
      return { success: false, error: '缺少 prompt 参数' }
    }
    
    const apiKey = env.BAILIAN_API_KEY || env.OPENAI_API_KEY
    const configuredBaseURL = env.BAILIAN_BASE_URL
    
    console.log('[AI Server] Config:', { 
      hasApiKey: !!apiKey, 
      apiKeyPrefix: apiKey?.substring(0, 10) + '...',
      configuredBaseURL
    })
    
    if (!apiKey) {
      return {
        success: true,
        text: `（AI 功能需要配置 API Key）`
      }
    }
    
    return await callBailianAPI(apiKey, prompt, maxTokens)
  })