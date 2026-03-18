/**
 * 敏感词过滤模块
 * 提供敏感词检测、过滤、替换功能
 */

import { POLITICS_CONFIG, POLITICS_WORDS } from './word-lists/politics'
import { VIOLENCE_CONFIG, VIOLENCE_WORDS } from './word-lists/violence'
import { ADULT_CONFIG, ADULT_WORDS } from './word-lists/adult'
import { GAMBLING_CONFIG, GAMBLING_WORDS } from './word-lists/gambling'

// ============================================
// 类型定义
// ============================================

/**
 * 敏感词类别
 */
export type SensitiveCategory = 'politics' | 'violence' | 'adult' | 'gambling' | 'custom'

/**
 * 敏感等级
 */
export type SensitiveLevel = 'low' | 'medium' | 'high'

/**
 * 处理方式
 */
export type SensitiveAction = 'warn' | 'replace' | 'block'

/**
 * 敏感词配置
 */
export interface SensitiveWordConfig {
  category: SensitiveCategory
  words: string[]
  level: SensitiveLevel
  action: SensitiveAction
}

/**
 * 检测到的敏感词
 */
export interface DetectedWord {
  word: string
  category: SensitiveCategory
  position: [number, number]
  level: SensitiveLevel
}

/**
 * 过滤结果
 */
export interface FilterResult {
  clean: boolean
  detected: DetectedWord[]
  filteredText: string
}

/**
 * 自定义敏感词条目
 */
export interface CustomWordEntry {
  word: string
  level: SensitiveLevel
  addedAt: number
}

// ============================================
// 内置敏感词库
// ============================================

const BUILTIN_CONFIGS: SensitiveWordConfig[] = [
  POLITICS_CONFIG,
  VIOLENCE_CONFIG,
  ADULT_CONFIG,
  GAMBLING_CONFIG,
]

// ============================================
// 状态管理
// ============================================

// 当前启用的类别
let enabledCategories: SensitiveCategory[] = ['politics', 'violence', 'adult', 'gambling']

// 自定义敏感词
let customWords: CustomWordEntry[] = []

// 替换字符
const REPLACE_CHAR = '*'

// ============================================
// 工具函数
// ============================================

/**
 * 获取指定类别的所有敏感词
 */
function getWordsForCategory(category: SensitiveCategory): string[] {
  switch (category) {
    case 'politics':
      return POLITICS_WORDS
    case 'violence':
      return VIOLENCE_WORDS
    case 'adult':
      return ADULT_WORDS
    case 'gambling':
      return GAMBLING_WORDS
    case 'custom':
      return customWords.map((w) => w.word)
    default:
      return []
  }
}

/**
 * 获取指定类别的敏感等级
 */
function getLevelForCategory(category: SensitiveCategory): SensitiveLevel {
  const config = BUILTIN_CONFIGS.find((c) => c.category === category)
  return config?.level || 'medium'
}

/**
 * 获取自定义词的等级
 */
function getCustomWordLevel(word: string): SensitiveLevel {
  const entry = customWords.find((e) => e.word === word)
  return entry?.level || 'medium'
}

/**
 * 构建正则表达式模式
 */
function buildPattern(words: string[]): RegExp {
  // 按长度降序排序，优先匹配长词
  const sortedWords = [...words].sort((a, b) => b.length - a.length)
  
  // 转义特殊字符
  const escapedWords = sortedWords.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )
  
  // 构建正则
  const pattern = escapedWords.join('|')
  return new RegExp(pattern, 'gi')
}

// ============================================
// 核心函数
// ============================================

/**
 * 过滤敏感词
 * @param text 待过滤文本
 * @param categories 指定检测的类别（默认使用启用的类别）
 * @returns 过滤结果
 */
export function filterSensitiveWords(
  text: string,
  categories?: SensitiveCategory[]
): FilterResult {
  const targetCategories = categories || enabledCategories
  const detected: DetectedWord[] = []
  let filteredText = text

  // 收集所有需要检测的词
  const allWords: Array<{ word: string; category: SensitiveCategory; level: SensitiveLevel }> = []
  
  for (const category of targetCategories) {
    const words = getWordsForCategory(category)
    const level = getLevelForCategory(category)
    
    for (const word of words) {
      const wordLevel = category === 'custom' ? getCustomWordLevel(word) : level
      allWords.push({ word, category, level: wordLevel })
    }
  }

  if (allWords.length === 0) {
    return { clean: true, detected: [], filteredText: text }
  }

  // 构建正则并检测
  const wordMap = new Map<string, { category: SensitiveCategory; level: SensitiveLevel }>()
  for (const item of allWords) {
    wordMap.set(item.word.toLowerCase(), { category: item.category, level: item.level })
  }

  const pattern = buildPattern(allWords.map((w) => w.word))
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    const matchedWord = match[0]
    const meta = wordMap.get(matchedWord.toLowerCase())
    
    if (meta) {
      detected.push({
        word: matchedWord,
        category: meta.category,
        position: [match.index, match.index + matchedWord.length],
        level: meta.level,
      })
    }
  }

  // 执行替换
  if (detected.length > 0) {
    filteredText = text.replace(pattern, (matched) => {
      const meta = wordMap.get(matched.toLowerCase())
      if (meta) {
        // 根据等级决定是否替换
        const config = BUILTIN_CONFIGS.find((c) => c.category === meta.category)
        const action = config?.action || 'replace'
        
        if (action === 'replace' || action === 'block') {
          return REPLACE_CHAR.repeat(matched.length)
        }
      }
      return matched
    })
  }

  return {
    clean: detected.length === 0,
    detected,
    filteredText,
  }
}

/**
 * 添加自定义敏感词
 * @param words 要添加的词列表
 * @param level 敏感等级（默认 medium）
 */
export function addCustomWords(
  words: string[],
  level: SensitiveLevel = 'medium'
): void {
  const now = Date.now()
  for (const word of words) {
    // 检查是否已存在
    const existingIndex = customWords.findIndex((w) => w.word === word)
    
    if (existingIndex >= 0) {
      // 更新等级
      customWords[existingIndex].level = level
    } else {
      // 添加新词
      customWords.push({ word, level, addedAt: now })
    }
  }
  
  // 启用自定义类别
  if (!enabledCategories.includes('custom')) {
    enabledCategories.push('custom')
  }
}

/**
 * 移除自定义敏感词
 * @param words 要移除的词列表
 */
export function removeCustomWords(words: string[]): void {
  customWords = customWords.filter((w) => !words.includes(w.word))
  
  // 如果没有自定义词了，禁用该类别
  if (customWords.length === 0) {
    enabledCategories = enabledCategories.filter((c) => c !== 'custom')
  }
}

/**
 * 清空所有自定义敏感词
 */
export function clearCustomWords(): void {
  customWords = []
  enabledCategories = enabledCategories.filter((c) => c !== 'custom')
}

/**
 * 获取自定义敏感词列表
 */
export function getCustomWords(): CustomWordEntry[] {
  return [...customWords]
}

/**
 * 获取启用的类别
 */
export function getEnabledCategories(): SensitiveCategory[] {
  return [...enabledCategories]
}

/**
 * 设置启用的类别
 * @param categories 类别列表
 */
export function setEnabledCategories(categories: SensitiveCategory[]): void {
  enabledCategories = [...new Set(categories)] // 去重
}

/**
 * 启用指定类别
 * @param category 类别
 */
export function enableCategory(category: SensitiveCategory): void {
  if (!enabledCategories.includes(category)) {
    enabledCategories.push(category)
  }
}

/**
 * 禁用指定类别
 * @param category 类别
 */
export function disableCategory(category: SensitiveCategory): void {
  enabledCategories = enabledCategories.filter((c) => c !== category)
}

/**
 * 检测文本是否包含敏感词
 * @param text 待检测文本
 * @param categories 指定检测的类别
 * @returns 是否包含敏感词
 */
export function hasSensitiveWords(
  text: string,
  categories?: SensitiveCategory[]
): boolean {
  const result = filterSensitiveWords(text, categories)
  return !result.clean
}

/**
 * 获取最高敏感等级
 * @param detected 检测到的敏感词列表
 * @returns 最高等级
 */
export function getHighestLevel(detected: DetectedWord[]): SensitiveLevel | null {
  if (detected.length === 0) return null
  
  const levels: SensitiveLevel[] = ['high', 'medium', 'low']
  for (const level of levels) {
    if (detected.some((d) => d.level === level)) {
      return level
    }
  }
  
  return null
}

/**
 * 判断是否应该阻止内容
 * @param detected 检测到的敏感词列表
 * @returns 是否应该阻止
 */
export function shouldBlockContent(detected: DetectedWord[]): boolean {
  // 高等级敏感词直接阻止
  if (detected.some((d) => d.level === 'high')) {
    return true
  }
  
  // 检查是否有对应类别的 block 配置
  for (const item of detected) {
    const config = BUILTIN_CONFIGS.find((c) => c.category === item.category)
    if (config?.action === 'block') {
      return true
    }
  }
  
  return false
}

// ============================================
// 持久化
// ============================================

const STORAGE_KEY = 'sensitive-words-config'

/**
 * 保存配置到本地存储
 */
export function saveConfig(): void {
  const config = {
    enabledCategories,
    customWords,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

/**
 * 从本地存储加载配置
 */
export function loadConfig(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const config = JSON.parse(stored)
      if (config.enabledCategories) {
        enabledCategories = config.enabledCategories
      }
      if (config.customWords) {
        customWords = config.customWords
      }
    }
  } catch (e) {
    console.warn('加载敏感词配置失败:', e)
  }
}

/**
 * 重置配置
 */
export function resetConfig(): void {
  enabledCategories = ['politics', 'violence', 'adult', 'gambling']
  customWords = []
  localStorage.removeItem(STORAGE_KEY)
}

// 初始化时加载配置
if (typeof window !== 'undefined') {
  loadConfig()
}