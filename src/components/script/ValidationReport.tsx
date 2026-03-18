/**
 * 验证报告组件
 * 显示剧本验证结果
 */

import type { ValidationResult, ValidationError, ValidationWarning } from '#/lib/game/script-validator'

interface ValidationReportProps {
  result: ValidationResult
  onFix?: (error: ValidationError) => void
}

export function ValidationReport({ result, onFix }: ValidationReportProps) {
  const hasErrors = result.errors.length > 0
  const hasWarnings = result.warnings.length > 0

  return (
    <div className="space-y-4">
      {/* 统计摘要 */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">剧本统计</h3>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <StatItem label="场景" value={result.stats.totalScenes} />
          <StatItem label="角色" value={result.stats.totalCharacters} />
          <StatItem label="结局" value={result.stats.totalEndings} />
          <StatItem label="选择" value={result.stats.totalChoices} />
          <StatItem label="可达场景" value={result.stats.reachableScenes} />
          <StatItem label="分支场景" value={result.stats.branchingScenes} />
          <StatItem
            label="平均选择"
            value={result.stats.averageChoicesPerScene}
            suffix=" 个/场景"
          />
          <StatItem
            label="状态"
            value={result.valid ? '✅ 有效' : '❌ 无效'}
            highlight={!result.valid}
          />
        </div>
      </div>

      {/* 错误列表 */}
      {hasErrors && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs dark:bg-red-900">
              ❌
            </span>
            发现 {result.errors.length} 个错误
          </h3>
          <ul className="space-y-2">
            {result.errors.map((error, index) => (
              <ErrorItem key={index} error={error} onFix={onFix} />
            ))}
          </ul>
        </div>
      )}

      {/* 警告列表 */}
      {hasWarnings && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/20">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-yellow-700 dark:text-yellow-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 text-xs dark:bg-yellow-900">
              ⚠️
            </span>
            发现 {result.warnings.length} 个警告
          </h3>
          <ul className="space-y-2">
            {result.warnings.map((warning, index) => (
              <WarningItem key={index} warning={warning} />
            ))}
          </ul>
        </div>
      )}

      {/* 全部通过 */}
      {!hasErrors && !hasWarnings && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
          <p className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs dark:bg-green-900">
              ✓
            </span>
            剧本验证通过，可以正常运行
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================
// 子组件
// ============================================

function StatItem({
  label,
  value,
  suffix = '',
  highlight = false,
}: {
  label: string
  value: string | number
  suffix?: string
  highlight?: boolean
}) {
  return (
    <div>
      <span className="text-[var(--sea-ink-soft)]">{label}</span>
      <p className={`font-medium ${highlight ? 'text-red-600' : 'text-[var(--sea-ink)]'}`}>
        {value}
        {suffix}
      </p>
    </div>
  )
}

function ErrorItem({
  error,
  onFix,
}: {
  error: ValidationError
  onFix?: (error: ValidationError) => void
}) {
  return (
    <li className="rounded-lg bg-white/50 p-3 text-sm dark:bg-transparent">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-mono text-red-700 dark:bg-red-900 dark:text-red-300">
            {error.code}
          </span>
          <p className="mt-1 text-red-800 dark:text-red-200">{error.message}</p>
          {error.location && (
            <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
              位置：{error.location}
            </p>
          )}
          {error.suggestion && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              建议：{error.suggestion}
            </p>
          )}
        </div>
        {onFix && (
          <button
            onClick={() => onFix(error)}
            className="shrink-0 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
          >
            修复
          </button>
        )}
      </div>
    </li>
  )
}

function WarningItem({ warning }: { warning: ValidationWarning }) {
  return (
    <li className="rounded-lg bg-white/50 p-3 text-sm dark:bg-transparent">
      <span className="inline-block rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-mono text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
        {warning.code}
      </span>
      <p className="mt-1 text-yellow-800 dark:text-yellow-200">{warning.message}</p>
      {warning.location && (
        <p className="mt-0.5 text-xs text-yellow-600 dark:text-yellow-400">位置：{warning.location}</p>
      )}
    </li>
  )
}

// ============================================
// 简洁版验证指示器
// ============================================

interface ValidationIndicatorProps {
  result: ValidationResult | null
  compact?: boolean
}

export function ValidationIndicator({ result, compact = false }: ValidationIndicatorProps) {
  if (!result) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
        未验证
      </span>
    )
  }

  if (result.valid) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
        ✓ {compact ? '' : '验证通过'}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
      ✗ {compact ? `${result.errors.length} 错误` : `${result.errors.length} 个错误`}
    </span>
  )
}