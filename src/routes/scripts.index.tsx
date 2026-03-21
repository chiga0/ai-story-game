import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMemo, useCallback, useEffect, useState } from 'react'
import { sampleScripts } from '#/data/scripts'
import type { Script } from '#/types'
import { getDefaultCoverEmoji, getDefaultCoverGradient } from '#/lib/ai/image-generator'

export const Route = createFileRoute('/scripts/')({
  component: ScriptsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    genre: search.genre as string | undefined,
    duration: search.duration as string | undefined,
    difficulty: search.difficulty as string | undefined,
  }),
})

const difficultyMap: Record<number, '简单' | '中等' | '困难'> = {
  1: '简单',
  2: '中等',
  3: '困难',
}

const genreLabels: Record<string, string> = {
  mystery: '悬疑',
  fantasy: '奇幻',
  scifi: '科幻',
}

// 筛选配置
const GENRE_FILTERS = [
  { value: '', label: '全部' },
  { value: 'mystery', label: '悬疑' },
  { value: 'fantasy', label: '奇幻' },
  { value: 'scifi', label: '科幻' },
]

const DURATION_FILTERS = [
  { value: '', label: '全部' },
  { value: 'short', label: '<15分钟' },
  { value: 'medium', label: '15-30分钟' },
  { value: 'long', label: '>30分钟' },
]

const DIFFICULTY_FILTERS = [
  { value: '', label: '全部' },
  { value: '1', label: '简单' },
  { value: '2', label: '中等' },
  { value: '3', label: '困难' },
]

// 时长筛选辅助函数
function matchDuration(duration: number, filter: string): boolean {
  if (!filter) return true
  if (filter === 'short') return duration < 15
  if (filter === 'medium') return duration >= 15 && duration <= 30
  if (filter === 'long') return duration > 30
  return true
}

function ScriptsPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/scripts/' })
  const { genre = '', duration = '', difficulty = '' } = search

  // 加载自定义剧本
  const [customScripts, setCustomScripts] = useState<Script[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('custom-scripts')
      if (saved) {
        const parsed = JSON.parse(saved) as Script[]
        setCustomScripts(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Failed to load custom scripts:', error)
      setCustomScripts([])
    }
  }, [])

  // 合并示例剧本和自定义剧本
  const allScripts = useMemo(() => {
    return [...sampleScripts, ...customScripts]
  }, [customScripts])

  // 筛选剧本
  const filteredScripts = useMemo(() => {
    return allScripts.filter((script) => {
      // 类型筛选
      if (genre && script.genre !== genre) return false
      // 时长筛选
      if (!matchDuration(script.duration, duration)) return false
      // 难度筛选
      if (difficulty && String(script.difficulty ?? 2) !== difficulty) return false
      return true
    })
  }, [allScripts, genre, duration, difficulty])

  // 更新筛选条件
  const updateFilter = useCallback(
    (key: string, value: string) => {
      navigate({
        search: (prev) => ({
          ...prev,
          [key]: value || undefined,
        }),
      })
    },
    [navigate]
  )

  // 清除所有筛选
  const clearFilters = useCallback(() => {
    navigate({ search: {} })
  }, [navigate])

  const hasActiveFilters = genre || duration || difficulty

  return (
    <div className="page-wrap py-8">
      <div className="mb-8">
        <span className="island-kicker">剧本库</span>
        <h1 className="display-title text-3xl font-bold mt-2 text-[var(--sea-ink)]">
          选择你的故事
        </h1>
        <p className="text-[var(--sea-ink-soft)] mt-2">探索不同的剧本世界，开启你的冒险之旅</p>
      </div>

      {/* 筛选区域 */}
      <div className="mb-6 space-y-4">
        {/* 类型筛选 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-[var(--sea-ink)]">类型:</span>
          <div className="flex flex-wrap gap-2">
            {GENRE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => updateFilter('genre', filter.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  genre === filter.value
                    ? 'bg-[var(--sea-ink)] text-white'
                    : 'bg-[var(--bg-soft)] text-[var(--sea-ink)] border border-[var(--sea-ink-light)] hover:border-[var(--sea-ink)]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* 时长筛选 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-[var(--sea-ink)]">时长:</span>
          <div className="flex flex-wrap gap-2">
            {DURATION_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => updateFilter('duration', filter.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  duration === filter.value
                    ? 'bg-[var(--sea-ink)] text-white'
                    : 'bg-[var(--bg-soft)] text-[var(--sea-ink)] border border-[var(--sea-ink-light)] hover:border-[var(--sea-ink)]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* 难度筛选 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-[var(--sea-ink)]">难度:</span>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => updateFilter('difficulty', filter.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  difficulty === filter.value
                    ? 'bg-[var(--sea-ink)] text-white'
                    : 'bg-[var(--bg-soft)] text-[var(--sea-ink)] border border-[var(--sea-ink-light)] hover:border-[var(--sea-ink)]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* 清除筛选按钮 */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] underline"
          >
            清除所有筛选
          </button>
        )}
      </div>

      {/* 筛选结果统计 */}
      <div className="mb-4 text-sm text-[var(--sea-ink-soft)]">
        共 {filteredScripts.length} 个剧本
        {hasActiveFilters && '（已筛选）'}
      </div>

      {/* 剧本列表 */}
      {filteredScripts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.map((script) => (
            <Link
              key={script.id}
              to="/scripts/$id"
              params={{ id: script.id }}
              className="block group"
            >
              <div className="bg-[var(--bg-soft)] rounded-lg overflow-hidden border border-[var(--sea-ink-light)] hover:border-[var(--sea-ink)] transition-colors">
                {/* 封面图 */}
                <div className={`aspect-video relative overflow-hidden ${script.cover ? '' : `bg-gradient-to-br ${getDefaultCoverGradient(script.genre)} flex items-center justify-center`}`}>
                  {script.cover ? (
                    <img 
                      src={script.cover} 
                      alt={script.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // 图片加载失败时显示默认封面
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br ${getDefaultCoverGradient(script.genre)} flex items-center justify-center"><span class="text-4xl">${getDefaultCoverEmoji(script.genre)}</span></div>`
                      }}
                    />
                  ) : (
                    <span className="text-4xl">
                      {getDefaultCoverEmoji(script.genre)}
                    </span>
                  )}
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
      ) : (
        <div className="text-center py-12">
          <p className="text-[var(--sea-ink-soft)]">没有找到符合条件的剧本</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 text-[var(--sea-ink)] hover:underline"
          >
            清除筛选条件
          </button>
        </div>
      )}
    </div>
  )
}
