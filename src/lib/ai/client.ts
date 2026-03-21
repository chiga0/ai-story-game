import type { DialogueContext, GameContext, NPC, GameEvent } from '../../types'
import {
  type PlayerStyle,
  type PlayerStyleAnalysis,
  type DynamicDialogueContext,
  type DynamicDialogueResult,
  type HiddenClue,
  type ClueGenerationContext,
  type PlayerChoicePattern,
  SYSTEM_PROMPTS,
  DIALOGUE_TEMPLATES,
  analyzeChoiceHistory,
  inferPlayerStyle,
  getStyleModifier,
} from './prompts'
import { loadAPIKeys, getActiveProvider, type AIProvider } from '../user/api-keys'
import {
  moderateText,
  type ModerationHook,
  createModerationHook,
} from '../content/content-moderator'
import { filterSensitiveWords } from '../content/sensitive-words'

// ============================================
// AI Provider 配置 - 通过独立 API Worker 调用
// ============================================

// API Worker 地址
const API_WORKER_URL = 'https://ai-story-api.arno-ga0.workers.dev'

// 重试配置
const DEFAULT_TIMEOUT = 90000 // 90 秒
const MAX_RETRIES = 2
const RETRY_DELAY = 3000 // 3 秒

/**
 * 通过 API Worker 调用 AI 文本生成
 */
async function callAIServer(prompt: string, maxTokens: number = 2000): Promise<string> {
  const response = await fetch(`${API_WORKER_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, maxTokens }),
  })

  if (!response.ok) {
    throw new Error(`AI 请求失败: ${response.status}`)
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'AI 调用失败')
  }
  
  return result.text || ''
}

// ============================================
// 重试工具函数
// ============================================

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    timeout?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const { maxRetries = MAX_RETRIES, timeout = DEFAULT_TIMEOUT, onRetry } = options

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 创建超时 Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('请求超时')), timeout)
      })

      // 执行请求
      const result = await Promise.race([fn(), timeoutPromise])
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // 检查是否为网络错误或超时
      const isNetworkError =
        lastError.message.includes('网络') ||
        lastError.message.includes('network') ||
        lastError.message.includes('fetch') ||
        lastError.message.includes('超时') ||
        lastError.message.includes('timeout')

      // 如果是最后一次尝试或非网络错误，直接抛出
      if (attempt === maxRetries || !isNetworkError) {
        throw lastError
      }

      // 调用重试回调
      onRetry?.(attempt, lastError)

      // 等待后重试
      await sleep(RETRY_DELAY * attempt)
    }
  }

  throw lastError || new Error('未知错误')
}

// ============================================
// AI 调用函数 - 全部通过后端代理
// ============================================

// 重新导出类型，保持向后兼容
export type { DialogueContext, GameContext, NPC, GameEvent }
export type { PlayerStyle, PlayerStyleAnalysis, DynamicDialogueContext, DynamicDialogueResult, HiddenClue, ClueGenerationContext, PlayerChoicePattern }

// 动态对话生成（带重试）- 通过后端代理
export async function generateDialogue(context: DialogueContext): Promise<string> {
  return withRetry(
    async () => {
      const prompt = `你是一个互动游戏的角色扮演助手。

【重要】上下文一致性规则：
1. 保持地点、人物名称的一致性，不要随意更改
2. 如果场景名称在前面已确定（如"黑鸦古堡"），后续必须使用相同名称
3. 保持剧情逻辑连贯，不要出现前后矛盾

当前场景：${context.scene}
${context.speaker ? `说话角色：${context.speaker}` : ''}
玩家历史选择：${context.playerHistory.join(' -> ')}
游戏状态：${JSON.stringify(context.gameState)}

请生成一段自然的对话或旁白，推动剧情发展。保持简洁有趣，不超过100字。确保名称和地点与上下文一致。`
      
      const text = await callAIServer(prompt)
      
      // 过滤敏感词
      const filterResult = filterSensitiveWords(text)
      if (!filterResult.clean) {
        console.warn('对话内容包含敏感词，已过滤:', filterResult.detected)
      }
      
      return filterResult.filteredText
    },
    {
      onRetry: (attempt, error) => {
        console.warn(`AI 调用重试 (${attempt}/${MAX_RETRIES}):`, error.message)
      },
    }
  )
}

// NPC 个性化
export function personalizeNPC(npc: NPC, _playerChoices: string[]): NPC {
  return {
    ...npc,
    personality: `${npc.personality}（根据玩家选择已调整）`,
  }
}

// 随机事件生成（带重试）- 通过后端代理
export async function generateRandomEvent(context: GameContext): Promise<GameEvent> {
  return withRetry(
    async () => {
      const prompt = `你是一个游戏事件生成器。
当前游戏状态：${JSON.stringify(context)}
请生成一个随机事件，格式为 JSON：{ "description": "事件描述", "effects": { "attribute": "value" } }
只返回 JSON，不要其他内容。`
      
      const text = await callAIServer(prompt)

      try {
        return JSON.parse(text)
      } catch {
        return {
          id: `event-${Date.now()}`,
          type: 'random',
          description: text,
        }
      }
    },
    {
      onRetry: (attempt, error) => {
        console.warn(`事件生成重试 (${attempt}/${MAX_RETRIES}):`, error.message)
      },
    }
  )
}

// ============================================
// 玩家风格分析
// ============================================

/**
 * 分析玩家决策风格
 */
export async function analyzePlayerStyle(
  playerChoices: string[],
  choiceTimes?: number[]
): Promise<PlayerStyleAnalysis> {
  // 基于规则的快速分析
  const pattern = analyzeChoiceHistory(playerChoices)
  const basicStyle = inferPlayerStyle(pattern)

  // 如果选择数量太少，直接返回基础分析
  if (playerChoices.length < 5) {
    return {
      style: basicStyle,
      confidence: 50 + playerChoices.length * 10,
      traits: [`基于 ${playerChoices.length} 次选择的初步分析`],
    }
  }

  // 使用 AI 进行深度分析
  try {
    return await withRetry(
      async () => {
        const prompt = `${SYSTEM_PROMPTS.playerStyleAnalysis}

玩家选择历史：
${playerChoices.map((c, i) => `${i + 1}. ${c}`).join('\n')}

请分析这个玩家的决策风格，返回 JSON 格式结果。`

        const text = await callAIServer(prompt, 1000)

        try {
          const result = JSON.parse(text)
          return {
            style: result.style || basicStyle,
            confidence: Math.min(100, Math.max(0, result.confidence || 70)),
            traits: result.traits || [],
          }
        } catch {
          return {
            style: basicStyle,
            confidence: 70,
            traits: ['AI 分析解析失败，使用规则推断'],
          }
        }
      },
      {
        timeout: 15000,
        onRetry: (attempt, error) => {
          console.warn(`风格分析重试 (${attempt}/${MAX_RETRIES}):`, error.message)
        },
      }
    )
  } catch (error) {
    return {
      style: basicStyle,
      confidence: 60,
      traits: [`降级使用规则分析: ${error instanceof Error ? error.message : '未知错误'}`],
    }
  }
}

// ============================================
// 动态对话生成
// ============================================

/**
 * 根据玩家风格生成个性化对话
 */
export async function generateDynamicDialogue(
  context: DynamicDialogueContext
): Promise<DynamicDialogueResult> {
  const { scene, speaker, speakerPersonality, playerHistory, playerStyle, gameState, storyGenre } = context

  // 获取风格修饰语
  const styleModifier = getStyleModifier(playerStyle.style)

  try {
    return await withRetry(
      async () => {
        const prompt = `${SYSTEM_PROMPTS.dynamicNPCDialogue}

【重要】上下文一致性规则：
1. 保持地点、人物名称的一致性，不要随意更改名称
2. 如果场景名称已确定（如"黑鸦古堡"），必须使用相同名称
3. 保持角色性格和剧情逻辑连贯

当前场景：${scene}
${speaker ? `说话角色：${speaker}` : '旁白'}
${speakerPersonality ? `角色性格：${speakerPersonality}` : ''}
玩家风格：${playerStyle.style}（置信度：${playerStyle.confidence}%）
玩家特质：${playerStyle.traits.join('、') || '未知'}
故事类型：${storyGenre}
玩家历史选择：${playerHistory.slice(-5).join(' → ')}
游戏状态：${JSON.stringify(gameState)}

风格提示：对${playerStyle.style === 'impulsive' ? '冲动型' : playerStyle.style === 'cautious' ? '谨慎型' : playerStyle.style === 'explorer' ? '探索型' : '平衡型'}玩家，使用${playerStyle.style === 'impulsive' ? '紧迫感强、强调行动' : playerStyle.style === 'cautious' ? '耐心详细、强调安全' : playerStyle.style === 'explorer' ? '神秘暗示、激发好奇' : '中性平衡'}的语气。

请生成一段对话或旁白（不超过100字），并返回 JSON 格式：
{
  "dialogue": "对话内容",
  "emotion": "neutral|happy|sad|angry|mysterious",
  "hints": ["可选的提示列表"]
}`

        const text = await callAIServer(prompt)

        try {
          const result = JSON.parse(text)
          
          // 过滤敏感词
          const filterResult = filterSensitiveWords(result.dialogue || text)
          if (!filterResult.clean) {
            console.warn('动态对话包含敏感词，已过滤:', filterResult.detected)
          }
          
          return {
            dialogue: filterResult.filteredText,
            emotion: result.emotion || 'neutral',
            hints: result.hints || [],
          }
        } catch {
          const filterResult = filterSensitiveWords(text)
          return {
            dialogue: filterResult.filteredText,
            emotion: 'neutral',
            hints: styleModifier ? [styleModifier] : [],
          }
        }
      },
      {
        timeout: 45000, // 45 秒
        onRetry: (attempt, error) => {
          console.warn(`动态对话生成重试 (${attempt}/${MAX_RETRIES}):`, error.message)
        },
      }
    )
  } catch (error) {
    // 降级处理：生成基础对话
    const fallbackDialogue = speaker
      ? `${speaker}：${scene.slice(0, 50)}...`
      : scene.slice(0, 100)

    const filterResult = filterSensitiveWords(fallbackDialogue)

    return {
      dialogue: filterResult.filteredText,
      emotion: 'neutral',
      hints: [],
    }
  }
}

// ============================================
// 隐藏线索生成
// ============================================

/**
 * 根据玩家进度生成动态线索
 */
export async function generateHiddenClue(context: ClueGenerationContext): Promise<HiddenClue | null> {
  const { scene, playerProgress, discoveredClues, storyGenre, playerStyle } = context

  if (playerProgress < 10) {
    return null
  }

  const clueComplexity = playerStyle === 'explorer' ? 'high' : playerStyle === 'impulsive' ? 'low' : 'medium'

  try {
    return await withRetry(
      async () => {
        const promptText = DIALOGUE_TEMPLATES.hiddenClueGeneration({
          scene: scene.slice(0, 200),
          playerProgress,
          discoveredClues,
          storyGenre,
        })

        const text = await callAIServer(`${promptText}

线索复杂度要求：${clueComplexity}（${playerStyle === 'explorer' ? '探索型玩家喜欢复杂线索' : playerStyle === 'impulsive' ? '冲动型玩家需要明显线索' : '中等复杂度'}）

只返回 JSON，不要其他内容。`, 1000)

        try {
          const result = JSON.parse(text)
          return {
            id: `clue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            clue: result.clue || '',
            hint: result.hint || '',
            importance: result.importance || 'medium',
          }
        } catch {
          return null
        }
      },
      {
        timeout: 15000,
        onRetry: (attempt, error) => {
          console.warn(`线索生成重试 (${attempt}/${MAX_RETRIES}):`, error.message)
        },
      }
    )
  } catch (error) {
    console.warn('线索生成失败:', error)
    return null
  }
}

// ============================================
// 智能对话建议
// ============================================

export interface DialogueSuggestion {
  text: string
  reason: string
  riskLevel: 'low' | 'medium' | 'high'
  expectedOutcome: string
}

/**
 * 根据玩家风格和当前情况生成智能对话建议
 */
export async function generateDialogueSuggestions(
  context: DialogueContext,
  playerStyle: PlayerStyleAnalysis
): Promise<DialogueSuggestion[]> {
  try {
    return await withRetry(
      async () => {
        const prompt = `你是一个游戏顾问，根据玩家风格提供对话建议。

当前场景：${context.scene}
玩家风格：${playerStyle.style}
玩家历史：${context.playerHistory.slice(-3).join(' → ')}
游戏状态：${JSON.stringify(context.gameState)}

请生成 2-3 个对话建议，每个建议返回 JSON 格式：
{
  "text": "建议的对话内容",
  "reason": "推荐理由",
  "riskLevel": "low|medium|high",
  "expectedOutcome": "预期结果"
}

返回 JSON 数组格式。`

        const text = await callAIServer(prompt, 1000)

        try {
          const result = JSON.parse(text)
          return Array.isArray(result) ? result : []
        } catch {
          return []
        }
      },
      {
        timeout: 15000,
        onRetry: (attempt, error) => {
          console.warn(`建议生成重试 (${attempt}/${MAX_RETRIES}):`, error.message)
        },
      }
    )
  } catch (error) {
    console.warn('建议生成失败:', error)
    return []
  }
}

// ============================================
// 导出配置
// ============================================

export { DEFAULT_TIMEOUT, MAX_RETRIES }

// ============================================
// NPC 记忆对话生成
// ============================================

import {
  type NPCDialogueContext,
  type NPCDialogueResult,
  buildNPCMemoryPrompt,
  getDialogueStyleFromMemory,
  generateGreetingByRelationship,
} from './prompts'
import type { MemoryContext, RelationshipTier } from '../game/npc-memory'

/**
 * 根据玩家风格和 NPC 记忆生成对话
 */
export async function generateNPCDialogueWithContext(
  context: NPCDialogueContext
): Promise<NPCDialogueResult> {
  const { scene, npcName, npcPersonality, memoryContext, playerStyle, storyGenre } = context

  if (!memoryContext) {
    const basicContext: DialogueContext = {
      scene,
      speaker: npcName,
      playerHistory: [],
      gameState: {},
    }
    
    const dialogue = await generateDialogue(basicContext)
    
    return {
      dialogue,
      emotion: 'neutral',
      hints: [],
    }
  }

  const dialogueStyle = getDialogueStyleFromMemory(memoryContext)

  try {
    return await withRetry(
      async () => {
        const prompt = buildNPCMemoryPrompt(context)
        const text = await callAIServer(prompt)

        try {
          const result = JSON.parse(text)
          return {
            dialogue: result.dialogue || text,
            emotion: result.emotion || memoryContext.currentMood,
            hints: result.hints || [],
            relationshipHint: result.relationshipHint,
          }
        } catch {
          return {
            dialogue: text,
            emotion: memoryContext.currentMood,
            hints: [dialogueStyle],
          }
        }
      },
      {
        timeout: 20000,
        onRetry: (attempt, error) => {
          console.warn(`NPC 记忆对话生成重试 (${attempt}/${MAX_RETRIES}):`, error.message)
        },
      }
    )
  } catch (error) {
    const greeting = generateGreetingByRelationship(
      npcName,
      memoryContext.relationshipTier,
      memoryContext.currentMood
    )

    return {
      dialogue: greeting,
      emotion: memoryContext.currentMood,
      hints: [],
      relationshipHint: '无法生成详细对话，使用基础问候',
    }
  }
}

/**
 * 生成 NPC 情感反应
 */
export async function generateNPCEmotionalResponse(
  playerChoice: string,
  memoryContext: MemoryContext,
  npcPersonality: string
): Promise<{
  emotion: string
  reaction: string
  dialogueModifier: string
}> {
  try {
    return await withRetry(
      async () => {
        const prompt = `你是一个情感反应分析器。

玩家选择："${playerChoice}"
NPC 性格：${npcPersonality}
当前关系：${memoryContext.relationshipTier}（${memoryContext.relationshipLevel}）
当前情绪：${memoryContext.currentMood}
信任度：${memoryContext.trustLevel}%

分析这个选择对 NPC 的情感影响，返回 JSON 格式：
{
  "emotion": "happy|neutral|sad|angry|suspicious",
  "reaction": "NPC 的内心反应描述",
  "dialogueModifier": "对话风格调整建议"
}`

        const text = await callAIServer(prompt, 500)

        try {
          return JSON.parse(text)
        } catch {
          return {
            emotion: memoryContext.currentMood,
            reaction: 'NPC 保持沉默。',
            dialogueModifier: '',
          }
        }
      },
      {
        timeout: 10000,
        onRetry: (attempt, error) => {
          console.warn(`情感反应生成重试 (${attempt}/${MAX_RETRIES}):`, error.message)
        },
      }
    )
  } catch (error) {
    return {
      emotion: memoryContext.currentMood,
      reaction: 'NPC 保持沉默。',
      dialogueModifier: '',
    }
  }
}

/**
 * 根据记忆调整对话选项
 */
export function adjustChoicesBasedOnMemory(
  choices: Array<{ id: string; text: string; condition?: any }>,
  memoryContext: MemoryContext
): Array<{ id: string; text: string; condition?: any; available: boolean; reason?: string }> {
  return choices.map((choice) => {
    if (memoryContext.relationshipTier === 'hostile') {
      const friendlyKeywords = ['友善', '帮助', '关心', '信任']
      if (friendlyKeywords.some((k) => choice.text.includes(k))) {
        return {
          ...choice,
          available: false,
          reason: '关系太差，NPC 不会接受',
        }
      }
    }

    if (memoryContext.trustLevel < 30) {
      const trustKeywords = ['秘密', '真相', '信任', '坦诚']
      if (trustKeywords.some((k) => choice.text.includes(k))) {
        return {
          ...choice,
          available: false,
          reason: 'NPC 不够信任你',
        }
      }
    }

    if (memoryContext.currentMood === 'angry') {
      const calmKeywords = ['平静', '冷静', '慢慢', '等一下']
      if (calmKeywords.some((k) => choice.text.includes(k))) {
        return {
          ...choice,
          available: true,
          reason: 'NPC 正在气头上，效果可能不好',
        }
      }
    }

    return {
      ...choice,
      available: true,
    }
  })
}

// 导出新的类型
export type { NPCDialogueContext, NPCDialogueResult }
export type { MemoryContext, RelationshipTier } from '../game/npc-memory'

// ============================================
// 内容审核钩子导出
// ============================================

export { createModerationHook }
export type { ModerationHook } from '../content/content-moderator'