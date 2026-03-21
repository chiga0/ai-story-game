// AI Prompt 模板

export const SYSTEM_PROMPTS = {
  // 游戏主持
  gameMaster: `你是一个互动小说的游戏主持，负责：
1. 生动地描述场景和氛围
2. 控制NPC的对话和行为
3. 根据玩家选择推动剧情
4. 在关键时刻制造悬念和转折
请保持语言简洁有力，富有感染力。`,

  // NPC 角色
  npc: (name: string, personality: string) => `你是游戏中的角色"${name}"。
性格特点：${personality}
请以这个角色的身份与玩家互动，保持角色一致性。`,

  // 剧情增强
  enhanceStory: `你是一个剧情增强助手。
根据玩家当前的游戏状态和历史选择，生成额外的细节描写和氛围营造。
保持神秘感和紧张感，适当埋下伏笔。`,

  // 玩家风格分析
  playerStyleAnalysis: `你是一个玩家行为分析专家。
根据玩家的选择历史，分析其决策风格。
返回格式要求：JSON 对象 { "style": "冲动|谨慎|探索|平衡", "confidence": 0-100, "traits": ["特质1", "特质2"] }`,

  // 动态 NPC 对话
  dynamicNPCDialogue: `你是一个动态对话生成器，根据玩家风格调整 NPC 的说话方式。
- 对冲动型玩家：使用紧迫感强的语言，强调行动和风险
- 对谨慎型玩家：提供更多细节和提示，强调安全和规划
- 对探索型玩家：提及隐藏内容和额外可能性，激发好奇心
- 对平衡型玩家：使用中性的、平衡的对话风格`,

  // NPC 记忆对话
  npcDialogueWithMemory: `你是一个有记忆的 NPC，会根据与玩家的历史互动调整对话风格。

【重要】上下文一致性规则：
1. 保持地点、人物名称的一致性，不要随意更改名称
2. 如果场景名称已确定（如"黑鸦古堡"），后续必须使用相同名称
3. 保持角色性格和剧情逻辑连贯，不要出现前后矛盾

你必须考虑以下因素：
1. 关系等级：敌对(冷淡警惕)、不友好(保持距离)、中立(礼貌)、友好(热情)、亲密(坦诚)
2. 当前情绪：愉快、平静、愤怒、悲伤、怀疑
3. 信任度：高信任(愿意分享秘密)、一般信任(正常交流)、低信任(有所保留)、不信任(拒绝深入交流)
4. 记住的关键选择：在对话中适时提及玩家之前的重要决定

对话风格指导：
- 敌对关系："..."、"你想要什么？"、"离我远点"
- 不友好关系："有事吗？"、"你又要干什么？"
- 中立关系："你好。"、"有什么我可以帮忙的吗？"
- 友好关系："啊，是你！"、"很高兴见到你！"
- 亲密关系："你来了！"、"我正想找你..."

请根据提供的记忆上下文生成自然的对话，保持角色一致性，确保名称和地点与上下文一致。`,

  // NPC 情感反应
  npcEmotionalResponse: `你是一个情感反应生成器，根据玩家的选择生成 NPC 的情感反应。
考虑因素：
1. 选择对 NPC 的影响（正面、负面、中性）
2. 当前关系等级
3. NPC 的性格特点
4. 之前的互动历史

返回格式：{ "emotion": "情绪类型", "reaction": "反应描述", "dialogueModifier": "对话风格调整" }`,
}

export const DIALOGUE_TEMPLATES = {
  // 场景描述
  sceneDescription: (scene: string, atmosphere: string) => `
【场景】${scene}
【氛围】${atmosphere}
请描述这个场景，让玩家身临其境。
`,

  // 选择生成
  choiceGeneration: (context: string, numChoices: number) => `
当前情况：${context}
请生成${numChoices}个合理的玩家选择，每个选择应该：
1. 明确可行
2. 有不同的后果导向
3. 保持游戏的趣味性
返回 JSON 数组格式。
`,

  // 结局判定
  endingCheck: (gameState: Record<string, any>) => `
游戏状态：${JSON.stringify(gameState)}
根据当前状态，判断玩家是否达成结局。
如果达成，返回结局信息；否则返回 null。
`,

  // 隐藏线索生成
  hiddenClueGeneration: (context: {
    scene: string
    playerProgress: number
    discoveredClues: string[]
    storyGenre: string
  }) => `
场景：${context.scene}
玩家进度：${context.playerProgress}%
已发现线索：${context.discoveredClues.join(', ') || '无'}
故事类型：${context.storyGenre}

请生成一个隐藏线索提示，要求：
1. 与当前场景相关
2. 不会过于明显
3. 能激发玩家的好奇心
4. 返回格式：{ "clue": "线索内容", "hint": "提示语", "importance": "low|medium|high" }
`,
}

// ============================================
// 玩家风格分析类型
// ============================================

export type PlayerStyle = 'impulsive' | 'cautious' | 'explorer' | 'balanced'

export interface PlayerStyleAnalysis {
  style: PlayerStyle
  confidence: number
  traits: string[]
}

export interface PlayerChoicePattern {
  totalChoices: number
  riskTaking: number // 0-100 风险偏好
  exploration: number // 0-100 探索倾向
  speed: number // 平均选择速度（毫秒）
  patterns: string[]
}

// ============================================
// 动态对话类型
// ============================================

export interface DynamicDialogueContext {
  scene: string
  speaker?: string
  speakerPersonality?: string
  playerHistory: string[]
  playerStyle: PlayerStyleAnalysis
  gameState: Record<string, unknown>
  storyGenre: string
}

export interface DynamicDialogueResult {
  dialogue: string
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'mysterious'
  hints: string[]
}

// ============================================
// 隐藏线索类型
// ============================================

export interface HiddenClue {
  id: string
  clue: string
  hint: string
  importance: 'low' | 'medium' | 'high'
  discoveredAt?: number
}

export interface ClueGenerationContext {
  scene: string
  playerProgress: number
  discoveredClues: string[]
  storyGenre: string
  playerStyle: PlayerStyle
}

// ============================================
// 风格适配器
// ============================================

export const STYLE_ADAPTATIONS = {
  impulsive: {
    description: '冲动型玩家偏好快速决策，喜欢冒险和直接行动',
    npcTone: '紧迫、直接、强调行动',
    dialogueModifiers: ['机会稍纵即逝', '必须立即行动', '犹豫就会败北'],
  },
  cautious: {
    description: '谨慎型玩家喜欢收集信息，权衡利弊后再做决定',
    npcTone: '耐心、详细、强调安全',
    dialogueModifiers: ['仔细考虑一下', '安全第一', '谋定而后动'],
  },
  explorer: {
    description: '探索型玩家喜欢发现隐藏内容，追求完整体验',
    npcTone: '神秘、暗示、激发好奇',
    dialogueModifiers: ['或许还有别的路', '这里隐藏着什么', '值得深入探索'],
  },
  balanced: {
    description: '平衡型玩家综合各种策略，根据情况调整',
    npcTone: '中性、平衡、灵活',
    dialogueModifiers: ['取决于你的选择', '每种方式都有其价值'],
  },
}

// ============================================
// 工具函数
// ============================================

export function buildPrompt(template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return result
}

/**
 * 根据玩家风格获取对话修饰语
 */
export function getStyleModifier(style: PlayerStyle): string {
  const modifiers = STYLE_ADAPTATIONS[style]?.dialogueModifiers || []
  return modifiers.length > 0 ? modifiers[Math.floor(Math.random() * modifiers.length)] : ''
}

/**
 * 分析选择历史获取玩家风格倾向
 */
export function analyzeChoiceHistory(choices: string[]): Partial<PlayerChoicePattern> {
  const riskKeywords = ['冒险', '攻击', '冲', '直接', '立即']
  const cautionKeywords = ['等待', '观察', '思考', '小心', '谨慎']
  const exploreKeywords = ['探索', '检查', '搜索', '寻找', '发现']

  let riskCount = 0
  let cautionCount = 0
  let exploreCount = 0

  choices.forEach((choice) => {
    if (riskKeywords.some((k) => choice.includes(k))) riskCount++
    if (cautionKeywords.some((k) => choice.includes(k))) cautionCount++
    if (exploreKeywords.some((k) => choice.includes(k))) exploreCount++
  })

  const total = choices.length || 1

  return {
    totalChoices: choices.length,
    riskTaking: Math.round((riskCount / total) * 100),
    exploration: Math.round((exploreCount / total) * 100),
    patterns: [],
  }
}

/**
 * 推断玩家风格
 */
export function inferPlayerStyle(pattern: Partial<PlayerChoicePattern>): PlayerStyle {
  const risk = pattern.riskTaking || 0
  const exploration = pattern.exploration || 0

  if (risk > 50 && exploration < 30) return 'impulsive'
  if (exploration > 50 && risk < 30) return 'explorer'
  if (risk < 30 && exploration < 30) return 'cautious'
  return 'balanced'
}

// ============================================
// NPC 记忆相关类型和函数
// ============================================

import type { MemoryContext, Interaction, RelationshipTier } from '../game/npc-memory'

/**
 * NPC 对话上下文（带记忆）
 */
export interface NPCDialogueContext {
  /** 当前场景 */
  scene: string
  /** NPC 名称 */
  npcName: string
  /** NPC 性格 */
  npcPersonality: string
  /** NPC 记忆上下文 */
  memoryContext?: MemoryContext
  /** 玩家风格 */
  playerStyle?: PlayerStyleAnalysis
  /** 故事类型 */
  storyGenre: string
}

/**
 * NPC 对话结果（带情感）
 */
export interface NPCDialogueResult {
  /** 对话内容 */
  dialogue: string
  /** 情感类型 */
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'suspicious'
  /** 暗示/提示 */
  hints: string[]
  /** 关系变化提示 */
  relationshipHint?: string
}

/**
 * 根据 NPC 记忆上下文生成对话风格
 */
export function getDialogueStyleFromMemory(memoryContext: MemoryContext): string {
  const { relationshipTier, currentMood, trustLevel, dialogueStyleSuggestion } = memoryContext

  // 基础风格
  const tierStyles: Record<RelationshipTier, string> = {
    hostile: '冷淡、警惕、可能拒绝交流',
    unfriendly: '保持距离、回答简短',
    neutral: '礼貌但保持距离',
    friendly: '热情友好、愿意分享',
    close: '亲密无间、坦诚交流',
  }

  // 情绪修饰
  const moodStyles: Record<string, string> = {
    happy: '语气愉快轻松',
    neutral: '语气平静',
    angry: '语气强硬激动',
    sad: '语气伤感低落',
    suspicious: '语气试探怀疑',
  }

  // 信任度修饰
  const trustStyle = trustLevel >= 70
    ? '愿意分享更多信息'
    : trustLevel >= 30
    ? '信息分享有所保留'
    : '不愿分享深度信息'

  return `${tierStyles[relationshipTier]}。${moodStyles[currentMood] || ''}。${trustStyle}。${dialogueStyleSuggestion}`
}

/**
 * 构建 NPC 记忆对话 Prompt
 */
export function buildNPCMemoryPrompt(context: NPCDialogueContext): string {
  const { scene, npcName, npcPersonality, memoryContext, playerStyle, storyGenre } = context

  let prompt = SYSTEM_PROMPTS.npcDialogueWithMemory + '\n\n'

  prompt += `=== NPC 基本信息 ===\n`
  prompt += `名称：${npcName}\n`
  prompt += `性格：${npcPersonality}\n`
  prompt += `故事类型：${storyGenre}\n\n`

  if (memoryContext) {
    prompt += `=== 记忆上下文 ===\n`
    prompt += `关系等级：${memoryContext.relationshipTier}（关系值：${memoryContext.relationshipLevel}）\n`
    prompt += `当前情绪：${memoryContext.currentMood}\n`
    prompt += `信任度：${memoryContext.trustLevel}%\n`
    prompt += `对话风格：${getDialogueStyleFromMemory(memoryContext)}\n\n`

    // 添加记住的关键选择
    if (memoryContext.rememberedChoices.length > 0) {
      prompt += `记住的关键选择：\n`
      memoryContext.rememberedChoices.slice(-3).forEach((choice, i) => {
        prompt += `${i + 1}. ${choice}\n`
      })
      prompt += '\n'
    }

    // 添加相关记忆
    if (memoryContext.relevantMemories.length > 0) {
      prompt += `最近的互动：\n`
      memoryContext.relevantMemories.slice(-3).forEach((memory, i) => {
        prompt += `${i + 1}. 玩家：${memory.playerChoice}\n`
        prompt += `   NPC：${memory.npcResponse}\n`
        prompt += `   情感：${memory.sentiment}\n`
      })
      prompt += '\n'
    }
  }

  // 添加玩家风格
  if (playerStyle) {
    prompt += `=== 玩家风格 ===\n`
    prompt += `风格：${playerStyle.style}\n`
    prompt += `置信度：${playerStyle.confidence}%\n`
    if (playerStyle.traits.length > 0) {
      prompt += `特质：${playerStyle.traits.join('、')}\n`
    }
    prompt += '\n'
  }

  prompt += `=== 当前场景 ===\n`
  prompt += `${scene}\n\n`

  prompt += `请生成 ${npcName} 的对话，保持角色一致性，体现关系和情感变化。\n`
  prompt += `返回格式：{ "dialogue": "对话内容", "emotion": "情绪类型", "hints": ["提示"], "relationshipHint": "关系变化提示" }`

  return prompt
}

/**
 * 根据 NPC 关系等级生成问候语
 */
export function generateGreetingByRelationship(
  npcName: string,
  relationshipTier: RelationshipTier,
  currentMood: string
): string {
  const greetings: Record<RelationshipTier, string[]> = {
    hostile: [
      '...你来了。',
      '有什么事？快点说。',
      '你怎么又出现了？',
    ],
    unfriendly: [
      '哦，是你。',
      '有什么要说的？',
      '你好。',
    ],
    neutral: [
      '你好。',
      '欢迎。',
      '有什么我可以帮你的吗？',
    ],
    friendly: [
      `啊，${npcName}很高兴见到你！`,
      '你来了！最近怎么样？',
      '欢迎回来！',
    ],
    close: [
      `${npcName}一直在等你！`,
      '你终于来了！我正想找你。',
      '老朋友，你来了！',
    ],
  }

  const options = greetings[relationshipTier]
  let greeting = options[Math.floor(Math.random() * options.length)]

  // 根据情绪调整
  if (currentMood === 'angry') {
    greeting = '...' + greeting.replace(/[！？]/g, '。')
  } else if (currentMood === 'happy' && relationshipTier !== 'hostile') {
    greeting = greeting.replace('。', '！')
  } else if (currentMood === 'suspicious') {
    greeting = '(上下打量)' + greeting
  }

  return greeting
}

/**
 * 生成 NPC 情感反应 Prompt
 */
export function buildEmotionalResponsePrompt(
  playerChoice: string,
  memoryContext: MemoryContext,
  npcPersonality: string
): string {
  return `${SYSTEM_PROMPTS.npcEmotionalResponse}

玩家选择：${playerChoice}
NPC 性格：${npcPersonality}
当前关系：${memoryContext.relationshipTier}（${memoryContext.relationshipLevel}）
当前情绪：${memoryContext.currentMood}
信任度：${memoryContext.trustLevel}%

请生成 NPC 的情感反应。`
}