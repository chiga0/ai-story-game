/**
 * Umami Analytics 工具模块
 * 用于追踪用户行为和游戏事件
 */

// 声明 umami 全局对象类型
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void
    }
  }
}

/**
 * 追踪自定义事件
 * @param eventName 事件名称
 * @param eventData 事件数据（可选）
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, unknown>
): void {
  if (typeof window === 'undefined' || !window.umami) {
    // 开发环境或 Umami 未加载时，静默失败
    if (import.meta.env.DEV) {
      console.log('[Analytics]', eventName, eventData)
    }
    return
  }

  try {
    window.umami.track(eventName, eventData)
  } catch (error) {
    console.warn('[Analytics] Failed to track event:', error)
  }
}

/**
 * 游戏相关事件追踪
 */
export const gameEvents = {
  /**
   * 游戏开始
   * @param scriptId 剧本 ID
   * @param scriptTitle 剧本标题
   * @param genre 剧本类型
   */
  start: (scriptId: string, scriptTitle: string, genre?: string) => {
    trackEvent('game-start', {
      scriptId,
      scriptTitle,
      genre,
    })
  },

  /**
   * 剧本选择
   * @param scriptId 剧本 ID
   * @param scriptTitle 剧本标题
   * @param genre 剧本类型
   */
  scriptSelect: (scriptId: string, scriptTitle: string, genre?: string) => {
    trackEvent('script-select', {
      scriptId,
      scriptTitle,
      genre,
    })
  },

  /**
   * 结局达成
   * @param scriptId 剧本 ID
   * @param endingId 结局 ID
   * @param endingType 结局类型 (good/bad/neutral/secret)
   * @param playTime 游玩时长（分钟）
   * @param choiceCount 选择次数
   */
  ending: (
    scriptId: string,
    endingId: string,
    endingType: string,
    playTime: number,
    choiceCount: number
  ) => {
    trackEvent('game-ending', {
      scriptId,
      endingId,
      endingType,
      playTime,
      choiceCount,
    })
  },

  /**
   * 存档保存
   * @param scriptId 剧本 ID
   */
  save: (scriptId: string) => {
    trackEvent('game-save', { scriptId })
  },

  /**
   * 存档加载
   * @param scriptId 剧本 ID
   */
  load: (scriptId: string) => {
    trackEvent('game-load', { scriptId })
  },

  /**
   * 成就解锁
   * @param achievementId 成就 ID
   * @param achievementTitle 成就标题
   */
  achievement: (achievementId: string, achievementTitle: string) => {
    trackEvent('achievement-unlock', {
      achievementId,
      achievementTitle,
    })
  },

  /**
   * 分享卡片生成
   * @param scriptId 剧本 ID
   * @param endingId 结局 ID
   */
  share: (scriptId: string, endingId: string) => {
    trackEvent('share-card', { scriptId, endingId })
  },

  /**
   * 剧本创建（自定义剧本）
   * @param genre 剧本类型
   */
  createScript: (genre: string) => {
    trackEvent('script-create', { genre })
  },
}

export default {
  trackEvent,
  gameEvents,
}