/**
 * AI Server Functions
 * 使用 TanStack Start 的 createServerFn 实现 AI 调用
 */
import { createServerFn } from '@tanstack/react-start'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

/**
 * AI 生成 Server Function
 * 通过 /serverfn/ai/generate 访问
 */
export const generateAI = createServerFn({ method: 'POST' })
  .validator((data: { prompt: string; maxTokens?: number }) => {
    if (!data.prompt) throw new Error('缺少 prompt 参数')
    return data
  })
  .handler(async (ctx) => {
    const { prompt, maxTokens = 2000 } = ctx.data
    
    // 从环境变量获取 API Key
    const apiKey = process.env.BAILIAN_API_KEY || process.env.OPENAI_API_KEY
    const baseURL = process.env.BAILIAN_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1'
    
    if (!apiKey) {
      return {
        success: false,
        error: 'API Key 未配置。请在 Cloudflare Dashboard 设置 BAILIAN_API_KEY secret。'
      }
    }
    
    try {
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
