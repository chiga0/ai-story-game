import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

export interface ChoiceItem {
  id: string
  text: string
}

interface ChoicePanelProps {
  choices: ChoiceItem[]
  onChoose: (choiceId: string) => void
  disabled?: boolean
  loading?: boolean
}

export function ChoicePanel({ choices, onChoose, disabled, loading }: ChoicePanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const prevChoicesRef = useRef<ChoiceItem[]>(choices)

  // 重置选中状态
  useEffect(() => {
    if (choices.length > 0) {
      setSelectedId(null)
    }
  }, [choices])

  if (choices.length === 0) return null

  const handleClick = (choiceId: string) => {
    if (disabled || loading) return
    
    // P0-2: 选择动画反馈
    setSelectedId(choiceId)
    
    // 短暂延迟让用户看到选中效果
    setTimeout(() => {
      onChoose(choiceId)
    }, 200)
  }

  return (
    <div className="space-y-2">
      {choices.map((choice, index) => {
        const isSelected = selectedId === choice.id
        const isDisabled = disabled || loading
        
        return (
          <Button
            key={choice.id}
            variant="outline"
            className={`
              choice-btn w-full justify-start text-left h-auto py-3 px-4 
              bg-gray-900/80 border-gray-700 
              hover:bg-gray-800 hover:border-gray-600 
              transition-all duration-200
              ${isSelected ? 'selected bg-gray-700 border-amber-500/50' : ''}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => handleClick(choice.id)}
            disabled={isDisabled}
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            <span className="text-amber-400 mr-2 font-mono">{index + 1}.</span>
            <span className="text-white flex-1">{choice.text}</span>
            
            {/* 选中状态指示器 */}
            {isSelected && (
              <span className="ml-2 text-amber-400 animate-pulse">
                →
              </span>
            )}
            
            {/* 加载指示器 */}
            {loading && isSelected && (
              <span className="ml-auto">
                <svg 
                  className="animate-spin h-4 w-4 text-amber-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" cy="12" r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
            )}
          </Button>
        )
      })}
      
      {/* P0-3: 情感化提示 */}
      <p className="text-center text-xs text-gray-500 mt-3 italic">
        每一个选择，都将改变故事的走向...
      </p>
    </div>
  )
}