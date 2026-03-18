/**
 * AI 剧本生成 API
 * 服务端路由，可以访问 Cloudflare Workers 的环境变量
 */
import { defineEventHandler, readBody, getHeader } from 'h3'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export default defineEventHandler(async (event) => {
  // 在 Cloudflare Workers 中，环境变量通过 event.context.cloudflare.env 访问
  // @ts-ignore
  const env = event.context?.cloudflare?.env || {}
  
  const apiKey = env.BAILIAN_API_KEY || env.OPENAI_API_KEY
  const baseURL = env.BAILIAN_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1'
  
  if (!apiKey) {
    return {
      success: false,
      error: 'API Key 未配置'
    }
  }
  
  const body = await readBody(event)
  const { prompt, maxTokens = 2000 } = body
  
  try {
    const client = createOpenAI({
      apiKey,
      baseURL,
    })
    
    const model = client('glm-5-plus')
    
    const { text } = await generateText({
      model,
      prompt,
      maxTokens,
    })
    
    return {
      success: true,
      text
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '生成失败'
    }
  }
})