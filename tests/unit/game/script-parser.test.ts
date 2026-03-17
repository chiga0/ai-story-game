import { describe, it, expect } from 'vitest'
import {
  ScriptParser,
  ScriptParseError,
  ScriptValidationError,
  createScriptParser,
  type Script,
} from '../../../src/lib/game/script-parser'

// 测试用剧本 JSON
const validScriptJson = JSON.stringify({
  id: 'test-script',
  title: '测试剧本',
  description: '用于测试的剧本',
  genre: 'mystery',
  tags: ['悬疑', '解谜'],
  estimatedDuration: 60,
  difficulty: 'normal',
  characters: [
    {
      id: 'butler',
      name: '管家',
      description: '神秘的管家',
      personality: '沉默寡言',
      speakingStyle: '礼貌',
    },
  ],
  scenes: {
    start: {
      id: 'start',
      text: '你站在古堡大门前...',
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
          nextSceneId: 'end',
        },
      ],
    },
    hall: {
      id: 'hall',
      text: '城堡大厅空荡荡的。',
      speaker: 'butler',
      choices: [
        {
          id: 'talk',
          text: '与管家交谈',
          nextSceneId: 'ending',
        },
      ],
    },
    end: {
      id: 'end',
      text: '你离开了城堡。',
    },
    ending: {
      id: 'ending',
      text: '游戏结束。',
    },
  },
  endings: [
    {
      id: 'good',
      title: '完美结局',
      description: '你揭开了古堡的秘密',
      condition: { clue: { min: 5 } },
    },
    {
      id: 'normal',
      title: '普通结局',
      description: '你完成了游戏',
      condition: {},
    },
  ],
  initialState: {
    attributes: { courage: 0, clue: 0 },
    relationships: { butler: 0 },
  },
})

describe('ScriptParser', () => {
  let parser: ScriptParser

  beforeEach(() => {
    parser = createScriptParser()
  })

  describe('parse', () => {
    it('应正确解析有效的 JSON', () => {
      const script = parser.parse(validScriptJson)

      expect(script.id).toBe('test-script')
      expect(script.title).toBe('测试剧本')
      expect(script.genre).toBe('mystery')
    })

    it('无效 JSON 应抛出错误', () => {
      expect(() => parser.parse('invalid json')).toThrow(ScriptParseError)
    })

    it('缺少必填字段应抛出错误', () => {
      const invalidJson = JSON.stringify({
        title: 'Test',
        // 缺少 id, genre, scenes, endings
      })

      expect(() => parser.parse(invalidJson)).toThrow(ScriptParseError)
    })

    it('缺少 id 应抛出错误', () => {
      const json = JSON.stringify({
        title: 'Test',
        genre: 'mystery',
        scenes: {},
        endings: [],
      })

      expect(() => parser.parse(json)).toThrow(ScriptParseError)
    })

    it('缺少 title 应抛出错误', () => {
      const json = JSON.stringify({
        id: 'test',
        genre: 'mystery',
        scenes: {},
        endings: [],
      })

      expect(() => parser.parse(json)).toThrow(ScriptParseError)
    })

    it('缺少 genre 应抛出错误', () => {
      const json = JSON.stringify({
        id: 'test',
        title: 'Test',
        scenes: {},
        endings: [],
      })

      expect(() => parser.parse(json)).toThrow(ScriptParseError)
    })

    it('缺少 scenes 应抛出错误', () => {
      const json = JSON.stringify({
        id: 'test',
        title: 'Test',
        genre: 'mystery',
        endings: [],
      })

      expect(() => parser.parse(json)).toThrow(ScriptParseError)
    })

    it('缺少 endings 应抛出错误', () => {
      const json = JSON.stringify({
        id: 'test',
        title: 'Test',
        genre: 'mystery',
        scenes: {},
      })

      expect(() => parser.parse(json)).toThrow(ScriptParseError)
    })

    it('字段类型错误应抛出错误', () => {
      const json = JSON.stringify({
        id: 123, // 应为字符串
        title: 'Test',
        genre: 'mystery',
        scenes: {},
        endings: [],
      })

      expect(() => parser.parse(json)).toThrow(ScriptParseError)
    })
    
    it('title 类型错误应抛出错误', () => {
      const json = JSON.stringify({
        id: 'test',
        title: 123, // 应为字符串
        genre: 'mystery',
        scenes: {},
        endings: [],
      })

      expect(() => parser.parse(json)).toThrow(ScriptParseError)
    })
    
    it('genre 类型错误应抛出错误', () => {
      const json = JSON.stringify({
        id: 'test',
        title: 'Test',
        genre: 123, // 应为字符串
        scenes: {},
        endings: [],
      })

      expect(() => parser.parse(json)).toThrow(ScriptParseError)
    })
    
    it('scenes 为 null 应抛出错误', () => {
      const json = JSON.stringify({
        id: 'test',
        title: 'Test',
        genre: 'mystery',
        scenes: null,
        endings: [],
      })

      expect(() => parser.parse(json)).toThrow(ScriptParseError)
    })
    
    it('endings 不是数组应抛出错误', () => {
      const json = JSON.stringify({
        id: 'test',
        title: 'Test',
        genre: 'mystery',
        scenes: {},
        endings: {}, // 应为数组
      })

      expect(() => parser.parse(json)).toThrow(ScriptParseError)
    })

    it('应正确解析可选字段', () => {
      const json = JSON.stringify({
        id: 'test',
        title: 'Test',
        description: 'A test script',
        genre: 'mystery',
        coverImage: 'cover.jpg',
        tags: ['tag1', 'tag2'],
        estimatedDuration: 60,
        difficulty: 'hard',
        characters: [{ id: 'c1', name: 'Character', description: 'desc' }],
        scenes: { start: { id: 'start', text: 'test' } },
        endings: [{ id: 'end', title: 'End', description: 'desc', condition: {} }],
        initialState: { attributes: { a: 1 }, relationships: {} },
      })

      const script = parser.parse(json)
      expect(script.coverImage).toBe('cover.jpg')
      expect(script.tags).toEqual(['tag1', 'tag2'])
      expect(script.estimatedDuration).toBe(60)
      expect(script.difficulty).toBe('hard')
    })
  })

  describe('parseObject', () => {
    it('应正确解析对象', () => {
      const data = JSON.parse(validScriptJson)
      const script = parser.parseObject(data)

      expect(script).toBeDefined()
      expect(script.id).toBe('test-script')
    })

    it('非对象应抛出错误', () => {
      expect(() => parser.parseObject(null)).toThrow(ScriptParseError)
      expect(() => parser.parseObject('string')).toThrow(ScriptParseError)
      expect(() => parser.parseObject(123)).toThrow(ScriptParseError)
    })
  })

  describe('validate', () => {
    it('有效剧本应通过验证', () => {
      const script = parser.parse(validScriptJson)
      const result = parser.validate(script)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('缺少必填字段应验证失败', () => {
      const script: Script = {
        id: '',
        title: '',
        description: '',
        genre: 'mystery',
        characters: [],
        scenes: {},
        endings: [],
      }

      const result = parser.validate(script)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('空场景应验证失败', () => {
      const script: Script = {
        id: 'test',
        title: 'Test',
        description: '',
        genre: 'mystery',
        characters: [],
        scenes: {},
        endings: [{ id: 'end', title: 'End', description: '', condition: {} }],
      }

      const result = parser.validate(script)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Script must have at least one scene')
    })

    it('空结局应验证失败', () => {
      const script: Script = {
        id: 'test',
        title: 'Test',
        description: '',
        genre: 'mystery',
        characters: [],
        scenes: { start: { id: 'start', text: 'test' } },
        endings: [],
      }

      const result = parser.validate(script)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Script must have at least one ending')
    })

    it('无效场景引用应验证失败', () => {
      const script: Script = {
        id: 'test',
        title: 'Test',
        description: '',
        genre: 'mystery',
        characters: [],
        scenes: {
          start: {
            id: 'start',
            text: 'test',
            choices: [
              {
                id: 'choice1',
                text: 'Go',
                nextSceneId: 'nonexistent', // 不存在的场景
              },
            ],
          },
        },
        endings: [{ id: 'end', title: 'End', description: '', condition: {} }],
      }

      const result = parser.validate(script)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('non-existent scene'))).toBe(true)
    })

    it('未知角色引用应产生警告', () => {
      const script: Script = {
        id: 'test',
        title: 'Test',
        description: '',
        genre: 'mystery',
        characters: [],
        scenes: {
          start: {
            id: 'start',
            text: 'test',
            speaker: 'unknown_character', // 不存在的角色
          },
        },
        endings: [{ id: 'end', title: 'End', description: '', condition: {} }],
      }

      const result = parser.validate(script)

      expect(result.warnings.some((w) => w.includes('unknown character'))).toBe(true)
    })
    
    it('初始状态中的未知角色应产生警告', () => {
      const script: Script = {
        id: 'test',
        title: 'Test',
        description: '',
        genre: 'mystery',
        characters: [],
        scenes: {
          start: {
            id: 'start',
            text: 'test',
          },
        },
        endings: [{ id: 'end', title: 'End', description: '', condition: {} }],
        initialState: {
          attributes: {},
          relationships: { unknown_char: 50 },
        },
      }

      const result = parser.validate(script)

      expect(result.warnings.some((w) => w.includes('unknown character'))).toBe(true)
    })
  })

  describe('getScene', () => {
    it('应返回存在的场景', () => {
      const script = parser.parse(validScriptJson)
      const scene = parser.getScene(script, 'start')

      expect(scene).not.toBeNull()
      expect(scene?.id).toBe('start')
      expect(scene?.text).toBe('你站在古堡大门前...')
    })

    it('不存在的场景应返回 null', () => {
      const script = parser.parse(validScriptJson)
      const scene = parser.getScene(script, 'nonexistent')

      expect(scene).toBeNull()
    })
  })

  describe('getCharacter', () => {
    it('应返回存在的角色', () => {
      const script = parser.parse(validScriptJson)
      const character = parser.getCharacter(script, 'butler')

      expect(character).not.toBeNull()
      expect(character?.name).toBe('管家')
    })

    it('不存在的角色应返回 null', () => {
      const script = parser.parse(validScriptJson)
      const character = parser.getCharacter(script, 'nonexistent')

      expect(character).toBeNull()
    })
  })

  describe('getStartScene', () => {
    it('应返回起始场景', () => {
      const script = parser.parse(validScriptJson)
      const scene = parser.getStartScene(script)

      expect(scene).not.toBeNull()
      // 第一个场景
      expect(scene?.id).toBe('start')
    })

    it('空剧本应返回 null', () => {
      const script: Script = {
        id: 'test',
        title: 'Test',
        description: '',
        genre: 'mystery',
        characters: [],
        scenes: {},
        endings: [],
      }

      const scene = parser.getStartScene(script)
      expect(scene).toBeNull()
    })
  })

  describe('getStartSceneId', () => {
    it('应返回起始场景ID', () => {
      const script = parser.parse(validScriptJson)
      const sceneId = parser.getStartSceneId(script)

      expect(sceneId).toBe('start')
    })

    it('空剧本应返回空字符串', () => {
      const script: Script = {
        id: 'test',
        title: 'Test',
        description: '',
        genre: 'mystery',
        characters: [],
        scenes: {},
        endings: [],
      }

      const sceneId = parser.getStartSceneId(script)
      expect(sceneId).toBe('')
    })
  })

  describe('checkSceneReferences', () => {
    it('有效引用应返回空数组', () => {
      const script = parser.parse(validScriptJson)
      const invalidRefs = parser.checkSceneReferences(script)

      expect(invalidRefs).toHaveLength(0)
    })

    it('应检测无效的场景引用', () => {
      const script: Script = {
        id: 'test',
        title: 'Test',
        description: '',
        genre: 'mystery',
        characters: [],
        scenes: {
          start: {
            id: 'start',
            text: 'test',
            choices: [
              {
                id: 'go',
                text: 'Go',
                nextSceneId: 'invalid_scene',
              },
            ],
          },
        },
        endings: [],
      }

      const invalidRefs = parser.checkSceneReferences(script)

      expect(invalidRefs.length).toBeGreaterThan(0)
      expect(invalidRefs[0]).toContain('invalid_scene')
    })

    it('应检测无效的 nextSceneId', () => {
      const script: Script = {
        id: 'test',
        title: 'Test',
        description: '',
        genre: 'mystery',
        characters: [],
        scenes: {
          start: {
            id: 'start',
            text: 'test',
            nextSceneId: 'invalid_scene',
          },
        },
        endings: [],
      }

      const invalidRefs = parser.checkSceneReferences(script)

      expect(invalidRefs.length).toBeGreaterThan(0)
    })
  })

  describe('getMetadata', () => {
    it('应返回正确的元信息', () => {
      const script = parser.parse(validScriptJson)
      const metadata = parser.getMetadata(script)

      expect(metadata.id).toBe('test-script')
      expect(metadata.title).toBe('测试剧本')
      expect(metadata.genre).toBe('mystery')
      expect(metadata.tags).toContain('悬疑')
      expect(metadata.estimatedDuration).toBe(60)
      expect(metadata.difficulty).toBe('normal')
      expect(metadata.sceneCount).toBe(4)
      expect(metadata.characterCount).toBe(1)
      expect(metadata.endingCount).toBe(2)
    })
    
    it('应处理缺失的可选字段', () => {
      const script: Script = {
        id: 'test',
        title: 'Test',
        description: 'desc',
        genre: 'fantasy',
        characters: [],
        scenes: { start: { id: 'start', text: 'test' } },
        endings: [{ id: 'end', title: 'End', description: 'desc', condition: {} }],
      }

      const metadata = parser.getMetadata(script)

      expect(metadata.tags).toEqual([])
      expect(metadata.estimatedDuration).toBe(0)
      expect(metadata.difficulty).toBe('normal')
    })
  })
})

describe('createScriptParser', () => {
  it('应创建 ScriptParser 实例', () => {
    const parser = createScriptParser()
    expect(parser).toBeInstanceOf(ScriptParser)
  })
})

describe('ScriptParseError', () => {
  it('应正确创建错误', () => {
    const error = new ScriptParseError('Test error', 'test.path')

    expect(error.name).toBe('ScriptParseError')
    expect(error.message).toBe('Test error')
    expect(error.path).toBe('test.path')
  })
})

describe('ScriptValidationError', () => {
  it('应正确创建错误', () => {
    const error = new ScriptValidationError('Validation failed', ['error1', 'error2'])

    expect(error.name).toBe('ScriptValidationError')
    expect(error.message).toBe('Validation failed')
    expect(error.errors).toEqual(['error1', 'error2'])
  })
})