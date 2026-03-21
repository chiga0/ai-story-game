/**
 * 成就系统
 * 定义成就类型、检查成就条件、管理成就状态
 */

// ============================================
// 成就类型定义
// ============================================

/**
 * 成就定义
 */
export interface Achievement {
  /** 成就 ID */
  id: string
  /** 成就名称 */
  name: string
  /** 成就描述 */
  description: string
  /** 成就图标（emoji） */
  icon: string
  /** 成就分类 */
  category: AchievementCategory
  /** 解锁条件描述 */
  condition: string
  /** 是否隐藏（未解锁时不显示详情） */
  hidden?: boolean
}

/**
 * 成就分类
 */
export type AchievementCategory = 'progress' | 'exploration' | 'collection' | 'speed' | 'ending'

/**
 * 已解锁成就记录
 */
export interface UnlockedAchievement {
  /** 成就 ID */
  id: string
  /** 解锁时间戳 */
  unlockedAt: number
}

/**
 * 成就存储数据
 */
export interface AchievementData {
  /** 已解锁的成就 */
  unlocked: UnlockedAchievement[]
  /** 统计数据 */
  stats: AchievementStats
}

/**
 * 成就统计数据
 */
export interface AchievementStats {
  /** 完成的游戏数量 */
  gamesCompleted: number
  /** 完成的剧本ID列表（去重） */
  completedScripts: string[]
  /** 发现的场景总数 */
  scenesDiscovered: string[]
  /** 收集的线索总数 */
  totalCluesCollected: number
  /** 达成的结局 */
  endingsReached: string[]
  /** 每个剧本达成的结局 */
  scriptEndings: Record<string, string[]>
  /** 最快完成时间（毫秒） */
  fastestCompletion: number | null
}

// ============================================
// 成就定义
// ============================================

/**
 * 所有成就定义
 */
export const ACHIEVEMENTS: Achievement[] = [
  // === 进度类成就 ===
  {
    id: 'FIRST_GAME',
    name: '初次探索',
    description: '完成你的第一个剧本',
    icon: '🎮',
    category: 'progress',
    condition: '完成任意一个剧本',
  },
  {
    id: 'STORY_COLLECTOR',
    name: '故事收藏家',
    description: '完成 3 个不同的剧本',
    icon: '📚',
    category: 'progress',
    condition: '完成所有 3 个剧本',
  },

  // === 探索类成就 ===
  {
    id: 'EXPLORER',
    name: '探险家',
    description: '在任意剧本中发现 10+ 个场景',
    icon: '🗺️',
    category: 'exploration',
    condition: '在一次游戏中探索至少 10 个不同场景',
  },
  {
    id: 'SECRET_FINDER',
    name: '秘密发现者',
    description: '发现隐藏场景或秘密通道',
    icon: '🔍',
    category: 'exploration',
    condition: '发现游戏中的隐藏内容',
    hidden: true,
  },

  // === 收集类成就 ===
  {
    id: 'SHERLOCK',
    name: '福尔摩斯',
    description: '在单次游戏中收集 5+ 线索',
    icon: '🔎',
    category: 'collection',
    condition: '在一次游戏中收集至少 5 个线索',
  },
  {
    id: 'MASTER_DETECTIVE',
    name: '神探',
    description: '在单次游戏中收集 10+ 线索',
    icon: '🏆',
    category: 'collection',
    condition: '在一次游戏中收集至少 10 个线索',
    hidden: true,
  },

  // === 速度类成就 ===
  {
    id: 'SPEEDRUNNER',
    name: '速通达人',
    description: '在 10 分钟内完成任意剧本',
    icon: '⚡',
    category: 'speed',
    condition: '在 10 分钟内完成一个剧本',
  },
  {
    id: 'LIGHTNING_FAST',
    name: '闪电侠',
    description: '在 5 分钟内完成任意剧本',
    icon: '💨',
    category: 'speed',
    condition: '在 5 分钟内完成一个剧本',
    hidden: true,
  },

  // === 结局类成就 ===
  {
    id: 'PERFECT_ENDING',
    name: '完美结局',
    description: '达成任意剧本的最佳结局',
    icon: '✨',
    category: 'ending',
    condition: '在任意剧本中达成最佳结局',
  },
  {
    id: 'ALL_ENDINGS',
    name: '多结局探索者',
    description: '在任意剧本中解锁 3 个不同结局',
    icon: '🎖️',
    category: 'ending',
    condition: '在同一个剧本中解锁 3 个结局',
  },
  {
    id: 'BAD_ENDING',
    name: '迷途知返',
    description: '达成一个不太理想的结局',
    icon: '🌧️',
    category: 'ending',
    condition: '达成任意一个坏结局',
    hidden: true,
  },
  {
    id: 'MYSTERY_MASTER',
    name: '古堡侦探',
    description: '在神秘古堡中解锁所有结局',
    icon: '🏰',
    category: 'ending',
    condition: '在神秘古堡中解锁所有 4 个结局',
    hidden: true,
  },
]

// ============================================
// 成就检查函数
// ============================================

/**
 * 最佳结局ID列表
 */
const PERFECT_ENDINGS = ['perfect-ending', 'dragon-friend', 'good-ending']

/**
 * 坏结局ID列表
 */
const BAD_ENDINGS = ['bad-ending', 'failed-ending', 'dragon-slayer']

/**
 * 隐藏场景ID列表（用于SECRET_FINDER成就）
 */
const SECRET_SCENES = ['secret-room', 'secret-passage', 'library-hidden', 'basement-wall']

/**
 * 检查游戏结束时应解锁的成就
 */
export function checkAchievements(
  scriptId: string,
  gameState: {
    attributes: Record<string, number>
    history: Array<{ sceneId: string }>
    startTime: number
  },
  endingId: string,
  currentData: AchievementData
): Achievement[] {
  const newlyUnlocked: Achievement[] = []
  const unlockedIds = new Set(currentData.unlocked.map((a) => a.id))
  const gameTime = Date.now() - gameState.startTime
  const cluesCollected = gameState.attributes.clue || 0
  const uniqueScenes = new Set(gameState.history.map((h) => h.sceneId))

  // === 进度类成就 ===
  
  // FIRST_GAME: 完成第一个剧本
  if (!unlockedIds.has('FIRST_GAME')) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'FIRST_GAME')!)
  }

  // STORY_COLLECTOR: 完成3个不同剧本
  const updatedCompletedScripts = new Set(currentData.stats.completedScripts || [])
  updatedCompletedScripts.add(scriptId)
  if (!unlockedIds.has('STORY_COLLECTOR') && updatedCompletedScripts.size >= 3) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'STORY_COLLECTOR')!)
  }

  // === 探索类成就 ===
  
  // EXPLORER: 探索10+场景
  if (!unlockedIds.has('EXPLORER') && uniqueScenes.size >= 10) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'EXPLORER')!)
  }

  // SECRET_FINDER: 发现隐藏场景
  if (!unlockedIds.has('SECRET_FINDER')) {
    const foundSecret = [...uniqueScenes].some(s => SECRET_SCENES.includes(s))
    if (foundSecret) {
      newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'SECRET_FINDER')!)
    }
  }

  // === 收集类成就 ===
  
  // SHERLOCK: 收集5+线索
  if (!unlockedIds.has('SHERLOCK') && cluesCollected >= 5) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'SHERLOCK')!)
  }

  // MASTER_DETECTIVE: 收集10+线索
  if (!unlockedIds.has('MASTER_DETECTIVE') && cluesCollected >= 10) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'MASTER_DETECTIVE')!)
  }

  // === 速度类成就 ===
  
  // SPEEDRUNNER: 10分钟内完成
  if (!unlockedIds.has('SPEEDRUNNER') && gameTime <= 10 * 60 * 1000) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'SPEEDRUNNER')!)
  }

  // LIGHTNING_FAST: 5分钟内完成
  if (!unlockedIds.has('LIGHTNING_FAST') && gameTime <= 5 * 60 * 1000) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'LIGHTNING_FAST')!)
  }

  // === 结局类成就 ===
  
  // PERFECT_ENDING: 达成最佳结局
  if (!unlockedIds.has('PERFECT_ENDING') && PERFECT_ENDINGS.includes(endingId)) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'PERFECT_ENDING')!)
  }

  // BAD_ENDING: 达成坏结局
  if (!unlockedIds.has('BAD_ENDING') && BAD_ENDINGS.includes(endingId)) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'BAD_ENDING')!)
  }

  // ALL_ENDINGS: 在同一剧本中解锁3个结局
  if (!unlockedIds.has('ALL_ENDINGS')) {
    const scriptEndings = currentData.stats.scriptEndings || {}
    const updatedEndings = new Set(scriptEndings[scriptId] || [])
    updatedEndings.add(endingId)
    if (updatedEndings.size >= 3) {
      newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'ALL_ENDINGS')!)
    }
  }

  // MYSTERY_MASTER: 在神秘古堡中解锁所有结局
  if (scriptId === 'mystery-castle' && !unlockedIds.has('MYSTERY_MASTER')) {
    const allMysteryEndings = ['perfect-ending', 'good-ending', 'partial-ending', 'bad-ending']
    const scriptEndings = currentData.stats.scriptEndings || {}
    const updatedEndings = new Set(scriptEndings[scriptId] || [])
    updatedEndings.add(endingId)
    if (allMysteryEndings.every(e => updatedEndings.has(e))) {
      newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'MYSTERY_MASTER')!)
    }
  }

  return newlyUnlocked
}

// ============================================
// 成就存储管理
// ============================================

const STORAGE_KEY = 'ai-story-game-achievements'

/**
 * 获取成就数据
 */
export function getAchievementData(): AchievementData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      // 确保新字段存在
      if (!data.stats.completedScripts) {
        data.stats.completedScripts = []
      }
      if (!data.stats.scriptEndings) {
        data.stats.scriptEndings = {}
      }
      return data
    }
  } catch (e) {
    console.error('Failed to load achievement data:', e)
  }
  return {
    unlocked: [],
    stats: {
      gamesCompleted: 0,
      completedScripts: [],
      scenesDiscovered: [],
      totalCluesCollected: 0,
      endingsReached: [],
      scriptEndings: {},
      fastestCompletion: null,
    },
  }
}

/**
 * 保存成就数据
 */
export function saveAchievementData(data: AchievementData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save achievement data:', e)
  }
}

/**
 * 解锁成就
 */
export function unlockAchievement(achievementId: string): UnlockedAchievement | null {
  const data = getAchievementData()
  
  if (data.unlocked.some((a) => a.id === achievementId)) {
    return null // 已经解锁
  }

  const unlocked: UnlockedAchievement = {
    id: achievementId,
    unlockedAt: Date.now(),
  }

  data.unlocked.push(unlocked)
  saveAchievementData(data)

  return unlocked
}

/**
 * 更新游戏统计
 */
export function updateGameStats(
  scriptId: string,
  gameState: {
    attributes: Record<string, number>
    history: Array<{ sceneId: string }>
    startTime: number
  },
  endingId: string
): void {
  const data = getAchievementData()
  const gameTime = Date.now() - gameState.startTime

  data.stats.gamesCompleted += 1
  
  // 更新完成的剧本列表
  if (!data.stats.completedScripts) {
    data.stats.completedScripts = []
  }
  if (!data.stats.completedScripts.includes(scriptId)) {
    data.stats.completedScripts.push(scriptId)
  }
  
  // 更新发现的场景
  const newScenes = gameState.history
    .map((h) => h.sceneId)
    .filter((s) => !data.stats.scenesDiscovered.includes(s))
  data.stats.scenesDiscovered.push(...newScenes)

  // 更新线索总数
  data.stats.totalCluesCollected += gameState.attributes.clue || 0

  // 更新结局
  if (!data.stats.endingsReached.includes(endingId)) {
    data.stats.endingsReached.push(endingId)
  }
  
  // 更新每个剧本的结局
  if (!data.stats.scriptEndings) {
    data.stats.scriptEndings = {}
  }
  if (!data.stats.scriptEndings[scriptId]) {
    data.stats.scriptEndings[scriptId] = []
  }
  if (!data.stats.scriptEndings[scriptId].includes(endingId)) {
    data.stats.scriptEndings[scriptId].push(endingId)
  }

  // 更新最快时间
  if (data.stats.fastestCompletion === null || gameTime < data.stats.fastestCompletion) {
    data.stats.fastestCompletion = gameTime
  }

  saveAchievementData(data)
}

/**
 * 检查成就是否已解锁
 */
export function isAchievementUnlocked(achievementId: string): boolean {
  const data = getAchievementData()
  return data.unlocked.some((a) => a.id === achievementId)
}

/**
 * 获取成就解锁时间
 */
export function getAchievementUnlockTime(achievementId: string): number | null {
  const data = getAchievementData()
  const achievement = data.unlocked.find((a) => a.id === achievementId)
  return achievement?.unlockedAt || null
}

/**
 * 获取成就进度统计
 */
export function getAchievementProgress(): {
  total: number
  unlocked: number
  byCategory: Record<AchievementCategory, { total: number; unlocked: number }>
} {
  const data = getAchievementData()
  const unlockedIds = new Set(data.unlocked.map((a) => a.id))

  const byCategory: Record<AchievementCategory, { total: number; unlocked: number }> = {
    progress: { total: 0, unlocked: 0 },
    exploration: { total: 0, unlocked: 0 },
    collection: { total: 0, unlocked: 0 },
    speed: { total: 0, unlocked: 0 },
    ending: { total: 0, unlocked: 0 },
  }

  for (const achievement of ACHIEVEMENTS) {
    byCategory[achievement.category].total += 1
    if (unlockedIds.has(achievement.id)) {
      byCategory[achievement.category].unlocked += 1
    }
  }

  return {
    total: ACHIEVEMENTS.length,
    unlocked: data.unlocked.length,
    byCategory,
  }
}