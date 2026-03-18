/**
 * NPC 记忆系统测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  NPCMemoryManager,
  getNPCMemoryManager,
  resetNPCMemoryManager,
  createInteraction,
  analyzeSentiment,
  analyzeChoiceType,
  getRelationshipTier,
  getRelationshipTierText,
  getRelationshipTierColor,
  recordNPCInteraction,
  getNPCRelationshipText,
  type RelationshipTier,
} from '#/lib/game/npc-memory'

describe('NPCMemoryManager', () => {
  let manager: NPCMemoryManager

  beforeEach(() => {
    resetNPCMemoryManager()
    manager = getNPCMemoryManager()
  })

  describe('initNPCMemory', () => {
    it('should initialize NPC memory with default values', () => {
      const memory = manager.initNPCMemory('npc-1')

      expect(memory.npcId).toBe('npc-1')
      expect(memory.playerInteractions).toEqual([])
      expect(memory.relationshipLevel).toBe(0)
      expect(memory.rememberedChoices).toEqual([])
      expect(memory.currentMood).toBe('neutral')
      expect(memory.trustLevel).toBe(50)
    })

    it('should return existing memory if already initialized', () => {
      manager.initNPCMemory('npc-1')
      manager.updateRelationship('npc-1', 10)

      const memory = manager.initNPCMemory('npc-1')
      expect(memory.relationshipLevel).toBe(10)
    })

    it('should accept custom personality traits', () => {
      const memory = manager.initNPCMemory('npc-1', ['friendly', 'helpful'])
      expect(memory.personalityTraits).toEqual(['friendly', 'helpful'])
    })
  })

  describe('addInteraction', () => {
    it('should add positive interaction and update relationship', () => {
      manager.initNPCMemory('npc-1')
      const interaction = createInteraction('scene-1', '友善地问候', '你好！')

      manager.addInteraction('npc-1', interaction)

      const memory = manager.getMemory('npc-1')
      expect(memory?.playerInteractions.length).toBe(1)
      expect(memory?.relationshipLevel).toBeGreaterThan(0)
      // Single positive interaction might not change mood to happy immediately
      expect(['neutral', 'happy']).toContain(memory?.currentMood)
    })

    it('should add negative interaction and update relationship', () => {
      manager.initNPCMemory('npc-1')
      const interaction = createInteraction('scene-1', '攻击对方', '...')

      manager.addInteraction('npc-1', interaction)

      const memory = manager.getMemory('npc-1')
      expect(memory?.playerInteractions.length).toBe(1)
      expect(memory?.relationshipLevel).toBeLessThan(0)
    })

    it('should remember important choices', () => {
      manager.initNPCMemory('npc-1')

      manager.addInteraction('npc-1', {
        sceneId: 'scene-1',
        timestamp: Date.now(),
        playerChoice: '帮助他解决问题',
        npcResponse: '谢谢你！',
        sentiment: 'positive',
      })

      const memory = manager.getMemory('npc-1')
      expect(memory?.rememberedChoices).toContain('帮助他解决问题')
    })

    it('should limit number of interactions', () => {
      manager = new NPCMemoryManager({ maxInteractionsPerNPC: 10 })
      manager.initNPCMemory('npc-1')

      for (let i = 0; i < 20; i++) {
        manager.addInteraction('npc-1', {
          sceneId: `scene-${i}`,
          timestamp: Date.now(),
          playerChoice: `choice-${i}`,
          npcResponse: `response-${i}`,
          sentiment: 'neutral',
        })
      }

      const memory = manager.getMemory('npc-1')
      expect(memory?.playerInteractions.length).toBeLessThanOrEqual(10)
    })
  })

  describe('updateRelationship', () => {
    it('should increase relationship', () => {
      manager.initNPCMemory('npc-1')
      manager.updateRelationship('npc-1', 10)

      const memory = manager.getMemory('npc-1')
      expect(memory?.relationshipLevel).toBe(10)
    })

    it('should not exceed maximum relationship', () => {
      manager.initNPCMemory('npc-1')
      manager.updateRelationship('npc-1', 150)

      const memory = manager.getMemory('npc-1')
      expect(memory?.relationshipLevel).toBe(100)
    })

    it('should not go below minimum relationship', () => {
      manager.initNPCMemory('npc-1')
      manager.updateRelationship('npc-1', -150)

      const memory = manager.getMemory('npc-1')
      expect(memory?.relationshipLevel).toBe(-100)
    })
  })

  describe('getRelevantMemories', () => {
    it('should return relevant memories based on context', () => {
      manager.initNPCMemory('npc-1')

      manager.addInteraction('npc-1', {
        sceneId: 'scene-1',
        timestamp: Date.now() - 10000,
        playerChoice: '询问关于宝藏的事',
        npcResponse: '宝藏藏在山洞里',
        sentiment: 'neutral',
      })

      manager.addInteraction('npc-1', {
        sceneId: 'scene-2',
        timestamp: Date.now(),
        playerChoice: '继续追问宝藏',
        npcResponse: '我只能告诉你这么多了',
        sentiment: 'neutral',
      })

      const memories = manager.getRelevantMemories('npc-1', '宝藏')
      expect(memories.length).toBeGreaterThan(0)
    })
  })

  describe('getMemoryContext', () => {
    it('should return null for non-existent NPC', () => {
      const context = manager.getMemoryContext('non-existent', 'NPC', 'friendly')
      expect(context).toBeNull()
    })

    it('should return memory context with all fields', () => {
      manager.initNPCMemory('npc-1')
      manager.updateRelationship('npc-1', 30)

      const context = manager.getMemoryContext('npc-1', '管家', '忠诚、谨慎')

      expect(context).not.toBeNull()
      expect(context?.npcId).toBe('npc-1')
      expect(context?.npcName).toBe('管家')
      expect(context?.relationshipTier).toBe('friendly')
      expect(context?.dialogueStyleSuggestion).toContain('热情')
    })
  })

  describe('serialization', () => {
    it('should serialize and deserialize memories', () => {
      manager.initNPCMemory('npc-1')
      manager.updateRelationship('npc-1', 20)
      // Don't add interaction - it will change the relationship

      const serialized = manager.serialize()

      const newManager = new NPCMemoryManager()
      newManager.deserialize(serialized)

      const memory = newManager.getMemory('npc-1')
      expect(memory?.relationshipLevel).toBe(20)
    })
  })
})

describe('analyzeSentiment', () => {
  it('should detect positive sentiment', () => {
    expect(analyzeSentiment('友善地帮助他')).toBe('positive')
    expect(analyzeSentiment('感谢你的帮助')).toBe('positive')
    expect(analyzeSentiment('我信任你')).toBe('positive')
  })

  it('should detect negative sentiment', () => {
    expect(analyzeSentiment('攻击他')).toBe('negative')
    expect(analyzeSentiment('充满敌意地看着')).toBe('negative')
    expect(analyzeSentiment('威胁他')).toBe('negative')
  })

  it('should return neutral for unclear sentiment', () => {
    expect(analyzeSentiment('观察周围')).toBe('neutral')
    expect(analyzeSentiment('等待')).toBe('neutral')
  })
})

describe('analyzeChoiceType', () => {
  it('should detect friendly choice', () => {
    expect(analyzeChoiceType('友善地问候')).toBe('friendly')
    expect(analyzeChoiceType('帮助他')).toBe('friendly')
  })

  it('should detect hostile choice', () => {
    expect(analyzeChoiceType('攻击敌人')).toBe('hostile')
    expect(analyzeChoiceType('威胁他')).toBe('hostile')
  })

  it('should detect helpful choice', () => {
    expect(analyzeChoiceType('帮忙处理')).toBe('helpful')
    expect(analyzeChoiceType('协助他')).toBe('helpful')
  })

  it('should detect selfish choice', () => {
    expect(analyzeChoiceType('欺骗他')).toBe('selfish')
    expect(analyzeChoiceType('背叛他')).toBe('selfish')
  })
})

describe('getRelationshipTier', () => {
  it('should return correct tiers', () => {
    expect(getRelationshipTier(-80)).toBe('hostile')
    expect(getRelationshipTier(-40)).toBe('unfriendly')
    expect(getRelationshipTier(0)).toBe('neutral')
    expect(getRelationshipTier(40)).toBe('friendly')
    expect(getRelationshipTier(80)).toBe('close')
  })
})

describe('getRelationshipTierText', () => {
  it('should return Chinese text for tiers', () => {
    expect(getRelationshipTierText('hostile')).toBe('敌对')
    expect(getRelationshipTierText('unfriendly')).toBe('不友好')
    expect(getRelationshipTierText('neutral')).toBe('中立')
    expect(getRelationshipTierText('friendly')).toBe('友好')
    expect(getRelationshipTierText('close')).toBe('亲密')
  })
})

describe('getRelationshipTierColor', () => {
  it('should return color codes for tiers', () => {
    expect(getRelationshipTierColor('hostile')).toMatch(/^#/)
    expect(getRelationshipTierColor('friendly')).toMatch(/^#/)
  })
})

describe('createInteraction', () => {
  it('should create interaction with analyzed sentiment', () => {
    const interaction = createInteraction('scene-1', '帮助他', '谢谢！')

    expect(interaction.sceneId).toBe('scene-1')
    expect(interaction.playerChoice).toBe('帮助他')
    expect(interaction.npcResponse).toBe('谢谢！')
    expect(interaction.sentiment).toBe('positive')
    expect(interaction.choiceType).toBe('friendly')
    expect(interaction.timestamp).toBeGreaterThan(0)
  })
})

describe('recordNPCInteraction', () => {
  beforeEach(() => {
    resetNPCMemoryManager()
  })

  it('should record interaction using convenience function', () => {
    recordNPCInteraction('npc-1', 'scene-1', '帮助', '谢谢')

    const manager = getNPCMemoryManager()
    const memory = manager.getMemory('npc-1')

    expect(memory).not.toBeNull()
    expect(memory?.playerInteractions.length).toBe(1)
  })
})

describe('getNPCRelationshipText', () => {
  beforeEach(() => {
    resetNPCMemoryManager()
  })

  it('should return "陌生" for unknown NPC', () => {
    expect(getNPCRelationshipText('unknown')).toBe('陌生')
  })

  it('should return relationship tier text for known NPC', () => {
    const manager = getNPCMemoryManager()
    manager.initNPCMemory('npc-1')
    manager.updateRelationship('npc-1', 50)

    expect(getNPCRelationshipText('npc-1')).toBe('友好')
  })
})