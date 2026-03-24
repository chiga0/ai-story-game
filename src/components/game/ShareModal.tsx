/**
 * 分享引导弹窗组件
 * 游戏完成后展示分享弹窗，包含成就+结局卡片，提升分享率
 */

import { useState, useEffect, useCallback } from 'react'
import {
  generateShareCard,
  shareToPlatform,
  downloadShareCard,
  nativeShare,
  createShareRecord,
  saveShareRecord,
  generateShareUrl,
  type ShareCardData,
  type SharePlatform,
} from '#/lib/sharing/share-card'
import type { Achievement } from '#/lib/game/achievements'

interface ShareModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 结局标题 */
  endingTitle: string
  /** 结局描述 */
  endingDescription: string
  /** 结局类型标签 */
  endingTag?: string
  /** 剧本标题 */
  scriptTitle: string
  /** 剧本ID */
  scriptId: string
  /** 游玩时长（分钟） */
  playTime: number
  /** 选择次数 */
  choiceCount: number
  /** 达成的成就列表 */
  achievements: Achievement[]
  /** 剧本类型 */
  genre?: string
  /** 再玩一次回调 */
  onReplay?: () => void
}

type ModalState = 'idle' | 'generating' | 'ready' | 'sharing' | 'error'

export function ShareModal({
  isOpen,
  onClose,
  endingTitle,
  endingDescription,
  endingTag,
  scriptTitle,
  scriptId,
  playTime,
  choiceCount,
  achievements,
  genre,
  onReplay,
}: ShareModalProps) {
  const [state, setState] = useState<ModalState>('idle')
  const [cardBlob, setCardBlob] = useState<Blob | null>(null)
  const [cardUrl, setCardUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCopied, setShowCopied] = useState(false)

  // 构建分享数据
  const shareData: ShareCardData = {
    scriptTitle,
    endingTitle,
    endingDescription,
    playTime,
    choices: choiceCount,
    achievements: achievements.map(a => a.name),
    genre,
    scriptId,
    endingTag,
  }

  // 生成分享卡片
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const generateCard = async () => {
      try {
        setState('generating')
        const blob = await generateShareCard(shareData)
        
        if (isMounted) {
          setCardBlob(blob)
          setCardUrl(URL.createObjectURL(blob))
          setState('ready')
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : '生成分享卡片失败')
          setState('error')
        }
      }
    }

    generateCard()

    return () => {
      isMounted = false
      if (cardUrl) {
        URL.revokeObjectURL(cardUrl)
      }
    }
  }, [isOpen, shareData])

  // 处理分享
  const handleShare = useCallback(async (platform: SharePlatform) => {
    if (state !== 'ready') return

    setState('sharing')
    try {
      await shareToPlatform(platform, shareData)
    } catch (err) {
      console.error('Share failed:', err)
    } finally {
      setState('ready')
    }
  }, [shareData, state])

  // 处理原生分享
  const handleNativeShare = useCallback(async () => {
    if (!cardBlob || state !== 'ready') return

    const record = createShareRecord(shareData)
    saveShareRecord(record)
    const shareUrl = generateShareUrl(record)

    const success = await nativeShare({
      title: `${scriptTitle} - ${endingTitle}`,
      text: `我在「${scriptTitle}」中达成了「${endingTitle}」结局！`,
      url: shareUrl,
      image: cardBlob,
    })

    if (!success) {
      alert('您的浏览器不支持原生分享功能，请使用其他分享方式')
    }
  }, [cardBlob, shareData, scriptTitle, endingTitle, state])

  // 处理下载
  const handleDownload = useCallback(() => {
    if (!cardBlob) return
    const filename = `${scriptTitle}-${endingTitle}-分享卡片.png`
    downloadShareCard(cardBlob, filename)
  }, [cardBlob, scriptTitle, endingTitle])

  // 复制分享链接
  const handleCopyLink = useCallback(() => {
    const record = createShareRecord(shareData)
    saveShareRecord(record)
    const shareUrl = generateShareUrl(record)
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    })
  }, [shareData])

  // 再玩一次
  const handleReplay = useCallback(() => {
    onClose()
    if (onReplay) {
      onReplay()
    } else {
      // 默认跳转到剧本列表
      window.location.href = '/scripts'
    }
  }, [onClose, onReplay])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl animate-slideUp">
        {/* 结局卡片 */}
        <div className="relative p-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="关闭"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 结局类型标签 */}
          {endingTag && (
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-3">
              {endingTag}
            </div>
          )}

          {/* 结局标题 */}
          <h2 className="text-2xl font-bold mb-2">
            🏆 {endingTitle}
          </h2>

          {/* 结局描述 */}
          <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
            {endingDescription}
          </p>

          {/* 游戏统计 */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{playTime} 分钟</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🎯</span>
              <span>{choiceCount} 次选择</span>
            </div>
          </div>
        </div>

        {/* 成就列表 */}
        {achievements.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span>🏅</span>
              <span>达成的成就 ({achievements.length})</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {achievements.slice(0, 4).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg"
                >
                  <span className="text-xl">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {achievement.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
              {achievements.length > 4 && (
                <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-500 dark:text-gray-400">
                  +{achievements.length - 4} 更多
                </div>
              )}
            </div>
          </div>
        )}

        {/* 分享卡片预览 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="aspect-[1200/630] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
            {state === 'generating' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">生成分享卡片...</p>
                </div>
              </div>
            )}

            {state === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm">
                <span>❌ {error || '生成失败'}</span>
              </div>
            )}

            {state === 'ready' && cardUrl && (
              <img
                src={cardUrl}
                alt="分享卡片"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* 分享按钮 */}
        <div className="p-4 space-y-3">
          {/* 主要分享按钮 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              disabled={state !== 'ready'}
              className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
            >
              <span>⬇️</span>
              <span>下载图片</span>
            </button>

            {typeof navigator !== 'undefined' && navigator.share ? (
              <button
                onClick={handleNativeShare}
                disabled={state !== 'ready'}
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
              >
                <span>📤</span>
                <span>系统分享</span>
              </button>
            ) : (
              <button
                onClick={handleCopyLink}
                disabled={state !== 'ready'}
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
              >
                <span>🔗</span>
                <span>{showCopied ? '已复制!' : '复制链接'}</span>
              </button>
            )}
          </div>

          {/* 社交平台按钮 */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleShare('wechat')}
              disabled={state === 'sharing'}
              className="flex items-center justify-center gap-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <span>💬</span>
              <span>微信</span>
            </button>

            <button
              onClick={() => handleShare('weibo')}
              disabled={state === 'sharing'}
              className="flex items-center justify-center gap-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <span>📱</span>
              <span>微博</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              disabled={state === 'sharing'}
              className="flex items-center justify-center gap-1 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              <span>🐦</span>
              <span>Twitter</span>
            </button>
          </div>

          {/* 再玩一次 */}
          <button
            onClick={handleReplay}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span>🔄</span>
            <span>再玩一次</span>
          </button>

          {/* 关闭 */}
          <button
            onClick={onClose}
            className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            关闭弹窗
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareModal