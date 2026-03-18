/**
 * 成就解锁通知组件
 * 在成就解锁时显示动画提示，3秒后自动消失
 */

import { useState, useEffect, useCallback } from 'react'
import type { Achievement } from '#/lib/game/achievements'

interface AchievementNotificationProps {
  /** 成就信息 */
  achievement: Achievement
  /** 动画完成后回调 */
  onComplete?: () => void
  /** 显示持续时间（毫秒） */
  duration?: number
}

/**
 * 单个成就通知
 */
export function AchievementNotification({
  achievement,
  onComplete,
  duration = 3000,
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // 延迟显示以触发入场动画
    const showTimer = setTimeout(() => setIsVisible(true), 50)
    
    // 设置消失计时
    const leaveTimer = setTimeout(() => {
      setIsLeaving(true)
    }, duration)

    // 完全消失后回调
    const completeTimer = setTimeout(() => {
      onComplete?.()
    }, duration + 300) // 额外300ms用于离场动画

    return () => {
      clearTimeout(showTimer)
      clearTimeout(leaveTimer)
      clearTimeout(completeTimer)
    }
  }, [duration, onComplete])

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          bg-gradient-to-r from-yellow-500 to-amber-500
          text-white rounded-lg shadow-lg
          px-4 py-3 min-w-[280px]
          flex items-center gap-3
          ${isVisible && !isLeaving ? 'animate-bounce-subtle' : ''}
        `}
        style={{
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
        }}
      >
        {/* 成就图标 */}
        <div className="text-3xl animate-pulse">{achievement.icon}</div>
        
        {/* 成就信息 */}
        <div className="flex-1">
          <div className="text-xs text-yellow-100 font-medium">成就解锁!</div>
          <div className="font-bold text-lg">{achievement.name}</div>
          <div className="text-sm text-yellow-100 opacity-90">{achievement.description}</div>
        </div>

        {/* 光效 */}
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 bg-white opacity-0"
            style={{
              animation: isVisible && !isLeaving ? 'shimmer 2s infinite' : 'none',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 0.1; }
          100% { opacity: 0; transform: translateX(100%); }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

/**
 * 成就通知队列管理器
 */
interface NotificationQueueItem {
  id: string
  achievement: Achievement
}

interface AchievementNotificationManagerProps {
  /** 待显示的成就队列 */
  achievements: Achievement[]
  /** 所有通知完成后回调 */
  onComplete?: () => void
}

export function AchievementNotificationManager({
  achievements,
  onComplete,
}: AchievementNotificationManagerProps) {
  const [queue, setQueue] = useState<NotificationQueueItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (achievements.length > 0) {
      setQueue(achievements.map((a, i) => ({ id: `achievement-${i}-${Date.now()}`, achievement: a })))
      setCurrentIndex(0)
    }
  }, [achievements])

  const handleNotificationComplete = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1
      if (next >= queue.length) {
        onComplete?.()
      }
      return next
    })
  }, [queue.length, onComplete])

  if (queue.length === 0 || currentIndex >= queue.length) {
    return null
  }

  const currentItem = queue[currentIndex]

  return (
    <AchievementNotification
      key={currentItem.id}
      achievement={currentItem.achievement}
      onComplete={handleNotificationComplete}
    />
  )
}

/**
 * 全局成就通知 Hook
 * 用于在任意组件中触发成就通知
 */
export function useAchievementNotifications() {
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([])

  const showNotifications = useCallback((achievements: Achievement[]) => {
    setPendingAchievements(achievements)
  }, [])

  const clearNotifications = useCallback(() => {
    setPendingAchievements([])
  }, [])

  return {
    pendingAchievements,
    showNotifications,
    clearNotifications,
    NotificationComponent: pendingAchievements.length > 0 ? (
      <AchievementNotificationManager
        achievements={pendingAchievements}
        onComplete={clearNotifications}
      />
    ) : null,
  }
}

export default AchievementNotification