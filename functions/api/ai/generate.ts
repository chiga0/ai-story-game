/**
 * AI 剧本生成 API
 * Cloudflare Pages Functions 路由
 * 通过 /api/ai/generate 访问
 */
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

interface Env {
  BAILIAN_API_KEY: string
  OPENAI_API_KEY?: string
  BAILIAN_BASE_URL: string
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  const env = context.env
  
  const apiKey = env.BAILIAN_API_KEY || env.OPENAI_API_KEY
  const baseURL = env.BAILIAN_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1'
  
  if (!apiKey) {
    return new Response(JSON.stringify({
      success: false,
      error: 'API Key 未配置。请在 Cloudflare Dashboard 设置 BAILIAN_API_KEY secret。'
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  try {
    const body = await context.request.json() as { prompt?: string; maxTokens?: number }
    const { prompt, maxTokens = 2000 } = body
    
    if (!prompt) {
      return new Response(JSON.stringify({ success: false, error: '缺少 prompt 参数' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const client = createOpenAI({ apiKey, baseURL })
    const model = client('glm-5-plus')
    
    const { text } = await generateText({ model, prompt, maxTokens })
    
    return new Response(JSON.stringify({ success: true, text }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('AI generate error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'AI 生成失败'
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}