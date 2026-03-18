/**
 * 内容审核模块
 * 统一导出敏感词过滤和内容审核功能
 */

// 敏感词过滤
export {
  filterSensitiveWords,
  hasSensitiveWords,
  addCustomWords,
  removeCustomWords,
  clearCustomWords,
  getCustomWords,
  getEnabledCategories,
  setEnabledCategories,
  enableCategory,
  disableCategory,
  getHighestLevel,
  shouldBlockContent,
  saveConfig,
  loadConfig,
  resetConfig,
  type SensitiveCategory,
  type SensitiveLevel,
  type SensitiveAction,
  type SensitiveWordConfig,
  type DetectedWord,
  type FilterResult,
  type CustomWordEntry,
} from './sensitive-words'

// 内容审核
export {
  moderateText,
  moderateDialogue,
  moderateScene,
  moderateCharacter,
  moderateScript,
  createModerationHook,
  type IssueType,
  type ModerationIssue,
  type ModerationResult,
  type ModerationOptions,
  type ModerationHook,
} from './content-moderator'