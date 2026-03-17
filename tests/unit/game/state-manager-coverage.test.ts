import { describe, it, expect } from 'vitest'
import {
  applyEffects,
  evaluateCondition,
  checkEnding,
  createInitialState,
  cloneState,
  type GameState,
  type Effect,
  type Condition,
  type Ending,
} from '../../../src/lib/game/state-manager'

describe('State Manager - 覆盖率补充测试', () => {
  describe('applyEffects - Branch 覆盖', () => {
    const createState = (attrs = {}, rels = {}): GameState => ({
      scriptId: 'test',
      currentScene: 'start',
      attributes: attrs,
      relationships: rels,
      history: [],
      startTime: Date.now(),
    })

    it('应该处理空效果列表', () => {
      const state = createState()
      const result = applyEffects(state, [])
      expect(result).toEqual(state)
    })

    it('应该处理属性增加效果', () => {
      const state = createState({ health: 50 })
      const effects: Effect[] = [
        { attribute: 'health', change: 10 },
      ]
      const result = applyEffects(state, effects)
      expect(result.attributes.health).toBe(60)
    })

    it('应该处理属性减少效果', () => {
      const state = createState({ health: 50 })
      const effects: Effect[] = [
        { attribute: 'health', change: -20 },
      ]
      const result = applyEffects(state, effects)
      expect(result.attributes.health).toBe(30)
    })

    it('应该处理创建新属性', () => {
      const state = createState()
      const effects: Effect[] = [
        { attribute: 'courage', change: 5 },
      ]
      const result = applyEffects(state, effects)
      expect(result.attributes.courage).toBe(5)
    })

    it('应该处理关系增加效果', () => {
      const state = createState({}, { npc1: 0 })
      const effects: Effect[] = [
        { relationship: { charId: 'npc1', change: 10 } },
      ]
      const result = applyEffects(state, effects)
      expect(result.relationships.npc1).toBe(10)
    })

    it('应该处理关系减少效果', () => {
      const state = createState({}, { npc1: 50 })
      const effects: Effect[] = [
        { relationship: { charId: 'npc1', change: -20 } },
      ]
      const result = applyEffects(state, effects)
      expect(result.relationships.npc1).toBe(30)
    })

    it('应该处理创建新关系', () => {
      const state = createState()
      const effects: Effect[] = [
        { relationship: { charId: 'newNpc', change: 15 } },
      ]
      const result = applyEffects(state, effects)
      expect(result.relationships.newNpc).toBe(15)
    })

    it('应该同时处理多个效果', () => {
      const state = createState({ health: 50 }, { npc1: 30 })
      const effects: Effect[] = [
        { attribute: 'health', change: 10 },
        { attribute: 'mana', change: 5 },
        { relationship: { charId: 'npc1', change: 10 } },
        { relationship: { charId: 'npc2', change: -5 } },
      ]
      const result = applyEffects(state, effects)
      expect(result.attributes.health).toBe(60)
      expect(result.attributes.mana).toBe(5)
      expect(result.relationships.npc1).toBe(40)
      expect(result.relationships.npc2).toBe(-5)
    })
  })

  describe('evaluateCondition - Branch 覆盖', () => {
    const createState = (attrs = {}): GameState => ({
      scriptId: 'test',
      currentScene: 'start',
      attributes: attrs,
      relationships: {},
      history: [],
      startTime: Date.now(),
    })

    it('无条件时应该返回 true', () => {
      const state = createState()
      expect(evaluateCondition(state, {} as Condition)).toBe(true)
    })

    it('min 条件满足时应该返回 true', () => {
      const state = createState({ courage: 60 })
      const condition: Condition = { attribute: 'courage', min: 50 }
      expect(evaluateCondition(state, condition)).toBe(true)
    })

    it('min 条件不满足时应该返回 false', () => {
      const state = createState({ courage: 40 })
      const condition: Condition = { attribute: 'courage', min: 50 }
      expect(evaluateCondition(state, condition)).toBe(false)
    })

    it('max 条件满足时应该返回 true', () => {
      const state = createState({ fear: 30 })
      const condition: Condition = { attribute: 'fear', max: 50 }
      expect(evaluateCondition(state, condition)).toBe(true)
    })

    it('max 条件不满足时应该返回 false', () => {
      const state = createState({ fear: 60 })
      const condition: Condition = { attribute: 'fear', max: 50 }
      expect(evaluateCondition(state, condition)).toBe(false)
    })

    it('min 和 max 同时满足时应该返回 true', () => {
      const state = createState({ health: 50 })
      const condition: Condition = { attribute: 'health', min: 30, max: 70 }
      expect(evaluateCondition(state, condition)).toBe(true)
    })

    it('min 和 max 部分不满足时应该返回 false', () => {
      const state = createState({ health: 80 })
      const condition: Condition = { attribute: 'health', min: 30, max: 70 }
      expect(evaluateCondition(state, condition)).toBe(false)
    })

    it('属性不存在时 min 条件应该返回 false', () => {
      const state = createState()
      const condition: Condition = { attribute: 'courage', min: 10 }
      expect(evaluateCondition(state, condition)).toBe(false)
    })

    it('属性不存在时 max 条件应该返回 true', () => {
      const state = createState()
      const condition: Condition = { attribute: 'fear', max: 10 }
      expect(evaluateCondition(state, condition)).toBe(true)
    })

    it('属性值为 0 时应该正确判断', () => {
      const state = createState({ courage: 0 })
      const condition: Condition = { attribute: 'courage', min: 0 }
      expect(evaluateCondition(state, condition)).toBe(true)
    })
  })

  describe('checkEnding - Branch 覆盖', () => {
    const createState = (attrs = {}): GameState => ({
      scriptId: 'test',
      currentScene: 'start',
      attributes: attrs,
      relationships: {},
      history: [],
      startTime: Date.now(),
    })

    it('无结局时应该返回 null', () => {
      const state = createState()
      const result = checkEnding(state, [])
      expect(result).toBeNull()
    })

    it('满足单个结局条件时应该返回结局', () => {
      const state = createState({ clue: 10 })
      const endings: Ending[] = [
        {
          id: 'good',
          title: '好结局',
          description: '成功',
          condition: { clue: { min: 5 } },
        },
      ]
      const result = checkEnding(state, endings)
      expect(result?.id).toBe('good')
    })

    it('不满足结局条件时应该返回 null', () => {
      const state = createState({ clue: 3 })
      const endings: Ending[] = [
        {
          id: 'good',
          title: '好结局',
          description: '成功',
          condition: { clue: { min: 5 } },
        },
      ]
      const result = checkEnding(state, endings)
      expect(result).toBeNull()
    })

    it('多个结局时应该返回第一个满足的', () => {
      const state = createState({ clue: 15 })
      const endings: Ending[] = [
        {
          id: 'best',
          title: '最佳结局',
          description: '完美',
          condition: { clue: { min: 10 } },
        },
        {
          id: 'good',
          title: '好结局',
          description: '不错',
          condition: { clue: { min: 5 } },
        },
      ]
      const result = checkEnding(state, endings)
      expect(result?.id).toBe('best')
    })

    it('结局条件包含 max 时应该正确判断', () => {
      const state = createState({ fear: 30 })
      const endings: Ending[] = [
        {
          id: 'brave',
          title: '勇敢结局',
          description: '恐惧值低',
          condition: { fear: { max: 50 } },
        },
      ]
      const result = checkEnding(state, endings)
      expect(result?.id).toBe('brave')
    })

    it('结局条件包含多个属性时应该都满足', () => {
      const state = createState({ courage: 60, clue: 8 })
      const endings: Ending[] = [
        {
          id: 'perfect',
          title: '完美结局',
          description: '全部达标',
          condition: { 
            courage: { min: 50 },
            clue: { min: 5 }
          },
        },
      ]
      const result = checkEnding(state, endings)
      expect(result?.id).toBe('perfect')
    })

    it('结局条件 max 不满足时应该排除', () => {
      const state = createState({ fear: 80 })
      const endings: Ending[] = [
        {
          id: 'brave',
          title: '勇敢结局',
          description: '恐惧值低',
          condition: { fear: { max: 50 } },
        },
      ]
      const result = checkEnding(state, endings)
      expect(result).toBeNull()
    })

    it('结局条件 min 和 max 组合检查', () => {
      const state = createState({ health: 60 })
      const endings: Ending[] = [
        {
          id: 'balanced',
          title: '平衡结局',
          description: '健康值适中',
          condition: { health: { min: 50, max: 70 } },
        },
      ]
      const result = checkEnding(state, endings)
      expect(result?.id).toBe('balanced')
    })

    it('多属性条件中有一个不满足时应该排除', () => {
      const state = createState({ courage: 60, clue: 3 })
      const endings: Ending[] = [
        {
          id: 'perfect',
          title: '完美结局',
          description: '全部达标',
          condition: { 
            courage: { min: 50 },
            clue: { min: 5 }
          },
        },
      ]
      const result = checkEnding(state, endings)
      expect(result).toBeNull()
    })
  })

  describe('createInitialState', () => {
    it('应该创建带有属性的初始状态', () => {
      const state = createInitialState('test', { health: 100 }, { npc1: 50 })
      expect(state.scriptId).toBe('test')
      expect(state.attributes.health).toBe(100)
      expect(state.relationships.npc1).toBe(50)
      expect(state.history).toEqual([])
      expect(state.startTime).toBeGreaterThan(0)
    })

    it('应该创建空状态', () => {
      const state = createInitialState('test', {}, {})
      expect(state.attributes).toEqual({})
      expect(state.relationships).toEqual({})
    })
  })

  describe('cloneState', () => {
    it('应该深度克隆状态', () => {
      const original: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { health: 50 },
        relationships: { npc1: 30 },
        history: [{ sceneId: 's1', text: 'test', timestamp: 1000 }],
        startTime: 1000,
      }
      
      const cloned = cloneState(original)
      
      // 修改克隆不应影响原对象
      cloned.attributes.health = 0
      cloned.relationships.npc1 = 0
      
      expect(original.attributes.health).toBe(50)
      expect(original.relationships.npc1).toBe(30)
    })
  })
})