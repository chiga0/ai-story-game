import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { SaveList } from '#/components/game/SaveList'
import { getAllSaves, type SaveSlot, getLatestSave } from '#/lib/game/save-manager'

export const Route = createFileRoute('/saves/')({
  component: SavesPage,
})

function SavesPage() {
  const [saves, setSaves] = useState<SaveSlot[]>([])
  const [hasLatestSave, setHasLatestSave] = useState(false)
  const [latestSave, setLatestSave] = useState<SaveSlot | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setSaves(getAllSaves())
    const latest = getLatestSave()
    setLatestSave(latest)
    setHasLatestSave(!!latest)
  }, [])

  const handleLoad = (save: SaveSlot) => {
    // 导航到游戏页面并加载存档
    window.location.href = `/play/${save.scriptId}?saveId=${save.id}`
  }

  const handleContinueGame = () => {
    if (latestSave) {
      handleLoad(latestSave)
    }
  }

  const handleRefresh = () => {
    setSaves(getAllSaves())
    const latest = getLatestSave()
    setLatestSave(latest)
    setHasLatestSave(!!latest)
  }

  return (
    <div className="page-wrap py-8">
      <div className="mb-6">
        <span className="island-kicker">存档管理</span>
        <h1 className="display-title text-3xl font-bold mt-2 text-[var(--sea-ink)]">
          我的存档
        </h1>
        <p className="text-[var(--sea-ink-soft)] mt-2">
          共 {saves.length} 个存档
        </p>
      </div>

      {/* 快捷操作按钮 */}
      <div className="mb-6 flex flex-wrap gap-3">
        {hasLatestSave && (
          <button
            onClick={handleContinueGame}
            className="px-5 py-2.5 bg-[var(--lagoon-deep)] text-white rounded-lg hover:opacity-90 transition-colors font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            继续游戏
          </button>
        )}
        <button
          onClick={handleRefresh}
          className="px-4 py-2 border border-[var(--sea-ink)] text-[var(--sea-ink)] rounded-lg hover:bg-[var(--bg-soft)] transition-colors"
        >
          刷新
        </button>
        <a
          href="/scripts"
          className="px-4 py-2 border border-[var(--line)] text-[var(--sea-ink-soft)] rounded-lg hover:bg-[var(--bg-soft)] transition-colors"
        >
          浏览剧本库
        </a>
      </div>

      <SaveList onLoad={handleLoad} />

      <div className="mt-8">
        <a
          href="/scripts"
          className="text-[var(--sea-ink)] hover:underline"
        >
          ← 返回剧本库
        </a>
      </div>
    </div>
  )
}