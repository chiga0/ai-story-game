/**
 * 内容警告组件
 * 显示敏感内容检测结果并提供处理选项
 */

import { useState } from 'react'
import type { ModerationIssue, ModerationResult } from '../../lib/content/content-moderator'
import type { SensitiveCategory, SensitiveLevel } from '../../lib/content/sensitive-words'

// ============================================
// 类型定义
// ============================================

export interface ContentWarningProps {
  /** 审核结果 */
  result: ModerationResult
  /** 用户选择忽略警告继续 */
  onIgnore?: () => void
  /** 用户选择重新生成 */
  onRegenerate?: () => void
  /** 用户选择编辑内容 */
  onEdit?: () => void
  /** 是否允许忽略（只有 low 级别可以忽略） */
  allowIgnore?: boolean
  /** 是否正在处理 */
  isLoading?: boolean
}

// ============================================
// 辅助组件
// ============================================

/**
 * 严重等级标签
 */
function SeverityBadge({ level }: { level: SensitiveLevel }) {
  const config = {
    high: { bg: 'bg-red-100', text: 'text-red-700', label: '高' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '中' },
    low: { bg: 'bg-blue-100', text: 'text-blue-700', label: '低' },
  }

  const { bg, text, label } = config[level]

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  )
}

/**
 * 类别标签
 */
function CategoryBadge({ category }: { category: SensitiveCategory }) {
  const config: Record<SensitiveCategory, { bg: string; text: string; label: string }> = {
    politics: { bg: 'bg-purple-100', text: 'text-purple-700', label: '政治' },
    violence: { bg: 'bg-red-100', text: 'text-red-700', label: '暴力' },
    adult: { bg: 'bg-pink-100', text: 'text-pink-700', label: '成人' },
    gambling: { bg: 'bg-orange-100', text: 'text-orange-700', label: '赌博' },
    custom: { bg: 'bg-gray-100', text: 'text-gray-700', label: '自定义' },
  }

  const { bg, text, label } = config[category] || config.custom

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  )
}

/**
 * 问题列表项
 */
function IssueItem({ issue }: { issue: ModerationIssue }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-white p-3 shadow-sm">
      <SeverityBadge level={issue.severity} />
      {issue.category && <CategoryBadge category={issue.category} />}
      <span className="flex-1 text-sm text-[var(--sea-ink)]">{issue.message}</span>
    </div>
  )
}

// ============================================
// 主组件
// ============================================

export function ContentWarning({
  result,
  onIgnore,
  onRegenerate,
  onEdit,
  allowIgnore = false,
  isLoading = false,
}: ContentWarningProps) {
  const [showDetails, setShowDetails] = useState(false)

  // 如果审核通过且没有问题，不显示
  if (result.approved && result.issues.length === 0) {
    return null
  }

  // 计算是否可以忽略
  const hasHighSeverity = result.issues.some((i) => i.severity === 'high')
  const canIgnore = allowIgnore && !hasHighSeverity && result.approved

  // 统计
  const stats = {
    high: result.issues.filter((i) => i.severity === 'high').length,
    medium: result.issues.filter((i) => i.severity === 'medium').length,
    low: result.issues.filter((i) => i.severity === 'low').length,
  }

  return (
    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
      {/* 标题 */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
          <span className="text-xl">⚠️</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--sea-ink)]">
            {result.approved ? '内容审核提示' : '内容审核未通过'}
          </h3>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            {result.blockedReason || '检测到以下敏感内容，请处理后继续'}
          </p>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="mt-4 flex gap-4">
        {stats.high > 0 && (
          <div className="flex items-center gap-1 text-sm text-red-600">
            <span className="font-medium">{stats.high}</span>
            <span>高敏感</span>
          </div>
        )}
        {stats.medium > 0 && (
          <div className="flex items-center gap-1 text-sm text-yellow-600">
            <span className="font-medium">{stats.medium}</span>
            <span>中敏感</span>
          </div>
        )}
        {stats.low > 0 && (
          <div className="flex items-center gap-1 text-sm text-blue-600">
            <span className="font-medium">{stats.low}</span>
            <span>低敏感</span>
          </div>
        )}
      </div>

      {/* 展开/收起详情 */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-3 text-sm text-[var(--lagoon-deep)] hover:underline"
      >
        {showDetails ? '收起详情' : '查看详情'}
      </button>

      {/* 问题详情 */}
      {showDetails && (
        <div className="mt-4 space-y-2">
          {result.issues.map((issue, index) => (
            <IssueItem key={index} issue={issue} />
          ))}
        </div>
      )}

      {/* 警告信息 */}
      {result.warnings.length > 0 && (
        <div className="mt-4 rounded-lg bg-white p-3">
          <h4 className="text-sm font-medium text-[var(--sea-ink)]">提示信息</h4>
          <ul className="mt-2 space-y-1">
            {result.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-[var(--sea-ink-soft)]">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {!result.approved && onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="rounded-lg bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? '处理中...' : '重新生成'}
          </button>
        )}

        {onEdit && (
          <button
            onClick={onEdit}
            disabled={isLoading}
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--sea-ink)] hover:bg-[var(--surface)] disabled:opacity-50"
          >
            编辑内容
          </button>
        )}

        {canIgnore && onIgnore && (
          <button
            onClick={onIgnore}
            disabled={isLoading}
            className="rounded-lg border border-yellow-300 bg-white px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-100 disabled:opacity-50"
          >
            忽略警告继续
          </button>
        )}
      </div>

      {/* 说明 */}
      {!result.approved && (
        <p className="mt-3 text-xs text-[var(--sea-ink-soft)]">
          高敏感内容无法忽略，请修改内容后重新提交或重新生成
        </p>
      )}
    </div>
  )
}

// ============================================
// 审核状态组件
// ============================================

export interface ModerationStatusProps {
  isModerating: boolean
  result?: ModerationResult | null
}

/**
 * 显示审核状态的轻量组件
 */
export function ModerationStatus({ isModerating, result }: ModerationStatusProps) {
  if (isModerating) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--lagoon-deep)] border-t-transparent" />
        <span>正在审核内容...</span>
      </div>
    )
  }

  if (!result) {
    return null
  }

  if (result.approved && result.issues.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <span>✓</span>
        <span>内容审核通过</span>
      </div>
    )
  }

  if (result.approved && result.issues.length > 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-600">
        <span>⚠️</span>
        <span>内容审核通过，但有 {result.issues.length} 个提示</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-red-600">
      <span>✗</span>
      <span>内容审核未通过</span>
    </div>
  )
}