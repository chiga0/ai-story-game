/**
 * 游戏存档管理器
 * MVP 阶段使用 localStorage 存储
 * 
 * 多标签页状态隔离：
 * - 使用 sessionStorage 存储当前标签页 ID
 * - 存档数据包含标签页 ID
 * - 加载存档时只显示当前标签页的存档
 */

import type { GameState } from './engine'

/**
 * 获取当前标签页的唯一 ID
 * 如果不存在则创建一个新的
 */
function getTabId(): string {
  let tabId = sessionStorage.getItem('ai-story-game-tab-id')
  if (!tabId) {
    tabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    sessionStorage.setItem('ai-story-game-tab-id', tabId)
  }
  return tabId
}

/**
 * 场景名称映射（场景ID -> 中文名称）
 */
export const SCENE_NAMES: Record<string, string> = {
  // 神秘古堡
  'start': '古堡大门',
  'castle-history': '古堡历史',
  'hall': '大厅',
  'hall-examine': '大厅检查',
  'safe-attempt': '尝试打开保险柜',
  'photo-question': '询问照片',
  'butler-secret': '管家秘密',
  'kitchen': '厨房',
  'chef-conversation': '与厨师交谈',
  'kitchen-search': '搜索厨房',
  'take-bottle': '拿起药瓶',
  'poison-info': '毒药信息',
  'doctor-info': '医生信息',
  'library': '图书馆',
  'library-search': '搜索图书馆',
  'library-hidden': '图书馆隐藏区',
  'secret-letter': '秘密信件',
  'library-desk': '书桌',
  'basement': '地下室',
  'basement-wall': '地下室墙壁',
  'basement-search': '搜索地下室',
  'garden': '花园',
  'gardener-conversation': '与园丁交谈',
  'key-purpose': '钥匙用途',
  'garden-examine': '检查花园',
  'garden-box': '花园盒子',
  'footprint-trail': '脚印追踪',
  'secret-passage': '秘密通道',
  'attic': '阁楼',
  'trunk-contents': '箱子内容',
  'attic-search': '搜索阁楼',
  'study': '书房',
  'letter': '信件',
  'search': '搜索',
  'window-clue': '窗户线索',
  'maid-conversation': '与女仆交谈',
  'maid-secret': '女仆秘密',
  'maid-reassured': '安抚女仆',
  'secret-room': '密室',
  'have-evidence': '获得证据',
  'confrontation': '对峙',
  'truth-revealed': '真相揭晓',
  'partial-reveal': '部分揭露',
  'failed-ending': '失败结局',
  
  // 星际迷途
  'bridge': '舰桥',
  'crew': '船员',
  'dama': '达玛星',
  
  // 龙之谷
  'village': '村庄',
  'dragon': '巨龙',
}

/**
 * 获取场景的中文名称
 */
export function getSceneDisplayName(sceneId: string): string {
  return SCENE_NAMES[sceneId] || sceneId
}

export interface SaveSlot {
  id: string
  scriptId: string
  scriptTitle: string
  currentScene: string
  exploredBranches: number // 已探索的分支数量
  attributes: Record<string, number> // 关键属性值
  state: GameState
  savedAt: number
  playDuration: number // 秒
  tabId?: string // 标签页 ID，用于多标签页状态隔离
}

const SAVE_KEY = 'ai-story-game-saves'
const MAX_SAVES = 10

/**
 * 获取所有存档（不过滤标签页）
 */
export function getAllSavesRaw(): SaveSlot[] {
  try {
    const data = localStorage.getItem(SAVE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * 获取当前标签页的存档
 */
export function getAllSaves(): SaveSlot[] {
  const tabId = getTabId()
  const saves = getAllSavesRaw()
  // 只返回当前标签页的存档，或没有 tabId 的旧存档（兼容性）
  return saves.filter(s => !s.tabId || s.tabId === tabId)
}

/**
 * 获取指定剧本的存档（当前标签页）
 */
export function getSavesByScript(scriptId: string): SaveSlot[] {
  const saves = getAllSaves()
  return saves.filter(s => s.scriptId === scriptId)
}

/**
 * 获取单个存档（不过滤标签页，用于加载存档）
 */
export function getSave(saveId: string): SaveSlot | null {
  const saves = getAllSavesRaw()
  return saves.find(s => s.id === saveId) || null
}

/**
 * 保存游戏
 */
export function saveGame(
  scriptId: string,
  scriptTitle: string,
  state: GameState
): SaveSlot {
  const saves = getAllSavesRaw() // 使用原始列表，避免过滤
  const tabId = getTabId()
  
  // 计算已探索的分支数量
  const exploredBranches = state.history?.length || 0
  
  // 提取关键属性值
  const attributes: Record<string, number> = {}
  if (state.attributes) {
    // 只保存关键属性
    const keyAttributes = ['clue', 'courage', 'wisdom', 'trust', 'suspicion']
    for (const key of keyAttributes) {
      if (state.attributes[key] !== undefined) {
        attributes[key] = state.attributes[key]
      }
    }
  }
  
  const save: SaveSlot = {
    id: `save-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    scriptId,
    scriptTitle,
    currentScene: state.currentScene,
    exploredBranches,
    attributes,
    state,
    savedAt: Date.now(),
    playDuration: Math.floor((Date.now() - state.startTime) / 1000),
    tabId, // 添加标签页 ID
  }
  
  // 添加到列表开头
  saves.unshift(save)
  
  // 限制存档数量
  if (saves.length > MAX_SAVES) {
    saves.pop()
  }
  
  localStorage.setItem(SAVE_KEY, JSON.stringify(saves))
  
  return save
}

/**
 * 更新存档
 */
export function updateSave(saveId: string, state: GameState): SaveSlot | null {
  const saves = getAllSavesRaw() // 使用原始列表
  const index = saves.findIndex(s => s.id === saveId)
  
  if (index === -1) return null
  
  const updated: SaveSlot = {
    ...saves[index],
    currentScene: state.currentScene,
    state,
    savedAt: Date.now(),
    playDuration: Math.floor((Date.now() - state.startTime) / 1000),
  }
  
  saves[index] = updated
  localStorage.setItem(SAVE_KEY, JSON.stringify(saves))
  
  return updated
}

/**
 * 删除存档
 */
export function deleteSave(saveId: string): boolean {
  const saves = getAllSavesRaw() // 使用原始列表
  const index = saves.findIndex(s => s.id === saveId)
  
  if (index === -1) return false
  
  saves.splice(index, 1)
  localStorage.setItem(SAVE_KEY, JSON.stringify(saves))
  
  return true
}

/**
 * 格式化游戏时长
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}小时${minutes}分钟`
}

/**
 * 格式化保存时间
 */
export function formatSaveTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - timestamp
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 获取最近的存档
 */
export function getLatestSave(): SaveSlot | null {
  const saves = getAllSaves()
  if (saves.length === 0) return null
  // 存档已按时间倒序排列，第一个即为最近的
  return saves[0]
}