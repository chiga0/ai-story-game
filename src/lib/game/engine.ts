/**
 * 游戏引擎核心模块
 * 负责管理游戏状态、处理玩家选择、推进剧情、判定结局
 */

import type { Script as DbScript } from '../db/schema'
import {
  applyEffects,
  evaluateCondition,
  checkEnding as checkEndingState,
  createInitialState,
  cloneState,
} from './state-manager'
import type {
  Script,
  Scene,
  Choice,
  Ending,
  Effect,
  Condition,
  GameState,
  HistoryEntry,
  ChoiceResult,
  InitialState,
} from '../types'

// 重新导出类型，保持向后兼容
export type {
  Script,
  Scene,
  Choice,
  Ending,
  Effect,
  Condition,
  GameState,
  HistoryEntry,
  ChoiceResult,
}

/**
 * 扩展的剧本类型，兼容数据库类型
 */
export interface GameScript extends Omit<DbScript, 'initialState' | 'scenes' | 'endings' | 'characters'> {
  initialState?: InitialState
  scenes: Record<string, Scene>
  endings: Ending[]
  characters?: Record<string, any>
}

// 游戏引擎类
export class GameEngine {
  private script: GameScript | null = null
  private state: GameState | null = null

  /**
   * 初始化游戏
   * @param script 剧本对象
   * @returns 初始游戏状态
   */
  async init(script: GameScript): Promise<GameState> {
    this.script = script
    const sceneIds = Object.keys(script.scenes)
    const initialScene = sceneIds.length > 0 ? sceneIds[0] : ''

    // 获取初始状态
    const initialState = script.initialState || {}
    const attributes = initialState.attributes || {}
    const relationships = initialState.relationships || {}

    this.state = createInitialState(script.id, attributes, relationships)
    this.state.currentScene = initialScene

    return cloneState(this.state)
  }

  /**
   * 从存档恢复游戏
   * @param savedState 保存的游戏状态
   * @param script 剧本对象
   */
  async restore(savedState: GameState, script: GameScript): Promise<void> {
    this.script = script
    this.state = cloneState(savedState)
  }

  /**
   * 获取当前场景
   * @returns 当前场景，或 null
   */
  getCurrentScene(): Scene | null {
    if (!this.script || !this.state) return null
    return this.script.scenes[this.state.currentScene] || null
  }

  /**
   * 获取可用选项列表（过滤条件不满足的选项）
   * @returns 可用选项列表
   */
  getChoices(): Choice[] {
    const scene = this.getCurrentScene()
    if (!scene?.choices) return []

    if (!this.state) return []

    // 过滤满足条件的选项
    return scene.choices.filter((choice) => {
      if (!choice.condition) return true
      return evaluateCondition(this.state!, choice.condition)
    })
  }

  /**
   * 处理玩家选择
   * @param choiceId 选项ID
   * @returns 选择结果
   */
  async processChoice(choiceId: string): Promise<ChoiceResult | null> {
    if (!this.script || !this.state) return null

    const choices = this.getChoices()
    const choice = choices.find((c) => c.id === choiceId)
    if (!choice) return null

    // 记录当前场景到历史
    const currentScene = this.getCurrentScene()
    const appliedEffects: Effect[] = []

    if (currentScene) {
      // 应用选项效果
      if (choice.effects && choice.effects.length > 0) {
        this.state = applyEffects(this.state, choice.effects)
        appliedEffects.push(...choice.effects)
      }

      // 记录历史
      this.state.history.push({
        sceneId: currentScene.id,
        text: currentScene.text,
        choice: choice.text,
        timestamp: Date.now(),
      })
    }

    // 移动到下一个场景
    this.state.currentScene = choice.nextSceneId

    // 获取下一个场景
    const nextScene = this.getCurrentScene()

    // 只在以下情况检查属性结局：
    // 1. 下一个场景没有选择（即结局场景）
    // 2. 或者下一个场景 ID 包含 "ending" 或 "confrontation"
    const isEndingScene = !nextScene?.choices || nextScene.choices.length === 0
    const isCheckpointScene = choice.nextSceneId?.includes('ending') || 
                              choice.nextSceneId?.includes('confrontation')

    if (isEndingScene || isCheckpointScene) {
      // 检查结局
      const ending = checkEndingState(this.state, this.script.endings)

      if (ending) {
        return {
          type: 'ending',
          ending,
          effects: appliedEffects,
        }
      }
    }

    return {
      type: 'continue',
      scene: nextScene || undefined,
      effects: appliedEffects,
    }
  }

  /**
   * 检查是否达到结局
   * @returns 结局对象，或 null
   */
  checkEnding(): Ending | null {
    if (!this.script || !this.state) return null
    if (!this.script.endings || this.script.endings.length === 0) return null
    return checkEndingState(this.state, this.script.endings)
  }

  /**
   * 获取游戏状态
   * @returns 游戏状态
   */
  getState(): GameState | null {
    if (!this.state) return null
    return cloneState(this.state)
  }

  /**
   * 获取游玩时长（秒）
   * @returns 游玩时长
   */
  getPlayDuration(): number {
    if (!this.state) return 0
    return Math.floor((Date.now() - this.state.startTime) / 1000)
  }

  /**
   * 获取属性值
   * @param attributeName 属性名
   * @returns 属性值
   */
  getAttribute(attributeName: string): number {
    if (!this.state) return 0
    return this.state.attributes[attributeName] || 0
  }

  /**
   * 获取关系值
   * @param characterId 角色ID
   * @returns 关系值
   */
  getRelationship(characterId: string): number {
    if (!this.state) return 0
    return this.state.relationships[characterId] || 0
  }
}

/**
 * 创建游戏引擎实例
 * @returns 游戏引擎实例
 */
export function createGameEngine(): GameEngine {
  return new GameEngine()
}