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

interface AICallResult {
  success: boolean
  text: string
  error: string
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
): Promise<AICallResult> {
  // 判断 API Key 类型
  const isCodingKey = apiKey.startsWith('sk-sp-')
  
  // 根据 Key 类型选择正确的 endpoint
  let baseURL: string
  let model: string
  
  const envModel = getEnv().DEFAULT_MODEL

  if (isCodingKey) {
    baseURL = 'https://coding.dashscope.aliyuncs.com/v1'
    model = envModel || 'qwen-turbo'
  } else {
    baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    model = envModel || 'qwen-plus'
  }
  
  const url = `${baseURL}/chat/completions`
  
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
    
    if (!response.ok) {
      const errorText = await response.text()
      if (isCodingKey && response.status === 405) {
        return await tryModelFallback(apiKey, baseURL, prompt, maxTokens, ['qwen-turbo', 'qwen-max'])
      }
      return {
        success: false,
        text: '',
        error: `API 错误 (${response.status}): ${errorText.substring(0, 200)}`
      }
    }
    
    const data = await response.json() as any
    const text = data.choices?.[0]?.message?.content || ''
    
    return { success: true, text, error: '' }
  } catch (error) {
    return {
      success: false,
      text: '',
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
): Promise<AICallResult> {
  for (const model of models) {
    const url = `${baseURL}/chat/completions`
    
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
      
      if (response.ok) {
        const data = await response.json() as any
        const text = data.choices?.[0]?.message?.content || ''
        return { success: true, text, error: '' }
      }
    } catch {
      // 继续尝试下一个模型
    }
  }
  
  return {
    success: false,
    text: '',
    error: 'Coding Plan Key 无法用于普通聊天。请使用普通的百炼 API Key（以 sk- 开头，不是 sk-sp-）'
  }
}

/**
 * AI 生成 Server Function
 */
export const generateAI = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const env = getEnv()
    
    const input = ctx.data as GenerateAIInput
    const { prompt, maxTokens = 2000 } = input
    
    if (!prompt) {
      return { success: false, text: '', error: '缺少 prompt 参数' }
    }
    
    const apiKey = env.BAILIAN_API_KEY || env.OPENAI_API_KEY
    
    if (!apiKey) {
      return { success: true, text: '（AI 功能需要配置 API Key）', error: '' }
    }
    
    const result = await callBailianAPI(apiKey, prompt, maxTokens)
    
    return result
  })