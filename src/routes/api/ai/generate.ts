/**
 * AI 剧本生成 API
 * 服务端路由，可以访问 Cloudflare Workers 的环境变量
 */
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export const APIRoute = createAPIFileRoute('/api/ai/generate')({
  POST: async ({ request, env }) => {
    // 在 Cloudflare Workers 中，环境变量通过 env 访问
    // @ts-ignore
    const cfEnv = env || {}
    
    const apiKey = cfEnv.BAILIAN_API_KEY || cfEnv.OPENAI_API_KEY
    const baseURL = cfEnv.BAILIAN_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1'
    
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'API Key 未配置'
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    try {
      const body = await request.json()
      const { prompt, maxTokens = 2000 } = body as { prompt: string; maxTokens?: number }
      
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
      
      return new Response(JSON.stringify({
        success: true,
        text
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '生成失败'
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
})