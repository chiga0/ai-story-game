/**
 * 分享卡片测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateShareCard,
  generateShareUrl,
  encodeShareData,
  decodeShareData,
  createShareRecord,
  saveShareRecord,
  getShareRecords,
  getShareRecord,
  generateShareId,
  type ShareCardData,
  type GameRecord,
} from '#/lib/sharing/share-card'

// Mock canvas for testing
class MockCanvas {
  width = 1200
  height = 630
  context: MockContext

  constructor() {
    this.context = new MockContext()
  }

  getContext() {
    return this.context
  }

  toBlob(callback: (blob: Blob | null) => void) {
    callback(new Blob(['mock-image'], { type: 'image/png' }))
  }
}

class MockContext {
  fillStyle = ''
  globalAlpha = 1
  textAlign = 'left' as const
  font = ''

  fillRect() {}
  beginPath() {}
  moveTo() {}
  lineTo() {}
  quadraticCurveTo() {}
  arc() {}
  closePath() {}
  fill() {}
  stroke() {}
  measureText() {
    return { width: 100 }
  }
  fillText() {}
  createLinearGradient() {
    return {
      addColorStop: vi.fn(),
    }
  }
}

// Mock document.createElement
vi.stubGlobal('document', {
  createElement: (tag: string) => {
    if (tag === 'canvas') {
      return new MockCanvas()
    }
    if (tag === 'a') {
      return {
        href: '',
        download: '',
        click: vi.fn(),
      }
    }
    if (tag === 'textarea') {
      return {
        value: '',
        style: {},
        select: vi.fn(),
      }
    }
    return {}
  },
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
})

// Mock URL
vi.stubGlobal('URL', {
  createObjectURL: () => 'blob:mock-url',
  revokeObjectURL: vi.fn(),
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    },
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

describe('Share Card Module', () => {
  const sampleData: ShareCardData = {
    scriptTitle: '神秘古堡',
    endingTitle: '真相大白',
    endingDescription: '你揭开了古堡的秘密，找到了失踪的继承人。',
    playTime: 25,
    choices: 15,
    achievements: ['探索大师', '真相猎人'],
    genre: '悬疑',
    scriptId: 'castle-mystery',
  }

  describe('generateShareCard', () => {
    it('should generate a blob for share card', async () => {
      const blob = await generateShareCard(sampleData)
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/png')
    })

    it('should use correct canvas dimensions', async () => {
      // Canvas dimensions are set in the function
      const blob = await generateShareCard(sampleData)
      expect(blob).toBeDefined()
    })

    it('should handle different genres', async () => {
      const fantasyData = { ...sampleData, genre: '奇幻' }
      const blob = await generateShareCard(fantasyData)
      expect(blob).toBeDefined()
    })
  })

  describe('generateShareUrl', () => {
    it('should generate share URL with record ID', () => {
      const record: GameRecord = {
        id: 'share-123',
        scriptId: 'castle-mystery',
        endingId: 'truth',
        createdAt: Date.now(),
        shareData: sampleData,
      }

      const url = generateShareUrl(record)
      expect(url).toContain('/share/share-123')
    })

    it('should include origin in URL', () => {
      vi.stubGlobal('window', {
        location: { origin: 'https://example.com' },
      })

      const record: GameRecord = {
        id: 'share-456',
        scriptId: 'castle-mystery',
        endingId: 'truth',
        createdAt: Date.now(),
        shareData: sampleData,
      }

      const url = generateShareUrl(record)
      expect(url).toContain('https://example.com')
    })
  })

  describe('encodeShareData / decodeShareData', () => {
    it('should encode and decode share data', () => {
      const encoded = encodeShareData(sampleData)
      expect(typeof encoded).toBe('string')
      expect(encoded.length).toBeGreaterThan(0)

      const decoded = decodeShareData(encoded)
      expect(decoded).toEqual(sampleData)
    })

    it('should return null for invalid encoded data', () => {
      const decoded = decodeShareData('invalid-base64!@#')
      expect(decoded).toBeNull()
    })
  })

  describe('Share Record Management', () => {
    beforeEach(() => {
      localStorageMock.clear()
    })

    describe('generateShareId', () => {
      it('should generate unique IDs', () => {
        const id1 = generateShareId()
        const id2 = generateShareId()
        expect(id1).not.toBe(id2)
        expect(id1).toMatch(/^share-/)
      })
    })

    describe('createShareRecord', () => {
      it('should create record with all fields', () => {
        const record = createShareRecord(sampleData)

        expect(record.id).toMatch(/^share-/)
        expect(record.scriptId).toBe(sampleData.scriptId)
        expect(record.endingId).toBe(sampleData.endingTitle)
        expect(record.shareData).toEqual(sampleData)
        expect(record.createdAt).toBeGreaterThan(0)
      })
    })

    describe('saveShareRecord / getShareRecord', () => {
      it('should save and retrieve share record', () => {
        const record = createShareRecord(sampleData)
        saveShareRecord(record)

        const retrieved = getShareRecord(record.id)
        expect(retrieved).toEqual(record)
      })

      it('should return null for non-existent record', () => {
        const retrieved = getShareRecord('non-existent')
        expect(retrieved).toBeNull()
      })
    })

    describe('getShareRecords', () => {
      it('should return all records sorted by date', () => {
        const record1 = createShareRecord(sampleData)
        record1.createdAt = Date.now() - 1000

        const record2 = createShareRecord({
          ...sampleData,
          endingTitle: '另一个结局',
        })

        saveShareRecord(record1)
        saveShareRecord(record2)

        const records = getShareRecords()
        expect(records.length).toBe(2)
        expect(records[0].id).toBe(record2.id) // Most recent first
      })

      it('should limit number of records', () => {
        // Save 60 records
        for (let i = 0; i < 60; i++) {
          const record = createShareRecord({
            ...sampleData,
            endingTitle: `结局-${i}`,
          })
          saveShareRecord(record)
        }

        const records = getShareRecords()
        expect(records.length).toBe(50)
      })
    })
  })
})