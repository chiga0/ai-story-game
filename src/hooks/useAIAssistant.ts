/**
 * AI 辅助功能 Hook
 * 封装 AI 辅助功能，提供玩家风格分析和智能对话建议
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  analyzePlayerStyle,
  generateDynamicDialogue,
  generateHiddenClue,
  generateDialogueSuggestions,
  inferPlayerStyle,
  analyzeChoiceHistory,
} from '#/lib/ai/client'
import type {
  PlayerStyleAnalysis,
  DynamicDialogueContext,
  DynamicDialogueResult,
  HiddenClue,
  ClueGenerationContext,
  DialogueSuggestion,
  PlayerStyle,
} from '#/lib/ai/client'
import type { GameState } from '#/lib/game/engine'

// ============================================
// Types
// ============================================

export interface UseAIAssistantOptions {
  /** 是否启用 AI 辅助（默认 true） */
  enabled?: boolean
  /** 玩家风格分析的采样间隔（选择数量） */
  analysisInterval?: number
  /** 缓存过期时间（毫秒） */
  cacheExpiry?: number
}

export interface UseAIAssistantReturn {
  /** 当前玩家风格分析 */
  playerStyle: PlayerStyleAnalysis | null
  /** 是否正在分析 */
  isAnalyzing: boolean
  /** 分析玩家风格 */
  analyzeStyle: (choices: string[]) => Promise<void>
  /** 生成动态对话 */
  generateDialogue: (context: DynamicDialogueContext) => Promise<DynamicDialogueResult>
  /** 生成隐藏线索 */
  generateClue: (context: ClueGenerationContext) => Promise<HiddenClue | null>
  /** 获取对话建议 */
  getSuggestions: (context: DynamicDialogueContext) => Promise<DialogueSuggestion[]>
  /** 已发现的线索 */
  discoveredClues: HiddenClue[]
  /** 记录线索发现 */
  recordClueDiscovery: (clueId: string) => void
  /** 重置 AI 辅助状态 */
  reset: () => void
  /** 快速推断玩家风格（不调用 AI） */
  quickInferStyle: (choices: string[]) => PlayerStyle
}

// ============================================
// Cache Management
// ============================================

interface StyleCache {
  style: PlayerStyleAnalysis
  timestamp: number
  choiceCount: number
}

const STYLE_CACHE_KEY = 'ai-assistant-style-cache'

function loadCachedStyle(): StyleCache | null {
  try {
    const cached = localStorage.getItem(STYLE_CACHE_KEY)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch {
    // ignore
  }
  return null
}

function saveCachedStyle(cache: StyleCache): void {
  try {
    localStorage.setItem(STYLE_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // ignore
  }
}

// ============================================
// Hook Implementation
// ============================================

export function useAIAssistant(options: UseAIAssistantOptions = {}): UseAIAssistantReturn {
  const {
    enabled = true,
    analysisInterval = 5, // 每 5 次选择重新分析
    cacheExpiry = 30 * 60 * 1000, // 30 分钟
  } = options

  // State
  const [playerStyle, setPlayerStyle] = useState<PlayerStyleAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [discoveredClues, setDiscoveredClues] = useState<HiddenClue[]>([])

  // Refs
  const lastAnalysisCount = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load cached style on mount
  useEffect(() => {
    const cached = loadCachedStyle()
    if (cached && Date.now() - cached.timestamp < cacheExpiry) {
      setPlayerStyle(cached.style)
      lastAnalysisCount.current = cached.choiceCount
    }
  }, [cacheExpiry])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  // ============================================
  // Analyze Player Style
  // ============================================

  const analyzeStyle = useCallback(
    async (choices: string[]) => {
      if (!enabled || choices.length < 3) return

      // 检查是否需要重新分析
      if (choices.length - lastAnalysisCount.current < analysisInterval) {
        return
      }

      setIsAnalyzing(true)
      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()

      try {
        const result = await analyzePlayerStyle(choices)
        setPlayerStyle(result)
        lastAnalysisCount.current = choices.length

        // 缓存结果
        saveCachedStyle({
          style: result,
          timestamp: Date.now(),
          choiceCount: choices.length,
        })
      } catch (error) {
        console.error('Failed to analyze player style:', error)
        // 降级：使用基于规则的分析
        const pattern = analyzeChoiceHistory(choices)
        const basicStyle = inferPlayerStyle(pattern)
        setPlayerStyle({
          style: basicStyle,
          confidence: 60,
          traits: ['基于规则的快速推断'],
        })
      } finally {
        setIsAnalyzing(false)
      }
    },
    [enabled, analysisInterval]
  )

  // ============================================
  // Generate Dynamic Dialogue
  // ============================================

  const generateDialogue = useCallback(
    async (context: DynamicDialogueContext): Promise<DynamicDialogueResult> => {
      if (!enabled) {
        return {
          dialogue: context.scene,
          emotion: 'neutral',
          hints: [],
        }
      }

      try {
        return await generateDynamicDialogue(context)
      } catch (error) {
        console.error('Failed to generate dynamic dialogue:', error)
        return {
          dialogue: context.scene.slice(0, 100),
          emotion: 'neutral',
          hints: [],
        }
      }
    },
    [enabled]
  )

  // ============================================
  // Generate Hidden Clue
  // ============================================

  const generateClue = useCallback(
    async (context: ClueGenerationContext): Promise<HiddenClue | null> => {
      if (!enabled) return null

      // 检查是否已经生成过这个线索
      if (discoveredClues.some((c) => c.clue === context.scene.slice(0, 50))) {
        return null
      }

      try {
        const clue = await generateHiddenClue(context)
        return clue
      } catch (error) {
        console.error('Failed to generate clue:', error)
        return null
      }
    },
    [enabled, discoveredClues]
  )

  // ============================================
  // Get Dialogue Suggestions
  // ============================================

  const getSuggestions = useCallback(
    async (context: DynamicDialogueContext): Promise<DialogueSuggestion[]> => {
      if (!enabled || !playerStyle) return []

      try {
        return await generateDialogueSuggestions(context, playerStyle)
      } catch (error) {
        console.error('Failed to get suggestions:', error)
        return []
      }
    },
    [enabled, playerStyle]
  )

  // ============================================
  // Record Clue Discovery
  // ============================================

  const recordClueDiscovery = useCallback((clueId: string) => {
    setDiscoveredClues((prev) => {
      const clue = prev.find((c) => c.id === clueId)
      if (clue) {
        return prev.map((c) =>
          c.id === clueId ? { ...c, discoveredAt: Date.now() } : c
        )
      }
      return prev
    })
  }, [])

  // ============================================
  // Reset
  // ============================================

  const reset = useCallback(() => {
    setPlayerStyle(null)
    setDiscoveredClues([])
    lastAnalysisCount.current = 0
    localStorage.removeItem(STYLE_CACHE_KEY)
  }, [])

  // ============================================
  // Quick Infer Style
  // ============================================

  const quickInferStyle = useCallback((choices: string[]): PlayerStyle => {
    const pattern = analyzeChoiceHistory(choices)
    return inferPlayerStyle(pattern)
  }, [])

  return {
    playerStyle,
    isAnalyzing,
    analyzeStyle,
    generateDialogue,
    generateClue,
    getSuggestions,
    discoveredClues,
    recordClueDiscovery,
    reset,
    quickInferStyle,
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * 从游戏状态计算玩家进度百分比
 */
export function calculatePlayerProgress(
  gameState: GameState,
  totalScenes: number
): number {
  const visitedScenes = new Set(gameState.history.map((h) => h.sceneId))
  return Math.round((visitedScenes.size / totalScenes) * 100)
}

/**
 * 获取剧本类型
 */
export function getStoryGenre(scriptId: string): string {
  const genreMap: Record<string, string> = {
    'mystery-castle': '悬疑',
    'space-odyssey': '科幻',
    'dragon-valley': '奇幻',
  }
  return genreMap[scriptId] || '悬疑'
}

/**
 * 创建动态对话上下文
 */
export function createDialogueContext(
  scene: string,
  gameState: GameState,
  playerStyle: PlayerStyleAnalysis | null,
  options: {
    speaker?: string
    speakerPersonality?: string
    storyGenre?: string
  } = {}
): DynamicDialogueContext {
  return {
    scene,
    speaker: options.speaker,
    speakerPersonality: options.speakerPersonality,
    playerHistory: gameState.history.map((h) => h.choice).filter(Boolean) as string[],
    playerStyle: playerStyle || {
      style: 'balanced',
      confidence: 50,
      traits: [],
    },
    gameState: {
      currentScene: gameState.currentScene,
      attributes: gameState.attributes,
      relationships: gameState.relationships,
    },
    storyGenre: options.storyGenre || '悬疑',
  }
}

export default useAIAssistant