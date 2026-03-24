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
import type { ShareCardData, KeyChoice } from '#/lib/sharing/share-card'
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

  // 场景切换状态
  const [sceneTransition, setSceneTransition] = useState(false)

  // 新手引导
  const [showGuide, setShowGuide] = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem('ai-story-game-guide-seen')
  })

  const dismissGuide = () => {
    setShowGuide(false)
    localStorage.setItem('ai-story-game-guide-seen', 'true')
  }

  // 游玩时长实时更新
  const [playTimeMinutes, setPlayTimeMinutes] = useState(0)
  
  // 获取当前标签页的唯一 ID（用于多标签页状态隔离）
  const tabId = useMemo(() => {
    if (typeof window === 'undefined') return ''
    let id = sessionStorage.getItem('ai-story-game-tab-id')
    if (!id) {
      id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      sessionStorage.setItem('ai-story-game-tab-id', id)
    }
    return id
  }, [])

  // 持久化的开始时间 key（包含标签页 ID 以隔离多标签页状态）
  const startTimeKey = `ai-story-game-start-time-${scriptId}-${tabId}`

  // 音频控制
  const { playSfx, playMusic, stopMusic, isReady: audioReady } = useAudio()

  // NPC 记忆管理器（单例）
  const npcMemoryManager = useMemo(() => getNPCMemoryManager(), [])

  // 游玩时长实时更新计时器（使用 localStorage 持久化）
  useEffect(() => {
    if (!gameState) return

    // 获取或初始化开始时间
    const getStartTime = (): number => {
      // 1. 优先使用 localStorage 中持久化的开始时间
      const storedStartTime = localStorage.getItem(startTimeKey)
      if (storedStartTime) {
        const time = parseInt(storedStartTime, 10)
        // 验证时间有效性：必须是合理的数字，且不能是未来时间
        const now = Date.now()
        const oneDayMs = 24 * 60 * 60 * 1000 // 24小时
        if (!isNaN(time) && time > 0 && time <= now && (now - time) < oneDayMs) {
          return time
        }
        // 如果时间无效，清除旧数据
        localStorage.removeItem(startTimeKey)
      }
      
      // 2. 使用 gameState 中的开始时间（同样验证有效性）
      if (gameState.startTime) {
        const now = Date.now()
        const oneDayMs = 24 * 60 * 60 * 1000
        if (gameState.startTime > 0 && gameState.startTime <= now && (now - gameState.startTime) < oneDayMs) {
          // 持久化到 localStorage
          localStorage.setItem(startTimeKey, gameState.startTime.toString())
          return gameState.startTime
        }
      }
      
      // 3. 如果都没有或数据无效，使用当前时间
      const now = Date.now()
      localStorage.setItem(startTimeKey, now.toString())
      return now
    }

    const startTime = getStartTime()

    // 初始化游玩时长
    const updatePlayTime = () => {
      const minutes = Math.floor((Date.now() - startTime) / 60000)
      setPlayTimeMinutes(minutes)
    }

    // 立即更新一次
    updatePlayTime()

    // 每分钟更新一次
    const interval = setInterval(updatePlayTime, 60000)

    return () => clearInterval(interval)
  }, [gameState, startTimeKey])

  // 获取当前剧本的场景数据
  const currentScript = useMemo(() => {
    // 先从 sampleScripts 查找
    const sampleScript = sampleScripts.find((s) => s.id === scriptId)
    if (sampleScript) return sampleScript

    // 再从 localStorage 的自定义剧本中查找
    if (typeof window !== 'undefined') {
      try {
        const customScripts = JSON.parse(localStorage.getItem('custom-scripts') || '[]')
        return customScripts.find((s: any) => s.id === scriptId)
      } catch {
        return undefined
      }
    }
    return undefined
  }, [scriptId])

  // 初始化游戏
  useEffect(() => {
    const initGame = async () => {
      try {
        setLoading(true)
        setError(null)

        // 查找剧本：先从 sampleScripts，再从 localStorage
        let script = sampleScripts.find((s) => s.id === scriptId)

        // 如果 sampleScripts 中没有，尝试从 localStorage 加载自定义剧本
        if (!script) {
          try {
            const customScripts = JSON.parse(localStorage.getItem('custom-scripts') || '[]')
            script = customScripts.find((s: any) => s.id === scriptId)
          } catch (e) {
            console.error('Failed to load custom scripts:', e)
          }
        }

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
              characters: script.characters,
              initialState: script.initialState,
            } as any)
            state = save.state
          } else {
            state = await gameEngine.init({
              id: script.id,
              title: script.title,
              scenes: script.scenes,
              endings: script.endings,
              characters: script.characters,
              initialState: script.initialState,
            } as any)
          }
        } else {
          state = await gameEngine.init({
            id: script.id,
            title: script.title,
            scenes: script.scenes,
            endings: script.endings,
            characters: script.characters,
            initialState: script.initialState,
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
      setSceneTransition(true)
      // 短暂的过渡动画后重置
      setTimeout(() => setSceneTransition(false), 500)
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

    // 安全超时保护：确保 isTyping 在 10 秒后被重置，避免用户卡死
    const safetyTimeout = setTimeout(() => {
      console.warn('handleChoice safety timeout triggered, resetting isTyping')
      setIsTyping(false)
    }, 10000)

    try {
      const result = await engine.processChoice(choiceId)
      if (!result) {
        // 修复：如果 processChoice 返回 null，重置 isTyping 以避免卡死
        console.error('processChoice returned null for choiceId:', choiceId)
        setIsTyping(false)
        clearTimeout(safetyTimeout)
        return
      }

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
        
        // 清除持久化的开始时间
        localStorage.removeItem(startTimeKey)
      } else {
        setCurrentScene(result.scene || null)
        setChoices(engine.getChoices())
        
        // 如果有选择结果效果，播放对应音效
        if (result.effects && result.effects.length > 0) {
          playSfx(SoundEffect.ITEM_GAIN)
        }
      }

      setGameState(engine.getState())
      
      // 清除安全超时
      clearTimeout(safetyTimeout)
    } catch (error) {
      console.error('handleChoice error:', error)
      setIsTyping(false)
      clearTimeout(safetyTimeout)
    }
  }, [engine, gameState, scriptId, playSfx, playMusic, startTimeKey, choices, currentScene, npcMemoryManager])

  // 处理分支树节点点击（回溯功能）
  const handleBranchNodeClick = useCallback((sceneId: string) => {
    if (!engine || !gameState) return
    
    // 调用引擎的回溯方法
    const success = engine.backtrackToScene(sceneId)
    
    if (success) {
      // 更新游戏状态
      setGameState(engine.getState())
      setCurrentScene(engine.getCurrentScene())
      setChoices(engine.getChoices())
      setEnhancedText(null)
      
      // 播放场景切换音效
      playSfx(SoundEffect.SCENE_TRANSITION)
      
      console.log(`成功回溯到场景: ${sceneId}`)
    } else {
      console.warn(`无法回溯到场景: ${sceneId}`)
    }
  }, [engine, gameState, playSfx])

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

  // 提取关键选择路径（用于分享卡片）
  const getKeyChoices = useCallback((): KeyChoice[] => {
    if (!gameState?.history) return []
    
    return gameState.history
      .filter(h => h.choice) // 只保留有选择的记录
      .slice(-5) // 取最近5个选择
      .map(h => ({
        text: h.choice || '',
        impact: undefined // 可以根据效果添加影响描述
      }))
      .filter(c => c.text.length > 0)
  }, [gameState?.history])

  // 判断结局类型标签
  const getEndingTag = useCallback((endingId: string | null): string | undefined => {
    if (!endingId) return undefined
    
    const lowerId = endingId.toLowerCase()
    if (lowerId.includes('good') || lowerId.includes('happy') || lowerId.includes('best')) {
      return '✨ 完美结局'
    }
    if (lowerId.includes('bad') || lowerId.includes('tragic') || lowerId.includes('worst')) {
      return '💔 悲剧结局'
    }
    if (lowerId.includes('secret') || lowerId.includes('hidden')) {
      return '🔮 隐藏结局'
    }
    if (lowerId.includes('neutral') || lowerId.includes('normal')) {
      return '🌙 普通结局'
    }
    return '🎭 特殊结局'
  }, [])

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
            onNodeClick={handleBranchNodeClick}
            enableBacktrack={true}
            endings={currentScript.endings}
            currentAttributes={gameState?.attributes}
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
            characterNames={currentScript?.characters ? 
              Object.fromEntries(
                Object.entries(currentScript.characters).map(([id, char]) => [id, char.name])
              ) : undefined
            }
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
                    onNodeClick={handleBranchNodeClick}
                    enableBacktrack={true}
                    endings={currentScript.endings}
                    currentAttributes={gameState?.attributes}
                  />
                )}
              </div>
            </details>
          </div>
        )}

        {/* 游戏主区域 */}
        <div className="flex-1 flex flex-col justify-end p-4 max-w-4xl mx-auto w-full">
          {/* 新手引导 */}
          {showGuide && (
            <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">🎮 游戏指南</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 点击选项推进剧情发展</li>
                    <li>• 左侧分支树显示你的探索进度</li>
                    <li>• 收集线索解锁不同结局</li>
                    <li>• 随时可以保存游戏进度</li>
                  </ul>
                </div>
                <button
                  onClick={dismissGuide}
                  className="text-gray-400 hover:text-gray-600 ml-4"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          {/* 当前场景提示 */}
          {gameState && (
            <div className="mb-4 flex justify-between items-center">
              <span className="text-sm text-[var(--sea-ink-soft)]">
                游玩时长: {playTimeMinutes} 分钟
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
              background={currentScene.background}
              onTypingComplete={() => setIsTyping(false)}
              sceneTransition={sceneTransition}
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
                      playTime: playTimeMinutes,
                      choices: gameState.history.length,
                      achievements: pendingAchievements.map((a) => a.title),
                      genre: currentScript?.genre,
                      scriptId: scriptId,
                      keyChoices: getKeyChoices(),
                      endingTag: getEndingTag(currentEndingId),
                      relationshipSummary: gameState.relationships && Object.keys(gameState.relationships).length > 0
                        ? `与 ${Object.keys(gameState.relationships).length} 位角色建立了关系`
                        : undefined,
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