/**
 * 音效和背景音乐类型定义
 * 定义游戏中使用的所有音效和背景音乐
 */

// ============================================
// 音效类型
// ============================================

/**
 * 音效类型枚举
 */
export enum SoundEffect {
  /** 点击音效 */
  CLICK = 'click',
  /** 选择音效 */
  SELECT = 'select',
  /** 取消音效 */
  CANCEL = 'cancel',
  /** 获得线索音效 */
  CLUE_FOUND = 'clue-found',
  /** 成就解锁音效 */
  ACHIEVEMENT = 'achievement',
  /** 场景切换音效 */
  SCENE_TRANSITION = 'scene-transition',
  /** 事件触发音效 */
  EVENT_TRIGGER = 'event-trigger',
  /** 获得物品音效 */
  ITEM_GAIN = 'item-gain',
  /** 失败音效 */
  FAILURE = 'failure',
  /** 成功音效 */
  SUCCESS = 'success',
  /** 警告音效 */
  WARNING = 'warning',
  /** 神秘音效 */
  MYSTERIOUS = 'mysterious',
  /** 对话出现音效 */
  DIALOGUE_APPEAR = 'dialogue-appear',
  /** 打字机音效 */
  TYPEWRITER = 'typewriter',
}

/**
 * 音效配置
 */
export interface SoundEffectConfig {
  /** 音效 ID */
  id: SoundEffect
  /** 音效名称 */
  name: string
  /** 音量（0-1） */
  volume: number
  /** 是否循环 */
  loop: boolean
  /** 音效描述 */
  description: string
}

/**
 * 所有音效配置
 */
export const SOUND_EFFECTS: Record<SoundEffect, SoundEffectConfig> = {
  [SoundEffect.CLICK]: {
    id: SoundEffect.CLICK,
    name: '点击',
    volume: 0.3,
    loop: false,
    description: '普通按钮点击音效',
  },
  [SoundEffect.SELECT]: {
    id: SoundEffect.SELECT,
    name: '选择',
    volume: 0.4,
    loop: false,
    description: '选项选择音效',
  },
  [SoundEffect.CANCEL]: {
    id: SoundEffect.CANCEL,
    name: '取消',
    volume: 0.3,
    loop: false,
    description: '取消操作音效',
  },
  [SoundEffect.CLUE_FOUND]: {
    id: SoundEffect.CLUE_FOUND,
    name: '发现线索',
    volume: 0.5,
    loop: false,
    description: '发现隐藏线索时的音效',
  },
  [SoundEffect.ACHIEVEMENT]: {
    id: SoundEffect.ACHIEVEMENT,
    name: '成就解锁',
    volume: 0.6,
    loop: false,
    description: '解锁成就时的音效',
  },
  [SoundEffect.SCENE_TRANSITION]: {
    id: SoundEffect.SCENE_TRANSITION,
    name: '场景切换',
    volume: 0.4,
    loop: false,
    description: '切换场景时的音效',
  },
  [SoundEffect.EVENT_TRIGGER]: {
    id: SoundEffect.EVENT_TRIGGER,
    name: '事件触发',
    volume: 0.5,
    loop: false,
    description: '随机事件触发音效',
  },
  [SoundEffect.ITEM_GAIN]: {
    id: SoundEffect.ITEM_GAIN,
    name: '获得物品',
    volume: 0.4,
    loop: false,
    description: '获得物品或奖励音效',
  },
  [SoundEffect.FAILURE]: {
    id: SoundEffect.FAILURE,
    name: '失败',
    volume: 0.5,
    loop: false,
    description: '操作失败或负面结果音效',
  },
  [SoundEffect.SUCCESS]: {
    id: SoundEffect.SUCCESS,
    name: '成功',
    volume: 0.5,
    loop: false,
    description: '成功完成目标音效',
  },
  [SoundEffect.WARNING]: {
    id: SoundEffect.WARNING,
    name: '警告',
    volume: 0.4,
    loop: false,
    description: '警告提示音效',
  },
  [SoundEffect.MYSTERIOUS]: {
    id: SoundEffect.MYSTERIOUS,
    name: '神秘',
    volume: 0.3,
    loop: false,
    description: '神秘氛围音效',
  },
  [SoundEffect.DIALOGUE_APPEAR]: {
    id: SoundEffect.DIALOGUE_APPEAR,
    name: '对话出现',
    volume: 0.2,
    loop: false,
    description: '新对话出现时的音效',
  },
  [SoundEffect.TYPEWRITER]: {
    id: SoundEffect.TYPEWRITER,
    name: '打字机',
    volume: 0.15,
    loop: false,
    description: '文字逐字显示时的打字机音效',
  },
}

// ============================================
// 背景音乐类型
// ============================================

/**
 * 背景音乐类型枚举
 */
export enum BackgroundMusic {
  /** 悬疑主题 */
  SUSPENSE = 'suspense',
  /** 奇幻主题 */
  FANTASY = 'fantasy',
  /** 科幻主题 */
  SCIFI = 'scifi',
  /** 紧张气氛 */
  TENSE = 'tense',
  /** 轻松愉快 */
  LIGHT = 'light',
  /** 神秘探索 */
  MYSTERY = 'mystery',
  /** 最终决战 */
  FINALE = 'finale',
  /** 结局音乐 */
  ENDING = 'ending',
  /** 主菜单 */
  MENU = 'menu',
}

/**
 * 背景音乐配置
 */
export interface BackgroundMusicConfig {
  /** 音乐 ID */
  id: BackgroundMusic
  /** 音乐名称 */
  name: string
  /** 默认音量（0-1） */
  volume: number
  /** 是否循环 */
  loop: boolean
  /** 淡入时间（毫秒） */
  fadeIn: number
  /** 淡出时间（毫秒） */
  fadeOut: number
  /** 适用剧本类型 */
  genres: string[]
  /** 音乐描述 */
  description: string
}

/**
 * 所有背景音乐配置
 */
export const BACKGROUND_MUSIC: Record<BackgroundMusic, BackgroundMusicConfig> = {
  [BackgroundMusic.SUSPENSE]: {
    id: BackgroundMusic.SUSPENSE,
    name: '悬疑',
    volume: 0.3,
    loop: true,
    fadeIn: 2000,
    fadeOut: 2000,
    genres: ['悬疑', 'mystery'],
    description: '适合悬疑类剧本的背景音乐',
  },
  [BackgroundMusic.FANTASY]: {
    id: BackgroundMusic.FANTASY,
    name: '奇幻',
    volume: 0.35,
    loop: true,
    fadeIn: 2000,
    fadeOut: 2000,
    genres: ['奇幻', 'fantasy'],
    description: '适合奇幻类剧本的背景音乐',
  },
  [BackgroundMusic.SCIFI]: {
    id: BackgroundMusic.SCIFI,
    name: '科幻',
    volume: 0.3,
    loop: true,
    fadeIn: 2000,
    fadeOut: 2000,
    genres: ['科幻', 'scifi'],
    description: '适合科幻类剧本的背景音乐',
  },
  [BackgroundMusic.TENSE]: {
    id: BackgroundMusic.TENSE,
    name: '紧张',
    volume: 0.35,
    loop: true,
    fadeIn: 1500,
    fadeOut: 1500,
    genres: ['悬疑', '科幻', '奇幻'],
    description: '紧张气氛时的背景音乐',
  },
  [BackgroundMusic.LIGHT]: {
    id: BackgroundMusic.LIGHT,
    name: '轻松',
    volume: 0.25,
    loop: true,
    fadeIn: 2000,
    fadeOut: 2000,
    genres: ['奇幻'],
    description: '轻松愉快场景的背景音乐',
  },
  [BackgroundMusic.MYSTERY]: {
    id: BackgroundMusic.MYSTERY,
    name: '神秘',
    volume: 0.3,
    loop: true,
    fadeIn: 2000,
    fadeOut: 2000,
    genres: ['悬疑', '奇幻'],
    description: '神秘探索时的背景音乐',
  },
  [BackgroundMusic.FINALE]: {
    id: BackgroundMusic.FINALE,
    name: '最终决战',
    volume: 0.4,
    loop: true,
    fadeIn: 1000,
    fadeOut: 2000,
    genres: ['悬疑', '科幻', '奇幻'],
    description: '最终决战或高潮时的背景音乐',
  },
  [BackgroundMusic.ENDING]: {
    id: BackgroundMusic.ENDING,
    name: '结局',
    volume: 0.3,
    loop: false,
    fadeIn: 2000,
    fadeOut: 3000,
    genres: ['悬疑', '科幻', '奇幻'],
    description: '结局时的背景音乐',
  },
  [BackgroundMusic.MENU]: {
    id: BackgroundMusic.MENU,
    name: '主菜单',
    volume: 0.2,
    loop: true,
    fadeIn: 2000,
    fadeOut: 2000,
    genres: [],
    description: '主菜单或选择剧本时的背景音乐',
  },
}

// ============================================
// 音频资源配置
// ============================================

/**
 * 音频资源 URL 映射
 * 使用占位符，后续可替换为真实音频文件
 */
export const AUDIO_URLS: Record<string, string> = {
  // 音效（使用 Web Audio API 生成简单音效）
  // 如果有真实音频文件，替换为实际 URL
  [SoundEffect.CLICK]: '',
  [SoundEffect.SELECT]: '',
  [SoundEffect.CANCEL]: '',
  [SoundEffect.CLUE_FOUND]: '',
  [SoundEffect.ACHIEVEMENT]: '',
  [SoundEffect.SCENE_TRANSITION]: '',
  [SoundEffect.EVENT_TRIGGER]: '',
  [SoundEffect.ITEM_GAIN]: '',
  [SoundEffect.FAILURE]: '',
  [SoundEffect.SUCCESS]: '',
  [SoundEffect.WARNING]: '',
  [SoundEffect.MYSTERIOUS]: '',
  [SoundEffect.DIALOGUE_APPEAR]: '',
  [SoundEffect.TYPEWRITER]: '',

  // 背景音乐
  [BackgroundMusic.SUSPENSE]: '',
  [BackgroundMusic.FANTASY]: '',
  [BackgroundMusic.SCIFI]: '',
  [BackgroundMusic.TENSE]: '',
  [BackgroundMusic.LIGHT]: '',
  [BackgroundMusic.MYSTERY]: '',
  [BackgroundMusic.FINALE]: '',
  [BackgroundMusic.ENDING]: '',
  [BackgroundMusic.MENU]: '',
}

// ============================================
// 工具函数
// ============================================

/**
 * 根据剧本类型获取推荐背景音乐
 */
export function getRecommendedMusic(genre: string): BackgroundMusic {
  const normalizedGenre = genre.toLowerCase()

  if (normalizedGenre.includes('悬疑') || normalizedGenre.includes('mystery')) {
    return BackgroundMusic.SUSPENSE
  }
  if (normalizedGenre.includes('奇幻') || normalizedGenre.includes('fantasy')) {
    return BackgroundMusic.FANTASY
  }
  if (normalizedGenre.includes('科幻') || normalizedGenre.includes('scifi') || normalizedGenre.includes('sci-fi')) {
    return BackgroundMusic.SCIFI
  }

  return BackgroundMusic.SUSPENSE
}

/**
 * 获取场景类型对应的音乐
 */
export function getSceneMusic(sceneType: 'normal' | 'tense' | 'mystery' | 'finale' | 'ending'): BackgroundMusic {
  const mapping: Record<string, BackgroundMusic> = {
    normal: BackgroundMusic.SUSPENSE,
    tense: BackgroundMusic.TENSE,
    mystery: BackgroundMusic.MYSTERY,
    finale: BackgroundMusic.FINALE,
    ending: BackgroundMusic.ENDING,
  }
  return mapping[sceneType] || BackgroundMusic.SUSPENSE
}

/**
 * 获取音效配置
 */
export function getSoundConfig(effect: SoundEffect): SoundEffectConfig {
  return SOUND_EFFECTS[effect] || SOUND_EFFECTS[SoundEffect.CLICK]
}

/**
 * 获取背景音乐配置
 */
export function getMusicConfig(music: BackgroundMusic): BackgroundMusicConfig {
  return BACKGROUND_MUSIC[music] || BACKGROUND_MUSIC[BackgroundMusic.SUSPENSE]
}