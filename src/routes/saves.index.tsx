import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { SaveList } from '#/components/game/SaveList'
import { getAllSaves, type SaveSlot } from '#/lib/game/save-manager'

export const Route = createFileRoute('/saves/')({
  component: SavesPage,
})

function SavesPage() {
  const [saves, setSaves] = useState<SaveSlot[]>([])

  useEffect(() => {
    setSaves(getAllSaves())
  }, [])

  const handleLoad = (save: SaveSlot) => {
    // 导航到游戏页面并加载存档
    window.location.href = `/play/${save.scriptId}?saveId=${save.id}`
  }

  const handleRefresh = () => {
    setSaves(getAllSaves())
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

      <div className="mb-4">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 border border-[var(--sea-ink)] text-[var(--sea-ink)] rounded-lg hover:bg-[var(--bg-soft)] transition-colors"
        >
          刷新
        </button>
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