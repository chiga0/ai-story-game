/**
 * 状态管理模块
 * 负责管理游戏状态、应用效果、评估条件
 */

import type {
  GameState,
  Choice,
  Ending,
  Effect,
  Condition,
  EndingCondition,
} from '../../types'

// 重新导出类型，保持向后兼容
export type { Effect, Condition }

/**
 * 应用效果到游戏状态
 * @param state 当前游戏状态
 * @param effects 效果列表
 * @returns 更新后的游戏状态
 */
export function applyEffects(state: GameState, effects: Effect[]): GameState {
  const newState = { ...state }

  // 深拷贝属性和关系
  newState.attributes = { ...state.attributes }
  newState.relationships = { ...state.relationships }

  for (const effect of effects) {
    // 属性效果
    if (effect.attribute !== undefined && effect.change !== undefined) {
      const currentValue = newState.attributes[effect.attribute] || 0
      newState.attributes[effect.attribute] = currentValue + effect.change
    }

    // 关系效果
    if (effect.relationship) {
      const { charId, change } = effect.relationship
      const currentValue = newState.relationships[charId] || 0
      // 关系值限制在 -100 到 100 之间
      newState.relationships[charId] = Math.max(-100, Math.min(100, currentValue + change))
    }
  }

  return newState
}

/**
 * 评估条件是否满足
 * @param state 当前游戏状态
 * @param condition 条件
 * @returns 是否满足条件
 */
export function evaluateCondition(state: GameState, condition: Condition): boolean {
  if (!condition.attribute) return true

  const value = state.attributes[condition.attribute] || 0

  if (condition.min !== undefined && value < condition.min) {
    return false
  }

  if (condition.max !== undefined && value > condition.max) {
    return false
  }

  return true
}

/**
 * 过滤满足条件的选项
 * @param state 当前游戏状态
 * @param choices 选项列表
 * @returns 可用的选项列表
 */
export function filterAvailableChoices(state: GameState, choices: Choice[]): Choice[] {
  return choices.filter((choice) => {
    if (!choice.condition) return true
    return evaluateCondition(state, choice.condition)
  })
}

/**
 * 检查是否达到结局
 * @param state 当前游戏状态
 * @param endings 结局列表
 * @param minHistoryCount 触发结局所需的最小历史记录数（默认 5，避免游戏流程过短）
 * @returns 匹配的结局（优先级最高的），或 null
 */
export function checkEnding(
  state: GameState,
  endings: Ending[],
  minHistoryCount: number = 5
): Ending | null {
  // 防止游戏刚开始就触发结局：至少需要经过 minHistoryCount 次选择
  if (state.history.length < minHistoryCount) {
    return null
  }

  const matchedEndings: Ending[] = []

  for (const ending of endings) {
    let matched = true

    for (const [attr, condition] of Object.entries(ending.condition)) {
      const value = state.attributes[attr] || 0

      if (condition.min !== undefined && value < condition.min) {
        matched = false
        break
      }

      if (condition.max !== undefined && value > condition.max) {
        matched = false
        break
      }
    }

    if (matched) {
      matchedEndings.push(ending)
    }
  }

  // 如果有多个结局匹配，返回第一个（按照定义顺序）
  return matchedEndings.length > 0 ? matchedEndings[0] : null
}

/**
 * 获取属性值
 * @param state 当前游戏状态
 * @param attributeName 属性名
 * @returns 属性值
 */
export function getAttribute(state: GameState, attributeName: string): number {
  return state.attributes[attributeName] || 0
}

/**
 * 获取关系值
 * @param state 当前游戏状态
 * @param characterId 角色ID
 * @returns 关系值
 */
export function getRelationship(state: GameState, characterId: string): number {
  return state.relationships[characterId] || 0
}

/**
 * 设置属性值
 * @param state 当前游戏状态
 * @param attributeName 属性名
 * @param value 新值
 * @returns 更新后的游戏状态
 */
export function setAttribute(state: GameState, attributeName: string, value: number): GameState {
  return {
    ...state,
    attributes: {
      ...state.attributes,
      [attributeName]: value,
    },
  }
}

/**
 * 设置关系值
 * @param state 当前游戏状态
 * @param characterId 角色ID
 * @param value 新值
 * @returns 更新后的游戏状态
 */
export function setRelationship(state: GameState, characterId: string, value: number): GameState {
  // 关系值限制在 -100 到 100 之间
  const clampedValue = Math.max(-100, Math.min(100, value))

  return {
    ...state,
    relationships: {
      ...state.relationships,
      [characterId]: clampedValue,
    },
  }
}

/**
 * 创建初始游戏状态
 * @param scriptId 剧本ID
 * @param initialAttributes 初始属性
 * @param initialRelationships 初始关系
 * @returns 初始游戏状态
 */
export function createInitialState(
  scriptId: string,
  initialAttributes: Record<string, number> = {},
  initialRelationships: Record<string, number> = {}
): GameState {
  return {
    scriptId,
    currentScene: '',
    attributes: { ...initialAttributes },
    relationships: { ...initialRelationships },
    history: [],
    startTime: Date.now(),
  }
}

/**
 * 克隆游戏状态（深拷贝）
 * @param state 当前游戏状态
 * @returns 克隆的游戏状态
 */
export function cloneState(state: GameState): GameState {
  return {
    scriptId: state.scriptId,
    currentScene: state.currentScene,
    attributes: { ...state.attributes },
    relationships: { ...state.relationships },
    history: state.history.map((entry) => ({ ...entry })),
    startTime: state.startTime,
  }
}