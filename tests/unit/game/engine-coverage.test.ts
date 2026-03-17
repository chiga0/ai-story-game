import { describe, it, expect, beforeEach } from 'vitest'
import { createGameEngine, type GameEngine } from '../../../src/lib/game/engine'
import type { Script, Scene, Ending } from '../../../src/lib/game/engine'

describe('GameEngine - 覆盖率补充测试', () => {
  let engine: GameEngine

  const createTestScript = (options: {
    scenes?: Record<string, Scene>
    endings?: Ending[]
    initialState?: {
      attributes: Record<string, number>
      relationships: Record<string, number>
    }
  } = {}): Script => {
    return {
      id: 'test-script',
      title: '测试剧本',
      scenes: options.scenes || {
        start: {
          id: 'start',
          text: '开始',
          choices: [
            { id: 'c1', text: '选择1', nextSceneId: 'scene2' },
          ],
        },
        scene2: {
          id: 'scene2',
          text: '场景2',
        },
      },
      endings: options.endings || [],
      initialState: options.initialState || {
        attributes: {},
        relationships: {},
      },
    } as Script
  }

  beforeEach(() => {
    engine = createGameEngine()
  })

  describe('场景跳转 - Branch 覆盖', () => {
    it('应该处理没有选项的场景（自动跳转）', async () => {
      const script = createTestScript({
        scenes: {
          start: {
            id: 'start',
            text: '开始场景',
            nextSceneId: 'auto-scene',
          },
          'auto-scene': {
            id: 'auto-scene',
            text: '自动跳转场景',
          },
        },
      })

      await engine.init(script)
      const scene = engine.getCurrentScene()
      expect(scene?.text).toBe('开始场景')
    })

    it('应该处理带效果的场景', async () => {
      const script = createTestScript({
        scenes: {
          start: {
            id: 'start',
            text: '开始',
            choices: [
              {
                id: 'c1',
                text: '选择1',
                nextSceneId: 'scene2',
                effects: [
                  { attribute: 'courage', change: 10 },
                  { relationship: { charId: 'npc1', change: 5 } },
                ],
              },
            ],
          },
          scene2: {
            id: 'scene2',
            text: '场景2',
          },
        },
      })

      await engine.init(script)
      await engine.processChoice('c1')

      const state = engine.getState()
      expect(state?.attributes.courage).toBe(10)
      expect(state?.relationships.npc1).toBe(5)
    })

    it('应该处理带条件的选项', async () => {
      const script = createTestScript({
        scenes: {
          start: {
            id: 'start',
            text: '开始',
            choices: [
              {
                id: 'c1',
                text: '需要勇气',
                nextSceneId: 'scene2',
                condition: { attribute: 'courage', min: 50 },
              },
              {
                id: 'c2',
                text: '无条件选择',
                nextSceneId: 'scene3',
              },
            ],
          },
          scene2: {
            id: 'scene2',
            text: '场景2',
          },
          scene3: {
            id: 'scene3',
            text: '场景3',
          },
        },
      })

      await engine.init(script)
      
      // 只有 c2 可选（因为没有勇气属性）
      const choices = engine.getChoices()
      expect(choices.length).toBe(1)
      expect(choices[0].id).toBe('c2')
    })

    it('应该处理满足条件的选项', async () => {
      const script = createTestScript({
        scenes: {
          start: {
            id: 'start',
            text: '开始',
            choices: [
              {
                id: 'c1',
                text: '需要勇气',
                nextSceneId: 'scene2',
                condition: { attribute: 'courage', min: 30 },
              },
            ],
          },
          scene2: {
            id: 'scene2',
            text: '场景2',
          },
        },
        initialState: {
          attributes: { courage: 50 },
          relationships: {},
        },
      })

      await engine.init(script)
      
      const choices = engine.getChoices()
      expect(choices.length).toBe(1)
      expect(choices[0].id).toBe('c1')
    })

    it('应该处理 max 条件', async () => {
      const script = createTestScript({
        scenes: {
          start: {
            id: 'start',
            text: '开始',
            choices: [
              {
                id: 'c1',
                text: '最大值测试',
                nextSceneId: 'scene2',
                condition: { attribute: 'fear', max: 30 },
              },
            ],
          },
          scene2: {
            id: 'scene2',
            text: '场景2',
          },
        },
        initialState: {
          attributes: { fear: 20 },
          relationships: {},
        },
      })

      await engine.init(script)
      const choices = engine.getChoices()
      expect(choices.length).toBe(1)
    })

    it('应该处理 min 和 max 同时存在', async () => {
      const script = createTestScript({
        scenes: {
          start: {
            id: 'start',
            text: '开始',
            choices: [
              {
                id: 'c1',
                text: '范围测试',
                nextSceneId: 'scene2',
                condition: { attribute: 'health', min: 30, max: 70 },
              },
            ],
          },
          scene2: {
            id: 'scene2',
            text: '场景2',
          },
        },
        initialState: {
          attributes: { health: 50 },
          relationships: {},
        },
      })

      await engine.init(script)
      const choices = engine.getChoices()
      expect(choices.length).toBe(1)
    })
  })

  describe('结局判定 - Branch 覆盖', () => {
    it('应该判定满足条件的结局', async () => {
      const script = createTestScript({
        scenes: {
          start: {
            id: 'start',
            text: '开始',
            choices: [
              {
                id: 'c1',
                text: '结束',
                nextSceneId: 'ending',
              },
            ],
          },
          ending: {
            id: 'ending',
            text: '结局场景',
          },
        },
        endings: [
          {
            id: 'good',
            title: '好结局',
            description: '你成功了',
            condition: { clue: { min: 5 } },
          },
        ],
        initialState: {
          attributes: { clue: 10 },
          relationships: {},
        },
      })

      await engine.init(script)
      await engine.processChoice('c1')
      
      // 检查结局
      const ending = engine.checkEnding()
      expect(ending).not.toBeNull()
      expect(ending?.id).toBe('good')
    })

    it('应该处理多个结局的条件优先级', async () => {
      const script = createTestScript({
        scenes: {
          start: {
            id: 'start',
            text: '开始',
          },
        },
        endings: [
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
        ],
        initialState: {
          attributes: { clue: 15 },
          relationships: {},
        },
      })

      await engine.init(script)
      const ending = engine.checkEnding()
      // 应该返回第一个满足条件的结局
      expect(ending?.id).toBe('best')
    })
  })

  describe('历史记录 - Branch 覆盖', () => {
    it('应该正确记录选择历史', async () => {
      const script = createTestScript({
        scenes: {
          start: {
            id: 'start',
            text: '开始',
            speaker: 'narrator',
            choices: [
              {
                id: 'c1',
                text: '继续',
                nextSceneId: 'scene2',
              },
            ],
          },
          scene2: {
            id: 'scene2',
            text: '场景2',
          },
        },
      })

      await engine.init(script)
      await engine.processChoice('c1')

      const state = engine.getState()
      expect(state?.history.length).toBe(1)
      expect(state?.history[0].choice).toBe('继续')
      expect(state?.history[0].sceneId).toBe('start')
    })

    it('应该处理多个选择的历史', async () => {
      const script = createTestScript({
        scenes: {
          start: {
            id: 'start',
            text: '开始',
            choices: [{ id: 'c1', text: '下一步', nextSceneId: 'scene2' }],
          },
          scene2: {
            id: 'scene2',
            text: '场景2',
            choices: [{ id: 'c2', text: '再下一步', nextSceneId: 'scene3' }],
          },
          scene3: {
            id: 'scene3',
            text: '场景3',
          },
        },
      })

      await engine.init(script)
      await engine.processChoice('c1')
      await engine.processChoice('c2')

      const state = engine.getState()
      expect(state?.history.length).toBe(2)
    })
  })

  describe('状态管理 - Branch 覆盖', () => {
    it('应该正确克隆状态', async () => {
      const script = createTestScript({
        initialState: {
          attributes: { health: 100, mana: 50 },
          relationships: { npc1: 30, npc2: 60 },
        },
      })

      await engine.init(script)
      const state1 = engine.getState()
      
      // 修改返回的状态不应影响引擎内部状态
      if (state1) {
        state1.attributes.health = 0
      }
      
      const state2 = engine.getState()
      expect(state2?.attributes.health).toBe(100)
    })

    it('应该正确获取游玩时长', async () => {
      const script = createTestScript()
      await engine.init(script)
      
      const duration = engine.getPlayDuration()
      expect(duration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('错误处理 - Branch 覆盖', () => {
    it('应该处理无效的选择 ID', async () => {
      const script = createTestScript()
      await engine.init(script)
      
      const result = await engine.processChoice('invalid-choice')
      expect(result).toBeNull()
    })

    it('未初始化时应该返回 null', () => {
      expect(engine.getCurrentScene()).toBeNull()
      expect(engine.getChoices()).toEqual([])
      expect(engine.getState()).toBeNull()
      expect(engine.checkEnding()).toBeNull()
    })
  })
})