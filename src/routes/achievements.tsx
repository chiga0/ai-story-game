/**
 * 成就页面
 * 显示成就列表、解锁状态和解锁时间
 */

import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  ACHIEVEMENTS,
  getAchievementData,
  getAchievementProgress,
  type Achievement,
  type AchievementCategory,
  type UnlockedAchievement,
} from '#/lib/game/achievements'

export const Route = createFileRoute('/achievements')({
  component: AchievementsPage,
})

// 分类图标映射
const CATEGORY_ICONS: Record<AchievementCategory, string> = {
  progress: '📈',
  exploration: '🗺️',
  collection: '💎',
  speed: '⚡',
  ending: '🏆',
}

// 分类名称映射
const CATEGORY_NAMES: Record<AchievementCategory, string> = {
  progress: '进度',
  exploration: '探索',
  collection: '收集',
  speed: '速度',
  ending: '结局',
}

function AchievementsPage() {
  const [unlockedMap, setUnlockedMap] = useState<Map<string, UnlockedAchievement>>(new Map())
  const [progress, setProgress] = useState<{
    total: number
    unlocked: number
    byCategory: Record<AchievementCategory, { total: number; unlocked: number }>
  } | null>(null)

  useEffect(() => {
    const data = getAchievementData()
    setUnlockedMap(new Map(data.unlocked.map((a) => [a.id, a])))
    setProgress(getAchievementProgress())
  }, [])

  // 按分类分组
  const achievementsByCategory = ACHIEVEMENTS.reduce(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = []
      }
      acc[achievement.category].push(achievement)
      return acc
    },
    {} as Record<AchievementCategory, Achievement[]>
  )

  // 格式化解锁时间
  const formatUnlockTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] p-4 md:p-8">
      {/* 返回按钮 */}
      <div className="mb-6">
        <a href="/" className="text-[var(--sea-ink)] hover:underline inline-flex items-center gap-2">
          ← 返回首页
        </a>
      </div>

      {/* 标题和总进度 */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--sea-ink)] mb-2">成就</h1>
          {progress && (
            <div className="text-[var(--sea-ink-soft)]">
              已解锁 {progress.unlocked} / {progress.total} 个成就
            </div>
          )}
        </div>

        {/* 进度条 */}
        {progress && (
          <div className="mb-8 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-500"
              style={{ width: `${(progress.unlocked / progress.total) * 100}%` }}
            />
          </div>
        )}

        {/* 分类进度 */}
        {progress && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {(Object.keys(CATEGORY_NAMES) as AchievementCategory[]).map((category) => (
              <div
                key={category}
                className="bg-white rounded-lg p-4 text-center shadow-sm border border-[var(--sea-ink-light)]"
              >
                <div className="text-2xl mb-1">{CATEGORY_ICONS[category]}</div>
                <div className="text-sm text-[var(--sea-ink-soft)]">{CATEGORY_NAMES[category]}</div>
                <div className="font-bold text-[var(--sea-ink)]">
                  {progress.byCategory[category].unlocked} / {progress.byCategory[category].total}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 成就列表 */}
        <div className="space-y-6">
          {(Object.keys(achievementsByCategory) as AchievementCategory[]).map((category) => (
            <div key={category}>
              {/* 分类标题 */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{CATEGORY_ICONS[category]}</span>
                <h2 className="text-xl font-semibold text-[var(--sea-ink)]">
                  {CATEGORY_NAMES[category]}
                </h2>
              </div>

              {/* 成就卡片 */}
              <div className="grid gap-4 md:grid-cols-2">
                {achievementsByCategory[category].map((achievement) => {
                  const unlocked = unlockedMap.get(achievement.id)
                  const isUnlocked = !!unlocked
                  const isHidden = achievement.hidden && !isUnlocked

                  return (
                    <div
                      key={achievement.id}
                      className={`
                        rounded-lg p-4 border transition-all duration-200
                        ${
                          isUnlocked
                            ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300'
                            : 'bg-gray-50 border-gray-200'
                        }
                        ${isHidden ? 'opacity-60' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* 图标 */}
                        <div
                          className={`
                            text-3xl w-12 h-12 flex items-center justify-center rounded-lg
                            ${isUnlocked ? 'bg-yellow-100' : 'bg-gray-200'}
                          `}
                        >
                          {isHidden ? '❓' : achievement.icon}
                        </div>

                        {/* 内容 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-semibold ${
                                isUnlocked ? 'text-[var(--sea-ink)]' : 'text-gray-500'
                              }`}
                            >
                              {isHidden ? '???' : achievement.name}
                            </h3>
                            {isUnlocked && <span className="text-green-500">✓</span>}
                          </div>
                          
                          <p
                            className={`text-sm mt-1 ${
                              isUnlocked ? 'text-[var(--sea-ink-soft)]' : 'text-gray-400'
                            }`}
                          >
                            {isHidden ? '完成特定条件后解锁' : achievement.description}
                          </p>

                          {/* 条件 */}
                          {!isHidden && (
                            <p className="text-xs text-gray-400 mt-1">
                              条件: {achievement.condition}
                            </p>
                          )}

                          {/* 解锁时间 */}
                          {isUnlocked && (
                            <p className="text-xs text-yellow-600 mt-2">
                              解锁于 {formatUnlockTime(unlocked.unlockedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 提示 */}
        <div className="mt-8 text-center text-sm text-[var(--sea-ink-soft)]">
          <p>💡 继续游玩以解锁更多成就！</p>
        </div>
      </div>
    </div>
  )
}