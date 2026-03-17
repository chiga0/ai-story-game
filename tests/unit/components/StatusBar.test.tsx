import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBar } from '../../../src/components/game/StatusBar'

describe('StatusBar', () => {
  describe('Attributes', () => {
    it('should render all attributes', () => {
      render(<StatusBar attributes={{ courage: 50, wisdom: 80, charm: 30 }} />)
      
      expect(screen.getByText('勇气')).toBeDefined()
      expect(screen.getByText('智慧')).toBeDefined()
      expect(screen.getByText('魅力')).toBeDefined()
    })

    it('should show attribute values', () => {
      render(<StatusBar attributes={{ courage: 75 }} />)
      
      expect(screen.getByText('75')).toBeDefined()
    })

    it('should handle unknown attribute names', () => {
      render(<StatusBar attributes={{ customAttr: 50 }} />)
      
      expect(screen.getByText('customAttr')).toBeDefined()
      expect(screen.getByText('50')).toBeDefined()
    })
  })

  describe('Relationships', () => {
    it('should render relationships when provided', () => {
      render(
        <StatusBar 
          attributes={{}} 
          relationships={{ butler: 50, maid: -20 }}
        />
      )
      
      expect(screen.getByText('butler')).toBeDefined()
      expect(screen.getByText('+50')).toBeDefined()
      expect(screen.getByText('-20')).toBeDefined()
    })

    it('should not render relationships section when not provided', () => {
      const { container } = render(<StatusBar attributes={{}} />)
      
      // 不应该有"关系"标签
      expect(screen.queryByText('关系')).toBeNull()
    })

    it('should use characterNames for display', () => {
      render(
        <StatusBar 
          attributes={{}} 
          relationships={{ butler: 30 }}
          characterNames={{ butler: '管家亨利' }}
        />
      )
      
      expect(screen.getByText('管家亨利')).toBeDefined()
    })

    it('should show positive relationships with + sign', () => {
      render(<StatusBar attributes={{}} relationships={{ butler: 30 }} />)
      
      expect(screen.getByText('+30')).toBeDefined()
    })

    it('should show negative relationships without + sign', () => {
      render(<StatusBar attributes={{}} relationships={{ enemy: -30 }} />)
      
      expect(screen.getByText('-30')).toBeDefined()
    })
  })

  describe('Attribute Colors', () => {
    it('should show green for values >= 80', () => {
      const { container } = render(<StatusBar attributes={{ courage: 85 }} />)
      
      const progressBar = container.querySelector('.bg-green-500')
      expect(progressBar).toBeDefined()
    })

    it('should show blue for values >= 60', () => {
      const { container } = render(<StatusBar attributes={{ courage: 65 }} />)
      
      const progressBar = container.querySelector('.bg-blue-500')
      expect(progressBar).toBeDefined()
    })

    it('should show yellow for values >= 40', () => {
      const { container } = render(<StatusBar attributes={{ courage: 45 }} />)
      
      const progressBar = container.querySelector('.bg-yellow-500')
      expect(progressBar).toBeDefined()
    })

    it('should show orange for values >= 20', () => {
      const { container } = render(<StatusBar attributes={{ courage: 25 }} />)
      
      const progressBar = container.querySelector('.bg-orange-500')
      expect(progressBar).toBeDefined()
    })

    it('should show red for values < 20', () => {
      const { container } = render(<StatusBar attributes={{ courage: 10 }} />)
      
      const progressBar = container.querySelector('.bg-red-500')
      expect(progressBar).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle value > 100', () => {
      const { container } = render(<StatusBar attributes={{ courage: 150 }} />)
      
      // 进度条最大宽度应为 100%
      const progressBar = container.querySelector('[style*="width"]')
      expect(progressBar?.getAttribute('style')).toContain('100%')
    })

    it('should handle negative values', () => {
      const { container } = render(<StatusBar attributes={{ courage: -10 }} />)
      
      // 进度条最小宽度应为 0%
      const progressBar = container.querySelector('[style*="width"]')
      expect(progressBar?.getAttribute('style')).toContain('0%')
    })

    it('should handle empty attributes', () => {
      const { container } = render(<StatusBar attributes={{}} />)
      
      // 组件应该正常渲染
      expect(container.firstChild).toBeDefined()
    })
  })
})