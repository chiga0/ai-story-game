/**
 * 结局分享卡片生成模块
 * 用于生成精美的社交分享卡片
 */

// ============================================
// 类型定义
// ============================================

export interface ShareCardData {
  /** 剧本标题 */
  scriptTitle: string
  /** 结局标题 */
  endingTitle: string
  /** 结局描述 */
  endingDescription: string
  /** 游戏时长（分钟） */
  playTime: number
  /** 做出的选择数 */
  choices: number
  /** 获得的成就 */
  achievements: string[]
  /** 玩家名称（可选） */
  playerName?: string
  /** 剧本类型（用于配色） */
  genre?: string
  /** 剧本 ID */
  scriptId?: string
}

export interface GameRecord {
  /** 记录 ID */
  id: string
  /** 剧本 ID */
  scriptId: string
  /** 结局 ID */
  endingId: string
  /** 创建时间 */
  createdAt: number
  /** 分享数据 */
  shareData: ShareCardData
}

// ============================================
// 配色方案
// ============================================

const GENRE_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  悬疑: { primary: '#1a1a2e', secondary: '#16213e', accent: '#e94560' },
  奇幻: { primary: '#0f0e17', secondary: '#232946', accent: '#b8c1ec' },
  科幻: { primary: '#0d1b2a', secondary: '#1b263b', accent: '#00d4ff' },
  恐怖: { primary: '#0d0d0d', secondary: '#1a1a1a', accent: '#8b0000' },
  爱情: { primary: '#2d132c', secondary: '#4a1942', accent: '#ff6b9d' },
  冒险: { primary: '#1a1a2e', secondary: '#2d2d44', accent: '#ffd700' },
  default: { primary: '#1a1a2e', secondary: '#16213e', accent: '#4ade80' },
}

function getGenreColors(genre?: string) {
  if (!genre) return GENRE_COLORS.default
  return GENRE_COLORS[genre] || GENRE_COLORS.default
}

// ============================================
// Canvas 绘制工具
// ============================================

/**
 * 绘制圆角矩形
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * 绘制渐变背景
 */
function drawGradientBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: { primary: string; secondary: string }
) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, colors.primary)
  gradient.addColorStop(1, colors.secondary)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // 添加装饰性图案
  ctx.globalAlpha = 0.05
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const size = Math.random() * 100 + 50
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/**
 * 绘制文字（自动换行）
 */
function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split('')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY)
      line = words[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, currentY)
  return currentY + lineHeight
}

// ============================================
// 分享卡片生成
// ============================================

/**
 * 生成分享卡片（Canvas）
 * @param data 分享卡片数据
 * @returns Blob 对象
 */
export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  // 创建 Canvas
  const width = 1200
  const height = 630
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // 获取配色
  const colors = getGenreColors(data.genre)

  // 绘制背景
  drawGradientBackground(ctx, width, height, colors)

  // 绘制内容区域背景
  ctx.globalAlpha = 0.9
  roundRect(ctx, 40, 40, width - 80, height - 80, 20)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fill()
  ctx.globalAlpha = 1

  // 绘制左侧装饰线
  ctx.fillStyle = colors.accent
  ctx.fillRect(40, 40, 8, height - 80)

  // 绘制标题
  ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.fillText(data.scriptTitle, 80, 120)

  // 绘制结局标签
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = colors.accent
  ctx.fillText('🏆 结局', 80, 180)

  // 绘制结局标题
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(data.endingTitle, 80, 230)

  // 绘制结局描述
  ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  drawMultilineText(ctx, data.endingDescription, 80, 280, 500, 30)

  // 绘制统计数据区域
  const statsX = 650
  const statsY = 120

  // 游戏时长
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.textAlign = 'left'
  ctx.fillText('游戏时长', statsX, statsY)
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`${data.playTime} 分钟`, statsX, statsY + 45)

  // 选择次数
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.fillText('关键选择', statsX, statsY + 100)
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`${data.choices} 次`, statsX, statsY + 145)

  // 成就数量
  if (data.achievements.length > 0) {
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fillText('获得成就', statsX, statsY + 200)
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = colors.accent
    ctx.fillText(`${data.achievements.length} 个`, statsX, statsY + 245)
  }

  // 绘制成就列表（最多显示3个）
  if (data.achievements.length > 0) {
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    data.achievements.slice(0, 3).forEach((achievement, index) => {
      const y = statsY + 290 + index * 30
      ctx.fillText(`⭐ ${achievement}`, statsX, y)
    })
  }

  // 绘制底部品牌信息
  ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.textAlign = 'center'
  ctx.fillText('AI Story Game - 互动剧情游戏', width / 2, height - 50)

  // 玩家名称（可选）
  if (data.playerName) {
    ctx.textAlign = 'left'
    ctx.fillText(`玩家: ${data.playerName}`, 80, height - 50)
  }

  // 转换为 Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate share card'))
      }
    }, 'image/png')
  })
}

/**
 * 生成分享链接
 * @param gameRecord 游戏记录
 * @returns 分享链接
 */
export function generateShareUrl(gameRecord: GameRecord): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}/share/${gameRecord.id}`
}

/**
 * 编码分享数据到 URL
 * @param data 分享卡片数据
 * @returns Base64 编码的数据
 */
export function encodeShareData(data: ShareCardData): string {
  const jsonStr = JSON.stringify(data)
  if (typeof window !== 'undefined') {
    return btoa(encodeURIComponent(jsonStr))
  }
  // Node.js 环境
  return Buffer.from(jsonStr).toString('base64')
}

/**
 * 解码分享数据
 * @param encoded 编码的数据
 * @returns 分享卡片数据
 */
export function decodeShareData(encoded: string): ShareCardData | null {
  try {
    if (typeof window !== 'undefined') {
      const jsonStr = decodeURIComponent(atob(encoded))
      return JSON.parse(jsonStr)
    }
    // Node.js 环境
    const jsonStr = Buffer.from(encoded, 'base64').toString()
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

// ============================================
// 社交平台分享
// ============================================

export type SharePlatform = 'wechat' | 'weibo' | 'twitter' | 'copy'

interface ShareOptions {
  title: string
  text: string
  url: string
  image?: Blob
}

/**
 * 分享到社交平台
 * @param platform 目标平台
 * @param data 分享卡片数据
 */
export async function shareToPlatform(
  platform: SharePlatform,
  data: ShareCardData
): Promise<void> {
  const shareText = `我在「${data.scriptTitle}」中达成了「${data.endingTitle}」结局！游玩了 ${data.playTime} 分钟，做出了 ${data.choices} 次关键选择。`

  switch (platform) {
    case 'wechat': {
      // 微信分享需要生成二维码或调用微信 JS-SDK
      // 这里提供复制链接的方式
      await copyToClipboard(shareText)
      alert('已复制分享内容，请打开微信粘贴分享')
      break
    }

    case 'weibo': {
      const weiboUrl = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}`
      window.open(weiboUrl, '_blank')
      break
    }

    case 'twitter': {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
      window.open(twitterUrl, '_blank')
      break
    }

    case 'copy': {
      await copyToClipboard(shareText)
      alert('已复制到剪贴板')
      break
    }
  }
}

/**
 * 使用 Web Share API 分享
 * @param options 分享选项
 */
export async function nativeShare(options: ShareOptions): Promise<boolean> {
  if (!navigator.share) {
    return false
  }

  try {
    const shareData: ShareData = {
      title: options.title,
      text: options.text,
      url: options.url,
    }

    // 如果有图片且支持 File API
    if (options.image && navigator.canShare) {
      const file = new File([options.image], 'share.png', { type: 'image/png' })
      const shareDataWithFile = { ...shareData, files: [file] }
      
      if (navigator.canShare(shareDataWithFile)) {
        await navigator.share(shareDataWithFile)
        return true
      }
    }

    await navigator.share(shareData)
    return true
  } catch (error) {
    // 用户取消分享不算错误
    if ((error as Error).name === 'AbortError') {
      return true
    }
    console.error('Share failed:', error)
    return false
  }
}

/**
 * 复制文本到剪贴板
 */
async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
  } else {
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

/**
 * 下载分享卡片
 * @param blob 图片 Blob
 * @param filename 文件名
 */
export function downloadShareCard(blob: Blob, filename: string = 'share-card.png'): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ============================================
// 分享记录存储
// ============================================

const SHARE_STORAGE_KEY = 'ai-story-game-shares'

/**
 * 保存分享记录
 */
export function saveShareRecord(record: GameRecord): void {
  if (typeof window === 'undefined') return

  const records = getShareRecords()
  records.unshift(record)
  
  // 最多保存 50 条记录
  if (records.length > 50) {
    records.pop()
  }

  localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(records))
}

/**
 * 获取分享记录列表
 */
export function getShareRecords(): GameRecord[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(SHARE_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * 获取单个分享记录
 */
export function getShareRecord(id: string): GameRecord | null {
  const records = getShareRecords()
  return records.find((r) => r.id === id) || null
}

/**
 * 生成分享记录 ID
 */
export function generateShareId(): string {
  return `share-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * 创建分享记录
 */
export function createShareRecord(data: ShareCardData): GameRecord {
  return {
    id: generateShareId(),
    scriptId: data.scriptId || 'unknown',
    endingId: data.endingTitle,
    createdAt: Date.now(),
    shareData: data,
  }
}