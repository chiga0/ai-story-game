/**
 * 游戏存档管理器
 * MVP 阶段使用 localStorage 存储
 */

import type { GameState } from './engine'

export interface SaveSlot {
  id: string
  scriptId: string
  scriptTitle: string
  currentScene: string
  state: GameState
  savedAt: number
  playDuration: number // 秒
}

const SAVE_KEY = 'ai-story-game-saves'
const MAX_SAVES = 10

/**
 * 获取所有存档
 */
export function getAllSaves(): SaveSlot[] {
  try {
    const data = localStorage.getItem(SAVE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * 获取指定剧本的存档
 */
export function getSavesByScript(scriptId: string): SaveSlot[] {
  const saves = getAllSaves()
  return saves.filter(s => s.scriptId === scriptId)
}

/**
 * 获取单个存档
 */
export function getSave(saveId: string): SaveSlot | null {
  const saves = getAllSaves()
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
  const saves = getAllSaves()
  
  const save: SaveSlot = {
    id: `save-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    scriptId,
    scriptTitle,
    currentScene: state.currentScene,
    state,
    savedAt: Date.now(),
    playDuration: Math.floor((Date.now() - state.startTime) / 1000),
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
  const saves = getAllSaves()
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
  const saves = getAllSaves()
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