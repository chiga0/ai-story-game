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

// ============================================
// AI 服务调用（使用用户配置的 API Key）
// ============================================

async function callAIGenerate(prompt: string, maxTokens: number = 2000): Promise<string> {
  // 从 localStorage 加载用户配置的 API Key
  const keys = await loadAPIKeys()
  
  // 优先使用用户配置的 custom API
  let apiKey: string | undefined
  let baseURL = 'https://coding.dashscope.aliyuncs.com/v1'
  
  if (keys?.custom) {
    apiKey = keys.custom.key
    baseURL = keys.custom.baseUrl
  } else if (keys?.openai) {
    apiKey = keys.openai
  } else {
    // 如果用户没有配置，提示用户去设置
    throw new Error('请先在"设置"页面配置您的 API Key')
  }
  
  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-5-plus',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('AI 生成失败')
  }
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
  step: 'outline' | 'characters' | 'scenes' | 'endings' | 'moderation' | 'validation' | 'complete' | 'error'
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
    sceneCount: { min: 5, max: 8 },
    characterCount: { min: 2, max: 4 },
  },
  medium: {
    duration: 30,
    sceneCount: { min: 10, max: 15 },
    characterCount: { min: 3, max: 6 },
  },
  long: {
    duration: 60,
    sceneCount: { min: 20, max: 30 },
    characterCount: { min: 5, max: 10 },
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

  try {
    const text = await callAIGenerate(prompt, 2000)

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI 响应格式错误：未找到 JSON')
    }

    const outline = JSON.parse(jsonMatch[0]) as ScriptOutline

    const moderationResult = await moderateText(`${outline.title} ${outline.description} ${outline.mainPlot}`)
    
    if (!moderationResult.approved) {
      onProgress?.({
        step: 'error',
        message: `大纲包含敏感内容：${moderationResult.issues.map(i => i.message).join('、')}`,
        progress: 0,
        moderationResult,
      })
      throw new Error(`大纲审核未通过`)
    }

    return outline
  } catch (error) {
    throw error
  }
}

async function generateCharacters(
  outline: ScriptOutline,
  options: ScriptGeneratorOptions,
  onProgress?: ProgressCallback
): Promise<Character[]> {
  const durationConfig = DURATION_CONFIG[options.duration]

  const prompt = CHARACTER_GENERATION_PROMPT
    .replace('{title}', outline.title)
    .replace('{mainPlot}', outline.mainPlot)
    .replace('{characterCount}', String(durationConfig.characterCount.max))

  try {
    const text = await callAIGenerate(prompt, 3000)

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('AI 响应格式错误：未找到角色数组')
    }

    const characters = JSON.parse(jsonMatch[0]) as Character[]

    for (const char of characters) {
      const moderationResult = await moderateCharacter(char)
      if (!moderationResult.approved) {
        console.warn(`角色 "${char.name}" 可能包含敏感内容`)
      }
    }

    return characters
  } catch (error) {
    throw error
  }
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
    .replace('{mainPlot}', outline.mainPlot)
    .replace('{keyEvents}', outline.keyEvents.join('\n'))
    .replace('{characters}', characterNames)
    .replace('{sceneCount}', String(durationConfig.sceneCount.max))

  try {
    const text = await callAIGenerate(prompt, 8000)

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('AI 响应格式错误：未找到场景数组')
    }

    const scenes = JSON.parse(jsonMatch[0]) as Scene[]

    for (const scene of scenes) {
      const moderationResult = await moderateScene(scene)
      if (!moderationResult.approved) {
        console.warn(`场景可能包含敏感内容`)
      }
    }

    return scenes
  } catch (error) {
    throw error
  }
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

    // 步骤 2：生成角色
    onProgress?.({
      step: 'characters',
      message: '正在生成角色...',
      progress: 30,
    })
    const characters = await generateCharacters(outline, options, onProgress)

    // 步骤 3：生成场景
    onProgress?.({
      step: 'scenes',
      message: '正在生成场景...',
      progress: 50,
    })
    const scenes = await generateScenes(outline, characters, options, onProgress)

    // 步骤 4：生成结局
    onProgress?.({
      step: 'endings',
      message: '正在生成结局...',
      progress: 80,
    })
    const endings = await generateEndings(scenes, options, onProgress)

    // 步骤 5：组装剧本
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