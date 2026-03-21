import { useState, useEffect } from 'react'
import { saveGame, type SaveSlot } from '#/lib/game/save-manager'
import type { GameState } from '#/lib/game/engine'

interface SaveButtonProps {
  scriptId: string
  scriptTitle: string
  state: GameState
  onSave?: (save: SaveSlot) => void
}

// P0-3: 情感化微文案
const emotionalMessages = {
  saving: '保存中...',
  success: '你的选择已被铭记',
  lastSave: (time: string) => `上次保存: ${time}`,
  farewell: '角色们会等你回来',
  autosaveHint: '游戏会自动保存你的进度',
}

export function SaveButton({ scriptId, scriptTitle, state, onSave }: SaveButtonProps) {
  const [saving, setSaving] = useState(false)
  const [lastSave, setLastSave] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const save = saveGame(scriptId, scriptTitle, state)
      const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      setLastSave(now)
      onSave?.(save)
      
      // P0-3: 显示成功提示
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Save failed:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-[var(--sea-ink)] text-white rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95"
      >
        {saving ? emotionalMessages.saving : '保存游戏'}
      </button>
      
      {/* P0-3: 情感化反馈 */}
      {showSuccess && (
        <span className="text-sm text-green-600 font-medium animate-pulse">
          ✓ {emotionalMessages.success}
        </span>
      )}
      
      {lastSave && !showSuccess && (
        <span className="text-sm text-[var(--sea-ink-soft)]">
          {emotionalMessages.lastSave(lastSave)}
        </span>
      )}
    </div>
  )
}

// P0-3: 离开游戏时的挽留提示组件
export function LeaveGamePrompt({ onConfirm, onCancel }: { 
  onConfirm: () => void
  onCancel: () => void 
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 text-center">
        <div className="text-4xl mb-4">👋</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          确定要离开吗？
        </h3>
        <p className="text-gray-600 mb-6">
          {emotionalMessages.farewell}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            继续游戏
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[var(--sea-ink)] text-white rounded-lg hover:opacity-90 transition-colors"
          >
            确认离开
          </button>
        </div>
      </div>
    </div>
  )
}

// P0-3: 成就达成祝贺组件
export function AchievementToast({ 
  title, 
  description, 
  onClose 
}: { 
  title: string
  description: string
  onClose: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl p-4 shadow-lg animate-slide-up max-w-sm z-50">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🏆</span>
        <div className="flex-1">
          <p className="text-sm font-semibold">太棒了！你解锁了...</p>
          <p className="font-bold">{title}</p>
          <p className="text-sm opacity-90">{description}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-white/70 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  )
}