import { createFileRoute, Link } from '@tanstack/react-router'
import { sampleScripts } from '#/data/scripts'

export const Route = createFileRoute('/scripts/')({
  component: ScriptsPage,
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

function ScriptsPage() {
  return (
    <div className="page-wrap py-8">
      <div className="mb-8">
        <span className="island-kicker">剧本库</span>
        <h1 className="display-title text-3xl font-bold mt-2 text-[var(--sea-ink)]">
          选择你的故事
        </h1>
        <p className="text-[var(--sea-ink-soft)] mt-2">探索不同的剧本世界，开启你的冒险之旅</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleScripts.map((script) => (
          <Link
            key={script.id}
            to="/scripts/$id"
            params={{ id: script.id }}
            className="block group"
          >
            <div className="bg-[var(--bg-soft)] rounded-lg overflow-hidden border border-[var(--sea-ink-light)] hover:border-[var(--sea-ink)] transition-colors">
              {/* 封面图 */}
              <div className="aspect-video bg-gradient-to-br from-[var(--sea-ink-light)] to-[var(--sea-ink)] flex items-center justify-center">
                <span className="text-4xl">
                  {script.genre === 'mystery' && '🏰'}
                  {script.genre === 'fantasy' && '🐉'}
                  {script.genre === 'scifi' && '🚀'}
                </span>
              </div>

              {/* 内容 */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-[var(--sea-ink)] text-white rounded">
                    {genreLabels[script.genre] || script.genre}
                  </span>
                  <span className="text-xs text-[var(--sea-ink-soft)]">{script.duration} 分钟</span>
                </div>

                <h3 className="font-bold text-lg text-[var(--sea-ink)] group-hover:text-[var(--sea-ink-soft)] transition-colors">
                  {script.title}
                </h3>

                <p className="text-sm text-[var(--sea-ink-soft)] mt-2 line-clamp-2">
                  {script.description}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[var(--sea-ink-soft)]">
                    难度: {difficultyMap[script.difficulty ?? 2] || '中等'}
                  </span>
                  <span className="text-sm text-[var(--sea-ink)] group-hover:translate-x-1 transition-transform">
                    开始游戏 →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
