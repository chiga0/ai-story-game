/**
 * 内容审核服务
 * 提供剧本内容、对话、文本的审核功能
 */

import type { Script, Scene, Character } from '../../types'
import {
  filterSensitiveWords,
  shouldBlockContent,
  getHighestLevel,
  type DetectedWord,
  type SensitiveCategory,
  type SensitiveLevel,
} from './sensitive-words'

// ============================================
// 类型定义
// ============================================

/**
 * 问题类型
 */
export type IssueType = 'sensitive_word' | 'inappropriate_content' | 'custom_rule'

/**
 * 审核问题
 */
export interface ModerationIssue {
  type: IssueType
  severity: SensitiveLevel
  message: string
  word?: string
  category?: SensitiveCategory
}

/**
 * 审核结果
 */
export interface ModerationResult {
  approved: boolean
  issues: ModerationIssue[]
  warnings: string[]
  blockedReason?: string
}

/**
 * 审核选项
 */
export interface ModerationOptions {
  /** 检测的类别 */
  categories?: SensitiveCategory[]
  /** 是否允许 low 级别警告 */
  allowLowWarnings?: boolean
  /** 是否允许 medium 级别警告 */
  allowMediumWarnings?: boolean
  /** 是否在审核前过滤敏感词 */
  autoFilter?: boolean
}

// ============================================
// 工具函数
// ============================================

/**
 * 将敏感词检测结果转换为审核问题
 */
function detectedToIssue(detected: DetectedWord): ModerationIssue {
  const categoryNames: Record<SensitiveCategory, string> = {
    politics: '政治敏感',
    violence: '暴力内容',
    adult: '成人内容',
    gambling: '赌博相关',
    custom: '自定义敏感词',
  }

  return {
    type: 'sensitive_word',
    severity: detected.level,
    message: `检测到${categoryNames[detected.category]}词汇「${detected.word}」`,
    word: detected.word,
    category: detected.category,
  }
}

/**
 * 合并相同词汇的问题
 */
function mergeIssues(issues: ModerationIssue[]): ModerationIssue[] {
  const seen = new Map<string, ModerationIssue>()
  
  for (const issue of issues) {
    const key = `${issue.type}:${issue.word || ''}:${issue.category || ''}`
    if (!seen.has(key)) {
      seen.set(key, issue)
    }
  }
  
  return Array.from(seen.values())
}

// ============================================
// 核心审核函数
// ============================================

/**
 * 审核单段文本
 * @param text 待审核文本
 * @param options 审核选项
 * @returns 审核结果
 */
export async function moderateText(
  text: string,
  options: ModerationOptions = {}
): Promise<ModerationResult> {
  const {
    categories,
    allowLowWarnings = true,
    allowMediumWarnings = false,
    autoFilter = false,
  } = options

  // 检测敏感词
  const filterResult = filterSensitiveWords(text, categories)
  
  if (filterResult.clean) {
    return {
      approved: true,
      issues: [],
      warnings: [],
    }
  }

  // 转换为审核问题
  const issues = mergeIssues(
    filterResult.detected.map(detectedToIssue)
  )

  // 生成警告信息
  const warnings: string[] = []
  for (const issue of issues) {
    if (issue.severity === 'low' && !allowLowWarnings) {
      warnings.push(`⚠️ ${issue.message}（建议修改）`)
    } else if (issue.severity === 'medium' && !allowMediumWarnings) {
      warnings.push(`⚠️ ${issue.message}（请注意）`)
    }
  }

  // 判断是否应该阻止
  const shouldBlock = shouldBlockContent(filterResult.detected)
  
  if (shouldBlock) {
    return {
      approved: false,
      issues,
      warnings,
      blockedReason: '内容包含敏感词汇，无法通过审核',
    }
  }

  // 如果允许自动过滤，返回过滤后的结果
  if (autoFilter) {
    return {
      approved: true,
      issues,
      warnings: [...warnings, '已自动过滤敏感词汇'],
    }
  }

  // 根据等级决定是否通过
  const highestLevel = getHighestLevel(filterResult.detected)
  
  if (highestLevel === 'high') {
    return {
      approved: false,
      issues,
      warnings,
      blockedReason: '内容包含高敏感词汇',
    }
  }

  if (highestLevel === 'medium' && !allowMediumWarnings) {
    return {
      approved: false,
      issues,
      warnings,
      blockedReason: '内容包含中等敏感词汇',
    }
  }

  // 允许通过，但有警告
  return {
    approved: true,
    issues,
    warnings,
  }
}

/**
 * 审核对话内容
 * @param dialogue 对话文本
 * @param npcId NPC ID
 * @param options 审核选项
 * @returns 审核结果
 */
export async function moderateDialogue(
  dialogue: string,
  npcId: string,
  options: ModerationOptions = {}
): Promise<ModerationResult> {
  const result = await moderateText(dialogue, options)
  
  // 对话特有的审核逻辑
  if (!result.approved) {
    // 添加对话相关的警告
    result.warnings.push(`NPC ${npcId} 的对话包含不适当内容`)
  }
  
  return result
}

/**
 * 审核场景内容
 * @param scene 场景对象
 * @param options 审核选项
 * @returns 审核结果
 */
export async function moderateScene(
  scene: Scene,
  options: ModerationOptions = {}
): Promise<ModerationResult> {
  const issues: ModerationIssue[] = []
  const warnings: string[] = []

  // 审核场景文本
  const textResult = await moderateText(scene.text, options)
  issues.push(...textResult.issues)
  warnings.push(...textResult.warnings.map((w) => `场景文本：${w}`))

  // 审核选项文本
  if (scene.choices) {
    for (const choice of scene.choices) {
      const choiceResult = await moderateText(choice.text, options)
      issues.push(...choiceResult.issues)
      warnings.push(...choiceResult.warnings.map((w) => `选项「${choice.text}」：${w}`))
    }
  }

  // 合并相同问题
  const mergedIssues = mergeIssues(issues)

  // 判断是否通过
  const hasHighSeverity = mergedIssues.some((i) => i.severity === 'high')
  const shouldBlock = hasHighSeverity || shouldBlockContent(
    mergedIssues
      .filter((i) => i.word && i.category)
      .map((i) => ({
        word: i.word!,
        category: i.category!,
        position: [0, 0] as [number, number],
        level: i.severity,
      }))
  )

  return {
    approved: !shouldBlock,
    issues: mergedIssues,
    warnings,
    blockedReason: shouldBlock ? '场景包含敏感内容' : undefined,
  }
}

/**
 * 审核角色内容
 * @param character 角色对象
 * @param options 审核选项
 * @returns 审核结果
 */
export async function moderateCharacter(
  character: Character,
  options: ModerationOptions = {}
): Promise<ModerationResult> {
  const issues: ModerationIssue[] = []
  const warnings: string[] = []

  // 审核角色名称
  if (character.name) {
    const nameResult = await moderateText(character.name, options)
    issues.push(...nameResult.issues)
    warnings.push(...nameResult.warnings.map((w) => `角色名称：${w}`))
  }

  // 审核角色描述
  if (character.description) {
    const descResult = await moderateText(character.description, options)
    issues.push(...descResult.issues)
    warnings.push(...descResult.warnings.map((w) => `角色描述：${w}`))
  }

  // 审核性格描述
  if (character.personality) {
    const personalityResult = await moderateText(character.personality, options)
    issues.push(...personalityResult.issues)
    warnings.push(...personalityResult.warnings.map((w) => `性格描述：${w}`))
  }

  // 审核说话风格
  if (character.speakingStyle) {
    const styleResult = await moderateText(character.speakingStyle, options)
    issues.push(...styleResult.issues)
    warnings.push(...styleResult.warnings.map((w) => `说话风格：${w}`))
  }

  const mergedIssues = mergeIssues(issues)
  const hasHighSeverity = mergedIssues.some((i) => i.severity === 'high')

  return {
    approved: !hasHighSeverity,
    issues: mergedIssues,
    warnings,
    blockedReason: hasHighSeverity ? '角色包含敏感内容' : undefined,
  }
}

/**
 * 审核完整剧本
 * @param script 剧本对象
 * @param options 审核选项
 * @returns 审核结果
 */
export async function moderateScript(
  script: Script,
  options: ModerationOptions = {}
): Promise<ModerationResult> {
  const allIssues: ModerationIssue[] = []
  const allWarnings: string[] = []

  // 审核标题和描述
  const titleResult = await moderateText(script.title, options)
  allIssues.push(...titleResult.issues)
  allWarnings.push(...titleResult.warnings.map((w) => `标题：${w}`))

  if (script.description) {
    const descResult = await moderateText(script.description, options)
    allIssues.push(...descResult.issues)
    allWarnings.push(...descResult.warnings.map((w) => `描述：${w}`))
  }

  // 审核所有角色
  for (const character of Object.values(script.characters)) {
    const charResult = await moderateCharacter(character, options)
    allIssues.push(...charResult.issues)
    allWarnings.push(...charResult.warnings.map((w) => `角色「${character.name}」：${w}`))
  }

  // 审核所有场景
  for (const scene of Object.values(script.scenes)) {
    const sceneResult = await moderateScene(scene, options)
    allIssues.push(...sceneResult.issues)
    allWarnings.push(...sceneResult.warnings.map((w) => `场景「${scene.id}」：${w}`))
  }

  // 审核结局
  for (const ending of script.endings) {
    const endingResult = await moderateText(ending.description, options)
    allIssues.push(...endingResult.issues)
    allWarnings.push(...endingResult.warnings.map((w) => `结局「${ending.title}」：${w}`))
  }

  // 合并问题
  const mergedIssues = mergeIssues(allIssues)
  
  // 计算统计信息
  const stats = {
    high: mergedIssues.filter((i) => i.severity === 'high').length,
    medium: mergedIssues.filter((i) => i.severity === 'medium').length,
    low: mergedIssues.filter((i) => i.severity === 'low').length,
  }

  // 判断是否通过
  const hasHighSeverity = stats.high > 0
  const shouldBlock = hasHighSeverity || shouldBlockContent(
    mergedIssues
      .filter((i) => i.word && i.category)
      .map((i) => ({
        word: i.word!,
        category: i.category!,
        position: [0, 0] as [number, number],
        level: i.severity,
      }))
  )

  // 添加统计警告
  if (stats.high > 0) {
    allWarnings.unshift(`发现 ${stats.high} 个高敏感内容`)
  }
  if (stats.medium > 0) {
    allWarnings.unshift(`发现 ${stats.medium} 个中等敏感内容`)
  }

  return {
    approved: !shouldBlock,
    issues: mergedIssues,
    warnings: allWarnings,
    blockedReason: shouldBlock
      ? `剧本包含敏感内容（高：${stats.high}，中：${stats.medium}，低：${stats.low}）`
      : undefined,
  }
}

// ============================================
// 审核钩子函数
// ============================================

/**
 * 内容审核钩子
 * 可用于 AI 生成流程中的内容审核
 */
export type ModerationHook = (
  content: string,
  context?: {
    type: 'outline' | 'character' | 'scene' | 'dialogue' | 'ending'
    metadata?: Record<string, unknown>
  }
) => Promise<{ approved: boolean; filteredContent?: string; reason?: string }>

/**
 * 创建默认审核钩子
 */
export function createModerationHook(
  options: ModerationOptions = {}
): ModerationHook {
  return async (content, context) => {
    const result = await moderateText(content, options)
    
    if (result.approved) {
      // 如果通过但有警告，记录日志
      if (result.warnings.length > 0) {
        console.warn('内容审核警告:', result.warnings)
      }
      return { approved: true }
    }
    
    return {
      approved: false,
      reason: result.blockedReason,
    }
  }
}