import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Button } from '#/components/ui/button'
import { sampleScripts } from '#/data/scripts'

export const Route = createFileRoute('/scripts/$id')({
  component: ScriptDetailPage,
})

const difficultyMap: Record<number, '简单' | '中等' | '困难'> = {
  1: '简单',
  2: '简单',
  3: '中等',
  4: '困难',
  5: '困难',
}

const genreLabels: Record<string, string> = {
  mystery: '悬疑',
  fantasy: '奇幻',
  scifi: '科幻',
}

function ScriptDetailPage() {
  const { id } = Route.useParams()

  // 查找剧本
  const script = useMemo(() => {
    return sampleScripts.find((s) => s.id === id)
  }, [id])

  if (!script) {
    return (
      <div className="page-wrap py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--sea-ink)] mb-4">剧本不存在</h1>
          <p className="text-[var(--sea-ink-soft)] mb-6">
            未找到该剧本，请返回剧本库选择其他剧本。
          </p>
          <Link to="/scripts">
            <Button>返回剧本列表</Button>
          </Link>
        </div>
      </div>
    )
  }

  // 获取角色列表
  const characters = Object.values(script.characters)

  // 获取前 2 个场景用于预览
  const previewScenes = useMemo(() => {
    const scenes = Object.values(script.scenes)
    return scenes.slice(0, 2)
  }, [script.scenes])

  return (
    <div className="page-wrap py-8">
      <Link to="/scripts" className="nav-link inline-flex items-center gap-1 mb-6">
        ← 返回剧本列表
      </Link>

      <div className="island-shell rounded-2xl overflow-hidden">
        {/* 封面区域 */}
        <div className="aspect-video bg-gradient-to-br from-[var(--sea-ink-light)] to-[var(--sea-ink)] flex items-center justify-center">
          <span className="text-6xl">
            {script.genre === 'mystery' && '🏰'}
            {script.genre === 'fantasy' && '🐉'}
            {script.genre === 'scifi' && '🚀'}
          </span>
        </div>

        {/* 信息区域 */}
        <div className="p-6">
          {/* 标签 */}
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 rounded-full text-sm bg-[var(--chip-bg)] border border-[var(--chip-line)]">
              {genreLabels[script.genre] || script.genre}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-[var(--chip-bg)] border border-[var(--chip-line)]">
              {script.duration} 分钟
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-[var(--lagoon)] text-white">
              {difficultyMap[script.difficulty || 2] || '中等'}
            </span>
          </div>

          {/* 标题和描述 */}
          <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)] mb-4">
            {script.title}
          </h1>

          <p className="text-[var(--sea-ink-soft)] leading-relaxed mb-6">
            {script.description}
          </p>

          {/* 角色列表 */}
          <div className="mb-6">
            <h2 className="font-semibold text-lg text-[var(--sea-ink)] mb-4">可选角色</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--line)]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{char.avatar || '👤'}</span>
                    <div>
                      <div className="font-medium text-[var(--sea-ink)]">{char.name}</div>
                      {char.personality && (
                        <div className="text-sm text-[var(--lagoon-deep)]">{char.personality}</div>
                      )}
                    </div>
                  </div>
                  {char.description && (
                    <div className="text-sm text-[var(--sea-ink-soft)]">{char.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 场景预览 */}
          <div className="mb-6">
            <h2 className="font-semibold text-lg text-[var(--sea-ink)] mb-4">场景预览</h2>
            <div className="space-y-4">
              {previewScenes.map((scene, index) => {
                const speaker = scene.speaker
                  ? script.characters[scene.speaker]
                  : null

                return (
                  <div
                    key={scene.id}
                    className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--line)]"
                  >
                    <div className="text-xs text-[var(--sea-ink-soft)] mb-2">
                      场景 {index + 1}
                    </div>
                    {speaker && (
                      <div className="flex items-center gap-2 mb-2">
                        <span>{speaker.avatar || '👤'}</span>
                        <span className="font-medium text-[var(--sea-ink)]">
                          {speaker.name}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-[var(--sea-ink-soft)] leading-relaxed">
                      {scene.text.length > 200 ? `${scene.text.slice(0, 200)}...` : scene.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Link to="/play/$scriptId" params={{ scriptId: script.id }}>
              <Button size="lg">开始游戏</Button>
            </Link>
            <Link to="/scripts">
              <Button variant="outline" size="lg">
                返回列表
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}