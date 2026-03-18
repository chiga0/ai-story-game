/**
 * 剧本验证器
 * 验证 AI 生成的剧本结构正确，可正常运行
 */

import type { Script, Scene, Ending, Choice, Characters, Scenes } from '../../types'

// ============================================
// 类型定义
// ============================================

export interface ValidationError {
  type: 'error'
  code: string
  message: string
  location?: string
  suggestion?: string
}

export interface ValidationWarning {
  type: 'warning'
  code: string
  message: string
  location?: string
}

export interface ScriptStats {
  totalScenes: number
  totalCharacters: number
  totalEndings: number
  totalChoices: number
  averageChoicesPerScene: number
  reachableScenes: number
  unreachableScenes: number
  startingScenes: number
  linearScenes: number
  branchingScenes: number
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  stats: ScriptStats
}

// ============================================
// 验证规则代码
// ============================================

export const ERROR_CODES = {
  MISSING_REQUIRED_FIELD: 'E001',
  DUPLICATE_SCENE_ID: 'E002',
  INVALID_SCENE_REFERENCE: 'E003',
  NO_START_SCENE: 'E004',
  UNREACHABLE_SCENE: 'E005',
  INVALID_CHOICE_REFERENCE: 'E006',
  INVALID_ENDING_REFERENCE: 'E007',
  EMPTY_SCENE_TEXT: 'E008',
  INVALID_TYPE: 'E009',
} as const

export const WARNING_CODES = {
  LOW_SCENE_COUNT: 'W001',
  HIGH_SCENE_COUNT: 'W002',
  LOW_CHARACTER_COUNT: 'W003',
  SINGLE_PATH: 'W004',
  DEEP_NESTING: 'W005',
  UNUSED_CHARACTER: 'W006',
  SHORT_TEXT: 'W007',
} as const

// ============================================
// 主验证函数
// ============================================

/**
 * 验证剧本结构
 */
export function validateScript(script: unknown): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 1. 基础类型检查
  if (!isScriptObject(script)) {
    errors.push({
      type: 'error',
      code: ERROR_CODES.INVALID_TYPE,
      message: '剧本数据格式无效',
      suggestion: '请确保传入有效的剧本对象',
    })
    return {
      valid: false,
      errors,
      warnings,
      stats: createEmptyStats(),
    }
  }

  // 2. 必填字段检查
  validateRequiredFields(script, errors)

  // 如果基础字段缺失，直接返回
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
      stats: createEmptyStats(),
    }
  }

  // 3. 场景验证
  const sceneIds = new Set(Object.keys(script.scenes))
  validateScenes(script.scenes, errors, warnings)

  // 4. 选择验证
  Object.entries(script.scenes).forEach(([sceneId, scene]) => {
    validateChoices(scene, sceneIds, errors, sceneId)
  })

  // 5. 结局验证
  validateEndings(script.endings, sceneIds, errors)

  // 6. 角色验证
  validateCharacters(script.characters, script.scenes, warnings)

  // 7. 可达性检查
  const reachableScenes = checkReachability(script.scenes, errors)

  // 8. 统计信息
  const stats = calculateStats(script, reachableScenes)

  // 9. 警告检查
  checkWarnings(script, stats, warnings)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats,
  }
}

// ============================================
// 验证辅助函数
// ============================================

function isScriptObject(obj: unknown): obj is Script {
  return typeof obj === 'object' && obj !== null
}

function createEmptyStats(): ScriptStats {
  return {
    totalScenes: 0,
    totalCharacters: 0,
    totalEndings: 0,
    totalChoices: 0,
    averageChoicesPerScene: 0,
    reachableScenes: 0,
    unreachableScenes: 0,
    startingScenes: 0,
    linearScenes: 0,
    branchingScenes: 0,
  }
}

function validateRequiredFields(script: Script, errors: ValidationError[]): void {
  if (!script.id || typeof script.id !== 'string') {
    errors.push({
      type: 'error',
      code: ERROR_CODES.MISSING_REQUIRED_FIELD,
      message: '缺少必填字段：id',
      location: 'root',
    })
  }

  if (!script.title || typeof script.title !== 'string') {
    errors.push({
      type: 'error',
      code: ERROR_CODES.MISSING_REQUIRED_FIELD,
      message: '缺少必填字段：title',
      location: 'root',
    })
  }

  if (!script.genre || typeof script.genre !== 'string') {
    errors.push({
      type: 'error',
      code: ERROR_CODES.MISSING_REQUIRED_FIELD,
      message: '缺少必填字段：genre',
      location: 'root',
    })
  }

  if (!script.scenes || typeof script.scenes !== 'object') {
    errors.push({
      type: 'error',
      code: ERROR_CODES.MISSING_REQUIRED_FIELD,
      message: '缺少必填字段：scenes',
      location: 'root',
    })
  }

  if (!script.characters || typeof script.characters !== 'object') {
    errors.push({
      type: 'error',
      code: ERROR_CODES.MISSING_REQUIRED_FIELD,
      message: '缺少必填字段：characters',
      location: 'root',
    })
  }

  if (!Array.isArray(script.endings)) {
    errors.push({
      type: 'error',
      code: ERROR_CODES.MISSING_REQUIRED_FIELD,
      message: '缺少必填字段：endings',
      location: 'root',
    })
  }
}

/**
 * 验证场景列表
 */
export function validateScenes(
  scenes: Scenes,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const sceneIds = new Set<string>()

  // 检查是否有 start 场景
  if (!scenes['start']) {
    errors.push({
      type: 'error',
      code: ERROR_CODES.NO_START_SCENE,
      message: '缺少起点场景（id: "start"）',
      suggestion: '请添加一个 id 为 "start" 的场景作为故事起点',
    })
  }

  Object.entries(scenes).forEach(([sceneId, scene]) => {
    // 检查 ID 唯一性
    if (sceneIds.has(sceneId)) {
      errors.push({
        type: 'error',
        code: ERROR_CODES.DUPLICATE_SCENE_ID,
        message: `场景 ID 重复：${sceneId}`,
        location: `scenes.${sceneId}`,
      })
    }
    sceneIds.add(sceneId)

    // 检查场景文本
    if (!scene.text || scene.text.trim().length === 0) {
      errors.push({
        type: 'error',
        code: ERROR_CODES.EMPTY_SCENE_TEXT,
        message: `场景 ${sceneId} 没有文本内容`,
        location: `scenes.${sceneId}.text`,
      })
    } else if (scene.text.length < 20) {
      warnings.push({
        type: 'warning',
        code: WARNING_CODES.SHORT_TEXT,
        message: `场景 ${sceneId} 文本过短（${scene.text.length} 字符）`,
        location: `scenes.${sceneId}.text`,
      })
    }

    // 检查场景 ID 一致性
    if (scene.id !== sceneId) {
      errors.push({
        type: 'error',
        code: ERROR_CODES.INVALID_TYPE,
        message: `场景 ID 不一致：对象键为 ${sceneId}，但 scene.id 为 ${scene.id}`,
        location: `scenes.${sceneId}`,
      })
    }
  })
}

/**
 * 验证选择列表
 */
export function validateChoices(
  scene: Scene,
  allSceneIds: Set<string>,
  errors: ValidationError[],
  sceneId: string
): void {
  if (!scene.choices || scene.choices.length === 0) {
    // 没有选择是允许的（可能是结局场景）
    return
  }

  const choiceIds = new Set<string>()

  scene.choices.forEach((choice: Choice, index: number) => {
    // 检查选择 ID 唯一性
    if (choiceIds.has(choice.id)) {
      errors.push({
        type: 'error',
        code: ERROR_CODES.DUPLICATE_SCENE_ID,
        message: `场景 ${sceneId} 中选择 ID 重复：${choice.id}`,
        location: `scenes.${sceneId}.choices[${index}]`,
      })
    }
    choiceIds.add(choice.id)

    // 检查选择文本
    if (!choice.text || choice.text.trim().length === 0) {
      errors.push({
        type: 'error',
        code: ERROR_CODES.EMPTY_SCENE_TEXT,
        message: `场景 ${sceneId} 的选择 ${index} 没有文本`,
        location: `scenes.${sceneId}.choices[${index}].text`,
      })
    }

    // 检查目标场景是否存在
    if (!allSceneIds.has(choice.nextSceneId)) {
      errors.push({
        type: 'error',
        code: ERROR_CODES.INVALID_CHOICE_REFERENCE,
        message: `选择 "${choice.id}" 引用了不存在的场景：${choice.nextSceneId}`,
        location: `scenes.${sceneId}.choices[${index}].nextSceneId`,
        suggestion: `请确保 nextSceneId 指向一个有效的场景 ID`,
      })
    }
  })
}

/**
 * 验证结局列表
 */
export function validateEndings(
  endings: Ending[],
  allSceneIds: Set<string>,
  errors: ValidationError[]
): void {
  if (!Array.isArray(endings) || endings.length === 0) {
    errors.push({
      type: 'error',
      code: ERROR_CODES.MISSING_REQUIRED_FIELD,
      message: '剧本至少需要一个结局',
      location: 'endings',
    })
    return
  }

  const endingIds = new Set<string>()

  endings.forEach((ending: Ending, index: number) => {
    // 检查结局 ID 唯一性
    if (endingIds.has(ending.id)) {
      errors.push({
        type: 'error',
        code: ERROR_CODES.DUPLICATE_SCENE_ID,
        message: `结局 ID 重复：${ending.id}`,
        location: `endings[${index}]`,
      })
    }
    endingIds.add(ending.id)

    // 检查必填字段
    if (!ending.title) {
      errors.push({
        type: 'error',
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: `结局 ${index} 缺少标题`,
        location: `endings[${index}].title`,
      })
    }

    if (!ending.description) {
      errors.push({
        type: 'error',
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: `结局 ${index} 缺少描述`,
        location: `endings[${index}].description`,
      })
    }

    // 检查条件
    if (!ending.condition || Object.keys(ending.condition).length === 0) {
      errors.push({
        type: 'error',
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: `结局 "${ending.id}" 缺少触发条件`,
        location: `endings[${index}].condition`,
      })
    }
  })
}

/**
 * 验证角色列表
 */
function validateCharacters(
  characters: Characters,
  scenes: Scenes,
  warnings: ValidationWarning[]
): void {
  const usedCharacterIds = new Set<string>()

  // 收集场景中使用的角色
  Object.values(scenes).forEach((scene) => {
    if (scene.speaker) {
      usedCharacterIds.add(scene.speaker)
    }
  })

  // 检查未使用的角色
  Object.keys(characters).forEach((charId) => {
    if (!usedCharacterIds.has(charId)) {
      warnings.push({
        type: 'warning',
        code: WARNING_CODES.UNUSED_CHARACTER,
        message: `角色 "${characters[charId].name}" (${charId}) 未在任何场景中使用`,
        location: `characters.${charId}`,
      })
    }
  })

  // 检查使用了但未定义的角色
  usedCharacterIds.forEach((charId) => {
    if (!characters[charId]) {
      warnings.push({
        type: 'warning',
        code: WARNING_CODES.UNUSED_CHARACTER,
        message: `场景中使用了未定义的角色：${charId}`,
        location: 'scenes',
      })
    }
  })
}

/**
 * 检查场景可达性
 */
function checkReachability(scenes: Scenes, errors: ValidationError[]): Set<string> {
  const reachable = new Set<string>()
  const toVisit: string[] = ['start']

  // BFS 遍历所有可达场景
  while (toVisit.length > 0) {
    const sceneId = toVisit.shift()!
    if (reachable.has(sceneId)) continue

    const scene = scenes[sceneId]
    if (!scene) continue

    reachable.add(sceneId)

    // 添加选择指向的场景
    if (scene.choices) {
      scene.choices.forEach((choice) => {
        if (!reachable.has(choice.nextSceneId)) {
          toVisit.push(choice.nextSceneId)
        }
      })
    }

    // 添加线性场景
    if (scene.nextSceneId && !reachable.has(scene.nextSceneId)) {
      toVisit.push(scene.nextSceneId)
    }
  }

  // 检查不可达场景
  Object.keys(scenes).forEach((sceneId) => {
    if (!reachable.has(sceneId)) {
      errors.push({
        type: 'error',
        code: ERROR_CODES.UNREACHABLE_SCENE,
        message: `场景 "${sceneId}" 不可达（无法从起点场景到达）`,
        location: `scenes.${sceneId}`,
        suggestion: '请检查场景之间的连接是否正确',
      })
    }
  })

  return reachable
}

/**
 * 计算统计信息
 */
function calculateStats(script: Script, reachableScenes: Set<string>): ScriptStats {
  const scenes = Object.values(script.scenes)
  const characters = Object.values(script.characters)

  const totalChoices = scenes.reduce(
    (sum, scene) => sum + (scene.choices?.length || 0),
    0
  )

  const linearScenes = scenes.filter(
    (scene) => !scene.choices || scene.choices.length === 0
  ).length

  const branchingScenes = scenes.filter(
    (scene) => scene.choices && scene.choices.length > 0
  ).length

  return {
    totalScenes: scenes.length,
    totalCharacters: characters.length,
    totalEndings: script.endings.length,
    totalChoices,
    averageChoicesPerScene: scenes.length > 0 ? Math.round(totalChoices / scenes.length * 10) / 10 : 0,
    reachableScenes: reachableScenes.size,
    unreachableScenes: scenes.length - reachableScenes.size,
    startingScenes: scenes['start'] ? 1 : 0,
    linearScenes,
    branchingScenes,
  }
}

/**
 * 检查警告条件
 */
function checkWarnings(
  script: Script,
  stats: ScriptStats,
  warnings: ValidationWarning[]
): void {
  // 场景数量警告
  if (stats.totalScenes < 5) {
    warnings.push({
      type: 'warning',
      code: WARNING_CODES.LOW_SCENE_COUNT,
      message: `场景数量较少（${stats.totalScenes} 个），可能影响游戏体验`,
    })
  }

  if (stats.totalScenes > 50) {
    warnings.push({
      type: 'warning',
      code: WARNING_CODES.HIGH_SCENE_COUNT,
      message: `场景数量较多（${stats.totalScenes} 个），可能导致性能问题`,
    })
  }

  // 角色数量警告
  if (stats.totalCharacters < 2) {
    warnings.push({
      type: 'warning',
      code: WARNING_CODES.LOW_CHARACTER_COUNT,
      message: `角色数量较少（${stats.totalCharacters} 个），可能影响剧情丰富度`,
    })
  }

  // 单一路径警告
  if (stats.averageChoicesPerScene < 1.5) {
    warnings.push({
      type: 'warning',
      code: WARNING_CODES.SINGLE_PATH,
      message: '选择分支较少，游戏线性和单一',
    })
  }
}

// ============================================
// 导出验证工具
// ============================================

export { validateScript as validateScriptStructure }