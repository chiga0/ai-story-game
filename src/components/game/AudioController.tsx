/**
 * 音频控制器组件
 * 提供音量滑块控制、静音按钮和播放状态显示
 */

import { useState, useCallback } from 'react'
import { useAudio } from '#/hooks/useAudio'
import { BackgroundMusic } from '#/lib/audio/sounds'

// ============================================
// Types
// ============================================

export interface AudioControllerProps {
  /** 是否显示音量滑块（默认 true） */
  showVolumeSliders?: boolean
  /** 是否显示静音按钮（默认 true） */
  showMuteButton?: boolean
  /** 是否显示当前播放状态（默认 true） */
  showStatus?: boolean
  /** 是否显示背景音乐选择器（默认 false） */
  showMusicSelector?: boolean
  /** 紧凑模式（默认 false） */
  compact?: boolean
  /** 自定义类名 */
  className?: string
}

// ============================================
// Component
// ============================================

export function AudioController({
  showVolumeSliders = true,
  showMuteButton = true,
  showStatus = true,
  showMusicSelector = false,
  compact = false,
  className = '',
}: AudioControllerProps) {
  const { state, playSfx, setMasterVolume, setMusicVolume, setSfxVolume, toggleMute, playMusic, stopMusic } = useAudio()

  const [isExpanded, setIsExpanded] = useState(!compact)

  const handleVolumeChange = useCallback(
    (type: 'master' | 'music' | 'sfx', value: number) => {
      switch (type) {
        case 'master':
          setMasterVolume(value)
          break
        case 'music':
          setMusicVolume(value)
          break
        case 'sfx':
          setSfxVolume(value)
          break
      }
    },
    [setMasterVolume, setMusicVolume, setSfxVolume]
  )

  const handleMuteToggle = useCallback(() => {
    toggleMute()
    if (!state.muted) {
      playSfx('click')
    }
  }, [state.muted, toggleMute, playSfx])

  const handleMusicSelect = useCallback(
    async (music: BackgroundMusic) => {
      await playMusic(music)
    },
    [playMusic]
  )

  const formatVolume = (volume: number): string => {
    return `${Math.round(volume * 100)}%`
  }

  // 紧凑模式渲染
  if (compact && !isExpanded) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleMuteToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={state.muted ? '取消静音' : '静音'}
        >
          <span className="text-lg">{state.muted ? '🔇' : state.masterVolume > 0.5 ? '🔊' : '🔉'}</span>
        </button>
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-500"
        >
          ⚙️
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <span>🎵</span>
          <span>音频设置</span>
        </h3>
        {compact && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* 静音按钮 */}
      {showMuteButton && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleMuteToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              state.muted
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}
          >
            <span>{state.muted ? '🔇' : '🔊'}</span>
            <span className="text-sm">{state.muted ? '已静音' : '音频开启'}</span>
          </button>
        </div>
      )}

      {/* 音量滑块 */}
      {showVolumeSliders && (
        <div className="space-y-4">
          {/* 主音量 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">主音量</label>
              <span className="text-xs text-gray-400">{formatVolume(state.masterVolume)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.masterVolume}
              onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* 背景音乐音量 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">背景音乐</label>
              <span className="text-xs text-gray-400">{formatVolume(state.musicVolume)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.musicVolume}
              onChange={(e) => handleVolumeChange('music', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* 音效音量 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">音效</label>
              <span className="text-xs text-gray-400">{formatVolume(state.sfxVolume)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.sfxVolume}
              onChange={(e) => handleVolumeChange('sfx', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>
      )}

      {/* 当前播放状态 */}
      {showStatus && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">状态:</span>
            {state.isPlaying ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <span className="animate-pulse">♪</span>
                <span>正在播放</span>
              </span>
            ) : (
              <span className="text-gray-400">未播放</span>
            )}
          </div>
          {state.currentMusic && (
            <div className="text-xs text-gray-400 mt-1">
              当前音乐: {state.currentMusic}
            </div>
          )}
        </div>
      )}

      {/* 背景音乐选择器 */}
      {showMusicSelector && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">选择背景音乐</div>
          <div className="flex flex-wrap gap-2">
            {Object.values(BackgroundMusic).map((music) => (
              <button
                key={music}
                onClick={() => handleMusicSelect(music)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  state.currentMusic === music
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {music}
              </button>
            ))}
          </div>
          {state.isPlaying && (
            <button
              onClick={() => stopMusic()}
              className="mt-2 px-3 py-1 text-xs rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
            >
              停止音乐
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Simple Mute Button Component
// ============================================

export interface MuteButtonProps {
  className?: string
}

/**
 * 简单静音按钮
 */
export function MuteButton({ className = '' }: MuteButtonProps) {
  const { state, toggleMute } = useAudio()

  return (
    <button
      onClick={toggleMute}
      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      title={state.muted ? '取消静音' : '静音'}
    >
      <span className="text-lg">
        {state.muted ? '🔇' : state.masterVolume > 0.5 ? '🔊' : '🔉'}
      </span>
    </button>
  )
}

// ============================================
// Volume Slider Component
// ============================================

export interface VolumeSliderProps {
  type: 'master' | 'music' | 'sfx'
  value: number
  onChange: (value: number) => void
  label?: string
  className?: string
}

/**
 * 单个音量滑块
 */
export function VolumeSlider({ type, value, onChange, label, className = '' }: VolumeSliderProps) {
  const labelMap = {
    master: '主音量',
    music: '背景音乐',
    sfx: '音效',
  }

  const colorMap = {
    master: 'blue',
    music: 'purple',
    sfx: 'orange',
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">
          {label || labelMap[type]}
        </label>
        <span className="text-xs text-gray-400">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-${colorMap[type]}-500`}
      />
    </div>
  )
}

export default AudioController