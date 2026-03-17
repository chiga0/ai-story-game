import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChoicePanel } from '../../../src/components/game/ChoicePanel'
import type { Choice } from '../../../src/lib/game/engine'

describe('ChoicePanel', () => {
  const mockChoices: Choice[] = [
    { id: '1', text: '选项一', nextSceneId: 'scene1' },
    { id: '2', text: '选项二', nextSceneId: 'scene2' },
    { id: '3', text: '选项三', nextSceneId: 'scene3' },
  ]

  it('should render all choices', () => {
    render(<ChoicePanel choices={mockChoices} onChoose={vi.fn()} />)
    
    expect(screen.getByText('选项一')).toBeDefined()
    expect(screen.getByText('选项二')).toBeDefined()
    expect(screen.getByText('选项三')).toBeDefined()
  })

  it('should show numbered indicators', () => {
    render(<ChoicePanel choices={mockChoices} onChoose={vi.fn()} />)
    
    expect(screen.getByText('1.')).toBeDefined()
    expect(screen.getByText('2.')).toBeDefined()
    expect(screen.getByText('3.')).toBeDefined()
  })

  it('should call onChoose with correct id when clicked', () => {
    const onChoose = vi.fn()
    render(<ChoicePanel choices={mockChoices} onChoose={onChoose} />)
    
    fireEvent.click(screen.getByText('选项二'))
    
    expect(onChoose).toHaveBeenCalledWith('2')
  })

  it('should not render when choices array is empty', () => {
    const { container } = render(<ChoicePanel choices={[]} onChoose={vi.fn()} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should disable all choices when disabled prop is true', () => {
    render(<ChoicePanel choices={mockChoices} onChoose={vi.fn()} disabled />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('should not call onChoose when disabled', () => {
    const onChoose = vi.fn()
    render(<ChoicePanel choices={mockChoices} onChoose={onChoose} disabled />)
    
    fireEvent.click(screen.getByText('选项一'))
    
    expect(onChoose).not.toHaveBeenCalled()
  })

  it('should handle single choice', () => {
    const singleChoice: Choice[] = [{ id: 'only', text: '唯一选项', nextSceneId: 'end' }]
    render(<ChoicePanel choices={singleChoice} onChoose={vi.fn()} />)
    
    expect(screen.getByText('唯一选项')).toBeDefined()
    expect(screen.getByText('1.')).toBeDefined()
  })
})