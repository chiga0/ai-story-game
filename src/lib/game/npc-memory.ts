/**
 * NPC 记忆系统
 * 管理玩家与 NPC 的互动历史，影响后续对话和剧情
 */

// ============================================
// 类型定义
// ============================================

/**
 * 互动记录
 */
export interface Interaction {
  /** 场景 ID */
  sceneId: string
  /** 时间戳 */
  timestamp: number
  /** 玩家选择 */
  playerChoice: string
  /** NPC 回应 */
  npcResponse: string
  /** 情感倾向 */
  sentiment: 'positive' | 'neutral' | 'negative'
  /** 选择类型（用于分析） */
  choiceType?: 'friendly' | 'hostile' | 'neutral' | 'helpful' | 'selfish'
}

/**
 * NPC 记忆
 */
export interface NPCMemory {
  /** NPC ID */
  npcId: string
  /** 玩家互动记录 */
  playerInteractions: Interaction[]
  /** 关系等级 (-100 到 100) */
  relationshipLevel: number
  /** 记住的关键选择 */
  rememberedChoices: string[]
  /** NPC 性格特征 */
  personalityTraits: string[]
  /** 当前情绪状态 */
  currentMood: 'happy' | 'neutral' | 'angry' | 'sad' | 'suspicious'
  /** 信任度 (0-100) */
  trustLevel: number
  /** 最后互动时间 */
  lastInteractionTime?: number
}

/**
 * 关系等级定义
 */
export type RelationshipTier = 
  | 'hostile'      // -100 to -60: 敌对
  | 'unfriendly'   // -59 to -20: 不友好
  | 'neutral'      // -19 to 20: 中立
  | 'friendly'     // 21 to 60: 友好
  | 'close'        // 61 to 100: 亲密

/**
 * 记忆上下文（用于 AI 生成对话）
 */
export interface MemoryContext {
  /** NPC ID */
  npcId: string
  /** NPC 名称 */
  npcName: string
  /** NPC 性格 */
  personality: string
  /** 关系等级 */
  relationshipTier: RelationshipTier
  /** 关系数值 */
  relationshipLevel: number
  /** 当前情绪 */
  currentMood: string
  /** 信任度 */
  trustLevel: number
  /** 相关记忆片段 */
  relevantMemories: Interaction[]
  /** 记住的关键选择 */
  rememberedChoices: string[]
  /** 对话风格建议 */
  dialogueStyleSuggestion: string
}

// ============================================
// 关系等级判断
// ============================================

/**
 * 根据关系值获取关系等级
 */
export function getRelationshipTier(level: number): RelationshipTier {
  if (level <= -60) return 'hostile'
  if (level <= -20) return 'unfriendly'
  if (level <= 20) return 'neutral'
  if (level <= 60) return 'friendly'
  return 'close'
}

/**
 * 获取关系等级的显示文本
 */
export function getRelationshipTierText(tier: RelationshipTier): string {
  const texts: Record<RelationshipTier, string> = {
    hostile: '敌对',
    unfriendly: '不友好',
    neutral: '中立',
    friendly: '友好',
    close: '亲密',
  }
  return texts[tier]
}

/**
 * 获取关系等级的颜色
 */
export function getRelationshipTierColor(tier: RelationshipTier): string {
  const colors: Record<RelationshipTier, string> = {
    hostile: '#ef4444',      // red-500
    unfriendly: '#f97316',   // orange-500
    neutral: '#6b7280',      // gray-500
    friendly: '#22c55e',     // green-500
    close: '#3b82f6',        // blue-500
  }
  return colors[tier]
}

// ============================================
// 情感分析
// ============================================

/**
 * 分析选择情感倾向
 */
export function analyzeSentiment(choice: string): Interaction['sentiment'] {
  const positiveKeywords = [
    '帮助', '感谢', '友善', '礼貌', '关心', '支持', '赞美', '信任',
    '好', '棒', '喜欢', '爱', '温暖', '温柔', '善良', '友好',
  ]
  const negativeKeywords = [
    '攻击', '威胁', '欺骗', '嘲讽', '冷漠', '拒绝', '怀疑', '敌意',
    '坏', '恨', '讨厌', '愤怒', '残忍', '恶意', '敌对', '攻击',
  ]

  const lowerChoice = choice.toLowerCase()
  
  let positiveCount = 0
  let negativeCount = 0

  positiveKeywords.forEach((keyword) => {
    if (lowerChoice.includes(keyword)) positiveCount++
  })

  negativeKeywords.forEach((keyword) => {
    if (lowerChoice.includes(keyword)) negativeCount++
  })

  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

/**
 * 分析选择类型
 */
export function analyzeChoiceType(choice: string): Interaction['choiceType'] {
  const typeKeywords: Record<NonNullable<Interaction['choiceType']>, string[]> = {
    friendly: ['友善', '帮助', '关心', '支持', '信任'],
    hostile: ['攻击', '威胁', '敌意', '嘲讽', '拒绝'],
    neutral: ['观察', '等待', '沉默', '中立', '无所谓'],
    helpful: ['帮忙', '协助', '贡献', '分享', '给予'],
    selfish: ['独占', '欺骗', '偷窃', '背叛', '利用'],
  }

  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some((keyword) => choice.includes(keyword))) {
      return type as Interaction['choiceType']
    }
  }

  return 'neutral'
}

// ============================================
// NPC 记忆管理器
// ============================================

/**
 * NPC 记忆管理类
 */
export class NPCMemoryManager {
  private memories: Map<string, NPCMemory> = new Map()
  private maxInteractionsPerNPC: number
  private maxRememberedChoices: number

  constructor(options: {
    maxInteractionsPerNPC?: number
    maxRememberedChoices?: number
  } = {}) {
    this.maxInteractionsPerNPC = options.maxInteractionsPerNPC || 50
    this.maxRememberedChoices = options.maxRememberedChoices || 10
  }

  /**
   * 初始化 NPC 记忆
   */
  initNPCMemory(npcId: string, personalityTraits: string[] = []): NPCMemory {
    if (this.memories.has(npcId)) {
      return this.memories.get(npcId)!
    }

    const memory: NPCMemory = {
      npcId,
      playerInteractions: [],
      relationshipLevel: 0,
      rememberedChoices: [],
      personalityTraits,
      currentMood: 'neutral',
      trustLevel: 50,
    }

    this.memories.set(npcId, memory)
    return memory
  }

  /**
   * 添加互动记录
   */
  addInteraction(npcId: string, interaction: Interaction): void {
    let memory = this.memories.get(npcId)
    
    if (!memory) {
      memory = this.initNPCMemory(npcId)
    }

    // 添加互动
    memory.playerInteractions.push(interaction)
    memory.lastInteractionTime = interaction.timestamp

    // 限制互动记录数量
    if (memory.playerInteractions.length > this.maxInteractionsPerNPC) {
      // 保留最近的互动，但保留重要选择
      const importantInteractions = memory.playerInteractions.filter(
        (i) => i.sentiment !== 'neutral'
      )
      const recentInteractions = memory.playerInteractions.slice(-this.maxInteractionsPerNPC + 10)
      
      memory.playerInteractions = [
        ...importantInteractions.slice(-20),
        ...recentInteractions.filter(
          (i) => !importantInteractions.includes(i)
        ),
      ].slice(-this.maxInteractionsPerNPC)
    }

    // 记住关键选择
    if (interaction.sentiment !== 'neutral') {
      if (!memory.rememberedChoices.includes(interaction.playerChoice)) {
        memory.rememberedChoices.push(interaction.playerChoice)
        
        // 限制记住的选择数量
        if (memory.rememberedChoices.length > this.maxRememberedChoices) {
          memory.rememberedChoices.shift()
        }
      }
    }

    // 更新关系等级
    this.updateRelationshipFromInteraction(npcId, interaction)

    // 更新情绪
    this.updateMoodFromInteraction(npcId, interaction)
  }

  /**
   * 根据互动更新关系
   */
  private updateRelationshipFromInteraction(npcId: string, interaction: Interaction): void {
    const memory = this.memories.get(npcId)
    if (!memory) return

    let change = 0

    // 根据情感倾向计算变化
    switch (interaction.sentiment) {
      case 'positive':
        change = 5 + Math.floor(Math.random() * 5) // 5-10
        break
      case 'negative':
        change = -5 - Math.floor(Math.random() * 5) // -5 to -10
        break
      case 'neutral':
        change = Math.floor(Math.random() * 3) - 1 // -1 to 1
        break
    }

    // 根据选择类型调整
    if (interaction.choiceType) {
      const typeModifiers: Record<NonNullable<Interaction['choiceType']>, number> = {
        friendly: 3,
        hostile: -5,
        neutral: 0,
        helpful: 5,
        selfish: -3,
      }
      change += typeModifiers[interaction.choiceType]
    }

    this.updateRelationship(npcId, change)
  }

  /**
   * 根据互动更新情绪
   */
  private updateMoodFromInteraction(npcId: string, interaction: Interaction): void {
    const memory = this.memories.get(npcId)
    if (!memory) return

    // 根据互动情感更新情绪
    if (interaction.sentiment === 'positive') {
      // 连续正面互动
      const recentPositive = memory.playerInteractions
        .slice(-5)
        .filter((i) => i.sentiment === 'positive').length

      if (recentPositive >= 3) {
        memory.currentMood = 'happy'
      } else {
        memory.currentMood = 'neutral'
      }
    } else if (interaction.sentiment === 'negative') {
      // 连续负面互动
      const recentNegative = memory.playerInteractions
        .slice(-5)
        .filter((i) => i.sentiment === 'negative').length

      if (recentNegative >= 3) {
        memory.currentMood = 'angry'
      } else if (recentNegative >= 2) {
        memory.currentMood = 'suspicious'
      } else {
        memory.currentMood = 'neutral'
      }
    }

    // 更新信任度
    if (interaction.sentiment === 'positive') {
      memory.trustLevel = Math.min(100, memory.trustLevel + 3)
    } else if (interaction.sentiment === 'negative') {
      memory.trustLevel = Math.max(0, memory.trustLevel - 5)
    }
  }

  /**
   * 更新关系等级
   */
  updateRelationship(npcId: string, change: number): void {
    const memory = this.memories.get(npcId)
    if (!memory) return

    memory.relationshipLevel = Math.max(-100, Math.min(100, memory.relationshipLevel + change))
  }

  /**
   * 获取 NPC 记忆
   */
  getMemory(npcId: string): NPCMemory | null {
    return this.memories.get(npcId) || null
  }

  /**
   * 获取所有 NPC 记忆
   */
  getAllMemories(): NPCMemory[] {
    return Array.from(this.memories.values())
  }

  /**
   * 获取相关记忆（用于上下文）
   */
  getRelevantMemories(npcId: string, currentContext: string, maxCount: number = 5): Interaction[] {
    const memory = this.memories.get(npcId)
    if (!memory || memory.playerInteractions.length === 0) return []

    // 简单的关键词匹配
    const contextKeywords = currentContext.split(/\s+/).filter((w) => w.length > 2)
    
    const relevantInteractions = memory.playerInteractions
      .map((interaction) => {
        let score = 0
        
        // 计算相关性分数
        contextKeywords.forEach((keyword) => {
          if (interaction.playerChoice.includes(keyword) || interaction.npcResponse.includes(keyword)) {
            score += 2
          }
        })

        // 最近的互动权重更高
        const age = Date.now() - interaction.timestamp
        const recencyScore = Math.max(0, 10 - Math.floor(age / (1000 * 60 * 60))) // 每小时减 1
        score += recencyScore

        // 重要互动权重更高
        if (interaction.sentiment !== 'neutral') {
          score += 3
        }

        return { interaction, score }
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxCount)
      .map((item) => item.interaction)

    return relevantInteractions
  }

  /**
   * 获取记忆上下文（用于 AI 对话生成）
   */
  getMemoryContext(
    npcId: string,
    npcName: string,
    personality: string,
    currentScene?: string
  ): MemoryContext | null {
    const memory = this.memories.get(npcId)
    if (!memory) return null

    const relationshipTier = getRelationshipTier(memory.relationshipLevel)
    
    // 获取相关记忆
    const relevantMemories = currentScene
      ? this.getRelevantMemories(npcId, currentScene)
      : memory.playerInteractions.slice(-5)

    // 生成对话风格建议
    const dialogueStyleSuggestion = this.generateDialogueStyleSuggestion(
      relationshipTier,
      memory.currentMood,
      memory.trustLevel
    )

    return {
      npcId,
      npcName,
      personality,
      relationshipTier,
      relationshipLevel: memory.relationshipLevel,
      currentMood: memory.currentMood,
      trustLevel: memory.trustLevel,
      relevantMemories,
      rememberedChoices: memory.rememberedChoices,
      dialogueStyleSuggestion,
    }
  }

  /**
   * 生成对话风格建议
   */
  private generateDialogueStyleSuggestion(
    tier: RelationshipTier,
    mood: NPCMemory['currentMood'],
    trustLevel: number
  ): string {
    const tierSuggestions: Record<RelationshipTier, string> = {
      hostile: '敌对态度，冷淡、警惕，可能拒绝交流',
      unfriendly: '不友好，保持距离，回答简短',
      neutral: '礼貌但保持距离，标准的社交礼仪',
      friendly: '热情友好，愿意分享更多信息',
      close: '亲密无间，可以坦诚交流，主动提供帮助',
    }

    const moodModifiers: Record<NPCMemory['currentMood'], string> = {
      happy: '情绪愉快，语气轻松',
      neutral: '情绪平静，语气平和',
      angry: '情绪激动，语气强硬',
      sad: '情绪低落，语气伤感',
      suspicious: '有所怀疑，语气试探',
    }

    const trustModifier = trustLevel >= 70
      ? '高度信任'
      : trustLevel >= 50
      ? '一般信任'
      : trustLevel >= 30
      ? '有所保留'
      : '缺乏信任'

    return `${tierSuggestions[tier]}。${moodModifiers[mood]}。${trustModifier}。`
  }

  /**
   * 序列化所有记忆
   */
  serialize(): Record<string, NPCMemory> {
    const result: Record<string, NPCMemory> = {}
    this.memories.forEach((memory, npcId) => {
      result[npcId] = memory
    })
    return result
  }

  /**
   * 从序列化数据恢复
   */
  deserialize(data: Record<string, NPCMemory>): void {
    this.memories.clear()
    Object.entries(data).forEach(([npcId, memory]) => {
      this.memories.set(npcId, memory)
    })
  }

  /**
   * 清除所有记忆
   */
  clear(): void {
    this.memories.clear()
  }
}

// ============================================
// 单例实例
// ============================================

let instance: NPCMemoryManager | null = null

/**
 * 获取 NPC 记忆管理器实例
 */
export function getNPCMemoryManager(): NPCMemoryManager {
  if (!instance) {
    instance = new NPCMemoryManager()
  }
  return instance
}

/**
 * 重置 NPC 记忆管理器（用于测试）
 */
export function resetNPCMemoryManager(): void {
  instance = null
}

// ============================================
// 便捷函数
// ============================================

/**
 * 创建 NPC 互动记录
 */
export function createInteraction(
  sceneId: string,
  playerChoice: string,
  npcResponse: string
): Interaction {
  return {
    sceneId,
    timestamp: Date.now(),
    playerChoice,
    npcResponse,
    sentiment: analyzeSentiment(playerChoice),
    choiceType: analyzeChoiceType(playerChoice),
  }
}

/**
 * 快速添加 NPC 互动
 */
export function recordNPCInteraction(
  npcId: string,
  sceneId: string,
  playerChoice: string,
  npcResponse: string
): void {
  const manager = getNPCMemoryManager()
  const interaction = createInteraction(sceneId, playerChoice, npcResponse)
  manager.addInteraction(npcId, interaction)
}

/**
 * 获取 NPC 关系等级文本
 */
export function getNPCRelationshipText(npcId: string): string {
  const manager = getNPCMemoryManager()
  const memory = manager.getMemory(npcId)
  
  if (!memory) return '陌生'
  
  const tier = getRelationshipTier(memory.relationshipLevel)
  return getRelationshipTierText(tier)
}

export default NPCMemoryManager