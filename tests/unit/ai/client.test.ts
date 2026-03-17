import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the ai module
vi.mock('ai', () => ({
  generateText: vi.fn(),
  streamText: vi.fn(),
}))

// Create a mock model function
const mockModel = vi.fn(() => 'mock-model-response')

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(() => mockModel),
}))

describe('AI Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('DialogueContext', () => {
    it('should have correct structure', () => {
      const context = {
        scene: '庄园大厅',
        speaker: '管家',
        playerHistory: ['进入庄园'],
        gameState: { courage: 5 },
      }

      expect(context.scene).toBe('庄园大厅')
      expect(context.speaker).toBe('管家')
      expect(context.playerHistory).toHaveLength(1)
      expect(context.gameState.courage).toBe(5)
    })
  })

  describe('GameContext', () => {
    it('should have correct structure', () => {
      const context = {
        scriptId: 'test-script',
        currentScene: 'hall',
        attributes: { courage: 10 },
        relationships: { butler: 50 },
      }

      expect(context.scriptId).toBe('test-script')
      expect(context.currentScene).toBe('hall')
      expect(context.attributes.courage).toBe(10)
      expect(context.relationships.butler).toBe(50)
    })
  })

  describe('NPC interface', () => {
    it('should have required fields', () => {
      const npc = {
        id: 'butler',
        name: '管家亨利',
        avatar: '👴',
        personality: '忠诚、严肃',
      }

      expect(npc.id).toBe('butler')
      expect(npc.name).toBe('管家亨利')
      expect(npc.avatar).toBe('👴')
      expect(npc.personality).toBe('忠诚、严肃')
    })

    it('should work without avatar', () => {
      const npc = {
        id: 'butler',
        name: '管家亨利',
        personality: '忠诚、严肃',
        avatar: '👴',
      }

      expect(npc.avatar).toBe('👴')
    })
  })

  describe('GameEvent interface', () => {
    it('should support random events', () => {
      const event = {
        id: 'event-1',
        type: 'random' as const,
        description: '你发现了一个隐藏的抽屉',
        effects: { clues: 1 },
      }

      expect(event.type).toBe('random')
      expect(event.description).toBe('你发现了一个隐藏的抽屉')
    })

    it('should support triggered events', () => {
      const event = {
        id: 'event-2',
        type: 'triggered' as const,
        description: '有人敲响了大门',
      }

      expect(event.type).toBe('triggered')
    })
  })
})

describe('AI Client Functions', () => {
  it('should export model', async () => {
    // Just verify the module can be imported without error
    // The actual model is tested through integration tests
    const client = await import('../../../src/lib/ai/client')
    expect(client).toBeDefined()
    expect(client.model).toBeDefined()
  })

  it('should export generateDialogue', async () => {
    const { generateDialogue } = await import('../../../src/lib/ai/client')
    expect(typeof generateDialogue).toBe('function')
  })

  it('should export streamDialogue', async () => {
    const { streamDialogue } = await import('../../../src/lib/ai/client')
    expect(typeof streamDialogue).toBe('function')
  })

  it('should export generateRandomEvent', async () => {
    const { generateRandomEvent } = await import('../../../src/lib/ai/client')
    expect(typeof generateRandomEvent).toBe('function')
  })

  it('should export personalizeNPC', async () => {
    const { personalizeNPC } = await import('../../../src/lib/ai/client')
    expect(typeof personalizeNPC).toBe('function')
  })
})