/**
 * 剧本创建页面
 * 用户选择主题、难度、时长，AI 生成完整剧本
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import {
  generateScript,
  validateOptions,
  getEstimatedTime,
  THEME_CONFIG,
  DIFFICULTY_CONFIG,
  DURATION_CONFIG,
  type ScriptGeneratorOptions,
  type GenerationProgress,
} from '#/lib/ai/script-generator'
import { validateScript } from '#/lib/game/script-validator'
import type { Script } from '#/types'
import { ValidationReport } from '#/components/script/ValidationReport'
import { ContentWarning, ModerationStatus } from '#/components/content/ContentWarning'
import type { ModerationResult } from '#/lib/content/content-moderator'

export const Route = createFileRoute('/create')({
  component: CreatePage,
})

type Step = 'config' | 'generating' | 'preview' | 'error'

function CreatePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('config')
  const [options, setOptions] = useState<ScriptGeneratorOptions>({
    theme: 'mystery',
    difficulty: 'normal',
    duration: 'medium',
    customElements: [],
  })
  const [customInput, setCustomInput] = useState('')
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [generatedScript, setGeneratedScript] = useState<Script | null>(null)
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateScript> | null>(null)
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 处理选项变更
  const handleOptionChange = useCallback(
    (key: keyof ScriptGeneratorOptions, value: string | string[]) => {
      setOptions((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  // 添加自定义元素
  const handleAddCustomElement = useCallback(() => {
    if (customInput.trim() && options.customElements && options.customElements.length < 5) {
      setOptions((prev) => ({
        ...prev,
        customElements: [...(prev.customElements || []), customInput.trim()],
      }))
      setCustomInput('')
    }
  }, [customInput, options.customElements])

  // 移除自定义元素
  const handleRemoveCustomElement = useCallback((index: number) => {
    setOptions((prev) => ({
      ...prev,
      customElements: prev.customElements?.filter((_, i) => i !== index),
    }))
  }, [])

  // 开始生成
  const handleGenerate = useCallback(async () => {
    const errors = validateOptions(options)
    if (errors.length > 0) {
      setError(errors.join('；'))
      return
    }

    setStep('generating')
    setError(null)
    setProgress({ step: 'outline', message: '准备开始...', progress: 0 })
    setModerationResult(null)

    try {
      const script = await generateScript(options, (p) => {
        setProgress(p)
        // 保存审核结果
        if (p.moderationResult) {
          setModerationResult(p.moderationResult)
        }
      })

      // 验证剧本
      const validation = validateScript(script)
      setValidationResult(validation)
      setGeneratedScript(script)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败')
      setStep('error')
    }
  }, [options])

  // 保存剧本
  const handleSave = useCallback(() => {
    if (!generatedScript) return

    // 保存到 localStorage
    const savedScripts = JSON.parse(localStorage.getItem('custom-scripts') || '[]')
    savedScripts.push(generatedScript)
    localStorage.setItem('custom-scripts', JSON.stringify(savedScripts))

    // 跳转到剧本库
    navigate({ to: '/scripts' })
  }, [generatedScript, navigate])

  // 重新生成
  const handleRegenerate = useCallback(() => {
    setStep('config')
    setGeneratedScript(null)
    setValidationResult(null)
    setModerationResult(null)
    setProgress(null)
    setError(null)
  }, [])

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10">
        <h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
          创建剧本
        </h1>
        <p className="mb-8 text-[var(--sea-ink-soft)]">
          选择主题、难度和时长，AI 将为你生成一个完整可玩的剧本
        </p>

        {/* 配置步骤 */}
        {step === 'config' && (
          <div className="space-y-8">
            {/* 主题选择 */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[var(--sea-ink)]">
                选择主题
              </label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(THEME_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleOptionChange('theme', key)}
                    className={`rounded-xl border p-4 text-left transition ${
                      options.theme === key
                        ? 'border-[var(--lagoon-deep)] bg-[rgba(79,184,178,0.1)]'
                        : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--lagoon-deep)]'
                    }`}
                  >
                    <span className="text-2xl">{config.icon}</span>
                    <h3 className="mt-2 font-semibold text-[var(--sea-ink)]">{config.name}</h3>
                    <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">{config.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 难度选择 */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[var(--sea-ink)]">
                选择难度
              </label>
              <div className="flex flex-wrap gap-3">
                {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleOptionChange('difficulty', key)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      options.difficulty === key
                        ? 'bg-[var(--lagoon-deep)] text-white'
                        : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] hover:border-[var(--lagoon-deep)]'
                    }`}
                  >
                    {config.name}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
                {DIFFICULTY_CONFIG[options.difficulty].description}
              </p>
            </div>

            {/* 时长选择 */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[var(--sea-ink)]">
                选择时长
              </label>
              <div className="flex flex-wrap gap-3">
                {Object.entries(DURATION_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleOptionChange('duration', key)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      options.duration === key
                        ? 'bg-[var(--lagoon-deep)] text-white'
                        : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)] hover:border-[var(--lagoon-deep)]'
                    }`}
                  >
                    {config.name} ({config.duration}分钟)
                  </button>
                ))}
              </div>
            </div>

            {/* 自定义元素 */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[var(--sea-ink)]">
                自定义元素（可选，最多5个）
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomElement()}
                  placeholder="例如：神秘的古书、失落的宝藏"
                  className="flex-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon-deep)] focus:outline-none"
                />
                <button
                  onClick={handleAddCustomElement}
                  disabled={!customInput.trim() || (options.customElements?.length || 0) >= 5}
                  className="rounded-lg bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  添加
                </button>
              </div>
              {options.customElements && options.customElements.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {options.customElements.map((element, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-sm text-[var(--sea-ink)]"
                    >
                      {element}
                      <button
                        onClick={() => handleRemoveCustomElement(index)}
                        className="text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 预估时间和开始按钮 */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
              <p className="text-sm text-[var(--sea-ink-soft)]">
                预估生成时间：约 {getEstimatedTime(options)} 秒
              </p>
              <button
                onClick={handleGenerate}
                className="rounded-full bg-[var(--lagoon-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90"
              >
                开始生成 ✨
              </button>
            </div>
          </div>
        )}

        {/* 生成进度 */}
        {step === 'generating' && progress && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(79,184,178,0.1)]">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--sea-ink)]">{progress.message}</h2>
              <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                {progress.step === 'outline' && '正在构思故事框架...'}
                {progress.step === 'characters' && '正在创建角色...'}
                {progress.step === 'scenes' && '正在构建场景...'}
                {progress.step === 'endings' && '正在设计结局...'}
                {progress.step === 'moderation' && '正在进行内容审核...'}
                {progress.step === 'validation' && '正在验证剧本...'}
              </p>
            </div>

            {/* 进度条 */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="h-full rounded-full bg-[var(--lagoon-deep)] transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>

            {/* 审核状态 */}
            {progress.step === 'moderation' && (
              <div className="flex justify-center">
                <ModerationStatus isModerating={true} />
              </div>
            )}

            {/* 步骤指示器 */}
            <div className="flex justify-between text-sm">
              {['大纲', '角色', '场景', '结局', '审核', '完成'].map((label, index) => {
                const stepProgress = index * 16
                const isActive = progress.progress >= stepProgress
                return (
                  <div
                    key={label}
                    className={`flex flex-col items-center ${
                      isActive ? 'text-[var(--lagoon-deep)]' : 'text-[var(--sea-ink-soft)]'
                    }`}
                  >
                    <span
                      className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full ${
                        isActive ? 'bg-[var(--lagoon-deep)] text-white' : 'bg-[var(--line)]'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 预览 */}
        {step === 'preview' && generatedScript && (
          <div className="space-y-6">
            {/* 内容审核结果 */}
            {moderationResult && moderationResult.issues.length > 0 && (
              <ContentWarning
                result={moderationResult}
                onRegenerate={handleRegenerate}
                allowIgnore={true}
              />
            )}

            {/* 验证结果 */}
            {validationResult && !validationResult.valid && (
              <ValidationReport result={validationResult} />
            )}

            {/* 剧本预览 */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6">
              <h2 className="text-xl font-semibold text-[var(--sea-ink)]">{generatedScript.title}</h2>
              <p className="mt-2 text-[var(--sea-ink-soft)]">{generatedScript.description}</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <span className="text-sm text-[var(--sea-ink-soft)]">类型</span>
                  <p className="font-medium text-[var(--sea-ink)]">{generatedScript.genre}</p>
                </div>
                <div>
                  <span className="text-sm text-[var(--sea-ink-soft)]">时长</span>
                  <p className="font-medium text-[var(--sea-ink)]">{generatedScript.duration} 分钟</p>
                </div>
                <div>
                  <span className="text-sm text-[var(--sea-ink-soft)]">场景数</span>
                  <p className="font-medium text-[var(--sea-ink)]">
                    {Object.keys(generatedScript.scenes).length} 个
                  </p>
                </div>
              </div>

              {/* 角色列表 */}
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-[var(--sea-ink)]">角色</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(generatedScript.characters).map((char) => (
                    <span
                      key={char.id}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white px-3 py-1 text-sm text-[var(--sea-ink)]"
                    >
                      {char.avatar} {char.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* 结局数量 */}
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-[var(--sea-ink)]">结局</h3>
                <p className="text-[var(--sea-ink-soft)]">
                  {generatedScript.endings.length} 个不同结局等待你发现
                </p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                className="rounded-full bg-[var(--lagoon-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90"
              >
                保存到剧本库
              </button>
              <button
                onClick={handleRegenerate}
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon-deep)]"
              >
                重新生成
              </button>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {step === 'error' && (
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--sea-ink)]">生成失败</h2>
            <p className="mt-2 text-[var(--sea-ink-soft)]">{error}</p>
            <button
              onClick={handleRegenerate}
              className="mt-6 rounded-full bg-[var(--lagoon-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90"
            >
              重新尝试
            </button>
          </div>
        )}
      </section>
    </main>
  )
}