/**
 * 政治敏感词列表
 * 基础列表，后续可扩展
 */

export const POLITICS_WORDS: string[] = [
  // 政治人物相关（示例，实际使用时需要根据具体要求调整）
  // 注意：这里只放基础的、通用的敏感词

  // 政治敏感词汇
  '反动',
  '颠覆',
  '分裂国家',
  '台独',
  '藏独',
  '疆独',
  '港独',
  '邪教',
  '法轮功',
  '恐怖主义',
  '恐怖分子',
  '恐怖袭击',
  '极端主义',
  '民族仇恨',
  '种族歧视',
  '煽动',
  '暴乱',
  '造反',
  '推翻政府',
  '反政府',
  '政治敏感',
]

/**
 * 政治敏感词配置
 */
export const POLITICS_CONFIG = {
  category: 'politics' as const,
  words: POLITICS_WORDS,
  level: 'high' as const,
  action: 'block' as const,
}