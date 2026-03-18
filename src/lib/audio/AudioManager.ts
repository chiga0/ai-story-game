/**
 * 音频管理器
 * 管理背景音乐和音效播放，支持音量控制和淡入淡出
 */

import {
  SoundEffect,
  BackgroundMusic,
  SOUND_EFFECTS,
  BACKGROUND_MUSIC,
  AUDIO_URLS,
  getSoundConfig,
  getMusicConfig,
} from './sounds'

// ============================================
// Types
// ============================================

export interface AudioManagerState {
  /** 是否已初始化 */
  initialized: boolean
  /** 是否静音 */
  muted: boolean
  /** 主音量（0-1） */
  masterVolume: number
  /** 背景音乐音量（0-1） */
  musicVolume: number
  /** 音效音量（0-1） */
  sfxVolume: number
  /** 当前播放的背景音乐 */
  currentMusic: BackgroundMusic | null
  /** 是否正在播放背景音乐 */
  isPlaying: boolean
}

export type AudioEventType = 'musicStart' | 'musicStop' | 'musicChange' | 'sfxPlay' | 'volumeChange' | 'muteChange'

export interface AudioEvent {
  type: AudioEventType
  data?: unknown
}

export type AudioEventListener = (event: AudioEvent) => void

// ============================================
// Audio Manager Class
// ============================================

class AudioManagerClass {
  private audioContext: AudioContext | null = null
  private musicElement: HTMLAudioElement | null = null
  private sfxPool: Map<string, HTMLAudioElement> = new Map()
  private state: AudioManagerState = {
    initialized: false,
    muted: false,
    masterVolume: 1,
    musicVolume: 0.3,
    sfxVolume: 0.5,
    currentMusic: null,
    isPlaying: false,
  }
  private listeners: Set<AudioEventListener> = new Set()
  private fadeInterval: number | null = null

  // ============================================
  // Initialization
  // ============================================

  /**
   * 初始化音频管理器
   */
  async init(): Promise<void> {
    if (this.state.initialized) return

    try {
      // 创建 AudioContext（用于生成简单音效）
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // 创建背景音乐元素
      this.musicElement = document.createElement('audio')
      this.musicElement.loop = true
      this.musicElement.volume = this.state.musicVolume * this.state.masterVolume

      // 加载保存的偏好设置
      this.loadPreferences()

      this.state.initialized = true
      this.emit({ type: 'volumeChange' })

      console.log('[AudioManager] Initialized')
    } catch (error) {
      console.error('[AudioManager] Failed to initialize:', error)
    }
  }

  /**
   * 确保音频上下文已激活（需要用户交互后调用）
   */
  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  // ============================================
  // Background Music
  // ============================================

  /**
   * 播放背景音乐
   */
  async playMusic(music: BackgroundMusic, fadeIn = true): Promise<void> {
    if (!this.state.initialized) await this.init()
    if (this.state.muted) return

    const config = getMusicConfig(music)
    const url = AUDIO_URLS[music]

    // 如果是同一首音乐且正在播放，不做任何操作
    if (this.state.currentMusic === music && this.state.isPlaying) {
      return
    }

    // 停止当前音乐
    if (this.state.isPlaying) {
      await this.stopMusic(fadeIn)
    }

    // 更新状态
    this.state.currentMusic = music

    // 如果没有 URL，使用 Web Audio API 生成简单背景音
    if (!url && this.audioContext) {
      this.generateAmbientSound(music)
      this.state.isPlaying = true
      this.emit({ type: 'musicStart', data: { music } })
      return
    }

    // 播放实际音频
    if (this.musicElement && url) {
      this.musicElement.src = url
      this.musicElement.volume = fadeIn ? 0 : config.volume * this.state.musicVolume * this.state.masterVolume

      try {
        await this.musicElement.play()

        if (fadeIn) {
          this.fadeInMusic(config.fadeIn)
        }

        this.state.isPlaying = true
        this.emit({ type: 'musicStart', data: { music } })
      } catch (error) {
        console.error('[AudioManager] Failed to play music:', error)
      }
    }
  }

  /**
   * 停止背景音乐
   */
  async stopMusic(fadeOut = true): Promise<void> {
    if (!this.state.isPlaying || !this.musicElement) return

    const config = this.state.currentMusic ? getMusicConfig(this.state.currentMusic) : null

    if (fadeOut && config) {
      await this.fadeOutMusic(config.fadeOut)
    }

    this.musicElement.pause()
    this.musicElement.currentTime = 0

    // 停止生成的环境音
    if (this.audioContext) {
      this.stopAmbientSound()
    }

    const previousMusic = this.state.currentMusic
    this.state.isPlaying = false
    this.state.currentMusic = null
    this.emit({ type: 'musicStop', data: { music: previousMusic } })
  }

  /**
   * 切换背景音乐
   */
  async changeMusic(music: BackgroundMusic): Promise<void> {
    const previousMusic = this.state.currentMusic

    await this.stopMusic(true)
    await this.playMusic(music, true)

    this.emit({ type: 'musicChange', data: { from: previousMusic, to: music } })
  }

  // ============================================
  // Sound Effects
  // ============================================

  /**
   * 播放音效
   */
  async playSfx(effect: SoundEffect): Promise<void> {
    if (!this.state.initialized) await this.init()
    if (this.state.muted) return

    await this.resume()

    const config = getSoundConfig(effect)
    const url = AUDIO_URLS[effect]

    // 如果没有 URL，使用 Web Audio API 生成简单音效
    if (!url && this.audioContext) {
      this.generateTone(effect)
      this.emit({ type: 'sfxPlay', data: { effect } })
      return
    }

    // 播放实际音频
    if (url) {
      const audio = new Audio(url)
      audio.volume = config.volume * this.state.sfxVolume * this.state.masterVolume

      try {
        await audio.play()
        this.emit({ type: 'sfxPlay', data: { effect } })
      } catch (error) {
        console.error('[AudioManager] Failed to play SFX:', error)
      }
    }
  }

  /**
   * 预加载音效
   */
  preloadSfx(effects: SoundEffect[]): void {
    effects.forEach((effect) => {
      const url = AUDIO_URLS[effect]
      if (url && !this.sfxPool.has(effect)) {
        const audio = new Audio(url)
        audio.preload = 'auto'
        this.sfxPool.set(effect, audio)
      }
    })
  }

  // ============================================
  // Volume Control
  // ============================================

  /**
   * 设置主音量
   */
  setMasterVolume(volume: number): void {
    this.state.masterVolume = Math.max(0, Math.min(1, volume))
    this.applyVolume()
    this.savePreferences()
    this.emit({ type: 'volumeChange' })
  }

  /**
   * 设置背景音乐音量
   */
  setMusicVolume(volume: number): void {
    this.state.musicVolume = Math.max(0, Math.min(1, volume))
    this.applyVolume()
    this.savePreferences()
    this.emit({ type: 'volumeChange' })
  }

  /**
   * 设置音效音量
   */
  setSfxVolume(volume: number): void {
    this.state.sfxVolume = Math.max(0, Math.min(1, volume))
    this.savePreferences()
    this.emit({ type: 'volumeChange' })
  }

  /**
   * 静音切换
   */
  toggleMute(): boolean {
    this.state.muted = !this.state.muted

    if (this.state.muted) {
      if (this.musicElement) {
        this.musicElement.muted = true
      }
    } else {
      if (this.musicElement) {
        this.musicElement.muted = false
      }
    }

    this.savePreferences()
    this.emit({ type: 'muteChange', data: { muted: this.state.muted } })
    return this.state.muted
  }

  /**
   * 设置静音状态
   */
  setMuted(muted: boolean): void {
    if (this.state.muted !== muted) {
      this.toggleMute()
    }
  }

  // ============================================
  // State & Events
  // ============================================

  /**
   * 获取当前状态
   */
  getState(): AudioManagerState {
    return { ...this.state }
  }

  /**
   * 添加事件监听器
   */
  addEventListener(listener: AudioEventListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // ============================================
  // Private Methods
  // ============================================

  private applyVolume(): void {
    if (this.musicElement) {
      const config = this.state.currentMusic ? getMusicConfig(this.state.currentMusic) : null
      const baseVolume = config?.volume || this.state.musicVolume
      this.musicElement.volume = baseVolume * this.state.musicVolume * this.state.masterVolume
    }
  }

  private fadeInMusic(duration: number): void {
    if (!this.musicElement || !this.state.currentMusic) return

    const config = getMusicConfig(this.state.currentMusic)
    const targetVolume = config.volume * this.state.musicVolume * this.state.masterVolume
    const steps = 20
    const stepDuration = duration / steps
    const volumeStep = targetVolume / steps
    let currentStep = 0

    this.clearFadeInterval()

    this.fadeInterval = window.setInterval(() => {
      currentStep++
      this.musicElement!.volume = Math.min(volumeStep * currentStep, targetVolume)

      if (currentStep >= steps) {
        this.clearFadeInterval()
      }
    }, stepDuration)
  }

  private fadeOutMusic(duration: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.musicElement) {
        resolve()
        return
      }

      const startVolume = this.musicElement.volume
      const steps = 20
      const stepDuration = duration / steps
      const volumeStep = startVolume / steps
      let currentStep = 0

      this.clearFadeInterval()

      this.fadeInterval = window.setInterval(() => {
        currentStep++
        this.musicElement!.volume = Math.max(startVolume - volumeStep * currentStep, 0)

        if (currentStep >= steps) {
          this.clearFadeInterval()
          resolve()
        }
      }, stepDuration)
    })
  }

  private clearFadeInterval(): void {
    if (this.fadeInterval) {
      window.clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }
  }

  private emit(event: AudioEvent): void {
    this.listeners.forEach((listener) => listener(event))
  }

  // ============================================
  // Web Audio API Synthesis (Fallback)
  // ============================================

  private ambientOscillators: OscillatorNode[] = []

  private generateAmbientSound(music: BackgroundMusic): void {
    if (!this.audioContext) return

    // 停止之前的环境音
    this.stopAmbientSound()

    // 根据音乐类型生成不同的基础频率
    const baseFrequencies: Record<BackgroundMusic, number> = {
      [BackgroundMusic.SUSPENSE]: 110, // A2
      [BackgroundMusic.FANTASY]: 146.83, // D3
      [BackgroundMusic.SCIFI]: 82.41, // E2
      [BackgroundMusic.TENSE]: 98, // G2
      [BackgroundMusic.LIGHT]: 164.81, // E3
      [BackgroundMusic.MYSTERY]: 73.42, // D2
      [BackgroundMusic.FINALE]: 130.81, // C3
      [BackgroundMusic.ENDING]: 110, // A2
      [BackgroundMusic.MENU]: 123.47, // B2
    }

    const freq = baseFrequencies[music] || 110

    // 创建振荡器
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime)

    // 低音量环境音
    gainNode.gain.setValueAtTime(0.02 * this.state.musicVolume * this.state.masterVolume, this.audioContext.currentTime)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start()
    this.ambientOscillators.push(oscillator)
  }

  private stopAmbientSound(): void {
    this.ambientOscillators.forEach((osc) => {
      try {
        osc.stop()
      } catch {
        // ignore
      }
    })
    this.ambientOscillators = []
  }

  private generateTone(effect: SoundEffect): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    // 不同音效使用不同频率
    const frequencies: Record<SoundEffect, number> = {
      [SoundEffect.CLICK]: 800,
      [SoundEffect.SELECT]: 600,
      [SoundEffect.CANCEL]: 400,
      [SoundEffect.CLUE_FOUND]: 880,
      [SoundEffect.ACHIEVEMENT]: 1000,
      [SoundEffect.SCENE_TRANSITION]: 500,
      [SoundEffect.EVENT_TRIGGER]: 700,
      [SoundEffect.ITEM_GAIN]: 750,
      [SoundEffect.FAILURE]: 300,
      [SoundEffect.SUCCESS]: 900,
      [SoundEffect.WARNING]: 550,
      [SoundEffect.MYSTERIOUS]: 450,
      [SoundEffect.DIALOGUE_APPEAR]: 650,
      [SoundEffect.TYPEWRITER]: 1200,
    }

    const freq = frequencies[effect] || 600
    const config = getSoundConfig(effect)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime)

    // 设置音量和衰减
    const volume = 0.1 * config.volume * this.state.sfxVolume * this.state.masterVolume
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.15)
  }

  // ============================================
  // Preferences Storage
  // ============================================

  private readonly STORAGE_KEY = 'audio-preferences'

  private savePreferences(): void {
    try {
      const prefs = {
        muted: this.state.muted,
        masterVolume: this.state.masterVolume,
        musicVolume: this.state.musicVolume,
        sfxVolume: this.state.sfxVolume,
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // ignore
    }
  }

  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (saved) {
        const prefs = JSON.parse(saved)
        this.state.muted = prefs.muted ?? false
        this.state.masterVolume = prefs.masterVolume ?? 1
        this.state.musicVolume = prefs.musicVolume ?? 0.3
        this.state.sfxVolume = prefs.sfxVolume ?? 0.5
      }
    } catch {
      // ignore
    }
  }
}

// ============================================
// Singleton Export
// ============================================

export const AudioManager = new AudioManagerClass()

export default AudioManager