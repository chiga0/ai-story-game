import { createOpenAI } from '@ai-sdk/openai'
import { generateText, streamText } from 'ai'

// 百炼平台 GLM-5 配置
const glm = createOpenAI({
  apiKey: process.env.BAILIAN_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.BAILIAN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
})

const model = glm('glm-5-plus')

export interface DialogueContext {
  scene: string
  speaker?: string
  playerHistory: string[]
  gameState: Record<string, any>
}

export interface GameContext {
  scriptId: string
  currentScene: string
  attributes: Record<string, number>
  relationships: Record<string, number>
}

export interface NPC {
  id: string
  name: string
  avatar?: string
  personality: string
}

export interface GameEvent {
  id: string
  type: 'random' | 'triggered'
  description: string
  effects?: Record<string, any>
}

// 动态对话生成
export async function generateDialogue(context: DialogueContext): Promise<string> {
  const { text } = await generateText({
    model,
    prompt: `你是一个互动游戏的角色扮演助手。
当前场景：${context.scene}
${context.speaker ? `说话角色：${context.speaker}` : ''}
玩家历史选择：${context.playerHistory.join(' -> ')}
游戏状态：${JSON.stringify(context.gameState)}

请生成一段自然的对话或旁白，推动剧情发展。保持简洁有趣，不超过100字。`,
  })

  return text
}

// NPC 个性化
export function personalizeNPC(npc: NPC, playerChoices: string[]): NPC {
  // 根据 playerChoices 调整 NPC 行为
  return {
    ...npc,
    personality: `${npc.personality}（根据玩家选择已调整）`,
  }
}

// 随机事件生成
export async function generateRandomEvent(context: GameContext): Promise<GameEvent> {
  const { text } = await generateText({
    model,
    prompt: `你是一个游戏事件生成器。
当前游戏状态：${JSON.stringify(context)}
请生成一个随机事件，格式为 JSON：{ "description": "事件描述", "effects": { "attribute": "value" } }
只返回 JSON，不要其他内容。`,
  })

  try {
    return JSON.parse(text)
  } catch {
    return {
      id: `event-${Date.now()}`,
      type: 'random',
      description: text,
    }
  }
}

// 流式对话
export async function streamDialogue(context: DialogueContext) {
  const result = streamText({
    model,
    prompt: `你是一个互动游戏的角色扮演助手。
当前场景：${context.scene}
${context.speaker ? `说话角色：${context.speaker}` : ''}
玩家历史选择：${context.playerHistory.join(' -> ')}
游戏状态：${JSON.stringify(context.gameState)}

请生成一段自然的对话或旁白，推动剧情发展。保持简洁有趣，不超过100字。`,
  })

  return result
}

export { model }