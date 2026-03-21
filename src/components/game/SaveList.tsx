import { useState } from 'react'
import { 
  getAllSaves, 
  deleteSave, 
  formatDuration, 
  formatSaveTime,
  getSceneDisplayName,
  type SaveSlot 
} from '#/lib/game/save-manager'

interface SaveListProps {
  onLoad: (save: SaveSlot) => void
  scriptId?: string // 可选，筛选特定剧本的存档
}

export function SaveList({ onLoad, scriptId }: SaveListProps) {
  const [saves, setSaves] = useState<SaveSlot[]>(() => {
    const all = getAllSaves()
    return scriptId ? all.filter(s => s.scriptId === scriptId) : all
  })

  const handleDelete = (saveId: string) => {
    if (confirm('确定删除这个存档吗？')) {
      deleteSave(saveId)
      setSaves(saves.filter(s => s.id !== saveId))
    }
  }

  const handleLoad = (save: SaveSlot) => {
    if (confirm('加载存档将覆盖当前游戏进度，确定继续吗？')) {
      onLoad(save)
    }
  }

  if (saves.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--sea-ink-soft)]">
        暂无存档
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {saves.map((save) => (
        <div
          key={save.id}
          className="bg-[var(--bg-soft)] border border-[var(--sea-ink-light)] rounded-lg p-4 hover:border-[var(--sea-ink)] transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-[var(--sea-ink)]">{save.scriptTitle}</h3>
              <div className="mt-2 text-sm text-[var(--sea-ink-soft)] space-y-1">
                <div>场景: {getSceneDisplayName(save.currentScene)}</div>
                <div>探索: {save.exploredBranches || 0} 个分支</div>
                <div>时长: {formatDuration(save.playDuration)}</div>
                {save.attributes && Object.keys(save.attributes).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(save.attributes).map(([key, value]) => (
                      <span key={key} className="px-2 py-0.5 bg-[var(--bg)] rounded text-xs">
                        {key === 'clue' ? '线索' : key === 'courage' ? '勇气' : 
                         key === 'wisdom' ? '智慧' : key === 'trust' ? '信任' : 
                         key === 'suspicion' ? '怀疑' : key}: {value}
                      </span>
                    ))}
                  </div>
                )}
                <div>保存: {formatSaveTime(save.savedAt)}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleLoad(save)}
                className="px-3 py-1.5 bg-[var(--sea-ink)] text-white rounded hover:opacity-90 transition-opacity text-sm"
              >
                加载
              </button>
              <button
                onClick={() => handleDelete(save.id)}
                className="px-3 py-1.5 border border-red-400 text-red-500 rounded hover:bg-red-50 transition-colors text-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}