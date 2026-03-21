/**
 * AI 图片生成模块
 * 使用阿里云通义万相 API 生成剧本封面图
 */

import type { ScriptOutline } from './script-generator'

// ============================================
// 类型定义
// ============================================

export interface ImageGenerationOptions {
  /** 图片描述/提示词 */
  prompt: string
  /** 图片尺寸 */
  size?: '512*512' | '720*1280' | '1280*720' | '1024*1024'
  /** 生成数量 */
  n?: number
  /** 风格 */
  style?: '<auto>' | '<photography>' | '<portrait>' | '<3d cartoon>' | '<anime>' | '<oil painting>' | '<watercolor>' | '<sketch>' | '<chinese painting>' | '<flat illustration>'
}

export interface ImageGenerationResult {
  success: boolean
  imageUrl?: string
  base64Data?: string
  error?: string
}

// ============================================
// 封面图生成 Prompt 模板
// ============================================

const COVER_PROMPT_TEMPLATES: Record<string, string> = {
  mystery: 'A mysterious scene with dark shadows, detective elements, foggy atmosphere, noir style, dramatic lighting, enigmatic mood, high detail illustration',
  fantasy: 'A magical fantasy world with floating islands, ancient castles, mystical creatures, ethereal glow, epic adventure atmosphere, digital art style',
  scifi: 'Futuristic sci-fi cityscape with neon lights, spaceships, holographic displays, cyberpunk atmosphere, high-tech environment, concept art',
  horror: 'A dark and eerie scene with subtle horror elements, ominous atmosphere, mysterious shadows, gothic style, dramatic lighting',
  romance: 'A romantic scene with soft lighting, beautiful landscape, dreamy atmosphere, pastel colors, elegant composition, emotional mood',
  adventure: 'An exciting adventure scene with exploration elements, treasure hunting vibes, exotic locations, dynamic composition, vibrant colors',
}

// ============================================
// 封面图生成函数
// ============================================

/**
 * 根据剧本大纲生成封面图
 */
export async function generateScriptCover(
  outline: ScriptOutline,
  theme: string
): Promise<ImageGenerationResult> {
  // 获取主题对应的 prompt 模板
  const stylePrompt = COVER_PROMPT_TEMPLATES[theme] || COVER_PROMPT_TEMPLATES.mystery
  
  // 组合 prompt
  const prompt = `Book cover illustration for a story titled "${outline.title}". ${outline.description}. Style: ${stylePrompt}. High quality, detailed, professional book cover art.`
  
  try {
    const result = await generateImage({
      prompt,
      size: '720*1280', // 适合封面的纵向尺寸
      n: 1,
      style: '<oil painting>',
    })
    
    return result
  } catch (error) {
    console.error('Failed to generate cover image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '图片生成失败',
    }
  }
}

/**
 * 调用图片生成 API
 * 通过 Server Function 调用，避免 CORS
 */
async function generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  // 动态导入 server function
  const { generateImageAI } = await import('#/server/ai')
  
  const result = await generateImageAI({
    data: {
      prompt: options.prompt,
      size: options.size || '720*1280',
      n: options.n || 1,
      style: options.style || '<auto>',
    }
  })
  
  return result
}

// ============================================
// 默认封面图
// ============================================

/**
 * 根据主题获取默认封面图（emoji 形式）
 */
export function getDefaultCoverEmoji(theme: string): string {
  const emojis: Record<string, string> = {
    mystery: '🏰',
    fantasy: '🐉',
    scifi: '🚀',
    horror: '👻',
    romance: '💕',
    adventure: '🗺️',
  }
  return emojis[theme] || '📖'
}

/**
 * 根据主题获取默认封面渐变色
 */
export function getDefaultCoverGradient(theme: string): string {
  const gradients: Record<string, string> = {
    mystery: 'from-slate-700 to-slate-900',
    fantasy: 'from-purple-500 to-indigo-900',
    scifi: 'from-cyan-500 to-blue-900',
    horror: 'from-red-900 to-black',
    romance: 'from-pink-400 to-rose-600',
    adventure: 'from-amber-500 to-orange-700',
  }
  return gradients[theme] || 'from-gray-500 to-gray-800'
}