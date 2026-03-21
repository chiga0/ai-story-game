/**
 * 分享卡片组件
 * 显示游戏结束后的分享界面
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

interface ShareCardProps {
  /** 分享数据 */
  data: ShareCardData
  /** 关闭回调 */
  onClose?: () => void
}

type ShareState = 'idle' | 'generating' | 'ready' | 'sharing' | 'error'

export function ShareCard({ data, onClose }: ShareCardProps) {
  const [state, setState] = useState<ShareState>('idle')
  const [cardBlob, setCardBlob] = useState<Blob | null>(null)
  const [cardUrl, setCardUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCopied, setShowCopied] = useState(false)

  // 生成分享卡片
  useEffect(() => {
    let isMounted = true

    const generateCard = async () => {
      try {
        setState('generating')
        const blob = await generateShareCard(data)
        
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
  }, [data])

  // 处理分享
  const handleShare = useCallback(async (platform: SharePlatform) => {
    if (state !== 'ready') return

    setState('sharing')
    try {
      await shareToPlatform(platform, data)
    } catch (err) {
      console.error('Share failed:', err)
    } finally {
      setState('ready')
    }
  }, [data, state])

  // 处理原生分享
  const handleNativeShare = useCallback(async () => {
    if (!cardBlob || state !== 'ready') return

    const record = createShareRecord(data)
    saveShareRecord(record)
    const shareUrl = generateShareUrl(record)

    const success = await nativeShare({
      title: `${data.scriptTitle} - ${data.endingTitle}`,
      text: `我在「${data.scriptTitle}」中达成了「${data.endingTitle}」结局！`,
      url: shareUrl,
      image: cardBlob,
    })

    if (!success) {
      // 原生分享不可用，显示其他选项
      alert('您的浏览器不支持原生分享功能，请使用其他分享方式')
    }
  }, [cardBlob, data, state])

  // 处理下载
  const handleDownload = useCallback(() => {
    if (!cardBlob) return
    const filename = `${data.scriptTitle}-${data.endingTitle}-分享卡片.png`
    downloadShareCard(cardBlob, filename)
  }, [cardBlob, data])

  // 复制分享链接
  const handleCopyLink = useCallback(() => {
    const record = createShareRecord(data)
    saveShareRecord(record)
    const shareUrl = generateShareUrl(record)
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    })
  }, [data])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎉 分享你的结局
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 卡片预览 */}
          <div className="mb-6">
            {state === 'generating' && (
              <div className="aspect-[1200/630] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">生成分享卡片...</p>
                </div>
              </div>
            )}

            {state === 'error' && (
              <div className="aspect-[1200/630] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-red-500">
                  <p>❌ {error}</p>
                  <button
                    onClick={() => {
                      setState('idle')
                      setError(null)
                    }}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    重试
                  </button>
                </div>
              </div>
            )}

            {state === 'ready' && cardUrl && (
              <div className="relative">
                <img
                  src={cardUrl}
                  alt="分享卡片"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* 关键选择路径 */}
            {state === 'ready' && data.keyChoices && data.keyChoices.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>📍</span>
                  <span>我的抉择之路</span>
                </h4>
                <div className="space-y-2">
                  {data.keyChoices.slice(0, 5).map((choice, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{choice.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 分享选项 */}
          {state === 'ready' && (
            <div className="space-y-4">
              {/* 原生分享（如果支持） */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={handleNativeShare}
                  disabled={state === 'sharing'}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>📤</span>
                  <span>系统分享</span>
                </button>
              )}

              {/* 社交平台按钮 */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleShare('wechat')}
                  disabled={state === 'sharing'}
                  className="py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>微信</span>
                </button>

                <button
                  onClick={() => handleShare('weibo')}
                  disabled={state === 'sharing'}
                  className="py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>📱</span>
                  <span>微博</span>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  disabled={state === 'sharing'}
                  className="py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>🐦</span>
                  <span>Twitter</span>
                </button>
              </div>

              {/* 其他操作 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 relative"
                >
                  <span>🔗</span>
                  <span>{showCopied ? '已复制!' : '复制链接'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>⬇️</span>
                  <span>下载图片</span>
                </button>
              </div>
            </div>
          )}

          {/* 游戏数据 */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              游戏数据
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">剧本</span>
                <p className="font-medium text-gray-900 dark:text-white">{data.scriptTitle}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">结局</span>
                <p className="font-medium text-gray-900 dark:text-white">{data.endingTitle}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">游戏时长</span>
                <p className="font-medium text-gray-900 dark:text-white">{data.playTime} 分钟</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">选择次数</span>
                <p className="font-medium text-gray-900 dark:text-white">{data.choices} 次</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 分享按钮组件
 * 用于在游戏结束页面显示
 */
interface ShareButtonProps {
  data: ShareCardData
  className?: string
}

export function ShareButton({ data, className = '' }: ShareButtonProps) {
  const [showShareCard, setShowShareCard] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowShareCard(true)}
        className={`px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 ${className}`}
      >
        <span>🎉</span>
        <span>分享你的结局</span>
      </button>

      {showShareCard && (
        <ShareCard data={data} onClose={() => setShowShareCard(false)} />
      )}
    </>
  )
}

export default ShareCard