/**
 * 用户 API Key 管理
 * 支持用户使用自己的 AI API Key
 */

// ============================================
// 类型定义
// ============================================

export interface UserAPIKeys {
  openai?: string
  anthropic?: string
  google?: string
  custom?: {
    name: string
    baseUrl: string
    key: string
  }
}

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'custom' | 'system'

export interface APIKeyStatus {
  provider: AIProvider
  hasKey: boolean
  maskedKey?: string
  lastChecked?: number
}

export interface APIKeyTestResult {
  success: boolean
  message: string
  latency?: number
}

// ============================================
// 存储键
// ============================================

const STORAGE_KEY = 'ai-story-game-api-keys'
const ENCRYPTION_KEY_NAME = 'ai-story-game-key'

// ============================================
// 加密工具
// ============================================

/**
 * 生成加密密钥
 */
async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  // 尝试从 IndexedDB 获取现有密钥
  const stored = localStorage.getItem(ENCRYPTION_KEY_NAME)
  if (stored) {
    const keyData = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0))
    return crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
  }

  // 生成新密钥
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const exportedKey = await crypto.subtle.exportKey('raw', key)
  const keyData = new Uint8Array(exportedKey)
  localStorage.setItem(ENCRYPTION_KEY_NAME, btoa(String.fromCharCode(...keyData)))
  return key
}

/**
 * 加密文本
 */
async function encrypt(text: string): Promise<string> {
  const key = await getOrCreateEncryptionKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encodedText = new TextEncoder().encode(text)

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodedText)

  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...combined))
}

/**
 * 解密文本
 */
async function decrypt(encryptedText: string): Promise<string> {
  try {
    const key = await getOrCreateEncryptionKey()
    const combined = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0))

    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)

    return new TextDecoder().decode(decrypted)
  } catch {
    // 解密失败，可能密钥已更改
    return ''
  }
}

// ============================================
// API Key 管理函数
// ============================================

/**
 * 保存 API Keys（加密存储）
 */
export async function saveAPIKeys(keys: UserAPIKeys): Promise<void> {
  const encryptedKeys: Record<string, string> = {}

  if (keys.openai) {
    encryptedKeys.openai = await encrypt(keys.openai)
  }
  if (keys.anthropic) {
    encryptedKeys.anthropic = await encrypt(keys.anthropic)
  }
  if (keys.google) {
    encryptedKeys.google = await encrypt(keys.google)
  }
  if (keys.custom) {
    encryptedKeys.custom = await encrypt(JSON.stringify(keys.custom))
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedKeys))
}

/**
 * 加载 API Keys（解密）
 */
export async function loadAPIKeys(): Promise<UserAPIKeys | null> {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    const encryptedKeys = JSON.parse(stored)
    const keys: UserAPIKeys = {}

    if (encryptedKeys.openai) {
      keys.openai = await decrypt(encryptedKeys.openai)
    }
    if (encryptedKeys.anthropic) {
      keys.anthropic = await decrypt(encryptedKeys.anthropic)
    }
    if (encryptedKeys.google) {
      keys.google = await decrypt(encryptedKeys.google)
    }
    if (encryptedKeys.custom) {
      const customStr = await decrypt(encryptedKeys.custom)
      if (customStr) {
        keys.custom = JSON.parse(customStr)
      }
    }

    return keys
  } catch {
    return null
  }
}

/**
 * 清除所有 API Keys
 */
export function clearAPIKeys(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(ENCRYPTION_KEY_NAME)
}

/**
 * 获取当前激活的 Provider
 */
export async function getActiveProvider(): Promise<AIProvider> {
  const keys = await loadAPIKeys()
  if (!keys) return 'system'

  if (keys.custom) return 'custom'
  if (keys.openai) return 'openai'
  if (keys.anthropic) return 'anthropic'
  if (keys.google) return 'google'

  return 'system'
}

/**
 * 获取 API Key 状态列表
 */
export async function getAPIKeyStatuses(): Promise<APIKeyStatus[]> {
  const keys = await loadAPIKeys()
  const statuses: APIKeyStatus[] = [
    {
      provider: 'openai',
      hasKey: !!keys?.openai,
      maskedKey: keys?.openai ? maskAPIKey(keys.openai) : undefined,
    },
    {
      provider: 'anthropic',
      hasKey: !!keys?.anthropic,
      maskedKey: keys?.anthropic ? maskAPIKey(keys.anthropic) : undefined,
    },
    {
      provider: 'google',
      hasKey: !!keys?.google,
      maskedKey: keys?.google ? maskAPIKey(keys.google) : undefined,
    },
    {
      provider: 'custom',
      hasKey: !!keys?.custom,
      maskedKey: keys?.custom?.key ? maskAPIKey(keys.custom.key) : undefined,
    },
  ]

  return statuses
}

/**
 * 掩码 API Key（只显示后 4 位）
 */
export function maskAPIKey(key: string): string {
  if (key.length <= 4) return '****'
  return '*'.repeat(key.length - 4) + key.slice(-4)
}

/**
 * 测试 API Key 连接
 */
export async function testAPIKey(
  provider: AIProvider,
  key: string,
  baseUrl?: string
): Promise<APIKeyTestResult> {
  const startTime = Date.now()

  try {
    let testUrl: string
    let headers: Record<string, string>

    switch (provider) {
      case 'openai':
        testUrl = 'https://api.openai.com/v1/models'
        headers = { Authorization: `Bearer ${key}` }
        break
      case 'anthropic':
        testUrl = 'https://api.anthropic.com/v1/messages'
        headers = {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        }
        break
      case 'google':
        testUrl = `https://generativelanguage.googleapis.com/v1/models?key=${key}`
        headers = {}
        break
      case 'custom':
        if (!baseUrl) {
          return { success: false, message: '自定义 Provider 需要提供 Base URL' }
        }
        testUrl = `${baseUrl.replace(/\/$/, '')}/v1/models`
        headers = { Authorization: `Bearer ${key}` }
        break
      default:
        return { success: false, message: '未知的 Provider' }
    }

    const response = await fetch(testUrl, {
      method: provider === 'anthropic' ? 'POST' : 'GET',
      headers,
      body:
        provider === 'anthropic'
          ? JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 1, messages: [] })
          : undefined,
    })

    const latency = Date.now() - startTime

    if (response.ok || response.status === 401) {
      // 401 也算连接成功（说明服务器响应了，只是可能 key 无效）
      if (response.status === 401) {
        return {
          success: false,
          message: 'API Key 无效或已过期',
          latency,
        }
      }
      return {
        success: true,
        message: '连接成功',
        latency,
      }
    }

    return {
      success: false,
      message: `服务器返回错误：${response.status}`,
      latency,
    }
  } catch (error) {
    return {
      success: false,
      message: `连接失败：${error instanceof Error ? error.message : '未知错误'}`,
      latency: Date.now() - startTime,
    }
  }
}

// ============================================
// Provider 配置
// ============================================

export const PROVIDER_CONFIG = {
  openai: {
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 等模型',
    keyPlaceholder: 'sk-...',
    baseUrl: 'https://api.openai.com',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Claude 系列模型',
    keyPlaceholder: 'sk-ant-...',
    baseUrl: 'https://api.anthropic.com',
    docsUrl: 'https://console.anthropic.com/',
  },
  google: {
    name: 'Google AI',
    description: 'Gemini 系列模型',
    keyPlaceholder: 'AIza...',
    baseUrl: 'https://generativelanguage.googleapis.com',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  custom: {
    name: '自定义 Provider',
    description: '兼容 OpenAI API 的自定义服务',
    keyPlaceholder: '输入你的 API Key',
    baseUrl: '',
    docsUrl: '',
  },
  system: {
    name: '系统默认',
    description: '使用应用配置的 AI 服务（百炼 GLM-5）',
    keyPlaceholder: '',
    baseUrl: '',
    docsUrl: '',
  },
} as const

// ============================================
// 同步版本（用于非异步上下文）
// ============================================

/**
 * 同步获取激活的 Provider（从缓存）
 */
export function getActiveProviderSync(): AIProvider {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return 'system'

    const keys = JSON.parse(stored)
    if (keys.custom) return 'custom'
    if (keys.openai) return 'openai'
    if (keys.anthropic) return 'anthropic'
    if (keys.google) return 'google'
    return 'system'
  } catch {
    return 'system'
  }
}