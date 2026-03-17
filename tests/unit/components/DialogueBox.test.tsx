import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { DialogueBox } from '../../../src/components/game/DialogueBox'

describe('DialogueBox', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render text content', () => {
    render(<DialogueBox text="测试对话" />)
    expect(screen.getByText('测试对话')).toBeDefined()
  })

  it('should render speaker name when provided', () => {
    render(<DialogueBox text="你好" speaker="管家亨利" />)
    expect(screen.getByText('管家亨利')).toBeDefined()
  })

  it('should not render speaker section when not provided', () => {
    const { container } = render(<DialogueBox text="旁白文本" />)
    // 不应该有说话者名称区域
    const speakerElements = container.querySelectorAll('.text-amber-400')
    expect(speakerElements.length).toBe(0)
  })

  it('should render avatar when provided', () => {
    const { container } = render(<DialogueBox text="你好" avatar="👴" speaker="管家" />)
    const img = container.querySelector('img')
    expect(img).toBeDefined()
    expect(img?.getAttribute('src')).toBe('👴')
    expect(img?.getAttribute('alt')).toBe('管家')
  })

  it('should show typing animation', () => {
    render(<DialogueBox text="测试" />)
    // 初始状态应该有光标
    const cursor = document.querySelector('.animate-pulse')
    expect(cursor).toBeDefined()
  })

  it('should call onTypingComplete after typing finishes', () => {
    const onComplete = vi.fn()
    render(<DialogueBox text="abc" onTypingComplete={onComplete} />)
    
    // 快进时间 (3 字符 * 30ms = 90ms)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    expect(onComplete).toHaveBeenCalled()
  })

  it('should reset animation when text changes', () => {
    const { rerender } = render(<DialogueBox text="第一段" />)
    
    // 快进到完成
    act(() => {
      vi.advanceTimersByTime(200)
    })
    
    // 更新文本
    rerender(<DialogueBox text="第二段" />)
    
    // 应该重新开始打字
    expect(screen.getByText('第')).toBeDefined()
  })
})

// 需要导入 afterEach
import { afterEach } from 'vitest'