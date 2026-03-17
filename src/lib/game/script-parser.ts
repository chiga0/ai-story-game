/**
 * 剧本解析模块
 * 负责解析、验证和管理游戏剧本数据
 */

import type { Scene, Ending } from './engine'

// 角色定义
export interface Character {
  id: string
  name: string
  avatar?: string
  description: string
  personality?: string
  speakingStyle?: string
}

// 剧本定义
export interface Script {
  id: string
  title: string
  description: string
  coverImage?: string
  genre: 'mystery' | 'fantasy' | 'scifi' | 'ancient' | 'modern'
  tags?: string[]
  estimatedDuration?: number
  difficulty?: 'easy' | 'normal' | 'hard'
  
  // 剧本内容
  characters: Character[]
  scenes: Record<string, Scene>
  endings: Ending[]
  
  // 初始状态
  initialState?: {
    attributes: Record<string, number>
    relationships: Record<string, number>
  }
  
  // 元数据
  playCount?: number
  rating?: number
  createdAt?: string
  updatedAt?: string
}

// 验证结果
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// 解析错误
export class ScriptParseError extends Error {
  constructor(message: string, public path?: string) {
    super(message)
    this.name = 'ScriptParseError'
  }
}

// 验证错误
export class ScriptValidationError extends Error {
  constructor(message: string, public errors: string[]) {
    super(message)
    this.name = 'ScriptValidationError'
  }
}

/**
 * 剧本解析器类
 */
export class ScriptParser {
  /**
   * 解析 JSON 字符串为剧本对象
   * @param json JSON 字符串
   * @returns 剧本对象
   */
  parse(json: string): Script {
    let data: unknown
    
    try {
      data = JSON.parse(json)
    } catch (e) {
      throw new ScriptParseError('Invalid JSON format')
    }
    
    return this.parseObject(data)
  }
  
  /**
   * 解析对象为剧本对象
   * @param data 数据对象
   * @returns 剧本对象
   */
  parseObject(data: unknown): Script {
    if (!data || typeof data !== 'object') {
      throw new ScriptParseError('Script data must be an object')
    }
    
    const obj = data as Record<string, unknown>
    
    // 检查必填字段
    const requiredFields = ['id', 'title', 'genre', 'scenes', 'endings']
    for (const field of requiredFields) {
      if (!(field in obj)) {
        throw new ScriptParseError(`Missing required field: ${field}`)
      }
    }
    
    // 验证字段类型
    if (typeof obj.id !== 'string') {
      throw new ScriptParseError('Field "id" must be a string')
    }
    if (typeof obj.title !== 'string') {
      throw new ScriptParseError('Field "title" must be a string')
    }
    if (typeof obj.genre !== 'string') {
      throw new ScriptParseError('Field "genre" must be a string')
    }
    if (typeof obj.scenes !== 'object' || obj.scenes === null) {
      throw new ScriptParseError('Field "scenes" must be an object')
    }
    if (!Array.isArray(obj.endings)) {
      throw new ScriptParseError('Field "endings" must be an array')
    }
    
    // 构建剧本对象
    const script: Script = {
      id: obj.id,
      title: obj.title,
      description: typeof obj.description === 'string' ? obj.description : '',
      genre: obj.genre as Script['genre'],
      characters: Array.isArray(obj.characters) ? obj.characters : [],
      scenes: obj.scenes as Record<string, Scene>,
      endings: obj.endings as Ending[],
    }
    
    // 可选字段
    if (typeof obj.coverImage === 'string') {
      script.coverImage = obj.coverImage
    }
    if (Array.isArray(obj.tags)) {
      script.tags = obj.tags as string[]
    }
    if (typeof obj.estimatedDuration === 'number') {
      script.estimatedDuration = obj.estimatedDuration
    }
    if (typeof obj.difficulty === 'string') {
      script.difficulty = obj.difficulty as Script['difficulty']
    }
    if (obj.initialState && typeof obj.initialState === 'object') {
      script.initialState = obj.initialState as Script['initialState']
    }
    
    return script
  }
  
  /**
   * 验证剧本数据
   * @param script 剧本对象
   * @returns 验证结果
   */
  validate(script: Script): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    // 检查必填字段
    if (!script.id) {
      errors.push('Script id is required')
    }
    if (!script.title) {
      errors.push('Script title is required')
    }
    if (!script.genre) {
      errors.push('Script genre is required')
    }
    
    // 检查场景
    if (!script.scenes || Object.keys(script.scenes).length === 0) {
      errors.push('Script must have at least one scene')
    }
    
    // 检查结局
    if (!script.endings || script.endings.length === 0) {
      errors.push('Script must have at least one ending')
    }
    
    // 检查角色引用
    const characterIds = new Set(script.characters.map((c) => c.id))
    
    for (const [sceneId, scene] of Object.entries(script.scenes)) {
      // 检查场景中的角色引用
      if (scene.speaker && !characterIds.has(scene.speaker)) {
        warnings.push(`Scene "${sceneId}" references unknown character "${scene.speaker}"`)
      }
      
      // 检查选项中的场景引用
      if (scene.choices) {
        for (const choice of scene.choices) {
          if (!script.scenes[choice.nextSceneId]) {
            errors.push(`Choice "${choice.id}" in scene "${sceneId}" references non-existent scene "${choice.nextSceneId}"`)
          }
        }
      }
      
      // 检查自动跳转场景
      if (scene.nextSceneId && !script.scenes[scene.nextSceneId]) {
        errors.push(`Scene "${sceneId}" references non-existent scene "${scene.nextSceneId}"`)
      }
    }
    
    // 检查初始状态中的角色引用
    if (script.initialState?.relationships) {
      for (const charId of Object.keys(script.initialState.relationships)) {
        if (!characterIds.has(charId)) {
          warnings.push(`Initial state references unknown character "${charId}"`)
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
  
  /**
   * 获取场景
   * @param script 剧本对象
   * @param sceneId 场景ID
   * @returns 场景对象，或 null
   */
  getScene(script: Script, sceneId: string): Scene | null {
    return script.scenes[sceneId] || null
  }
  
  /**
   * 获取角色
   * @param script 剧本对象
   * @param charId 角色ID
   * @returns 角色对象，或 null
   */
  getCharacter(script: Script, charId: string): Character | null {
    return script.characters.find((c) => c.id === charId) || null
  }
  
  /**
   * 获取起始场景
   * @param script 剧本对象
   * @returns 起始场景
   */
  getStartScene(script: Script): Scene | null {
    const sceneIds = Object.keys(script.scenes)
    if (sceneIds.length === 0) return null
    
    // 默认返回第一个场景
    const firstSceneId = sceneIds[0]
    return script.scenes[firstSceneId] || null
  }
  
  /**
   * 获取起始场景ID
   * @param script 剧本对象
   * @returns 起始场景ID
   */
  getStartSceneId(script: Script): string {
    const sceneIds = Object.keys(script.scenes)
    return sceneIds.length > 0 ? sceneIds[0] : ''
  }
  
  /**
   * 检查场景引用完整性
   * @param script 剧本对象
   * @returns 无效引用列表
   */
  checkSceneReferences(script: Script): string[] {
    const invalidRefs: string[] = []
    const sceneIds = new Set(Object.keys(script.scenes))
    
    for (const [sceneId, scene] of Object.entries(script.scenes)) {
      if (scene.choices) {
        for (const choice of scene.choices) {
          if (!sceneIds.has(choice.nextSceneId)) {
            invalidRefs.push(`Scene "${sceneId}" -> Choice "${choice.id}" -> "${choice.nextSceneId}"`)
          }
        }
      }
      
      if (scene.nextSceneId && !sceneIds.has(scene.nextSceneId)) {
        invalidRefs.push(`Scene "${sceneId}" -> "${scene.nextSceneId}"`)
      }
    }
    
    return invalidRefs
  }
  
  /**
   * 获取剧本元信息
   * @param script 剧本对象
   * @returns 元信息对象
   */
  getMetadata(script: Script): {
    id: string
    title: string
    description: string
    genre: string
    tags: string[]
    estimatedDuration: number
    difficulty: string
    sceneCount: number
    characterCount: number
    endingCount: number
  } {
    return {
      id: script.id,
      title: script.title,
      description: script.description,
      genre: script.genre,
      tags: script.tags || [],
      estimatedDuration: script.estimatedDuration || 0,
      difficulty: script.difficulty || 'normal',
      sceneCount: Object.keys(script.scenes).length,
      characterCount: script.characters.length,
      endingCount: script.endings.length,
    }
  }
}

// 创建解析器实例
export function createScriptParser(): ScriptParser {
  return new ScriptParser()
}