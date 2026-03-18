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
  /** 发现的场景总数 */
  scenesDiscovered: string[]
  /** 收集的线索总数 */
  totalCluesCollected: number
  /** 达成的结局 */
  endingsReached: string[]
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

  // === 探索类成就 ===
  {
    id: 'EXPLORER',
    name: '探险家',
    description: '在神秘古堡中发现所有场景',
    icon: '🗺️',
    category: 'exploration',
    condition: '在神秘古堡中发现所有 15+ 个场景',
  },
  {
    id: 'SECRET_FINDER',
    name: '秘密发现者',
    description: '发现所有隐藏场景',
    icon: '🔍',
    category: 'exploration',
    condition: '发现密室和秘密通道',
    hidden: true,
  },

  // === 收集类成就 ===
  {
    id: 'SHERLOCK',
    name: '福尔摩斯',
    description: '在单次游戏中收集 10+ 线索',
    icon: '🔎',
    category: 'collection',
    condition: '在一次游戏中收集至少 10 个线索',
  },
  {
    id: 'MASTER_DETECTIVE',
    name: '神探',
    description: '在单次游戏中收集 15+ 线索',
    icon: '🏆',
    category: 'collection',
    condition: '在一次游戏中收集至少 15 个线索',
    hidden: true,
  },

  // === 速度类成就 ===
  {
    id: 'SPEEDRUNNER',
    name: '速通达人',
    description: '在 15 分钟内完成任意剧本',
    icon: '⚡',
    category: 'speed',
    condition: '在 15 分钟内完成一个剧本',
  },
  {
    id: 'LIGHTNING_FAST',
    name: '闪电侠',
    description: '在 10 分钟内完成任意剧本',
    icon: '💨',
    category: 'speed',
    condition: '在 10 分钟内完成一个剧本',
    hidden: true,
  },

  // === 结局类成就 ===
  {
    id: 'PERFECT_ENDING',
    name: '完美结局',
    description: '达成最佳结局',
    icon: '✨',
    category: 'ending',
    condition: '在神秘古堡中达成"完美侦探"结局',
  },
  {
    id: 'ALL_ENDINGS',
    name: '全结局大师',
    description: '解锁神秘古堡的所有结局',
    icon: '🎖️',
    category: 'ending',
    condition: '在神秘古堡中解锁所有 4 个结局',
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
]

// ============================================
// 成就检查函数
// ============================================

/**
 * 检查游戏结束时应解锁的成就
 * @param scriptId 剧本 ID
 * @param gameState 游戏状态
 * @param currentData 当前成就数据
 * @returns 新解锁的成就列表
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
  const scenesVisited = gameState.history.map((h) => h.sceneId)

  // 检查 FIRST_GAME
  if (!unlockedIds.has('FIRST_GAME')) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'FIRST_GAME')!)
  }

  // 检查 SHERLOCK (10+ 线索)
  if (!unlockedIds.has('SHERLOCK') && cluesCollected >= 10) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'SHERLOCK')!)
  }

  // 检查 MASTER_DETECTIVE (15+ 线索)
  if (!unlockedIds.has('MASTER_DETECTIVE') && cluesCollected >= 15) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'MASTER_DETECTIVE')!)
  }

  // 检查 SPEEDRUNNER (15 分钟内)
  if (!unlockedIds.has('SPEEDRUNNER') && gameTime <= 15 * 60 * 1000) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'SPEEDRUNNER')!)
  }

  // 检查 LIGHTNING_FAST (10 分钟内)
  if (!unlockedIds.has('LIGHTNING_FAST') && gameTime <= 10 * 60 * 1000) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'LIGHTNING_FAST')!)
  }

  // 检查 EXPLORER (神秘古堡所有场景)
  if (scriptId === 'mystery-castle' && !unlockedIds.has('EXPLORER')) {
    const allMysteryCastleScenes = [
      'start', 'castle-history', 'hall', 'hall-examine', 'safe-attempt',
      'photo-question', 'butler-secret', 'kitchen', 'chef-conversation',
      'kitchen-search', 'take-bottle', 'poison-info', 'doctor-info',
      'library', 'library-search', 'library-hidden', 'secret-letter',
      'library-desk', 'basement', 'basement-wall', 'basement-search',
      'garden', 'gardener-conversation', 'key-purpose', 'garden-examine',
      'garden-box', 'footprint-trail', 'secret-passage', 'attic',
      'trunk-contents', 'attic-search', 'study', 'letter', 'search',
      'window-clue', 'maid-conversation', 'maid-secret', 'maid-reassured',
      'secret-room', 'have-evidence', 'confrontation', 'truth-revealed',
      'partial-reveal', 'failed-ending',
    ]
    const visitedSet = new Set(scenesVisited)
    const discoveredCount = allMysteryCastleScenes.filter((s) => visitedSet.has(s)).length
    if (discoveredCount >= 15) {
      newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'EXPLORER')!)
    }
  }

  // 检查 SECRET_FINDER (发现密室)
  if (!unlockedIds.has('SECRET_FINDER') && scenesVisited.includes('secret-room')) {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'SECRET_FINDER')!)
  }

  // 检查 PERFECT_ENDING
  if (!unlockedIds.has('PERFECT_ENDING') && endingId === 'perfect-ending') {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'PERFECT_ENDING')!)
  }

  // 检查 BAD_ENDING
  if (!unlockedIds.has('BAD_ENDING') && endingId === 'bad-ending') {
    newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'BAD_ENDING')!)
  }

  // 检查 ALL_ENDINGS
  if (scriptId === 'mystery-castle' && !unlockedIds.has('ALL_ENDINGS')) {
    const allEndings = ['perfect-ending', 'good-ending', 'partial-ending', 'bad-ending']
    const updatedEndings = [...currentData.stats.endingsReached, endingId]
    const uniqueEndings = new Set(updatedEndings)
    if (allEndings.every((e) => uniqueEndings.has(e))) {
      newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === 'ALL_ENDINGS')!)
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
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load achievement data:', e)
  }
  return {
    unlocked: [],
    stats: {
      gamesCompleted: 0,
      scenesDiscovered: [],
      totalCluesCollected: 0,
      endingsReached: [],
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