/**
 * 音频控制 Hook
 * 提供音频控制接口，支持静音切换和音量偏好记忆
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { AudioManager, type AudioManagerState, type AudioEvent } from '#/lib/audio/AudioManager'
import { SoundEffect, BackgroundMusic, getRecommendedMusic } from '#/lib/audio/sounds'

// ============================================
// Types
// ============================================

export interface UseAudioOptions {
  /** 是否自动初始化（默认 true） */
  autoInit?: boolean
}

export interface UseAudioReturn {
  /** 音频状态 */
  state: AudioManagerState
  /** 是否已初始化 */
  isReady: boolean
  /** 初始化音频 */
  init: () => Promise<void>
  /** 播放背景音乐 */
  playMusic: (music: BackgroundMusic, fadeIn?: boolean) => Promise<void>
  /** 停止背景音乐 */
  stopMusic: (fadeOut?: boolean) => Promise<void>
  /** 切换背景音乐 */
  changeMusic: (music: BackgroundMusic) => Promise<void>
  /** 根据剧本类型播放对应音乐 */
  playMusicForGenre: (genre: string) => Promise<void>
  /** 播放音效 */
  playSfx: (effect: SoundEffect) => Promise<void>
  /** 设置主音量 */
  setMasterVolume: (volume: number) => void
  /** 设置背景音乐音量 */
  setMusicVolume: (volume: number) => void
  /** 设置音效音量 */
  setSfxVolume: (volume: number) => void
  /** 静音切换 */
  toggleMute: () => boolean
  /** 设置静音 */
  setMuted: (muted: boolean) => void
  /** 预加载音效 */
  preloadSfx: (effects: SoundEffect[]) => void
}

// ============================================
// Hook Implementation
// ============================================

export function useAudio(options: UseAudioOptions = {}): UseAudioReturn {
  const { autoInit = true } = options

  const [state, setState] = useState<AudioManagerState>(AudioManager.getState())
  const [isReady, setIsReady] = useState(false)
  const initRef = useRef(false)

  // Sync state from AudioManager
  const syncState = useCallback(() => {
    setState(AudioManager.getState())
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (!autoInit) return

    const init = async () => {
      if (initRef.current) return
      initRef.current = true

      await AudioManager.init()
      setIsReady(true)
      syncState()
    }

    // Delay init to after user interaction
    const handleUserInteraction = () => {
      init()
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }

    // Check if already initialized
    if (AudioManager.getState().initialized) {
      setIsReady(true)
      syncState()
    } else {
      document.addEventListener('click', handleUserInteraction)
      document.addEventListener('keydown', handleUserInteraction)
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [autoInit, syncState])

  // Listen to AudioManager events
  useEffect(() => {
    const unsubscribe = AudioManager.addEventListener((event: AudioEvent) => {
      syncState()
    })

    return unsubscribe
  }, [syncState])

  // ============================================
  // Actions
  // ============================================

  const init = useCallback(async () => {
    if (!isReady) {
      await AudioManager.init()
      setIsReady(true)
      syncState()
    }
  }, [isReady, syncState])

  const playMusic = useCallback(
    async (music: BackgroundMusic, fadeIn = true) => {
      await AudioManager.resume()
      await AudioManager.playMusic(music, fadeIn)
      syncState()
    },
    [syncState]
  )

  const stopMusic = useCallback(
    async (fadeOut = true) => {
      await AudioManager.stopMusic(fadeOut)
      syncState()
    },
    [syncState]
  )

  const changeMusic = useCallback(
    async (music: BackgroundMusic) => {
      await AudioManager.changeMusic(music)
      syncState()
    },
    [syncState]
  )

  const playMusicForGenre = useCallback(
    async (genre: string) => {
      const music = getRecommendedMusic(genre)
      await playMusic(music)
    },
    [playMusic]
  )

  const playSfx = useCallback(
    async (effect: SoundEffect) => {
      await AudioManager.resume()
      await AudioManager.playSfx(effect)
    },
    []
  )

  const setMasterVolume = useCallback(
    (volume: number) => {
      AudioManager.setMasterVolume(volume)
      syncState()
    },
    [syncState]
  )

  const setMusicVolume = useCallback(
    (volume: number) => {
      AudioManager.setMusicVolume(volume)
      syncState()
    },
    [syncState]
  )

  const setSfxVolume = useCallback(
    (volume: number) => {
      AudioManager.setSfxVolume(volume)
      syncState()
    },
    [syncState]
  )

  const toggleMute = useCallback(() => {
    const muted = AudioManager.toggleMute()
    syncState()
    return muted
  }, [syncState])

  const setMuted = useCallback(
    (muted: boolean) => {
      AudioManager.setMuted(muted)
      syncState()
    },
    [syncState]
  )

  const preloadSfx = useCallback((effects: SoundEffect[]) => {
    AudioManager.preloadSfx(effects)
  }, [])

  return {
    state,
    isReady,
    init,
    playMusic,
    stopMusic,
    changeMusic,
    playMusicForGenre,
    playSfx,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    toggleMute,
    setMuted,
    preloadSfx,
  }
}

// ============================================
// Utility Hooks
// ============================================

/**
 * 简单音效播放 Hook
 * 仅用于播放音效，不管理背景音乐
 */
export function useSfx(): {
  play: (effect: SoundEffect) => Promise<void>
} {
  const play = useCallback(async (effect: SoundEffect) => {
    await AudioManager.resume()
    await AudioManager.playSfx(effect)
  }, [])

  return { play }
}

/**
 * 背景音乐 Hook
 * 用于管理场景背景音乐
 */
export function useBackgroundMusic(): {
  play: (music: BackgroundMusic) => Promise<void>
  stop: () => Promise<void>
  change: (music: BackgroundMusic) => Promise<void>
  current: BackgroundMusic | null
} {
  const [current, setCurrent] = useState<BackgroundMusic | null>(null)

  useEffect(() => {
    const unsubscribe = AudioManager.addEventListener((event: AudioEvent) => {
      if (event.type === 'musicStart' || event.type === 'musicChange') {
        setCurrent(AudioManager.getState().currentMusic)
      } else if (event.type === 'musicStop') {
        setCurrent(null)
      }
    })

    return unsubscribe
  }, [])

  const play = useCallback(async (music: BackgroundMusic) => {
    await AudioManager.resume()
    await AudioManager.playMusic(music)
    setCurrent(music)
  }, [])

  const stop = useCallback(async () => {
    await AudioManager.stopMusic()
    setCurrent(null)
  }, [])

  const change = useCallback(async (music: BackgroundMusic) => {
    await AudioManager.changeMusic(music)
    setCurrent(music)
  }, [])

  return { play, stop, change, current }
}

export default useAudio