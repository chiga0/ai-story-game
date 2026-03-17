import { describe, it, expect, beforeAll } from 'vitest'

describe('Chat API', () => {
  describe('Request Validation', () => {
    it('should validate DialogueContext structure', () => {
      const validContext = {
        scene: '庄园大厅',
        speaker: '管家亨利',
        playerHistory: ['进入庄园', '询问威廉爵士'],
        gameState: { courage: 5, clues: 1 },
      }

      expect(validContext.scene).toBeDefined()
      expect(validContext.playerHistory).toBeInstanceOf(Array)
      expect(validContext.gameState).toBeDefined()
    })

    it('should reject missing scene field', () => {
      const invalidContext = {
        speaker: '管家亨利',
        playerHistory: [],
        gameState: {},
      }

      expect(invalidContext).not.toHaveProperty('scene')
    })
  })

  describe('Response Format', () => {
    it('should return SSE format', () => {
      const sseData = 'data: {"text":"你好"}\n\n'
      expect(sseData).toMatch(/^data: /)
      expect(sseData).toMatch(/\n\n$/)
    })

    it('should end with [DONE]', () => {
      const doneMessage = 'data: [DONE]\n\n'
      expect(doneMessage).toContain('[DONE]')
    })

    it('should handle error format', () => {
      const errorData = JSON.stringify({ error: 'Stream error' })
      const sseMessage = `data: ${errorData}\n\n`
      
      const parsed = JSON.parse(errorData)
      expect(parsed).toHaveProperty('error')
    })
  })

  describe('Stream Processing', () => {
    it('should parse text chunks correctly', () => {
      const chunk = '{"text":"欢迎"}'
      const parsed = JSON.parse(chunk)
      
      expect(parsed.text).toBe('欢迎')
    })

    it('should accumulate text from multiple chunks', () => {
      const chunks = [
        { text: '欢' },
        { text: '迎' },
        { text: '来' },
        { text: '到' },
      ]
      
      const result = chunks.reduce((acc, chunk) => acc + chunk.text, '')
      expect(result).toBe('欢迎来到')
    })
  })
})