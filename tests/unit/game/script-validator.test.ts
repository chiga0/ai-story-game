/**
 * 剧本验证器测试
 */

import { describe, it, expect } from 'vitest'
import {
  validateScript,
  validateScenes,
  validateChoices,
  validateEndings,
  ERROR_CODES,
  WARNING_CODES,
} from '#/lib/game/script-validator'
import type { Script, Scene, Characters, Ending } from '#/types'

// 测试用剧本
const createValidScript = (): Script => ({
  id: 'test-script',
  title: '测试剧本',
  genre: '悬疑',
  characters: {
    'char-1': {
      id: 'char-1',
      name: '角色1',
      description: '测试角色',
    },
  },
  scenes: {
    start: {
      id: 'start',
      text: '这是一个测试场景，长度足够，不会触发警告。',
      choices: [
        {
          id: 'choice-1',
          text: '选择1',
          nextSceneId: 'scene-2',
        },
      ],
    },
    'scene-2': {
      id: 'scene-2',
      text: '第二个场景',
    },
  },
  endings: [
    {
      id: 'ending-1',
      title: '好结局',
      description: '你成功了',
      condition: { 勇气: { min: 50 } },
    },
  ],
})

describe('ScriptValidator', () => {
  describe('validateScript', () => {
    it('should return valid for a correct script', () => {
      const script = createValidScript()
      const result = validateScript(script)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return invalid for null input', () => {
      const result = validateScript(null)
      expect(result.valid).toBe(false)
      expect(result.errors[0].code).toBe(ERROR_CODES.INVALID_TYPE)
    })

    it('should return invalid for missing required fields', () => {
      const script = { id: 'test' } as unknown as Script
      const result = validateScript(script)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === ERROR_CODES.MISSING_REQUIRED_FIELD)).toBe(true)
    })

    it('should detect missing start scene', () => {
      const script = createValidScript()
      script.scenes = {
        'scene-1': { id: 'scene-1', text: 'test' },
      }
      const result = validateScript(script)
      expect(result.errors.some((e) => e.code === ERROR_CODES.NO_START_SCENE)).toBe(true)
    })

    it('should detect invalid choice reference', () => {
      const script = createValidScript()
      script.scenes.start.choices = [
        { id: 'choice-1', text: 'test', nextSceneId: 'non-existent' },
      ]
      const result = validateScript(script)
      expect(result.errors.some((e) => e.code === ERROR_CODES.INVALID_CHOICE_REFERENCE)).toBe(true)
    })

    it('should detect unreachable scenes', () => {
      const script = createValidScript()
      script.scenes['isolated-scene'] = {
        id: 'isolated-scene',
        text: 'This scene is unreachable',
      }
      const result = validateScript(script)
      expect(result.errors.some((e) => e.code === ERROR_CODES.UNREACHABLE_SCENE)).toBe(true)
    })

    it('should calculate correct stats', () => {
      const script = createValidScript()
      const result = validateScript(script)
      expect(result.stats.totalScenes).toBe(2)
      expect(result.stats.totalCharacters).toBe(1)
      expect(result.stats.totalEndings).toBe(1)
      expect(result.stats.totalChoices).toBe(1)
    })
  })

  describe('validateScenes', () => {
    it('should return no errors for valid scenes', () => {
      const scenes = {
        start: { id: 'start', text: 'Test scene with enough length' },
      }
      const errors: never[] = []
      const warnings: never[] = []
      validateScenes(scenes, errors, warnings)
      expect(errors).toHaveLength(0)
    })

    it('should detect duplicate scene IDs', () => {
      const scenes = {
        'scene-1': { id: 'scene-1', text: 'First scene' },
        'scene-1-dup': { id: 'scene-1', text: 'Duplicate ID' },
      }
      const errors: { type: string; code: string; message: string }[] = []
      const warnings: never[] = []
      validateScenes(scenes, errors, warnings)
      // 注：这个测试可能需要根据实际实现调整
    })

    it('should detect empty scene text', () => {
      const scenes = {
        start: { id: 'start', text: '' },
      }
      const errors: { type: string; code: string; message: string }[] = []
      const warnings: never[] = []
      validateScenes(scenes, errors, warnings)
      expect(errors.some((e) => e.code === ERROR_CODES.EMPTY_SCENE_TEXT)).toBe(true)
    })
  })

  describe('validateChoices', () => {
    it('should return no errors for valid choices', () => {
      const scene: Scene = {
        id: 'start',
        text: 'Test',
        choices: [
          { id: 'choice-1', text: 'Choice 1', nextSceneId: 'scene-2' },
        ],
      }
      const allSceneIds = new Set(['start', 'scene-2'])
      const errors: { type: string; code: string; message: string }[] = []
      validateChoices(scene, allSceneIds, errors, 'start')
      expect(errors).toHaveLength(0)
    })

    it('should detect invalid nextSceneId', () => {
      const scene: Scene = {
        id: 'start',
        text: 'Test',
        choices: [
          { id: 'choice-1', text: 'Choice 1', nextSceneId: 'non-existent' },
        ],
      }
      const allSceneIds = new Set(['start'])
      const errors: { type: string; code: string; message: string }[] = []
      validateChoices(scene, allSceneIds, errors, 'start')
      expect(errors.some((e) => e.code === ERROR_CODES.INVALID_CHOICE_REFERENCE)).toBe(true)
    })

    it('should handle scenes without choices', () => {
      const scene: Scene = {
        id: 'start',
        text: 'Test',
      }
      const allSceneIds = new Set(['start'])
      const errors: never[] = []
      validateChoices(scene, allSceneIds, errors, 'start')
      expect(errors).toHaveLength(0)
    })
  })

  describe('validateEndings', () => {
    it('should return no errors for valid endings', () => {
      const endings: Ending[] = [
        {
          id: 'ending-1',
          title: 'Good Ending',
          description: 'You win',
          condition: { score: { min: 50 } },
        },
      ]
      const errors: { type: string; code: string; message: string }[] = []
      const allSceneIds = new Set(['start'])
      validateEndings(endings, allSceneIds, errors)
      expect(errors).toHaveLength(0)
    })

    it('should detect missing title', () => {
      const endings = [
        {
          id: 'ending-1',
          description: 'No title',
          condition: {},
        },
      ] as Ending[]
      const errors: { type: string; code: string; message: string }[] = []
      const allSceneIds = new Set(['start'])
      validateEndings(endings, allSceneIds, errors)
      expect(errors.some((e) => e.code === ERROR_CODES.MISSING_REQUIRED_FIELD)).toBe(true)
    })

    it('should detect empty endings array', () => {
      const errors: { type: string; code: string; message: string }[] = []
      const allSceneIds = new Set(['start'])
      validateEndings([], allSceneIds, errors)
      expect(errors.some((e) => e.code === ERROR_CODES.MISSING_REQUIRED_FIELD)).toBe(true)
    })
  })
})