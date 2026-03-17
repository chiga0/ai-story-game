import { useState } from 'react'
import { saveGame, type SaveSlot } from '#/lib/game/save-manager'
import type { GameState } from '#/lib/game/engine'

interface SaveButtonProps {
  scriptId: string
  scriptTitle: string
  state: GameState
  onSave?: (save: SaveSlot) => void
}

export function SaveButton({ scriptId, scriptTitle, state, onSave }: SaveButtonProps) {
  const [saving, setSaving] = useState(false)
  const [lastSave, setLastSave] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const save = saveGame(scriptId, scriptTitle, state)
      setLastSave(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
      onSave?.(save)
    } catch (error) {
      console.error('Save failed:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-[var(--sea-ink)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? '保存中...' : '保存游戏'}
      </button>
      {lastSave && (
        <span className="text-sm text-[var(--sea-ink-soft)]">
          上次保存: {lastSave}
        </span>
      )}
    </div>
  )
}