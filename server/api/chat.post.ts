/**
 * Chat API - 流式对话接口
 * POST /api/chat
 */
import { defineEventHandler, readBody, setResponseHeaders, sendStream } from 'h3'
import { streamDialogue, type DialogueContext } from '../../src/lib/ai/client'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const context = body as DialogueContext

  // 验证必要字段
  if (!context.scene) {
    return { error: 'Missing scene field' }
  }

  try {
    // 获取流式响应
    const result = await streamDialogue(context)
    const stream = result.textStream

    // 设置 SSE 响应头
    setResponseHeaders(event, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    // 创建 TransformStream 用于 SSE 格式
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const textPart of stream) {
            const data = JSON.stringify({ text: textPart })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          const errorData = JSON.stringify({ error: 'Stream error' })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      },
    })

    return sendStream(event, readable)
  } catch (error) {
    console.error('Chat API error:', error)
    return { error: 'Internal server error' }
  }
})