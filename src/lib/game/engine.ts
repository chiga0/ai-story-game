/**
 * 游戏引擎核心模块
 * 负责管理游戏状态、处理玩家选择、推进剧情、判定结局
 */

import type { Script } from '../db/schema'
import {
  applyEffects,
  evaluateCondition,
  checkEnding as checkEndingState,
  createInitialState,
  cloneState,
} from './state-manager'

// 游戏状态
export interface GameState {
  scriptId: string
  currentScene: string
  attributes: Record<string, number>
  relationships: Record<string, number>
  history: HistoryEntry[]
  startTime: number
}

export interface HistoryEntry {
  sceneId: string
  text: string
  choice?: string
  timestamp: number
}

export interface Choice {
  id: string
  text: string
  nextSceneId: string
  effects?: Effect[]
  condition?: Condition
}

export interface Effect {
  attribute?: string
  change?: number
  relationship?: { charId: string; change: number }
}

export interface Condition {
  attribute?: string
  min?: number
  max?: number
}

export interface Scene {
  id: string
  speaker?: string
  text: string
  choices?: Choice[]
  nextSceneId?: string
  effects?: Effect[]
}

export interface Ending {
  id: string
  title: string
  description: string
  condition: Record<string, { min?: number; max?: number }>
}

// 选择结果
export interface ChoiceResult {
  type: 'continue' | 'ending'
  scene?: Scene
  ending?: Ending
  effects: Effect[]
}

// 游戏引擎类
export class GameEngine {
  private script: Script | null = null
  private state: GameState | null = null

  /**
   * 初始化游戏
   * @param script 剧本对象
   * @returns 初始游戏状态
   */
  async init(script: Script): Promise<GameState> {
    this.script = script
    const scenes = script.scenes as Record<string, Scene>
    const sceneIds = Object.keys(scenes)
    const initialScene = sceneIds.length > 0 ? sceneIds[0] : ''

    // 获取初始状态
    const initialState = (script.scenes as any)?.initialState || {}
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
  async restore(savedState: GameState, script: Script): Promise<void> {
    this.script = script
    this.state = cloneState(savedState)
  }

  /**
   * 获取当前场景
   * @returns 当前场景，或 null
   */
  getCurrentScene(): Scene | null {
    if (!this.script || !this.state) return null
    const scenes = this.script.scenes as Record<string, Scene>
    return scenes[this.state.currentScene] || null
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

    // 检查结局
    const endings = this.script.endings as Ending[]
    const ending = checkEndingState(this.state, endings)

    if (ending) {
      return {
        type: 'ending',
        ending,
        effects: appliedEffects,
      }
    }

    const nextScene = this.getCurrentScene()
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

    const endings = this.script.endings as Ending[]
    if (!endings || endings.length === 0) return null

    return checkEndingState(this.state, endings)
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
