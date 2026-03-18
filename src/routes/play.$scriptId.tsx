import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { DialogueBox } from '#/components/game/DialogueBox'
import { ChoicePanel } from '#/components/game/ChoicePanel'
import { StatusBar } from '#/components/game/StatusBar'
import { SaveButton } from '#/components/game/SaveButton'
import { BranchTree } from '#/components/game/BranchTree'
import { MuteButton } from '#/components/game/AudioController'
import { ShareButton } from '#/components/game/ShareCard'
import { NPCRelationshipPanel } from '#/components/game/NPCRelationshipPanel'
import {
  checkAchievements,
  updateGameStats,
  getAchievementData,
  type Achievement,
} from '#/lib/game/achievements'
import { AchievementNotificationManager } from '#/components/game/AchievementNotification'
import {
  createGameEngine,
  type GameEngine,
  type GameState,
  type Scene,
  type Choice,
} from '#/lib/game/engine'
import { getSave } from '#/lib/game/save-manager'
import { sampleScripts } from '#/data/scripts'
import { useAudio } from '#/hooks/useAudio'
import { SoundEffect, BackgroundMusic, getRecommendedMusic } from '#/lib/audio/sounds'
import type { ShareCardData } from '#/lib/sharing/share-card'
import {
  generateDynamicDialogue,
  analyzePlayerStyle,
  type PlayerStyleAnalysis,
} from '#/lib/ai/client'
import { getNPCMemoryManager, type NPCMemoryManager } from '#/lib/game/npc-memory'

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
  const [scriptTitle, setScriptTitle] = useState('')
  const [currentEndingId, setCurrentEndingId] = useState<string | null>(null)
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([])
  const [showBranchTree, setShowBranchTree] = useState(true)
  const [prevSceneId, setPrevSceneId] = useState<string | null>(null)
  
  // AI 增强状态
  const [enhancedText, setEnhancedText] = useState<string | null>(null)
  const [playerStyle, setPlayerStyle] = useState<PlayerStyleAnalysis>({
    style: 'balanced',
    confidence: 50,
    traits: [],
  })

  // 音频控制
  const { playSfx, playMusic, stopMusic, isReady: audioReady } = useAudio()

  // NPC 记忆管理器（单例）
  const npcMemoryManager = useMemo(() => getNPCMemoryManager(), [])

  // 获取当前剧本的场景数据
  const currentScript = sampleScripts.find((s) => s.id === scriptId)

  // 初始化游戏
  useEffect(() => {
    const initGame = async () => {
      try {
        setLoading(true)
        setError(null)

        // 查找剧本
        const script = sampleScripts.find((s) => s.id === scriptId)
        if (!script) {
          setError('剧本不存在')
          setLoading(false)
          return
        }

        setScriptTitle(script.title)

        // 创建游戏引擎
        const gameEngine = createGameEngine()
        
        // 检查是否有存档要加载
        const params = new URLSearchParams(window.location.search)
        const saveId = params.get('saveId')
        
        let state: GameState
        
        if (saveId) {
          // 加载存档
          const save = getSave(saveId)
          if (save) {
            await gameEngine.restore(save.state, {
              id: script.id,
              title: script.title,
              scenes: script.scenes,
              endings: script.endings,
            } as any)
            state = save.state
          } else {
            state = await gameEngine.init({
              id: script.id,
              title: script.title,
              scenes: script.scenes,
              endings: script.endings,
            } as any)
          }
        } else {
          state = await gameEngine.init({
            id: script.id,
            title: script.title,
            scenes: script.scenes,
            endings: script.endings,
          } as any)
        }

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

  // 根据剧本类型播放背景音乐
  useEffect(() => {
    if (!audioReady || !currentScript) return

    const genre = currentScript.genre
    const music = getRecommendedMusic(genre)
    playMusic(music)

    return () => {
      stopMusic()
    }
  }, [audioReady, currentScript, playMusic, stopMusic])

  // 场景切换时播放音效
  useEffect(() => {
    if (!currentScene || !audioReady) return

    // 如果是场景切换（不是初始化）
    if (prevSceneId && prevSceneId !== currentScene.id) {
      playSfx(SoundEffect.SCENE_TRANSITION)
    }

    // 新对话出现
    if (currentScene.id !== 'ending') {
      playSfx(SoundEffect.DIALOGUE_APPEAR)
    }

    setPrevSceneId(currentScene.id)
  }, [currentScene, audioReady, playSfx, prevSceneId])

  // AI 增强对话生成
  useEffect(() => {
    if (!currentScene || currentScene.id === 'ending' || !currentScript) {
      setEnhancedText(null)
      return
    }

    // 重置增强文本，开始新的生成
    setEnhancedText(null)

    const generateEnhancedDialogue = async () => {
      try {
        // 分析玩家风格
        const playerChoices = gameState?.history.map(h => h.choice).filter(Boolean) || []
        const style = await analyzePlayerStyle(playerChoices)
        setPlayerStyle(style)

        // 如果有说话者，生成增强对话
        if (currentScene.speaker && currentScene.text) {
          const speakerName = getSpeakerName(currentScene.speaker)
          const speakerPersonality = getSpeakerPersonality(currentScene.speaker)

          const result = await generateDynamicDialogue({
            scene: currentScene.text,
            speaker: speakerName,
            speakerPersonality,
            playerHistory: playerChoices,
            playerStyle: style,
            gameState: gameState?.attributes || {},
            storyGenre: currentScript.genre,
          })

          if (result.dialogue && result.dialogue !== currentScene.text) {
            setEnhancedText(result.dialogue)
          }
        }
      } catch (error) {
        // AI 生成失败，使用原始文本（静默失败）
        console.warn('AI dialogue enhancement failed:', error)
      }
    }

    generateEnhancedDialogue()
  }, [currentScene, currentScript, gameState])

  // 处理选择
  const handleChoice = useCallback(async (choiceId: string) => {
    if (!engine || !gameState) return

    // 播放选择音效
    playSfx(SoundEffect.SELECT)

    setIsTyping(true)

    const result = await engine.processChoice(choiceId)
    if (!result) return

    // 记录 NPC 互动（如果有说话者）
    if (currentScene?.speaker && result.type !== 'ending') {
      const choice = choices.find(c => c.id === choiceId)
      if (choice) {
        npcMemoryManager.addInteraction(currentScene.speaker, {
          sceneId: currentScene.id,
          timestamp: Date.now(),
          playerChoice: choice.text,
          npcResponse: currentScene.text,
          sentiment: 'neutral', // 可以通过情感分析确定
        })
      }
    }

    if (result.type === 'ending') {
      setCurrentScene({
        id: 'ending',
        text: `🏆 ${result.ending?.title}\n\n${result.ending?.description}`,
      })
      setChoices([])
      
      // 记录结局
      const endingId = result.ending?.id || 'unknown'
      setCurrentEndingId(endingId)
      
      // 播放结局音乐
      playMusic(BackgroundMusic.ENDING)
      
      // 更新统计并检查成就
      const currentState = engine.getState()
      updateGameStats(scriptId, currentState, endingId)
      
      // 检查成就
      const achievementData = getAchievementData()
      const newAchievements = checkAchievements(
        scriptId,
        currentState,
        endingId,
        achievementData
      )
      
      // 解锁成就
      for (const achievement of newAchievements) {
        // 导入 unlockAchievement 函数并调用
        const { unlockAchievement } = await import('#/lib/game/achievements')
        unlockAchievement(achievement.id)
      }
      
      // 显示成就通知
      if (newAchievements.length > 0) {
        // 播放成就音效
        playSfx(SoundEffect.ACHIEVEMENT)
        setPendingAchievements(newAchievements)
      }
    } else {
      setCurrentScene(result.scene || null)
      setChoices(engine.getChoices())
      
      // 如果有选择结果效果，播放对应音效
      if (result.effects && result.effects.length > 0) {
        playSfx(SoundEffect.ITEM_GAIN)
      }
    }

    setGameState(engine.getState())
  }, [engine, gameState, scriptId, playSfx, playMusic])

  // 获取角色头像
  const getAvatar = (speakerId?: string): string | undefined => {
    if (!speakerId) return undefined
    const script = sampleScripts.find((s) => s.id === scriptId)
    if (!script?.characters) return undefined
    const characters = script.characters as Record<string, { avatar?: string }>
    return characters[speakerId]?.avatar
  }

  // 获取角色名称
  const getSpeakerName = (speakerId?: string): string | undefined => {
    if (!speakerId) return undefined
    const script = sampleScripts.find((s) => s.id === scriptId)
    if (!script?.characters) return undefined
    const characters = script.characters as Record<string, { name?: string }>
    return characters[speakerId]?.name
  }

  // 获取角色性格
  const getSpeakerPersonality = (speakerId?: string): string | undefined => {
    if (!speakerId) return undefined
    const script = sampleScripts.find((s) => s.id === scriptId)
    if (!script?.characters) return undefined
    const characters = script.characters as Record<string, { personality?: string }>
    return characters[speakerId]?.personality
  }

  // 获取已访问的场景 ID 列表
  const visitedSceneIds = gameState?.history.map((h) => h.sceneId) || []

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
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-base)]">
      {/* 成就通知 */}
      {pendingAchievements.length > 0 && (
        <AchievementNotificationManager
          achievements={pendingAchievements}
          onComplete={() => setPendingAchievements([])}
        />
      )}

      {/* 左侧：分支树（桌面端显示） */}
      {showBranchTree && currentScript && currentScene && currentScene.id !== 'ending' && (
        <div className="hidden md:block w-72 lg:w-80 p-4 border-r border-[var(--sea-ink-light)] overflow-auto">
          <BranchTree
            scenes={currentScript.scenes}
            currentSceneId={gameState?.currentScene || 'start'}
            visitedSceneIds={visitedSceneIds}
            startSceneId="start"
            maxDepth={4}
            collapsible
          />
        </div>
      )}

      {/* 主游戏区域 */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* 顶部工具栏 */}
        <div className="p-4 border-b border-[var(--sea-ink-light)] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/scripts" className="text-[var(--sea-ink)] hover:underline">
              ← 返回
            </a>
            {/* 分支树切换按钮（桌面端） */}
            <button
              onClick={() => setShowBranchTree(!showBranchTree)}
              className="hidden md:flex items-center gap-1 text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
            >
              <span>🌳</span>
              <span>{showBranchTree ? '隐藏分支树' : '显示分支树'}</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            {/* 静音按钮 */}
            <MuteButton />
            <a href="/achievements" className="text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]">
              🏆 成就
            </a>
            <a href="/saves" className="text-[var(--sea-ink)] hover:underline">
              存档管理
            </a>
          </div>
        </div>

        {/* 状态栏 */}
        {gameState && (
          <StatusBar
            attributes={gameState.attributes}
            relationships={gameState.relationships}
          />
        )}

        {/* 移动端分支树按钮 */}
        {currentScene && currentScene.id !== 'ending' && (
          <div className="md:hidden p-2 border-b border-[var(--sea-ink-light)]">
            <details className="group">
              <summary className="cursor-pointer text-sm text-[var(--sea-ink)] flex items-center gap-2">
                <span>🌳</span>
                <span>查看分支树</span>
                <span className="text-xs text-gray-400">({visitedSceneIds.length} 已探索)</span>
              </summary>
              <div className="mt-2">
                {currentScript && (
                  <BranchTree
                    scenes={currentScript.scenes}
                    currentSceneId={gameState?.currentScene || 'start'}
                    visitedSceneIds={visitedSceneIds}
                    startSceneId="start"
                    maxDepth={3}
                    collapsible={false}
                  />
                )}
              </div>
            </details>
          </div>
        )}

        {/* 游戏主区域 */}
        <div className="flex-1 flex flex-col justify-end p-4 max-w-4xl mx-auto w-full">
          {/* 当前场景提示 */}
          {gameState && (
            <div className="mb-4 flex justify-between items-center">
              <span className="text-sm text-[var(--sea-ink-soft)]">
                游玩时长: {Math.floor((Date.now() - gameState.startTime) / 60000)} 分钟
              </span>
              {scriptTitle && gameState && (
                <SaveButton
                  scriptId={scriptId}
                  scriptTitle={scriptTitle}
                  state={gameState}
                />
              )}
            </div>
          )}

          {/* 对话框 */}
          {currentScene && (
            <DialogueBox
              speaker={getSpeakerName(currentScene.speaker)}
              text={enhancedText || currentScene.text}
              avatar={getAvatar(currentScene.speaker)}
              onTypingComplete={() => setIsTyping(false)}
            />
          )}

          {/* 选项面板 */}
          {choices.length > 0 && (
            <div className="mt-4">
              <ChoicePanel
                choices={choices.map((c) => ({ id: c.id, text: c.text }))}
                onChoose={handleChoice}
                disabled={isTyping}
              />
            </div>
          )}

          {/* 游戏结束 */}
          {choices.length === 0 && currentScene?.id === 'ending' && (
            <div className="mt-8 text-center space-y-4">
              {currentEndingId && (
                <div className="text-sm text-[var(--sea-ink-soft)] mb-4">
                  结局: {currentEndingId}
                </div>
              )}
              
              {/* 分享卡片按钮 */}
              {gameState && (
                <div className="mb-6">
                  <ShareButton
                    data={{
                      scriptTitle: scriptTitle,
                      endingTitle: currentEndingId || '未知结局',
                      endingDescription: currentScene?.text?.replace(/^🏆.*?\n\n/, '') || '',
                      playTime: Math.floor((Date.now() - gameState.startTime) / 60000),
                      choices: gameState.history.length,
                      achievements: pendingAchievements.map((a) => a.title),
                      genre: currentScript?.genre,
                      scriptId: scriptId,
                    }}
                  />
                </div>
              )}
              
              {/* NPC 关系面板 */}
              {gameState && currentScript?.characters && (
                <div className="mt-6 text-left">
                  <NPCRelationshipPanel
                    scriptId={scriptId}
                    characters={currentScript.characters as Record<string, { name: string; avatar?: string; personality?: string }>}
                    collapsible
                    defaultExpanded={false}
                  />
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/scripts"
                  className="inline-block px-6 py-3 bg-[var(--sea-ink)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  返回剧本列表
                </a>
                <a
                  href="/achievements"
                  className="inline-block px-6 py-3 border border-[var(--sea-ink)] text-[var(--sea-ink)] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  查看成就
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}