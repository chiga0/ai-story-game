/**
 * 结局分享卡片生成模块
 * 用于生成精美的社交分享卡片
 */

// ============================================
// 类型定义
// ============================================

export interface KeyChoice {
  /** 选择文本 */
  text: string
  /** 选择影响描述 */
  impact?: string
}

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
  /** 关键选择路径（新增） */
  keyChoices?: KeyChoice[]
  /** 结局类型标签（如"好结局"、"坏结局"） */
  endingTag?: string
  /** 角色关系摘要 */
  relationshipSummary?: string
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
 * 绘制选择路径（带箭头连接）
 */
function drawChoicePath(
  ctx: CanvasRenderingContext2D,
  choices: KeyChoice[],
  x: number,
  y: number,
  maxWidth: number,
  colors: { primary: string; secondary: string; accent: string }
): number {
  const lineHeight = 28
  const bulletWidth = 20
  let currentY = y

  choices.slice(0, 3).forEach((choice, index) => {
    // 绘制序号圆圈
    ctx.beginPath()
    ctx.arc(x + 10, currentY - 8, 10, 0, Math.PI * 2)
    ctx.fillStyle = colors.accent
    ctx.fill()
    
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText(`${index + 1}`, x + 10, currentY - 3)
    
    // 绘制选择文本
    ctx.textAlign = 'left'
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    
    const truncatedText = choice.text.length > 25 
      ? choice.text.substring(0, 25) + '...' 
      : choice.text
    ctx.fillText(`→ ${truncatedText}`, x + 28, currentY)
    
    currentY += lineHeight
  })
  
  return currentY
}

/**
 * 生成分享卡片（Canvas）- 增强版
 * @param data 分享卡片数据
 * @returns Blob 对象
 */
export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  // 创建 Canvas - 稍微增加高度以容纳选择路径
  const width = 1200
  const height = data.keyChoices && data.keyChoices.length > 0 ? 700 : 630
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

  // 绘制标题区域
  ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.fillText(data.scriptTitle, 80, 105)

  // 绘制结局标签和类型
  const tagX = 80
  const tagY = 140
  
  // 结局类型标签（如有）
  if (data.endingTag) {
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    const tagWidth = ctx.measureText(data.endingTag).width + 24
    roundRect(ctx, tagX, tagY - 22, tagWidth, 28, 14)
    ctx.fillStyle = colors.accent
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.fillText(data.endingTag, tagX + 12, tagY - 2)
  }

  // 绘制结局标题
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`🏆 ${data.endingTitle}`, 80, 200)

  // 绘制结局描述（限制行数）
  ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  const descLines = 2
  let descY = 235
  const descMaxWidth = 480
  const descText = data.endingDescription.length > 100 
    ? data.endingDescription.substring(0, 100) + '...'
    : data.endingDescription
  drawMultilineText(ctx, descText, 80, descY, descMaxWidth, 26)

  // 绘制关键选择路径（新增）
  if (data.keyChoices && data.keyChoices.length > 0) {
    const pathY = 320
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = colors.accent
    ctx.fillText('📍 我的抉择之路', 80, pathY)
    
    drawChoicePath(ctx, data.keyChoices, 80, pathY + 30, descMaxWidth, colors)
  }

  // 绘制统计数据区域
  const statsX = 620
  const statsY = 100

  // 统计卡片背景
  roundRect(ctx, statsX - 20, statsY - 30, 560, 180, 12)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.fill()

  // 游戏时长
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.textAlign = 'left'
  ctx.fillText('⏱️ 游戏时长', statsX, statsY)
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`${data.playTime} 分钟`, statsX, statsY + 38)

  // 选择次数
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.fillText('🎯 关键选择', statsX + 180, statsY)
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`${data.choices} 次`, statsX + 180, statsY + 38)

  // 成就数量
  if (data.achievements.length > 0) {
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillText('🏅 获得成就', statsX + 360, statsY)
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = colors.accent
    ctx.fillText(`${data.achievements.length} 个`, statsX + 360, statsY + 38)
  }

  // 绘制成就列表（最多显示3个）
  if (data.achievements.length > 0) {
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    data.achievements.slice(0, 3).forEach((achievement, index) => {
      const y = statsY + 80 + index * 26
      const truncatedAchievement = achievement.length > 20
        ? achievement.substring(0, 20) + '...'
        : achievement
      ctx.fillText(`✨ ${truncatedAchievement}`, statsX, y)
    })
  }

  // 绘制角色关系摘要（如有）
  if (data.relationshipSummary) {
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    const summaryY = statsY + 160
    ctx.fillText(`💬 ${data.relationshipSummary}`, statsX, summaryY)
  }

  // 绘制底部品牌信息
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.textAlign = 'center'
  ctx.fillText('🎮 AI Story Game - 你的选择，定义故事', width / 2, height - 45)

  // 玩家名称（可选）
  if (data.playerName) {
    ctx.textAlign = 'left'
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillText(`👤 ${data.playerName}`, 80, height - 45)
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
  // 构建更吸引人的分享文案
  let shareText = `我在「${data.scriptTitle}」中达成了「${data.endingTitle}」结局！`
  
  // 添加结局类型标签
  if (data.endingTag) {
    shareText += `\n${data.endingTag}`
  }
  
  // 添加关键选择信息
  if (data.keyChoices && data.keyChoices.length > 0) {
    shareText += `\n\n我的关键选择：`
    data.keyChoices.slice(0, 3).forEach((choice, i) => {
      shareText += `\n${i + 1}. ${choice.text}`
    })
  }
  
  shareText += `\n\n⏱️ 游玩 ${data.playTime} 分钟 · 🎯 ${data.choices} 次选择`
  
  if (data.achievements.length > 0) {
    shareText += ` · 🏅 ${data.achievements.length} 个成就`
  }

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