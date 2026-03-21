/**
 * 设置页面
 * 管理用户 API Key 和其他设置
 */

import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useCallback, useEffect } from 'react'
import {
  saveAPIKeys,
  loadAPIKeys,
  testAPIKey,
  getActiveProvider,
  getAPIKeyStatuses,
  clearAPIKeys,
  PROVIDER_CONFIG,
  type UserAPIKeys,
  type AIProvider,
  type APIKeyStatus,
  type APIKeyTestResult,
} from '#/lib/user/api-keys'
import {
  getEnabledCategories,
  setEnabledCategories,
  getCustomWords,
  addCustomWords,
  removeCustomWords,
  clearCustomWords,
  saveConfig,
  resetConfig,
  type SensitiveCategory,
  type SensitiveLevel,
} from '#/lib/content/sensitive-words'

type Tab = 'api' | 'content' | 'general' | 'about'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => {
    return {
      tab: search.tab as Tab | undefined,
    }
  },
})

// 敏感词类别配置
const CATEGORY_CONFIG: Record<SensitiveCategory, { name: string; description: string }> = {
  politics: { name: '政治敏感', description: '政治相关敏感内容' },
  violence: { name: '暴力内容', description: '暴力、血腥、恐怖内容' },
  adult: { name: '成人内容', description: '色情、成人相关内容' },
  gambling: { name: '赌博相关', description: '赌博、博彩相关内容' },
  custom: { name: '自定义', description: '用户自定义敏感词' },
}

function SettingsPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/settings' })
  const initialTab = search.tab || 'api'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [activeProvider, setActiveProvider] = useState<AIProvider>('system')
  const [keyStatuses, setKeyStatuses] = useState<APIKeyStatus[]>([])
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null)
  const [editingKey, setEditingKey] = useState('')
  const [customBaseUrl, setCustomBaseUrl] = useState('')
  const [customName, setCustomName] = useState('')
  const [testResult, setTestResult] = useState<APIKeyTestResult | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 内容审核设置状态
  const [enabledCategories, setEnabledCategoriesState] = useState<SensitiveCategory[]>([])
  const [customWordInput, setCustomWordInput] = useState('')
  const [customWordLevel, setCustomWordLevel] = useState<SensitiveLevel>('medium')
  const [customWordsList, setCustomWordsList] = useState<Array<{ word: string; level: SensitiveLevel }>>([])

  // 加载初始数据
  useEffect(() => {
    loadData()
    loadModerationSettings()
  }, [])

  // 同步 URL 参数
  useEffect(() => {
    if (search.tab && search.tab !== activeTab) {
      setActiveTab(search.tab)
    }
  }, [search.tab])

  // 切换标签页时更新 URL
  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab)
    navigate({ search: { tab } })
  }, [navigate])

  const loadData = async () => {
    const provider = await getActiveProvider()
    setActiveProvider(provider)
    const statuses = await getAPIKeyStatuses()
    setKeyStatuses(statuses)
  }

  // 加载内容审核设置
  const loadModerationSettings = () => {
    const categories = getEnabledCategories()
    setEnabledCategoriesState(categories)
    const words = getCustomWords()
    setCustomWordsList(words.map((w) => ({ word: w.word, level: w.level })))
  }

  // 开始编辑
  const startEditing = useCallback((provider: AIProvider) => {
    setEditingProvider(provider)
    setEditingKey('')
    setCustomBaseUrl('')
    setCustomName('')
    setTestResult(null)
    setMessage(null)
  }, [])

  // 取消编辑
  const cancelEditing = useCallback(() => {
    setEditingProvider(null)
    setEditingKey('')
    setCustomBaseUrl('')
    setCustomName('')
    setTestResult(null)
  }, [])

  // 测试连接
  const handleTest = useCallback(async () => {
    if (!editingKey.trim()) {
      setMessage({ type: 'error', text: '请输入 API Key' })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    const result = await testAPIKey(editingProvider!, editingKey, customBaseUrl || undefined)
    setTestResult(result)
    setIsTesting(false)
  }, [editingKey, editingProvider, customBaseUrl])

  // 保存 Key
  const handleSave = useCallback(async () => {
    if (!editingKey.trim()) {
      setMessage({ type: 'error', text: '请输入 API Key' })
      return
    }

    setIsSaving(true)

    try {
      const keys = (await loadAPIKeys()) || {}

      if (editingProvider === 'custom') {
        keys.custom = {
          name: customName || 'Custom Provider',
          baseUrl: customBaseUrl || 'https://api.openai.com',
          key: editingKey,
        }
      } else {
        keys[editingProvider as keyof UserAPIKeys] = editingKey
      }

      await saveAPIKeys(keys)
      setMessage({ type: 'success', text: 'API Key 已保存' })
      cancelEditing()
      loadData()
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败' })
    } finally {
      setIsSaving(false)
    }
  }, [editingKey, editingProvider, customName, customBaseUrl, cancelEditing])

  // 删除 Key
  const handleDelete = useCallback(
    async (provider: AIProvider) => {
      const keys = (await loadAPIKeys()) || {}
      delete keys[provider as keyof UserAPIKeys]
      await saveAPIKeys(keys)
      loadData()
      setMessage({ type: 'success', text: '已删除' })
    },
    []
  )

  // 清除所有
  const handleClearAll = useCallback(async () => {
    if (confirm('确定要清除所有 API Key 吗？')) {
      clearAPIKeys()
      loadData()
      setMessage({ type: 'success', text: '已清除所有 API Key' })
    }
  }, [])

  // 切换敏感词类别
  const toggleCategory = useCallback((category: SensitiveCategory) => {
    const newCategories = enabledCategories.includes(category)
      ? enabledCategories.filter((c) => c !== category)
      : [...enabledCategories, category]
    setEnabledCategoriesState(newCategories)
    setEnabledCategories(newCategories)
    saveConfig()
  }, [enabledCategories])

  // 添加自定义敏感词
  const handleAddCustomWord = useCallback(() => {
    if (!customWordInput.trim()) {
      setMessage({ type: 'error', text: '请输入敏感词' })
      return
    }
    addCustomWords([customWordInput.trim()], customWordLevel)
    saveConfig()
    loadModerationSettings()
    setCustomWordInput('')
    setMessage({ type: 'success', text: '已添加敏感词' })
  }, [customWordInput, customWordLevel])

  // 删除自定义敏感词
  const handleRemoveCustomWord = useCallback((word: string) => {
    removeCustomWords([word])
    saveConfig()
    loadModerationSettings()
    setMessage({ type: 'success', text: '已删除敏感词' })
  }, [])

  // 清空所有自定义敏感词
  const handleClearCustomWords = useCallback(() => {
    if (confirm('确定要清空所有自定义敏感词吗？')) {
      clearCustomWords()
      saveConfig()
      loadModerationSettings()
      setMessage({ type: 'success', text: '已清空自定义敏感词' })
    }
  }, [])

  // 重置内容审核设置
  const handleResetModeration = useCallback(() => {
    if (confirm('确定要重置内容审核设置为默认值吗？')) {
      resetConfig()
      loadModerationSettings()
      setMessage({ type: 'success', text: '已重置为默认设置' })
    }
  }, [])

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10">
        <h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
          设置
        </h1>
        <p className="mb-8 text-[var(--sea-ink-soft)]">管理你的 API Key 和应用设置</p>

        {/* 标签页 */}
        <div className="mb-6 flex gap-2 border-b border-[var(--line)] pb-2">
          {[
            { key: 'api', label: 'API Key' },
            { key: 'content', label: '内容审核' },
            { key: 'general', label: '通用' },
            { key: 'about', label: '关于' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key as Tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-[var(--lagoon-deep)] text-white'
                  : 'text-[var(--sea-ink-soft)] hover:bg-[var(--surface)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 消息提示 */}
        {message && (
          <div
            className={`mb-4 rounded-lg p-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* API Key 设置 */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            {/* 当前激活的 Provider */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <span className="text-sm text-[var(--sea-ink-soft)]">当前使用</span>
              <p className="mt-1 text-lg font-semibold text-[var(--sea-ink)]">
                {PROVIDER_CONFIG[activeProvider].name}
              </p>
              <p className="text-sm text-[var(--sea-ink-soft)]">
                {PROVIDER_CONFIG[activeProvider].description}
              </p>
            </div>

            {/* Provider 列表 */}
            <div className="space-y-3">
              {(Object.keys(PROVIDER_CONFIG) as AIProvider[]).map((provider) => {
                const config = PROVIDER_CONFIG[provider]
                const status = keyStatuses.find((s) => s.provider === provider)
                const isEditing = editingProvider === provider

                return (
                  <div
                    key={provider}
                    className={`rounded-xl border p-4 transition ${
                      activeProvider === provider
                        ? 'border-[var(--lagoon-deep)] bg-[rgba(79,184,178,0.05)]'
                        : 'border-[var(--line)] bg-[var(--surface)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--sea-ink)]">{config.name}</h3>
                        <p className="text-sm text-[var(--sea-ink-soft)]">{config.description}</p>
                        {status?.hasKey && status.maskedKey && (
                          <p className="mt-1 font-mono text-xs text-[var(--sea-ink-soft)]">
                            {status.maskedKey}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {provider !== 'system' && (
                          <>
                            <button
                              onClick={() => startEditing(provider)}
                              className="rounded-lg bg-[var(--lagoon-deep)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                            >
                              {status?.hasKey ? '编辑' : '添加'}
                            </button>
                            {status?.hasKey && (
                              <button
                                onClick={() => handleDelete(provider)}
                                className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                删除
                              </button>
                            )}
                          </>
                        )}
                        {provider === 'system' && (
                          <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500">
                            默认
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 编辑表单 */}
                    {isEditing && (
                      <div className="mt-4 space-y-3 border-t border-[var(--line)] pt-4">
                        {provider === 'custom' && (
                          <>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-[var(--sea-ink)]">
                                服务名称
                              </label>
                              <input
                                type="text"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                placeholder="My Custom API"
                                className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:border-[var(--lagoon-deep)] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-[var(--sea-ink)]">
                                Base URL
                              </label>
                              <input
                                type="url"
                                value={customBaseUrl}
                                onChange={(e) => setCustomBaseUrl(e.target.value)}
                                placeholder="https://api.example.com"
                                className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:border-[var(--lagoon-deep)] focus:outline-none"
                              />
                            </div>
                          </>
                        )}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--sea-ink)]">
                            API Key
                          </label>
                          <input
                            type="password"
                            value={editingKey}
                            onChange={(e) => setEditingKey(e.target.value)}
                            placeholder={config.keyPlaceholder}
                            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:border-[var(--lagoon-deep)] focus:outline-none"
                          />
                        </div>

                        {/* 测试结果 */}
                        {testResult && (
                          <div
                            className={`rounded-lg p-3 text-sm ${
                              testResult.success
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {testResult.message}
                            {testResult.latency && (
                              <span className="ml-2 text-xs">({testResult.latency}ms)</span>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={handleTest}
                            disabled={isTesting}
                            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--sea-ink)] hover:bg-[var(--surface)] disabled:opacity-50"
                          >
                            {isTesting ? '测试中...' : '测试连接'}
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-lg bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                          >
                            {isSaving ? '保存中...' : '保存'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--sea-ink-soft)] hover:bg-[var(--surface)]"
                          >
                            取消
                          </button>
                        </div>

                        {config.docsUrl && (
                          <a
                            href={config.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs text-[var(--lagoon-deep)] hover:underline"
                          >
                            获取 API Key →
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 清除所有 */}
            <div className="border-t border-[var(--line)] pt-6">
              <button
                onClick={handleClearAll}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                清除所有 API Key
              </button>
              <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">
                API Key 仅存储在本地浏览器中，不会上传到服务器
              </p>
            </div>
          </div>
        )}

        {/* 内容审核设置 */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* 敏感词类别开关 */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <h3 className="font-semibold text-[var(--sea-ink)]">敏感词类别</h3>
              <p className="mt-1 mb-4 text-sm text-[var(--sea-ink-soft)]">
                选择需要检测的敏感词类别
              </p>
              <div className="space-y-3">
                {(['politics', 'violence', 'adult', 'gambling'] as SensitiveCategory[]).map(
                  (category) => {
                    const config = CATEGORY_CONFIG[category]
                    const isEnabled = enabledCategories.includes(category)
                    return (
                      <div
                        key={category}
                        className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-white p-3"
                      >
                        <div>
                          <p className="font-medium text-[var(--sea-ink)]">{config.name}</p>
                          <p className="text-sm text-[var(--sea-ink-soft)]">{config.description}</p>
                        </div>
                        <button
                          onClick={() => toggleCategory(category)}
                          className={`relative h-6 w-11 rounded-full transition-colors ${
                            isEnabled ? 'bg-[var(--lagoon-deep)]' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                              isEnabled ? 'left-6' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    )
                  }
                )}
              </div>
            </div>

            {/* 自定义敏感词 */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <h3 className="font-semibold text-[var(--sea-ink)]">自定义敏感词</h3>
              <p className="mt-1 mb-4 text-sm text-[var(--sea-ink-soft)]">
                添加需要额外检测的敏感词
              </p>

              {/* 添加表单 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customWordInput}
                  onChange={(e) => setCustomWordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomWord()}
                  placeholder="输入敏感词"
                  className="flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:border-[var(--lagoon-deep)] focus:outline-none"
                />
                <select
                  value={customWordLevel}
                  onChange={(e) => setCustomWordLevel(e.target.value as SensitiveLevel)}
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:border-[var(--lagoon-deep)] focus:outline-none"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
                <button
                  onClick={handleAddCustomWord}
                  disabled={!customWordInput.trim()}
                  className="rounded-lg bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  添加
                </button>
              </div>

              {/* 自定义词列表 */}
              {customWordsList.length > 0 && (
                <div className="mt-4 space-y-2">
                  {customWordsList.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-white p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--sea-ink)]">{item.word}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            item.level === 'high'
                              ? 'bg-red-100 text-red-700'
                              : item.level === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {item.level === 'high' ? '高' : item.level === 'medium' ? '中' : '低'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveCustomWord(item.word)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {customWordsList.length === 0 && (
                <p className="mt-4 text-sm text-[var(--sea-ink-soft)]">暂无自定义敏感词</p>
              )}

              {/* 清空按钮 */}
              {customWordsList.length > 0 && (
                <button
                  onClick={handleClearCustomWords}
                  className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  清空所有
                </button>
              )}
            </div>

            {/* 重置设置 */}
            <div className="border-t border-[var(--line)] pt-6">
              <button
                onClick={handleResetModeration}
                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--sea-ink)] hover:bg-gray-100"
              >
                重置为默认设置
              </button>
              <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">
                重置将恢复默认的敏感词类别，并清空所有自定义敏感词
              </p>
            </div>
          </div>
        )}

        {/* 通用设置 */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <h3 className="font-semibold text-[var(--sea-ink)]">主题</h3>
              <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                点击右上角的主题切换按钮切换深色/浅色模式
              </p>
            </div>

            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <h3 className="font-semibold text-[var(--sea-ink)]">数据存储</h3>
              <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                所有数据（存档、设置、自定义剧本）都存储在本地浏览器中
              </p>
              <button
                onClick={() => {
                  localStorage.clear()
                  setMessage({ type: 'success', text: '已清除所有本地数据' })
                }}
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                清除所有本地数据
              </button>
            </div>
          </div>
        )}

        {/* 关于 */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <h3 className="font-semibold text-[var(--sea-ink)]">AI Story Game</h3>
              <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">版本 1.0.0</p>
              <p className="mt-4 text-sm text-[var(--sea-ink-soft)]">
                一个 AI 驱动的互动故事游戏平台。你可以探索预设剧本，或使用 AI 创建属于自己的独特故事。
              </p>
            </div>

            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <h3 className="font-semibold text-[var(--sea-ink)]">技术栈</h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--sea-ink-soft)]">
                <li>• TanStack Router + Start</li>
                <li>• React 19</li>
                <li>• Tailwind CSS</li>
                <li>• AI SDK</li>
              </ul>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}