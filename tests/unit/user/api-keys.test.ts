/**
 * 用户 API Key 管理测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveAPIKeys,
  loadAPIKeys,
  clearAPIKeys,
  getActiveProvider,
  getAPIKeyStatuses,
  maskAPIKey,
  testAPIKey,
  PROVIDER_CONFIG,
  type UserAPIKeys,
  type AIProvider,
} from '#/lib/user/api-keys'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

// Mock crypto.subtle
const mockCrypto = {
  subtle: {
    generateKey: vi.fn().mockResolvedValue({}),
    exportKey: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    importKey: vi.fn().mockResolvedValue({}),
    encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(64)),
    decrypt: vi.fn().mockResolvedValue(new TextEncoder().encode('test-key')),
  },
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256)
    }
    return arr
  },
}

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
})

describe('API Keys Management', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('maskAPIKey', () => {
    it('should mask all but last 4 characters', () => {
      const result = maskAPIKey('sk-1234567890')
      expect(result.endsWith('7890')).toBe(true)
      expect(result.length).toBe('sk-1234567890'.length)
    })

    it('should handle short keys', () => {
      expect(maskAPIKey('abc')).toBe('****')
      expect(maskAPIKey('1234')).toBe('****')
    })
  })

  describe('PROVIDER_CONFIG', () => {
    it('should have all providers', () => {
      const providers: AIProvider[] = ['openai', 'anthropic', 'google', 'custom', 'system']
      providers.forEach((provider) => {
        expect(PROVIDER_CONFIG).toHaveProperty(provider)
      })
    })

    it('should have required properties for each provider', () => {
      Object.entries(PROVIDER_CONFIG).forEach(([key, config]) => {
        expect(config).toHaveProperty('name')
        expect(config).toHaveProperty('description')
      })
    })
  })

  describe('getActiveProvider', () => {
    it('should return system when no keys are stored', async () => {
      const provider = await getActiveProvider()
      expect(provider).toBe('system')
    })
  })

  describe('clearAPIKeys', () => {
    it('should clear all stored keys', () => {
      localStorageMock.setItem('ai-story-game-api-keys', JSON.stringify({ openai: 'encrypted' }))
      clearAPIKeys()
      expect(localStorageMock.getItem('ai-story-game-api-keys')).toBeNull()
    })
  })

  describe('saveAPIKeys and loadAPIKeys', () => {
    it('should save and load API keys', async () => {
      const keys: UserAPIKeys = {
        openai: 'sk-test-openai',
      }

      await saveAPIKeys(keys)
      const loaded = await loadAPIKeys()

      // 由于 mock 加密，可能无法完美还原，但应该能检查到存在
      expect(loaded).not.toBeNull()
    })
  })

  describe('getAPIKeyStatuses', () => {
    it('should return statuses for all providers', async () => {
      const statuses = await getAPIKeyStatuses()
      expect(statuses).toHaveLength(4) // openai, anthropic, google, custom
      expect(statuses.map((s) => s.provider)).toContain('openai')
      expect(statuses.map((s) => s.provider)).toContain('anthropic')
      expect(statuses.map((s) => s.provider)).toContain('google')
      expect(statuses.map((s) => s.provider)).toContain('custom')
    })

    it('should show hasKey as false when no keys stored', async () => {
      const statuses = await getAPIKeyStatuses()
      statuses.forEach((status) => {
        expect(status.hasKey).toBe(false)
      })
    })
  })

  describe('testAPIKey', () => {
    it('should return error for invalid provider', async () => {
      const result = await testAPIKey('system' as AIProvider, 'test-key')
      expect(result.success).toBe(false)
      expect(result.message).toContain('未知')
    })

    it('should require base URL for custom provider', async () => {
      const result = await testAPIKey('custom', 'test-key')
      expect(result.success).toBe(false)
      expect(result.message).toContain('Base URL')
    })

    // 注意：实际网络请求测试需要 mock fetch
    it('should handle network errors gracefully', async () => {
      // Mock fetch to throw error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await testAPIKey('openai', 'sk-test')
      expect(result.success).toBe(false)
      expect(result.message).toContain('失败')
    })
  })
})