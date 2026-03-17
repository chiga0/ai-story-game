import { describe, it, expect, beforeEach } from 'vitest'
import { createGameEngine, type GameEngine } from '../../../src/lib/game/engine'
import type { Script } from '../../../src/lib/game/engine'

describe('GameEngine - Branch 覆盖补充', () => {
  let engine: GameEngine

  beforeEach(() => {
    engine = createGameEngine()
  })

  describe('空 scenes 处理', () => {
    it('应该处理空的 scenes 对象', async () => {
      const script = {
        id: 'test',
        title: '测试',
        genre: 'mystery',
        characters: [],
        scenes: {},
        endings: [{ id: 'e1', title: '结局', condition: {} }],
      } as Script

      const state = await engine.init(script)
      expect(state.currentScene).toBe('')
    })
  })

  describe('无效场景引用处理', () => {
    it('getCurrentScene 未初始化时应该返回 null', () => {
      const scene = engine.getCurrentScene()
      expect(scene).toBeNull()
    })
  })

  describe('空 endings 处理', () => {
    it('应该处理空的 endings 数组', async () => {
      const script = {
        id: 'test',
        title: '测试',
        genre: 'mystery',
        characters: [],
        scenes: {
          start: {
            id: 'start',
            text: '开始',
          },
        },
        endings: [],
      } as Script

      await engine.init(script)
      
      const ending = engine.checkEnding()
      expect(ending).toBeNull()
    })

    it('应该处理 endings 为 undefined', async () => {
      const script = {
        id: 'test',
        title: '测试',
        genre: 'mystery',
        characters: [],
        scenes: {
          start: {
            id: 'start',
            text: '开始',
          },
        },
        endings: undefined as any,
      } as Script

      await engine.init(script)
      
      const ending = engine.checkEnding()
      expect(ending).toBeNull()
    })
  })

  describe('场景切换分支', () => {
    it('应该处理 nextScene 不存在的情况', async () => {
      const script = {
        id: 'test',
        title: '测试',
        genre: 'mystery',
        characters: [],
        scenes: {
          start: {
            id: 'start',
            text: '开始',
            choices: [
              { id: 'c1', text: '选项', nextSceneId: 'non-existent' },
            ],
          },
        },
        endings: [{ id: 'e1', title: '结局', condition: {} }],
      } as Script

      await engine.init(script)
      const result = await engine.processChoice('c1')
      
      // 由于场景不存在，可能触发结局或返回 continue
      expect(result?.type).toBeDefined()
    })
  })

  describe('恢复游戏', () => {
    it('应该正确恢复游戏状态', async () => {
      const script = {
        id: 'test',
        title: '测试',
        genre: 'mystery',
        characters: [],
        scenes: {
          start: { id: 'start', text: '开始' },
          scene2: { id: 'scene2', text: '场景2' },
        },
        endings: [],
      } as Script

      const savedState = {
        scriptId: 'test',
        currentScene: 'scene2',
        attributes: { health: 50 },
        relationships: {},
        history: [],
        startTime: Date.now(),
      }

      await engine.restore(savedState, script)
      
      const state = engine.getState()
      expect(state?.currentScene).toBe('scene2')
      expect(state?.attributes.health).toBe(50)
    })
  })

  describe('未初始化状态处理', () => {
    it('未初始化时 getState 应该返回 null', () => {
      const state = engine.getState()
      expect(state).toBeNull()
    })

    it('未初始化时 getCurrentScene 应该返回 null', () => {
      const scene = engine.getCurrentScene()
      expect(scene).toBeNull()
    })

    it('未初始化时 getChoices 应该返回空数组', () => {
      const choices = engine.getChoices()
      expect(choices).toEqual([])
    })

    it('未初始化时 checkEnding 应该返回 null', () => {
      const ending = engine.checkEnding()
      expect(ending).toBeNull()
    })

    it('未初始化时 processChoice 应该返回 null', async () => {
      const result = await engine.processChoice('any')
      expect(result).toBeNull()
    })

    it('未初始化时 getPlayDuration 应该返回 0', () => {
      const duration = engine.getPlayDuration()
      expect(duration).toBe(0)
    })
  })
})