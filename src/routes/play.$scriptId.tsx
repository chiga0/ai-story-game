import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { DialogueBox } from '#/components/game/DialogueBox'
import { ChoicePanel } from '#/components/game/ChoicePanel'
import { StatusBar } from '#/components/game/StatusBar'
import { createGameEngine, type GameEngine, type GameState, type Scene, type Choice } from '#/lib/game/engine'
import { sampleScripts } from '#/data/scripts'

export const Route = createFileRoute('/play/$scriptId')({
  component: PlayPage,
})

function PlayPage() {
  const { scriptId } = Route.useParams()
  const [engine, setEngine] = useState<GameEngine | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [currentScene, setCurrentScene] = useState<Scene | null>(null)
  const [choices, setChoices] = useState<Choice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(true)

  // 初始化游戏
  useEffect(() => {
    const initGame = async () => {
      try {
        setLoading(true)
        setError(null)

        // 查找剧本
        const script = sampleScripts.find(s => s.id === scriptId)
        if (!script) {
          setError('剧本不存在')
          setLoading(false)
          return
        }

        // 创建游戏引擎
        const gameEngine = createGameEngine()
        const state = await gameEngine.init({
          id: script.id,
          title: script.title,
          scenes: script.scenes,
          endings: script.endings,
        } as any)

        setEngine(gameEngine)
        setGameState(state)
        setCurrentScene(gameEngine.getCurrentScene())
        setChoices(gameEngine.getChoices())
        setLoading(false)
      } catch (err) {
        console.error('Failed to init game:', err)
        setError('游戏初始化失败')
        setLoading(false)
      }
    }

    initGame()
  }, [scriptId])

  // 处理选择
  const handleChoice = useCallback(async (choiceId: string) => {
    if (!engine || !gameState) return

    setIsTyping(true)

    const result = await engine.processChoice(choiceId)
    if (!result) return

    if (result.type === 'ending') {
      // 游戏结束
      setCurrentScene({
        id: 'ending',
        text: `🏆 ${result.ending?.title}\n\n${result.ending?.description}`,
      })
      setChoices([])
    } else {
      // 继续游戏
      setCurrentScene(result.scene || null)
      setChoices(engine.getChoices())
    }

    setGameState(engine.getState())
  }, [engine, gameState])

  // 获取角色头像
  const getAvatar = (speakerId?: string) => {
    if (!speakerId) return undefined
    const script = sampleScripts.find(s => s.id === scriptId)
    const character = script?.characters?.[speakerId as keyof typeof script.characters]
    return character?.avatar
  }

  // 获取角色名称
  const getSpeakerName = (speakerId?: string) => {
    if (!speakerId) return undefined
    const script = sampleScripts.find(s => s.id === scriptId)
    const character = script?.characters?.[speakerId as keyof typeof script.characters]
    return character?.name
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--sea-ink)] mx-auto mb-4"></div>
          <p className="text-[var(--sea-ink-soft)]">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <a href="/scripts" className="text-[var(--sea-ink)] hover:underline">返回剧本列表</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)]">
      {/* 状态栏 */}
      {gameState && (
        <StatusBar
          attributes={gameState.attributes}
          relationships={gameState.relationships}
        />
      )}

      {/* 游戏主区域 */}
      <div className="flex-1 flex flex-col justify-end p-4 max-w-4xl mx-auto w-full">
        {/* 当前场景提示 */}
        {gameState && (
          <div className="mb-4">
            <span className="text-sm text-[var(--sea-ink-soft)]">
              游玩时长: {Math.floor((Date.now() - gameState.startTime) / 60000)} 分钟
            </span>
          </div>
        )}

        {/* 对话框 */}
        {currentScene && (
          <DialogueBox
            speaker={getSpeakerName(currentScene.speaker)}
            content={currentScene.text}
            avatar={getAvatar(currentScene.speaker)}
            onTypingComplete={() => setIsTyping(false)}
          />
        )}

        {/* 选项面板 */}
        {choices.length > 0 && (
          <div className="mt-4">
            <ChoicePanel
              choices={choices.map(c => ({ id: c.id, text: c.text }))}
              onChoose={handleChoice}
              disabled={isTyping}
            />
          </div>
        )}

        {/* 游戏结束 */}
        {choices.length === 0 && currentScene?.id === 'ending' && (
          <div className="mt-8 text-center">
            <a
              href="/scripts"
              className="inline-block px-6 py-3 bg-[var(--sea-ink)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              返回剧本列表
            </a>
          </div>
        )}
      </div>
    </div>
  )
}