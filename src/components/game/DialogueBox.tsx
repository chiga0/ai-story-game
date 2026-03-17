import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface DialogueBoxProps {
  speaker?: string
  text: string
  avatar?: string
  onTypingComplete?: () => void
}

export function DialogueBox({ speaker, text, avatar, onTypingComplete }: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    setDisplayedText('')
    setIsTyping(true)

    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(interval)
        onTypingComplete?.()
      }
    }, 30) // 打字速度

    return () => clearInterval(interval)
  }, [text, onTypingComplete])

  return (
    <Card className="bg-black/80 backdrop-blur-sm border-gray-700">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* 角色头像 */}
          {avatar && (
            <div className="flex-shrink-0">
              <img
                src={avatar}
                alt={speaker || '角色'}
                className="w-16 h-16 rounded-full border-2 border-gray-600"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* 说话者名称 */}
            {speaker && (
              <div className="text-sm text-amber-400 font-medium mb-1">{speaker}</div>
            )}

            {/* 对话内容 */}
            <div className="text-white leading-relaxed">
              {displayedText}
              {isTyping && <span className="animate-pulse">▌</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}