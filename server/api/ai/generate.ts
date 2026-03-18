import { eventHandler, readBody, getHeader } from 'h3'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export default eventHandler(async (event) => {
  // Cloudflare Workers 环境变量
  // @ts-ignore
  const env = event.context?.cloudflare?.env || {}
  
  const apiKey = env.BAILIAN_API_KEY || env.OPENAI_API_KEY
  const baseURL = env.BAILIAN_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1'
  
  if (!apiKey) {
    return {
      success: false,
      error: 'API Key 未配置。请在 Cloudflare Dashboard 设置 BAILIAN_API_KEY secret。'
    }
  }
  
  try {
    const body = await readBody(event)
    const { prompt, maxTokens = 2000 } = body
    
    if (!prompt) {
      return { success: false, error: '缺少 prompt 参数' }
    }
    
    const client = createOpenAI({ apiKey, baseURL })
    const model = client('glm-5-plus')
    
    const { text } = await generateText({ model, prompt, maxTokens })
    
    return { success: true, text }
  } catch (error) {
    console.error('AI generate error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI 生成失败'
    }
  }
})