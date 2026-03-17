import { describe, it, expect } from 'vitest'
import {
  applyEffects,
  evaluateCondition,
  filterAvailableChoices,
  checkEnding,
  getAttribute,
  getRelationship,
  setAttribute,
  setRelationship,
  createInitialState,
  cloneState,
  type Effect,
  type Condition,
} from '../../../src/lib/game/state-manager'
import type { GameState, Choice, Ending } from '../../../src/lib/game/engine'

describe('state-manager', () => {
  describe('applyEffects', () => {
    it('应正确应用属性效果', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 10 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const effects: Effect[] = [
        { attribute: 'courage', change: 5 },
      ]

      const newState = applyEffects(state, effects)

      expect(newState.attributes.courage).toBe(15)
      // 原状态不应被修改
      expect(state.attributes.courage).toBe(10)
    })

    it('应正确应用关系效果', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: { butler: 10 },
        history: [],
        startTime: Date.now(),
      }

      const effects: Effect[] = [
        { relationship: { charId: 'butler', change: 5 } },
      ]

      const newState = applyEffects(state, effects)

      expect(newState.relationships.butler).toBe(15)
    })

    it('应正确应用多个效果', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 10, wisdom: 5 },
        relationships: { butler: 0 },
        history: [],
        startTime: Date.now(),
      }

      const effects: Effect[] = [
        { attribute: 'courage', change: 5 },
        { attribute: 'wisdom', change: -2 },
        { relationship: { charId: 'butler', change: 10 } },
      ]

      const newState = applyEffects(state, effects)

      expect(newState.attributes.courage).toBe(15)
      expect(newState.attributes.wisdom).toBe(3)
      expect(newState.relationships.butler).toBe(10)
    })

    it('关系值应限制在 -100 到 100 之间', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: { butler: 95 },
        history: [],
        startTime: Date.now(),
      }

      const effects: Effect[] = [
        { relationship: { charId: 'butler', change: 10 } },
      ]

      const newState = applyEffects(state, effects)
      expect(newState.relationships.butler).toBe(100)
    })

    it('关系值不应低于 -100', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: { butler: -95 },
        history: [],
        startTime: Date.now(),
      }

      const effects: Effect[] = [
        { relationship: { charId: 'butler', change: -10 } },
      ]

      const newState = applyEffects(state, effects)
      expect(newState.relationships.butler).toBe(-100)
    })

    it('空效果列表应返回相同状态', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 10 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const newState = applyEffects(state, [])

      expect(newState.attributes).toEqual(state.attributes)
    })

    it('应处理不存在的属性', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const effects: Effect[] = [
        { attribute: 'newAttr', change: 5 },
      ]

      const newState = applyEffects(state, effects)
      expect(newState.attributes.newAttr).toBe(5)
    })
  })

  describe('evaluateCondition', () => {
    it('无条件时应返回 true', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      expect(evaluateCondition(state, {})).toBe(true)
    })

    it('应正确评估 min 条件', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 10 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      expect(evaluateCondition(state, { attribute: 'courage', min: 5 })).toBe(true)
      expect(evaluateCondition(state, { attribute: 'courage', min: 15 })).toBe(false)
    })

    it('应正确评估 max 条件', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 10 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      expect(evaluateCondition(state, { attribute: 'courage', max: 15 })).toBe(true)
      expect(evaluateCondition(state, { attribute: 'courage', max: 5 })).toBe(false)
    })

    it('应正确评估 min 和 max 组合条件', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 10 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      expect(evaluateCondition(state, { attribute: 'courage', min: 5, max: 15 })).toBe(true)
      expect(evaluateCondition(state, { attribute: 'courage', min: 15, max: 20 })).toBe(false)
    })

    it('不存在的属性应视为 0', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      expect(evaluateCondition(state, { attribute: 'nonexistent', min: -5 })).toBe(true)
      expect(evaluateCondition(state, { attribute: 'nonexistent', min: 5 })).toBe(false)
    })
  })

  describe('filterAvailableChoices', () => {
    const createChoice = (id: string, condition?: Condition): Choice => ({
      id,
      text: `Choice ${id}`,
      nextSceneId: 'next',
      condition,
    })

    it('应返回所有无条件选项', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const choices = [
        createChoice('a'),
        createChoice('b'),
        createChoice('c'),
      ]

      const filtered = filterAvailableChoices(state, choices)
      expect(filtered).toHaveLength(3)
    })

    it('应过滤条件不满足的选项', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 5 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const choices = [
        createChoice('a'),
        createChoice('b', { attribute: 'courage', min: 10 }),
        createChoice('c', { attribute: 'courage', min: 3 }),
      ]

      const filtered = filterAvailableChoices(state, choices)
      expect(filtered).toHaveLength(2)
      expect(filtered.map((c) => c.id)).toContain('a')
      expect(filtered.map((c) => c.id)).toContain('c')
    })
  })

  describe('checkEnding', () => {
    const createEnding = (id: string, condition: Record<string, { min?: number; max?: number }>): Ending => ({
      id,
      title: `Ending ${id}`,
      description: `Description for ${id}`,
      condition,
    })

    it('无匹配结局时应返回 null', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 5 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const endings = [
        createEnding('good', { courage: { min: 10 } }),
      ]

      expect(checkEnding(state, endings)).toBeNull()
    })

    it('应返回匹配的结局', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 15 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const endings = [
        createEnding('good', { courage: { min: 10 } }),
      ]

      const ending = checkEnding(state, endings)
      expect(ending?.id).toBe('good')
    })

    it('多个结局匹配时应返回第一个', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 15, wisdom: 10 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const endings = [
        createEnding('first', { courage: { min: 10 } }),
        createEnding('second', { wisdom: { min: 5 } }),
      ]

      const ending = checkEnding(state, endings)
      expect(ending?.id).toBe('first')
    })

    it('无条件结局应总是匹配', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const endings = [
        createEnding('default', {}),
      ]

      const ending = checkEnding(state, endings)
      expect(ending?.id).toBe('default')
    })

    it('应正确处理多属性条件', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 15, wisdom: 10 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const endings = [
        createEnding('perfect', { courage: { min: 10 }, wisdom: { min: 5 } }),
      ]

      const ending = checkEnding(state, endings)
      expect(ending?.id).toBe('perfect')
    })
  })

  describe('getAttribute', () => {
    it('应返回正确的属性值', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 10 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      expect(getAttribute(state, 'courage')).toBe(10)
    })

    it('不存在的属性应返回 0', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      expect(getAttribute(state, 'nonexistent')).toBe(0)
    })
  })

  describe('getRelationship', () => {
    it('应返回正确的关系值', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: { butler: 50 },
        history: [],
        startTime: Date.now(),
      }

      expect(getRelationship(state, 'butler')).toBe(50)
    })

    it('不存在的角色应返回 0', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      expect(getRelationship(state, 'nonexistent')).toBe(0)
    })
  })

  describe('setAttribute', () => {
    it('应正确设置属性值', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 10 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const newState = setAttribute(state, 'courage', 20)
      expect(newState.attributes.courage).toBe(20)
    })

    it('应添加新属性', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const newState = setAttribute(state, 'wisdom', 15)
      expect(newState.attributes.wisdom).toBe(15)
    })

    it('不应修改原状态', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 10 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      setAttribute(state, 'courage', 20)
      expect(state.attributes.courage).toBe(10)
    })
  })

  describe('setRelationship', () => {
    it('应正确设置关系值', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: { butler: 50 },
        history: [],
        startTime: Date.now(),
      }

      const newState = setRelationship(state, 'butler', 75)
      expect(newState.relationships.butler).toBe(75)
    })

    it('关系值应限制在 -100 到 100 之间', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: {},
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const newState1 = setRelationship(state, 'butler', 150)
      expect(newState1.relationships.butler).toBe(100)

      const newState2 = setRelationship(state, 'butler', -150)
      expect(newState2.relationships.butler).toBe(-100)
    })
  })

  describe('createInitialState', () => {
    it('应创建正确的初始状态', () => {
      const state = createInitialState(
        'test-script',
        { courage: 10, wisdom: 5 },
        { butler: 0 }
      )

      expect(state.scriptId).toBe('test-script')
      expect(state.currentScene).toBe('')
      expect(state.attributes).toEqual({ courage: 10, wisdom: 5 })
      expect(state.relationships).toEqual({ butler: 0 })
      expect(state.history).toEqual([])
    })

    it('应正确处理空初始值', () => {
      const state = createInitialState('test-script')

      expect(state.attributes).toEqual({})
      expect(state.relationships).toEqual({})
    })
  })

  describe('cloneState', () => {
    it('应创建状态的深拷贝', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 10 },
        relationships: { butler: 50 },
        history: [
          { sceneId: 'prev', text: 'test', timestamp: Date.now() },
        ],
        startTime: Date.now(),
      }

      const cloned = cloneState(state)

      expect(cloned).toEqual(state)
      expect(cloned).not.toBe(state)
      expect(cloned.attributes).not.toBe(state.attributes)
      expect(cloned.relationships).not.toBe(state.relationships)
      expect(cloned.history).not.toBe(state.history)
    })

    it('修改克隆不应影响原状态', () => {
      const state: GameState = {
        scriptId: 'test',
        currentScene: 'start',
        attributes: { courage: 10 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      const cloned = cloneState(state)
      cloned.attributes.courage = 20

      expect(state.attributes.courage).toBe(10)
      expect(cloned.attributes.courage).toBe(20)
    })
  })
})