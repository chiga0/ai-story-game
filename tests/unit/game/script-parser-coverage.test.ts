import { describe, it, expect, beforeEach } from 'vitest'
import {
  ScriptParser,
  ScriptParseError,
  ScriptValidationError,
  createScriptParser,
  type Script,
} from '../../../src/lib/game/script-parser'

describe('ScriptParser - 覆盖率补充测试', () => {
  let parser: ScriptParser

  beforeEach(() => {
    parser = createScriptParser()
  })

  describe('parse - 错误处理', () => {
    it('应该拒绝无效的 JSON', () => {
      expect(() => parser.parse('not json')).toThrow(ScriptParseError)
    })

    it('应该拒绝非对象 JSON', () => {
      expect(() => parser.parse('"string"')).toThrow(ScriptParseError)
    })

    it('应该拒绝数组 JSON', () => {
      expect(() => parser.parse('[]')).toThrow(ScriptParseError)
    })
  })

  describe('validate - 必填字段检查', () => {
    it('应该拒绝缺少 id 的剧本', () => {
      const script = {
        title: '测试',
        characters: [],
        scenes: {},
        endings: [],
      } as Script
      
      const result = parser.validate(script)
      expect(result.valid).toBe(false)
    })

    it('应该拒绝缺少 title 的剧本', () => {
      const script = {
        id: 'test',
        characters: [],
        scenes: {},
        endings: [],
      } as Script
      
      const result = parser.validate(script)
      expect(result.valid).toBe(false)
    })

    it('应该拒绝空 scenes 的剧本', () => {
      const script = {
        id: 'test',
        title: '测试',
        characters: [],
        scenes: {},
        endings: [],
      } as Script
      
      const result = parser.validate(script)
      expect(result.valid).toBe(false)
    })

    it('应该接受有效的剧本', () => {
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
        endings: [
          { id: 'end1', title: '结局', condition: {} },
        ],
      } as Script
      
      const result = parser.validate(script)
      expect(result.valid).toBe(true)
    })
  })

  describe('checkSceneReferences - 引用检查', () => {
    it('应该检测无效的场景引用', () => {
      const script = {
        id: 'test',
        title: '测试',
        scenes: {
          start: {
            id: 'start',
            text: '开始',
            choices: [
              { id: 'c1', text: '选项', nextSceneId: 'non-existent' },
            ],
          },
        },
        endings: [],
      } as Script
      
      const invalidRefs = parser.checkSceneReferences(script)
      expect(invalidRefs.length).toBeGreaterThan(0)
      expect(invalidRefs[0]).toContain('non-existent')
    })

    it('应该接受有效的场景引用', () => {
      const script = {
        id: 'test',
        title: '测试',
        scenes: {
          start: {
            id: 'start',
            text: '开始',
            choices: [
              { id: 'c1', text: '选项', nextSceneId: 'scene2' },
            ],
          },
          scene2: {
            id: 'scene2',
            text: '场景2',
          },
        },
        endings: [],
      } as Script
      
      const invalidRefs = parser.checkSceneReferences(script)
      expect(invalidRefs).toEqual([])
    })
  })

  describe('getScene', () => {
    it('应该返回存在的场景', () => {
      const script = {
        id: 'test',
        title: '测试',
        scenes: {
          start: { id: 'start', text: '开始' },
          scene2: { id: 'scene2', text: '场景2' },
        },
        endings: [],
      } as Script
      
      const scene = parser.getScene(script, 'scene2')
      expect(scene?.id).toBe('scene2')
    })

    it('不存在时应该返回 null', () => {
      const script = {
        id: 'test',
        title: '测试',
        scenes: {
          start: { id: 'start', text: '开始' },
        },
        endings: [],
      } as Script
      
      const scene = parser.getScene(script, 'non-existent')
      expect(scene).toBeNull()
    })
  })

  describe('getStartScene', () => {
    it('应该返回 "start" 场景', () => {
      const script = {
        id: 'test',
        title: '测试',
        scenes: {
          start: { id: 'start', text: '开始' },
          other: { id: 'other', text: '其他' },
        },
        endings: [],
      } as Script
      
      const scene = parser.getStartScene(script)
      expect(scene?.id).toBe('start')
    })

    it('没有 start 场景时应该返回第一个场景', () => {
      const script = {
        id: 'test',
        title: '测试',
        scenes: {
          intro: { id: 'intro', text: '介绍' },
        },
        endings: [],
      } as Script
      
      const scene = parser.getStartScene(script)
      expect(scene?.id).toBe('intro')
    })
  })

  describe('getCharacter', () => {
    it('应该返回存在的角色', () => {
      const script = {
        id: 'test',
        title: '测试',
        characters: [
          { id: 'npc1', name: 'NPC1', description: '' },
        ],
        scenes: {},
        endings: [],
      } as Script
      
      const char = parser.getCharacter(script, 'npc1')
      expect(char?.name).toBe('NPC1')
    })

    it('不存在时应该返回 null', () => {
      const script = {
        id: 'test',
        title: '测试',
        characters: [],
        scenes: {},
        endings: [],
      } as Script
      
      const char = parser.getCharacter(script, 'non-existent')
      expect(char).toBeNull()
    })
  })

  describe('parseObject - 类型处理', () => {
    it('应该正确解析完整剧本对象', () => {
      const data = {
        id: 'test',
        title: '测试剧本',
        description: '描述',
        coverImage: 'cover.jpg',
        genre: 'mystery',
        tags: ['悬疑'],
        estimatedDuration: 30,
        difficulty: 'normal',
        characters: [
          { id: 'npc1', name: 'NPC', description: '描述' },
        ],
        scenes: {
          start: { id: 'start', text: '开始' },
        },
        endings: [
          { id: 'end1', title: '结局', condition: {} },
        ],
        initialState: {
          attributes: { courage: 50 },
          relationships: {},
        },
      }
      
      const script = parser.parseObject(data)
      expect(script.id).toBe('test')
      expect(script.title).toBe('测试剧本')
      expect(script.genre).toBe('mystery')
      expect(script.characters?.[0]?.name).toBe('NPC')
      expect(script.scenes?.start?.text).toBe('开始')
    })
  })
})