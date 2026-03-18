/**
 * 暴力相关敏感词列表
 * 基础列表，后续可扩展
 */

export const VIOLENCE_WORDS: string[] = [
  // 极端暴力词汇
  '杀人',
  '杀戮',
  '屠杀',
  '灭门',
  '碎尸',
  '分尸',
  '肢解',
  '虐杀',
  '活埋',
  '活烧',
  '凌迟',
  '酷刑',
  '折磨致死',

  // 暴力行为
  '强奸',
  '轮奸',
  '性侵',
  '性虐待',
  '家暴',
  '虐待',
  '施暴',
  '殴打致死',
  '暴力犯罪',
  '恐怖袭击',
  '爆炸',
  '炸弹',
  '纵火',
  '投毒',

  // 血腥描述
  '血肉横飞',
  '血流成河',
  '血腥屠杀',
  '残忍杀害',
  '残忍手段',
  '变态杀人',
  '连环杀人',
  '变态狂',
]

/**
 * 暴力敏感词配置
 */
export const VIOLENCE_CONFIG = {
  category: 'violence' as const,
  words: VIOLENCE_WORDS,
  level: 'high' as const,
  action: 'block' as const,
}