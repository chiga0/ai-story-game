/**
 * 统一类型定义
 * 所有剧本、场景、角色、结局等核心类型的定义
 */

// ============================================
// 角色相关类型
// ============================================

/**
 * 角色定义
 */
export interface Character {
  /** 角色 ID */
  id: string
  /** 角色名称 */
  name: string
  /** 角色描述 */
  description?: string
  /** 角色性格 */
  personality?: string
  /** 说话风格 */
  speakingStyle?: string
  /** 头像（emoji 或 URL） */
  avatar?: string
}

/**
 * 角色集合（以 ID 为键）
 */
export type Characters = Record<string, Character>

// ============================================
// 效果和条件类型
// ============================================

/**
 * 效果定义
 * 用于描述选择带来的状态变化
 */
export interface Effect {
  /** 属性名称 */
  attribute?: string
  /** 属性变化值 */
  change?: number
  /** 关系变化 */
  relationship?: {
    /** 角色 ID */
    charId: string
    /** 变化值 */
    change: number
  }
}

/**
 * 条件定义
 * 用于控制选项的可用性
 */
export interface Condition {
  /** 属性名称 */
  attribute?: string
  /** 最小值（满足条件的最小值） */
  min?: number
  /** 最大值（满足条件的最大值） */
  max?: number
}

// ============================================
// 选择和场景类型
// ============================================

/**
 * 选择选项
 */
export interface Choice {
  /** 选项 ID */
  id: string
  /** 选项文本 */
  text: string
  /** 下一个场景 ID */
  nextSceneId: string
  /** 选择带来的效果 */
  effects?: Effect[]
  /** 显示条件 */
  condition?: Condition
}

/**
 * 场景定义
 */
export interface Scene {
  /** 场景 ID */
  id: string
  /** 场景文本/对话内容 */
  text: string
  /** 说话者角色 ID */
  speaker?: string
  /** 背景图片 URL */
  background?: string
  /** 可选的选择列表 */
  choices?: Choice[]
  /** 下一个场景 ID（用于线性场景） */
  nextSceneId?: string
  /** 场景效果 */
  effects?: Effect[]
}

/**
 * 场景集合（以场景 ID 为键）
 */
export type Scenes = Record<string, Scene>

// ============================================
// 结局类型
// ============================================

/**
 * 结局条件
 */
export interface EndingCondition {
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
}

/**
 * 结局定义
 */
export interface Ending {
  /** 结局 ID */
  id: string
  /** 结局标题 */
  title: string
  /** 结局描述 */
  description: string
  /** 触发条件 */
  condition: Record<string, EndingCondition>
}

/**
 * 结局集合
 */
export type Endings = Ending[]

// ============================================
// 初始状态类型
// ============================================

/**
 * 游戏初始状态
 */
export interface InitialState {
  /** 初始属性 */
  attributes?: Record<string, number>
  /** 初始关系 */
  relationships?: Record<string, number>
}

// ============================================
// 剧本类型
// ============================================

/**
 * 剧本类型（核心定义）
 */
export interface Script {
  /** 剧本 ID */
  id: string
  /** 剧本标题 */
  title: string
  /** 剧本描述 */
  description?: string
  /** 剧本类型 */
  genre: string
  /** 封面图片 URL */
  cover?: string
  /** 预计时长（分钟） */
  duration?: number
  /** 难度等级（1-5） */
  difficulty?: number
  /** 角色列表 */
  characters: Characters
  /** 场景列表 */
  scenes: Scenes
  /** 结局列表 */
  endings: Endings
  /** 初始状态 */
  initialState?: InitialState
}

/**
 * 剧本元数据（用于列表展示）
 */
export interface ScriptMeta {
  id: string
  title: string
  description?: string
  genre: string
  cover?: string
  duration?: number
  difficulty?: number
}

// ============================================
// 游戏状态类型
// ============================================

/**
 * 历史记录条目
 */
export interface HistoryEntry {
  /** 场景 ID */
  sceneId: string
  /** 场景文本 */
  text: string
  /** 玩家选择 */
  choice?: string
  /** 时间戳 */
  timestamp: number
}

/**
 * 游戏运行时状态
 */
export interface GameState {
  /** 剧本 ID */
  scriptId: string
  /** 当前场景 ID */
  currentScene: string
  /** 属性值 */
  attributes: Record<string, number>
  /** 关系值 */
  relationships: Record<string, number>
  /** 历史记录 */
  history: HistoryEntry[]
  /** 游戏开始时间 */
  startTime: number
}

// ============================================
// 游戏引擎类型
// ============================================

/**
 * 选择结果
 */
export interface ChoiceResult {
  /** 结果类型 */
  type: 'continue' | 'ending'
  /** 下一个场景（继续游戏时） */
  scene?: Scene
  /** 结局（游戏结束时） */
  ending?: Ending
  /** 应用的效果 */
  effects: Effect[]
}

// ============================================
// AI 相关类型
// ============================================

/**
 * 对话上下文
 */
export interface DialogueContext {
  /** 当前场景 */
  scene: string
  /** 说话者 */
  speaker?: string
  /** 玩家历史选择 */
  playerHistory: string[]
  /** 游戏状态 */
  gameState: Record<string, unknown>
}

/**
 * 游戏上下文
 */
export interface GameContext {
  scriptId: string
  currentScene: string
  attributes: Record<string, number>
  relationships: Record<string, number>
}

/**
 * NPC 定义
 */
export interface NPC {
  id: string
  name: string
  avatar?: string
  personality: string
}

/**
 * 游戏事件
 */
export interface GameEvent {
  id: string
  type: 'random' | 'triggered'
  description: string
  effects?: Record<string, unknown>
}

// ============================================
// 存档类型
// ============================================

/**
 * 存档数据
 */
export interface SaveData {
  /** 存档 ID */
  id: string
  /** 剧本 ID */
  scriptId: string
  /** 剧本标题 */
  scriptTitle: string
  /** 存档名称 */
  name?: string
  /** 游戏状态 */
  state: GameState
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
}

// ============================================
// 类型守卫函数
// ============================================

/**
 * 检查是否为有效的剧本对象
 */
export function isValidScript(obj: unknown): obj is Script {
  if (typeof obj !== 'object' || obj === null) return false
  const script = obj as Script
  return (
    typeof script.id === 'string' &&
    typeof script.title === 'string' &&
    typeof script.genre === 'string' &&
    typeof script.scenes === 'object' &&
    typeof script.characters === 'object' &&
    Array.isArray(script.endings)
  )
}

/**
 * 检查是否为有效的场景对象
 */
export function isValidScene(obj: unknown): obj is Scene {
  if (typeof obj !== 'object' || obj === null) return false
  const scene = obj as Scene
  return typeof scene.id === 'string' && typeof scene.text === 'string'
}

/**
 * 检查是否为有效的选择对象
 */
export function isValidChoice(obj: unknown): obj is Choice {
  if (typeof obj !== 'object' || obj === null) return false
  const choice = obj as Choice
  return (
    typeof choice.id === 'string' &&
    typeof choice.text === 'string' &&
    typeof choice.nextSceneId === 'string'
  )
}