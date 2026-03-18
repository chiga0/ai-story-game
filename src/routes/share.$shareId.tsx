/**
 * 分享落地页
 * 用于展示分享链接对应的结局信息
 */

import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { decodeShareData, getShareRecord, type ShareCardData } from '#/lib/sharing/share-card'
import { sampleScripts } from '#/data/scripts'

export const Route = createFileRoute('/share/$shareId')({
  component: SharePage,
})

interface SharePageState {
  loading: boolean
  data: ShareCardData | null
  error: string | null
}

function SharePage() {
  const { shareId } = Route.useParams()
  const [state, setState] = useState<SharePageState>({
    loading: true,
    data: null,
    error: null,
  })

  useEffect(() => {
    const loadShareData = async () => {
      try {
        // 尝试从本地存储获取分享记录
        const record = getShareRecord(shareId)
        
        if (record) {
          setState({
            loading: false,
            data: record.shareData,
            error: null,
          })
          return
        }

        // 尝试从 URL 参数解码
        // shareId 可能是 base64 编码的数据
        const decodedData = decodeShareData(shareId)
        
        if (decodedData) {
          setState({
            loading: false,
            data: decodedData,
            error: null,
          })
          return
        }

        // 如果都失败，显示错误
        setState({
          loading: false,
          data: null,
          error: '分享链接已过期或无效',
        })
      } catch (err) {
        setState({
          loading: false,
          data: null,
          error: err instanceof Error ? err.message : '加载失败',
        })
      }
    }

    loadShareData()
  }, [shareId])

  // 获取剧本信息
  const getScriptInfo = (scriptId?: string) => {
    if (!scriptId) return null
    return sampleScripts.find((s) => s.id === scriptId)
  }

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  if (state.error || !state.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">分享链接无效</h1>
          <p className="text-gray-300 mb-6">{state.error || '找不到分享内容'}</p>
          <a
            href="/scripts"
            className="inline-block px-6 py-3 bg-white text-purple-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            探索更多剧本
          </a>
        </div>
      </div>
    )
  }

  const { data } = state
  const script = getScriptInfo(data.scriptId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 装饰背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* 顶部导航 */}
        <nav className="flex justify-between items-center mb-12">
          <a href="/" className="text-white text-xl font-bold flex items-center gap-2">
            <span>🎮</span>
            <span>AI Story Game</span>
          </a>
          <a
            href="/scripts"
            className="text-white/70 hover:text-white transition-colors"
          >
            剧本库
          </a>
        </nav>

        {/* 主要内容 */}
        <div className="max-w-2xl mx-auto">
          {/* 结局卡片 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white mb-8">
            {/* 剧本标题 */}
            <div className="text-sm text-white/60 mb-2">{data.genre || '互动剧情'}</div>
            <h1 className="text-3xl font-bold mb-4">{data.scriptTitle}</h1>

            {/* 分割线 */}
            <div className="h-px bg-white/20 my-6"></div>

            {/* 结局信息 */}
            <div className="text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-4">{data.endingTitle}</h2>
              <p className="text-white/80 leading-relaxed">{data.endingDescription}</p>
            </div>

            {/* 分割线 */}
            <div className="h-px bg-white/20 my-6"></div>

            {/* 统计数据 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{data.playTime}</div>
                <div className="text-white/60 text-sm">游戏时长（分钟）</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{data.choices}</div>
                <div className="text-white/60 text-sm">关键选择</div>
              </div>
            </div>

            {/* 成就 */}
            {data.achievements.length > 0 && (
              <>
                <div className="h-px bg-white/20 my-6"></div>
                <div className="text-center">
                  <div className="text-sm text-white/60 mb-3">获得成就</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {data.achievements.map((achievement, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-300 text-sm"
                      >
                        ⭐ {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 玩家名称 */}
            {data.playerName && (
              <div className="mt-6 text-center text-white/60 text-sm">
                玩家: {data.playerName}
              </div>
            )}
          </div>

          {/* 行动按钮 */}
          <div className="text-center space-y-4">
            {script ? (
              <a
                href={`/play/${script.id}`}
                className="block w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                开始游戏
              </a>
            ) : (
              <a
                href="/scripts"
                className="block w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                探索更多剧本
              </a>
            )}

            <p className="text-white/60 text-sm">
              体验这个精彩的互动剧情，探索不同的结局
            </p>
          </div>

          {/* 剧本推荐 */}
          {script && (
            <div className="mt-12 bg-white/5 backdrop-blur rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">关于这个剧本</h3>
              <div className="grid grid-cols-3 gap-4 text-center text-white/80">
                <div>
                  <div className="text-2xl font-bold text-white">{script.duration || 20}</div>
                  <div className="text-sm">预计时长（分钟）</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{script.difficulty || 2}</div>
                  <div className="text-sm">难度等级</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{script.genre}</div>
                  <div className="text-sm">类型</div>
                </div>
              </div>

              {script.description && (
                <p className="mt-4 text-white/60 text-sm">{script.description}</p>
              )}
            </div>
          )}

          {/* 更多剧本推荐 */}
          <div className="mt-8">
            <h3 className="text-white/60 text-sm mb-4 text-center">更多精彩剧本</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sampleScripts
                .filter((s) => s.id !== data.scriptId)
                .slice(0, 2)
                .map((s) => (
                  <a
                    key={s.id}
                    href={`/scripts/${s.id}`}
                    className="bg-white/5 backdrop-blur rounded-lg p-4 text-white hover:bg-white/10 transition-colors"
                  >
                    <div className="text-xs text-white/60 mb-1">{s.genre}</div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm text-white/60 mt-1">
                      {s.duration || 20} 分钟 · 难度 {s.difficulty || 2}
                    </div>
                  </a>
                ))}
            </div>
          </div>
        </div>

        {/* 底部 */}
        <footer className="mt-16 text-center text-white/40 text-sm">
          <p>AI Story Game - 创造你的故事</p>
        </footer>
      </div>
    </div>
  )
}

export default SharePage