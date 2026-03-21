import type { Script, Character, Scene, Ending, Characters, Scenes, Endings } from '../../types'
import {
  OUTLINE_GENERATION_PROMPT,
  CHARACTER_GENERATION_PROMPT,
  SCENE_GENERATION_PROMPT,
  ENDING_GENERATION_PROMPT,
} from './prompts/script-generation'
import {
  moderateText,
  moderateScene,
  moderateCharacter,
  type ModerationResult,
} from '../content/content-moderator'
import { loadAPIKeys, type UserAPIKeys } from '../user/api-keys'
import { generateAI } from '#/server/ai'

// ============================================
// AI 服务调用（通过 Server Function，避免 CORS）
// ============================================

async function callAIGenerate(prompt: string, maxTokens: number = 4000): Promise<string> {
  const result = await generateAI({ data: { prompt, maxTokens } })
  if (!result.success) {
    throw new Error(result.error || 'AI 生成失败')
  }
  return result.text || ''
}

// ============================================
// 类型定义
// ============================================

export interface ScriptGeneratorOptions {
  theme: 'mystery' | 'fantasy' | 'scifi' | 'horror' | 'romance' | 'adventure'
  difficulty: 'easy' | 'normal' | 'hard'
  duration: 'short' | 'medium' | 'long' // 15/30/60分钟
  customElements?: string[] // 用户自定义元素
}

export interface ScriptOutline {
  title: string
  description: string
  genre: string
  setting: string
  mainPlot: string
  keyEvents: string[]
  estimatedScenes: number
  estimatedCharacters: number
}

export interface GenerationProgress {
  step: 'outline' | 'cover' | 'characters' | 'scenes' | 'endings' | 'moderation' | 'validation' | 'complete' | 'error'
  message: string
  progress: number // 0-100
  data?: unknown
  moderationResult?: ModerationResult
}

export type ProgressCallback = (progress: GenerationProgress) => void

// ============================================
// 主题配置
// ============================================

export const THEME_CONFIG = {
  mystery: {
    name: '悬疑推理',
    description: '扑朔迷离的案件，层层递进的线索',
    icon: '🔍',
    defaultElements: ['神秘事件', '隐藏线索', '嫌疑人', '真相揭露'],
  },
  fantasy: {
    name: '奇幻冒险',
    description: '魔法与奇迹的世界，英雄的史诗旅程',
    icon: '🧙',
    defaultElements: ['魔法', '神话生物', '古老预言', '命运抉择'],
  },
  scifi: {
    name: '科幻未来',
    description: '科技与人性，宇宙的未知边界',
    icon: '🚀',
    defaultElements: ['高科技', '太空探索', '人工智能', '时空旅行'],
  },
  horror: {
    name: '恐怖惊悚',
    description: '黑暗中的恐惧，生存的考验',
    icon: '👻',
    defaultElements: ['诡异现象', '生存危机', '未知威胁', '心理恐惧'],
  },
  romance: {
    name: '浪漫爱情',
    description: '情感的纠葛，命运的相遇',
    icon: '💕',
    defaultElements: ['命运相遇', '情感纠葛', '阻碍与考验', '爱情抉择'],
  },
  adventure: {
    name: '冒险探索',
    description: '未知的旅程，勇敢的探索',
    icon: '🗺️',
    defaultElements: ['未知领域', '宝藏寻找', '危险挑战', '成长蜕变'],
  },
} as const

export const DIFFICULTY_CONFIG = {
  easy: { name: '简单', description: '简单的选择，明确的线索' },
  normal: { name: '普通', description: '平衡的选择和挑战' },
  hard: { name: '困难', description: '复杂的选择，隐藏的线索' },
} as const

export const DURATION_CONFIG = {
  short: {
    duration: 15,
    sceneCount: { min: 3, max: 5 },
    characterCount: { min: 2, max: 3 },
  },
  medium: {
    duration: 30,
    sceneCount: { min: 5, max: 8 },
    characterCount: { min: 3, max: 4 },
  },
  long: {
    duration: 60,
    sceneCount: { min: 8, max: 12 },
    characterCount: { min: 4, max: 6 },
  },
} as const

// ============================================
// 验证函数
// ============================================

export function validateOptions(options: ScriptGeneratorOptions): string[] {
  const errors: string[] = []
  
  if (!options.theme) {
    errors.push('请选择主题')
  }
  if (!options.difficulty) {
    errors.push('请选择难度')
  }
  if (!options.duration) {
    errors.push('请选择时长')
  }
  
  return errors
}

export function getEstimatedTime(options: ScriptGeneratorOptions): number {
  const durationConfig = DURATION_CONFIG[options.duration]
  const baseTime = durationConfig.sceneCount.min * 5 // 每个场景约 5 秒
  return Math.max(30, baseTime)
}

// ============================================
// 生成函数
// ============================================

async function generateOutline(
  options: ScriptGeneratorOptions,
  onProgress?: ProgressCallback
): Promise<ScriptOutline> {
  const themeConfig = THEME_CONFIG[options.theme]
  const difficultyConfig = DIFFICULTY_CONFIG[options.difficulty]
  const durationConfig = DURATION_CONFIG[options.duration]

  const customElementsStr = options.customElements?.length
    ? `\n用户自定义元素：${options.customElements.join('、')}`
    : ''

  const prompt = OUTLINE_GENERATION_PROMPT
    .replace('{theme}', themeConfig.name)
    .replace('{themeDescription}', themeConfig.description)
    .replace('{difficulty}', difficultyConfig.name)
    .replace('{duration}', `${durationConfig.duration}分钟`)
    .replace('{sceneRange}', `${durationConfig.sceneCount.min}-${durationConfig.sceneCount.max}`)
    .replace('{characterRange}', `${durationConfig.characterCount.min}-${durationConfig.characterCount.max}`)
    .replace('{customElements}', customElementsStr)
    .replace('{defaultElements}', themeConfig.defaultElements.join('、'))

  // 最多尝试3次（初次生成 + 2次修正）
  const maxAttempts = 3
  let lastModerationResult: ModerationResult | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // 如果是修正尝试，添加审核反馈
      let currentPrompt = prompt
      if (lastModerationResult && attempt > 1) {
        const feedback = lastModerationResult.issues.map(i => `- ${i.message}`).join('\n')
        currentPrompt = `${prompt}\n\n**注意：上次生成的内容未通过审核，请根据以下反馈修正：**\n${feedback}\n\n请避免上述问题，重新生成内容。`
        
        onProgress?.({
          step: 'moderation',
          message: `正在根据审核意见修正大纲（第${attempt}次尝试）...`,
          progress: 10,
          moderationResult: lastModerationResult,
        })
      }

      const text = await callAIGenerate(currentPrompt, 2000)

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('AI 响应格式错误：未找到 JSON')
      }

      const outline = JSON.parse(jsonMatch[0]) as ScriptOutline

      const moderationResult = await moderateText(`${outline.title} ${outline.description} ${outline.mainPlot}`)
      
      if (!moderationResult.approved) {
        lastModerationResult = moderationResult
        
        if (attempt < maxAttempts) {
          console.log(`大纲审核未通过，准备第${attempt + 1}次尝试修正...`)
          continue
        }
        
        // 最后一次尝试仍然失败
        onProgress?.({
          step: 'error',
          message: `大纲包含敏感内容：${moderationResult.issues.map(i => i.message).join('、')}`,
          progress: 0,
          moderationResult,
        })
        throw new Error(`大纲审核未通过，已尝试${maxAttempts}次修正`)
      }

      return outline
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
      // 继续下一次尝试
    }
  }

  throw new Error('大纲生成失败')
}

async function generateCharacters(
  outline: ScriptOutline,
  options: ScriptGeneratorOptions,
  onProgress?: ProgressCallback
): Promise<Character[]> {
  const durationConfig = DURATION_CONFIG[options.duration]

  const prompt = CHARACTER_GENERATION_PROMPT
    .replace('{title}', outline.title)
    .replace('{description}', outline.description)
    .replace('{setting}', outline.setting)
    .replace('{mainPlot}', outline.mainPlot)
    .replace('{characterCount}', String(durationConfig.characterCount.max))

  // 最多尝试3次
  const maxAttempts = 3
  let lastModerationIssues: Array<{ charName: string; issues: ModerationResult }> = []

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      let currentPrompt = prompt
      if (lastModerationIssues.length > 0 && attempt > 1) {
        const feedback = lastModerationIssues
          .map(({ charName, issues }) => {
            const issueList = issues.issues.map(i => `  - ${i.message}`).join('\n')
            return `角色「${charName}」：\n${issueList}`
          })
          .join('\n\n')
        
        currentPrompt = `${prompt}\n\n**注意：上次生成的角色未通过审核，请根据以下反馈修正：**\n${feedback}\n\n请避免上述问题，重新生成角色。`
        
        onProgress?.({
          step: 'moderation',
          message: `正在根据审核意见修正角色（第${attempt}次尝试）...`,
          progress: 30,
        })
      }

      const text = await callAIGenerate(currentPrompt, 3000)

      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('AI 响应格式错误：未找到角色数组')
      }

      const characters = JSON.parse(jsonMatch[0]) as Character[]

      // 审核所有角色
      const moderationResults: Array<{ charName: string; issues: ModerationResult }> = []
      let hasDisapproved = false

      for (const char of characters) {
        const moderationResult = await moderateCharacter(char)
        if (!moderationResult.approved) {
          hasDisapproved = true
          moderationResults.push({ charName: char.name, issues: moderationResult })
          console.warn(`角色 "${char.name}" 包含敏感内容`)
        }
      }

      if (hasDisapproved) {
        lastModerationIssues = moderationResults
        
        if (attempt < maxAttempts) {
          console.log(`角色审核未通过，准备第${attempt + 1}次尝试修正...`)
          continue
        }
        
        // 最后一次尝试仍有问题，返回角色但记录警告
        console.warn(`角色审核存在警告，已尝试${maxAttempts}次修正`)
      }

      return characters
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
    }
  }

  throw new Error('角色生成失败')
}

async function generateScenes(
  outline: ScriptOutline,
  characters: Character[],
  options: ScriptGeneratorOptions,
  onProgress?: ProgressCallback
): Promise<Scene[]> {
  const durationConfig = DURATION_CONFIG[options.duration]
  const characterNames = characters.map(c => c.name).join('、')

  const prompt = SCENE_GENERATION_PROMPT
    .replace('{title}', outline.title)
    .replace('{description}', outline.description)
    .replace('{setting}', outline.setting)
    .replace('{mainPlot}', outline.mainPlot)
    .replace('{keyEvents}', outline.keyEvents.join('\n'))
    .replace('{characters}', characterNames)
    .replace('{sceneCount}', String(durationConfig.sceneCount.max))

  // 最多尝试3次
  const maxAttempts = 3
  let lastModerationIssues: Array<{ sceneId: string; issues: ModerationResult }> = []

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      let currentPrompt = prompt
      if (lastModerationIssues.length > 0 && attempt > 1) {
        const feedback = lastModerationIssues
          .map(({ sceneId, issues }) => {
            const issueList = issues.issues.map(i => `  - ${i.message}`).join('\n')
            return `场景「${sceneId}」：\n${issueList}`
          })
          .join('\n\n')
        
        currentPrompt = `${prompt}\n\n**注意：上次生成的场景未通过审核，请根据以下反馈修正：**\n${feedback}\n\n请避免上述问题，重新生成场景。`
        
        onProgress?.({
          step: 'moderation',
          message: `正在根据审核意见修正场景（第${attempt}次尝试）...`,
          progress: 50,
        })
      }

      const text = await callAIGenerate(currentPrompt, 6000)

      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('AI 响应格式错误：未找到场景数组')
      }

      const scenes = JSON.parse(jsonMatch[0]) as Scene[]

      // 审核所有场景
      const moderationResults: Array<{ sceneId: string; issues: ModerationResult }> = []
      let hasDisapproved = false

      for (const scene of scenes) {
        const moderationResult = await moderateScene(scene)
        if (!moderationResult.approved) {
          hasDisapproved = true
          moderationResults.push({ sceneId: scene.id, issues: moderationResult })
          console.warn(`场景包含敏感内容`)
        }
      }

      if (hasDisapproved) {
        lastModerationIssues = moderationResults
        
        if (attempt < maxAttempts) {
          console.log(`场景审核未通过，准备第${attempt + 1}次尝试修正...`)
          continue
        }
        
        // 最后一次尝试仍有问题
        console.warn(`场景审核存在警告，已尝试${maxAttempts}次修正`)
      }

      return scenes
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
    }
  }

  throw new Error('场景生成失败')
}

async function generateEndings(
  scenes: Scene[],
  options: ScriptGeneratorOptions,
  onProgress?: ProgressCallback
): Promise<Ending[]> {
  const prompt = ENDING_GENERATION_PROMPT
    .replace('{sceneCount}', String(scenes.length))

  try {
    const text = await callAIGenerate(prompt, 2000)

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('AI 响应格式错误：未找到结局数组')
    }

    return JSON.parse(jsonMatch[0]) as Ending[]
  } catch (error) {
    throw error
  }
}

// ============================================
// 主生成函数
// ============================================

export async function generateScript(
  options: ScriptGeneratorOptions,
  onProgress?: ProgressCallback
): Promise<Script> {
  try {
    // 步骤 1：生成大纲
    onProgress?.({
      step: 'outline',
      message: '正在生成剧本大纲...',
      progress: 10,
    })
    const outline = await generateOutline(options, onProgress)

    // 步骤 2：生成封面图（在大纲生成后，与其他步骤并行）
    let coverImage: string | undefined
    const coverPromise = (async () => {
      try {
        onProgress?.({
          step: 'cover',
          message: '正在生成封面图...',
          progress: 20,
        })
        
        // 动态导入图片生成模块
        const { generateScriptCover } = await import('./image-generator')
        const coverResult = await generateScriptCover(outline, options.theme)
        
        if (coverResult.success && coverResult.imageUrl) {
          coverImage = coverResult.imageUrl
          console.log('[Script Generator] Cover image generated:', coverImage)
        } else if (coverResult.success && coverResult.base64Data) {
          coverImage = coverResult.base64Data
          console.log('[Script Generator] Cover image generated (base64)')
        } else {
          console.warn('[Script Generator] Cover generation failed:', coverResult.error)
        }
      } catch (error) {
        console.warn('[Script Generator] Cover generation error:', error)
        // 封面生成失败不影响剧本生成
      }
    })()

    // 步骤 3：生成角色
    onProgress?.({
      step: 'characters',
      message: '正在生成角色...',
      progress: 30,
    })
    const charactersPromise = generateCharacters(outline, options, onProgress)

    // 等待封面和角色都完成
    const [, characters] = await Promise.all([coverPromise, charactersPromise])

    // 步骤 4：生成场景
    onProgress?.({
      step: 'scenes',
      message: '正在生成场景...',
      progress: 50,
    })
    const scenes = await generateScenes(outline, characters, options, onProgress)

    // 步骤 5：生成结局
    onProgress?.({
      step: 'endings',
      message: '正在生成结局...',
      progress: 80,
    })
    const endings = await generateEndings(scenes, options, onProgress)

    // 步骤 6：组装剧本
    onProgress?.({
      step: 'validation',
      message: '正在验证剧本...',
      progress: 90,
    })

    const script: Script = {
      id: `generated-${Date.now()}`,
      title: outline.title,
      description: outline.description,
      genre: options.theme,
      cover: coverImage, // 添加封面图
      difficulty: options.difficulty,
      estimatedDuration: DURATION_CONFIG[options.duration].duration,
      characters: characters.reduce((acc, char) => {
        acc[char.id] = char
        return acc
      }, {} as Characters),
      scenes: scenes.reduce((acc, scene) => {
        acc[scene.id] = scene
        return acc
      }, {} as Scenes),
      endings,
      initialState: {
        attributes: { courage: 0, wisdom: 0, charm: 0 },
        relationships: {},
      },
    }

    onProgress?.({
      step: 'complete',
      message: '剧本生成完成！',
      progress: 100,
    })

    return script
  } catch (error) {
    onProgress?.({
      step: 'error',
      message: error instanceof Error ? error.message : '生成失败',
      progress: 0,
    })
    throw error
  }
}