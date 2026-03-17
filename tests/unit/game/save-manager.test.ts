import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getAllSaves,
  getSavesByScript,
  getSave,
  saveGame,
  updateSave,
  deleteSave,
  formatDuration,
  formatSaveTime,
  type SaveSlot,
} from '../../../src/lib/game/save-manager'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('SaveManager', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('getAllSaves', () => {
    it('应该返回空数组当没有存档时', () => {
      const saves = getAllSaves()
      expect(saves).toEqual([])
    })

    it('应该返回所有存档', () => {
      const state = createMockState()
      saveGame('script-1', '剧本1', state)
      saveGame('script-2', '剧本2', state)

      const saves = getAllSaves()
      expect(saves.length).toBe(2)
    })
  })

  describe('getSavesByScript', () => {
    it('应该返回指定剧本的存档', () => {
      const state = createMockState()
      saveGame('script-1', '剧本1', state)
      saveGame('script-2', '剧本2', state)
      saveGame('script-1', '剧本1', state)

      const saves = getSavesByScript('script-1')
      expect(saves.length).toBe(2)
      saves.forEach(s => expect(s.scriptId).toBe('script-1'))
    })

    it('应该返回空数组当没有匹配的存档', () => {
      const state = createMockState()
      saveGame('script-1', '剧本1', state)

      const saves = getSavesByScript('non-existent')
      expect(saves).toEqual([])
    })
  })

  describe('saveGame', () => {
    it('应该创建新存档', () => {
      const state = createMockState()
      const save = saveGame('script-1', '测试剧本', state)

      expect(save.id).toBeDefined()
      expect(save.scriptId).toBe('script-1')
      expect(save.scriptTitle).toBe('测试剧本')
      expect(save.currentScene).toBe(state.currentScene)
      expect(save.savedAt).toBeGreaterThan(0)
    })

    it('新存档应该在列表开头', () => {
      const state = createMockState()
      const save1 = saveGame('script-1', '剧本1', state)
      const save2 = saveGame('script-2', '剧本2', state)

      const saves = getAllSaves()
      expect(saves[0].id).toBe(save2.id)
      expect(saves[1].id).toBe(save1.id)
    })

    it('应该限制最大存档数量', () => {
      const state = createMockState()
      
      // 创建超过限制的存档
      for (let i = 0; i < 15; i++) {
        saveGame(`script-${i}`, `剧本${i}`, state)
      }

      const saves = getAllSaves()
      expect(saves.length).toBe(10) // MAX_SAVES = 10
    })
  })

  describe('getSave', () => {
    it('应该返回指定存档', () => {
      const state = createMockState()
      const saved = saveGame('script-1', '剧本1', state)

      const found = getSave(saved.id)
      expect(found?.id).toBe(saved.id)
    })

    it('应该返回 null 当存档不存在', () => {
      const found = getSave('non-existent')
      expect(found).toBeNull()
    })
  })

  describe('updateSave', () => {
    it('应该更新存档', () => {
      const state = createMockState()
      const saved = saveGame('script-1', '剧本1', state)

      const newState = {
        ...state,
        currentScene: 'scene-2',
      }

      const updated = updateSave(saved.id, newState)
      expect(updated?.currentScene).toBe('scene-2')
    })

    it('应该返回 null 当存档不存在', () => {
      const state = createMockState()
      const result = updateSave('non-existent', state)
      expect(result).toBeNull()
    })
  })

  describe('deleteSave', () => {
    it('应该删除存档', () => {
      const state = createMockState()
      const saved = saveGame('script-1', '剧本1', state)

      const result = deleteSave(saved.id)
      expect(result).toBe(true)

      const found = getSave(saved.id)
      expect(found).toBeNull()
    })

    it('应该返回 false 当存档不存在', () => {
      const result = deleteSave('non-existent')
      expect(result).toBe(false)
    })
  })

  describe('formatDuration', () => {
    it('应该格式化秒', () => {
      expect(formatDuration(30)).toBe('30秒')
    })

    it('应该格式化分钟', () => {
      expect(formatDuration(120)).toBe('2分钟')
    })

    it('应该格式化小时和分钟', () => {
      expect(formatDuration(3661)).toBe('1小时1分钟')
    })
  })

  describe('formatSaveTime', () => {
    it('应该显示刚刚', () => {
      const now = Date.now()
      expect(formatSaveTime(now)).toBe('刚刚')
    })

    it('应该显示分钟前', () => {
      const time = Date.now() - 5 * 60 * 1000 // 5分钟前
      expect(formatSaveTime(time)).toBe('5分钟前')
    })

    it('应该显示小时前', () => {
      const time = Date.now() - 2 * 60 * 60 * 1000 // 2小时前
      expect(formatSaveTime(time)).toBe('2小时前')
    })
  })
})

// Helper
function createMockState() {
  return {
    scriptId: 'test-script',
    currentScene: 'start',
    attributes: { courage: 50 },
    relationships: {},
    history: [],
    startTime: Date.now() - 60 * 1000, // 1分钟前开始
  }
}