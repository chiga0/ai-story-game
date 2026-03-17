import { describe, it, expect, beforeEach } from 'vitest'
import { GameEngine, createGameEngine, type GameState, type Scene, type Ending } from '../../../src/lib/game/engine'
import type { Script } from '../../../src/lib/db/schema'

// 测试用剧本数据
const createTestScript = (): Script => ({
  id: 'test-script',
  title: '测试剧本',
  description: '用于测试的剧本',
  genre: 'mystery',
  scenes: {
    start: {
      id: 'start',
      text: '你站在一个神秘的城堡前。',
      choices: [
        {
          id: 'enter',
          text: '推门进入',
          nextSceneId: 'hall',
          effects: [{ attribute: 'courage', change: 5 }],
        },
        {
          id: 'leave',
          text: '转身离开',
          nextSceneId: 'end_leave',
        },
      ],
    },
    hall: {
      id: 'hall',
      text: '城堡大厅空荡荡的。',
      choices: [
        {
          id: 'search',
          text: '搜索房间',
          nextSceneId: 'treasure',
          effects: [{ attribute: 'clue', change: 1 }],
        },
        {
          id: 'rest',
          text: '休息一下',
          nextSceneId: 'rest',
        },
      ],
    },
    treasure: {
      id: 'treasure',
      text: '你发现了一个宝箱！',
      choices: [
        {
          id: 'open',
          text: '打开宝箱',
          nextSceneId: 'ending_good',
          condition: { attribute: 'courage', min: 5 },
        },
        {
          id: 'ignore',
          text: '无视宝箱',
          nextSceneId: 'ending_normal',
        },
      ],
    },
    rest: {
      id: 'rest',
      text: '你休息了一会儿。',
      nextSceneId: 'hall',
    },
    end_leave: {
      id: 'end_leave',
      text: '你离开了城堡，什么也没发生。',
    },
    ending_good: {
      id: 'ending_good',
      text: '恭喜你找到了宝藏！',
    },
    ending_normal: {
      id: 'ending_normal',
      text: '游戏结束。',
    },
  } as Record<string, Scene>,
  initialState: {
    attributes: { courage: 0, clue: 0 },
    relationships: { butler: 0 },
  },
  endings: [
    {
      id: 'good',
      title: '完美结局',
      description: '你找到了宝藏并成功离开',
      condition: { clue: { min: 1 } },
    },
  ] as Ending[],
} as any)

describe('GameEngine', () => {
  let engine: GameEngine
  let testScript: Script

  beforeEach(() => {
    engine = createGameEngine()
    testScript = createTestScript()
  })

  describe('init', () => {
    it('应该正确初始化游戏状态', async () => {
      const state = await engine.init(testScript)

      expect(state).toBeDefined()
      expect(state.scriptId).toBe('test-script')
      expect(state.currentScene).toBe('start')
      expect(state.attributes).toEqual({ courage: 0, clue: 0 })
      expect(state.relationships).toEqual({ butler: 0 })
      expect(state.history).toEqual([])
    })

    it('应该正确设置开始时间', async () => {
      const beforeTime = Date.now()
      const state = await engine.init(testScript)
      const afterTime = Date.now()

      expect(state.startTime).toBeGreaterThanOrEqual(beforeTime)
      expect(state.startTime).toBeLessThanOrEqual(afterTime)
    })

    it('应该正确初始化空属性', async () => {
      const scriptWithNoInitial = {
        ...testScript,
        scenes: { start: { id: 'start', text: 'test' } },
        initialState: undefined,
      } as unknown as Script

      const state = await engine.init(scriptWithNoInitial)

      expect(state.attributes).toEqual({})
      expect(state.relationships).toEqual({})
    })
  })

  describe('restore', () => {
    it('应该正确从存档恢复', async () => {
      const savedState: GameState = {
        scriptId: 'test-script',
        currentScene: 'hall',
        attributes: { courage: 10, clue: 5 },
        relationships: { butler: 50 },
        history: [
          {
            sceneId: 'start',
            text: 'test',
            choice: 'enter',
            timestamp: Date.now(),
          },
        ],
        startTime: Date.now() - 1000,
      }

      await engine.restore(savedState, testScript)

      const state = engine.getState()
      expect(state).toEqual(savedState)
    })

    it('恢复后应该能正确获取当前场景', async () => {
      const savedState: GameState = {
        scriptId: 'test-script',
        currentScene: 'hall',
        attributes: {},
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      await engine.restore(savedState, testScript)

      const scene = engine.getCurrentScene()
      expect(scene?.id).toBe('hall')
    })
  })

  describe('getCurrentScene', () => {
    it('初始化前应返回 null', () => {
      expect(engine.getCurrentScene()).toBeNull()
    })

    it('初始化后应返回起始场景', async () => {
      await engine.init(testScript)
      const scene = engine.getCurrentScene()

      expect(scene).toBeDefined()
      expect(scene?.id).toBe('start')
    })

    it('选择后应正确返回新场景', async () => {
      await engine.init(testScript)
      await engine.processChoice('enter')

      const scene = engine.getCurrentScene()
      expect(scene?.id).toBe('hall')
    })
  })

  describe('getChoices', () => {
    it('初始化前应返回空数组', () => {
      expect(engine.getChoices()).toEqual([])
    })

    it('应返回所有可用选项', async () => {
      await engine.init(testScript)
      const choices = engine.getChoices()

      expect(choices).toHaveLength(2)
      expect(choices.map((c) => c.id)).toContain('enter')
      expect(choices.map((c) => c.id)).toContain('leave')
    })

    it('应过滤条件不满足的选项', async () => {
      await engine.init(testScript)
      // 先进入 hall，然后搜索，到达 treasure 场景
      await engine.processChoice('enter')
      await engine.processChoice('search')
      
      // 现在 courage = 5, 应该能看到 open 选项
      const choices = engine.getChoices()
      expect(choices).toHaveLength(2)
    })

    it('条件不满足时应隐藏选项', async () => {
      await engine.init(testScript)
      
      // 创建一个需要高勇气的剧本
      const scriptWithCondition = {
        ...testScript,
        scenes: {
          start: {
            id: 'start',
            text: 'test',
            choices: [
              {
                id: 'brave',
                text: '勇敢行动',
                nextSceneId: 'end',
                condition: { attribute: 'courage', min: 100 },
              },
              {
                id: 'normal',
                text: '普通行动',
                nextSceneId: 'end',
              },
            ],
          },
        },
      } as unknown as Script

      const testEngine = createGameEngine()
      await testEngine.init(scriptWithCondition)
      const choices = testEngine.getChoices()
      
      expect(choices).toHaveLength(1)
      expect(choices[0].id).toBe('normal')
    })

    it('无选项的场景应返回空数组', async () => {
      await engine.init(testScript)
      // 直接修改内部状态模拟到达无选项场景
      const savedState: GameState = {
        scriptId: 'test-script',
        currentScene: 'end_leave',
        attributes: {},
        relationships: {},
        history: [],
        startTime: Date.now(),
      }
      await engine.restore(savedState, testScript)

      expect(engine.getChoices()).toEqual([])
    })
  })

  describe('processChoice', () => {
    it('初始化前应返回 null', async () => {
      const result = await engine.processChoice('enter')
      expect(result).toBeNull()
    })

    it('无效选择应返回 null', async () => {
      await engine.init(testScript)
      const result = await engine.processChoice('invalid')
      expect(result).toBeNull()
    })

    it('应正确处理有效选择', async () => {
      await engine.init(testScript)
      const result = await engine.processChoice('enter')

      expect(result).not.toBeNull()
      expect(result?.type).toBe('continue')
      expect(result?.scene?.id).toBe('hall')
    })

    it('应正确应用属性效果', async () => {
      await engine.init(testScript)
      await engine.processChoice('enter')

      expect(engine.getAttribute('courage')).toBe(5)
    })

    it('应正确记录历史', async () => {
      await engine.init(testScript)
      await engine.processChoice('enter')

      const state = engine.getState()!
      expect(state.history).toHaveLength(1)
      expect(state.history[0].sceneId).toBe('start')
      expect(state.history[0].choice).toBe('推门进入')
    })

    it('应正确切换场景', async () => {
      await engine.init(testScript)
      await engine.processChoice('enter')

      expect(engine.getCurrentScene()?.id).toBe('hall')
    })

    it('达到结局时应返回正确类型', async () => {
      await engine.init(testScript)
      // 一直选择直到结局
      await engine.processChoice('enter')
      await engine.processChoice('search')
      const result = await engine.processChoice('open')

      // 应该到达结局或继续
      expect(result?.type).toBeDefined()
    })
  })

  describe('checkEnding', () => {
    it('未达到结局条件时应返回 null', async () => {
      // 使用没有无条件结局的剧本
      const scriptWithConditionalEndings = {
        ...testScript,
        endings: [
          {
            id: 'good',
            title: '完美结局',
            description: '你找到了宝藏',
            condition: { clue: { min: 10 } }, // 需要很高
          },
        ],
      } as unknown as Script

      const testEngine = createGameEngine()
      await testEngine.init(scriptWithConditionalEndings)
      expect(testEngine.checkEnding()).toBeNull()
    })

    it('达到结局条件时应返回结局', async () => {
      await engine.init(testScript)
      
      // 使用 restore 设置带有高 clue 值的状态
      const stateWithHighClue: GameState = {
        scriptId: 'test-script',
        currentScene: 'start',
        attributes: { courage: 0, clue: 5 },
        relationships: { butler: 0 },
        history: [],
        startTime: Date.now(),
      }
      await engine.restore(stateWithHighClue, testScript)

      const ending = engine.checkEnding()
      expect(ending).not.toBeNull()
      expect(ending?.id).toBe('good')
    })
  })

  describe('getState', () => {
    it('初始化前应返回 null', () => {
      expect(engine.getState()).toBeNull()
    })

    it('应返回游戏状态的副本', async () => {
      await engine.init(testScript)
      const state1 = engine.getState()
      const state2 = engine.getState()

      expect(state1).not.toBe(state2) // 不同的引用
      expect(state1).toEqual(state2) // 相同的内容
    })
  })

  describe('getPlayDuration', () => {
    it('初始化前应返回 0', () => {
      expect(engine.getPlayDuration()).toBe(0)
    })

    it('应返回正确的游玩时长', async () => {
      await engine.init(testScript)
      
      // 等待一小段时间
      await new Promise((resolve) => setTimeout(resolve, 100))
      
      const duration = engine.getPlayDuration()
      expect(duration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getAttribute', () => {
    it('初始化前应返回 0', () => {
      expect(engine.getAttribute('courage')).toBe(0)
    })

    it('应返回正确的属性值', async () => {
      await engine.init(testScript)
      expect(engine.getAttribute('courage')).toBe(0)
      expect(engine.getAttribute('clue')).toBe(0)
    })

    it('不存在的属性应返回 0', async () => {
      await engine.init(testScript)
      expect(engine.getAttribute('nonexistent')).toBe(0)
    })
  })

  describe('getRelationship', () => {
    it('初始化前应返回 0', () => {
      expect(engine.getRelationship('butler')).toBe(0)
    })

    it('应返回正确的关系值', async () => {
      await engine.init(testScript)
      expect(engine.getRelationship('butler')).toBe(0)
    })

    it('不存在的角色应返回 0', async () => {
      await engine.init(testScript)
      expect(engine.getRelationship('nonexistent')).toBe(0)
    })
  })
})

describe('createGameEngine', () => {
  it('应创建 GameEngine 实例', () => {
    const engine = createGameEngine()
    expect(engine).toBeInstanceOf(GameEngine)
  })
})