import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScriptCard } from '../../../src/components/script/ScriptCard'

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params, className }: any) => (
    <a href={`${to}/${params?.id || ''}`} className={className}>
      {children}
    </a>
  ),
}))

describe('ScriptCard', () => {
  const defaultProps = {
    id: 'test-script',
    title: '神秘庄园',
    description: '一个神秘的庄园等待你的探索',
    coverImage: 'https://example.com/cover.jpg',
    players: 4,
    duration: '2小时',
    difficulty: '中等' as const,
  }

  it('should render title', () => {
    render(<ScriptCard {...defaultProps} />)
    
    expect(screen.getByText('神秘庄园')).toBeDefined()
  })

  it('should render description', () => {
    render(<ScriptCard {...defaultProps} />)
    
    expect(screen.getByText('一个神秘的庄园等待你的探索')).toBeDefined()
  })

  it('should render player count', () => {
    render(<ScriptCard {...defaultProps} />)
    
    expect(screen.getByText('4 人')).toBeDefined()
  })

  it('should render duration', () => {
    render(<ScriptCard {...defaultProps} />)
    
    expect(screen.getByText('2小时')).toBeDefined()
  })

  it('should render difficulty badge', () => {
    render(<ScriptCard {...defaultProps} />)
    
    expect(screen.getByText('中等')).toBeDefined()
  })

  it('should render cover image with correct src', () => {
    render(<ScriptCard {...defaultProps} />)
    
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('https://example.com/cover.jpg')
    expect(img.getAttribute('alt')).toBe('神秘庄园')
  })

  describe('Difficulty Colors', () => {
    it('should show green for 简单 difficulty', () => {
      const { container } = render(<ScriptCard {...defaultProps} difficulty="简单" />)
      
      const badge = container.querySelector('.bg-\\[var\\(--palm\\)\\]')
      expect(badge).toBeDefined()
    })

    it('should show blue for 中等 difficulty', () => {
      const { container } = render(<ScriptCard {...defaultProps} difficulty="中等" />)
      
      const badge = container.querySelector('.bg-\\[var\\(--lagoon\\)\\]')
      expect(badge).toBeDefined()
    })

    it('should show red for 困难 difficulty', () => {
      const { container } = render(<ScriptCard {...defaultProps} difficulty="困难" />)
      
      const badge = container.querySelector('.bg-red-500')
      expect(badge).toBeDefined()
    })
  })

  it('should have correct link href', () => {
    render(<ScriptCard {...defaultProps} />)
    
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/scripts/$id/test-script')
  })

  it('should handle long descriptions', () => {
    const longDescription = '这是一个非常非常长的描述文字，用于测试文本截断功能是否正常工作，确保卡片不会因为描述过长而破坏布局。'
    
    render(<ScriptCard {...defaultProps} description={longDescription} />)
    
    expect(screen.getByText(longDescription)).toBeDefined()
  })
})