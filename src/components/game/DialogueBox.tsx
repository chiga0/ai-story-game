import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface DialogueBoxProps {
  speaker?: string
  text: string
  avatar?: string
  background?: string
  onTypingComplete?: () => void
  /** 是否显示"思考中"动画（AI生成时） */
  isThinking?: boolean
  /** 场景切换动画 */
  sceneTransition?: boolean
}

interface DialogueSegment {
  id: number
  text: string
  isComplete: boolean
}

/**
 * 将文本按句子分段
 */
function splitIntoSegments(text: string): string[] {
  // 按换行符、句号、感叹号、问号分段
  const segments: string[] = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    if (line.trim() === '') {
      if (segments.length > 0 && segments[segments.length - 1] !== '') {
        segments.push('')
      }
      continue
    }
    
    // 按句子分隔
    const sentences = line.match(/[^。！？!?]+[。！？!?]?/g) || [line]
    segments.push(...sentences.filter(s => s.trim()))
  }
  
  return segments.filter(s => s.trim())
}

/**
 * 打字机效果 Hook - 支持逐段显示
 */
function useTypewriter(
  text: string,
  options: {
    speed?: number
    segmentDelay?: number
    onComplete?: () => void
  } = {}
) {
  const { speed = 25, segmentDelay = 400, onComplete } = options
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [charInSegment, setCharInSegment] = useState(0)
  
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const segments = useMemo(() => splitIntoSegments(text), [text])
  const onCompleteRef = useRef(onComplete)

  // 更新 onComplete ref
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // 重置状态
  useEffect(() => {
    setDisplayedText('')
    setIsTyping(true)
    setCurrentSegmentIndex(0)
    setCharInSegment(0)
    lastTimeRef.current = 0
  }, [text])

  // 动画循环
  useEffect(() => {
    if (segments.length === 0) {
      setIsTyping(false)
      onCompleteRef.current?.()
      return
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp
      }

      // 检查是否完成所有段落
      if (currentSegmentIndex >= segments.length) {
        setIsTyping(false)
        onCompleteRef.current?.()
        return
      }

      const currentSegment = segments[currentSegmentIndex]
      const elapsed = timestamp - lastTimeRef.current

      // 段落间延迟
      if (charInSegment === 0 && displayedText.length > 0) {
        if (elapsed < segmentDelay) {
          animationRef.current = requestAnimationFrame(animate)
          return
        }
        lastTimeRef.current = timestamp
      }

      // 打字速度
      if (elapsed >= speed) {
        const charsToAdd = Math.floor(elapsed / speed)
        const newCharIndex = Math.min(charInSegment + charsToAdd, currentSegment.length)
        
        // 更新显示文本
        const previousText = segments.slice(0, currentSegmentIndex).join('')
        const currentText = currentSegment.slice(0, newCharIndex)
        setDisplayedText(previousText + currentText)
        
        if (newCharIndex >= currentSegment.length) {
          // 当前段落完成，进入下一个
          setCurrentSegmentIndex(prev => prev + 1)
          setCharInSegment(0)
          lastTimeRef.current = timestamp
        } else {
          setCharInSegment(newCharIndex)
          lastTimeRef.current = timestamp - (elapsed % speed)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [text, speed, segmentDelay, currentSegmentIndex, charInSegment, segments, displayedText.length])

  // 跳过动画
  const skip = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setDisplayedText(text)
    setIsTyping(false)
    setCurrentSegmentIndex(segments.length)
    onCompleteRef.current?.()
  }, [text, segments.length])

  return { 
    displayedText, 
    isTyping, 
    skip,
    currentSegmentIndex,
    totalSegments: segments.length 
  }
}

/**
 * 思考中动画组件
 */
function ThinkingIndicator({ speaker }: { speaker?: string }) {
  const [dots, setDots] = useState('')
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="bg-black/80 backdrop-blur-sm border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 relative">
            <div className="w-16 h-16 rounded-full border-2 border-gray-600 bg-gray-800 flex items-center justify-center">
              <span className="text-2xl">🤔</span>
            </div>
            {/* 脉冲动画 */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-30" />
          </div>
          <div className="flex-1">
            {speaker && (
              <div className="text-sm text-amber-400 font-medium mb-1">{speaker}</div>
            )}
            <div className="text-gray-400 italic flex items-center gap-1">
              <span>思考中</span>
              <span className="w-6 text-left">{dots}</span>
              <div className="ml-2 flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 场景切换过渡效果 - 已禁用
 * 问题：全屏黑色遮罩导致明显闪烁
 * 解决：改用 DialogueBox 自身的淡入淡出，无需额外遮罩
 */
function SceneTransition({ 
  isActive, 
  onComplete 
}: { 
  isActive: boolean
  onComplete?: () => void 
}) {
  // 直接触发完成回调，不显示遮罩
  useEffect(() => {
    if (isActive) {
      // 立即完成，让 DialogueBox 的淡入效果处理过渡
      const timer = setTimeout(() => {
        onComplete?.()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isActive, onComplete])

  return null
}

export function DialogueBox({ 
  speaker, 
  text, 
  avatar, 
  background, 
  onTypingComplete,
  isThinking = false,
  sceneTransition = false
}: DialogueBoxProps) {
  const { displayedText, isTyping, skip, currentSegmentIndex, totalSegments } = useTypewriter(
    text, 
    { speed: 25, segmentDelay: 400, onComplete: onTypingComplete }
  )
  const [showSkip, setShowSkip] = useState(true)
  const textContainerRef = useRef<HTMLDivElement>(null)
  
  // 跟踪文本变化，用于平滑过渡
  const [prevText, setPrevText] = useState(text)
  const [isTextChanging, setIsTextChanging] = useState(false)

  // 打字完成后隐藏跳过按钮
  useEffect(() => {
    if (!isTyping) {
      const timer = setTimeout(() => setShowSkip(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isTyping])

  // 跳过打字动画
  const handleSkip = () => {
    skip()
    setShowSkip(false)
  }

  // 处理场景切换完成
  const handleTransitionComplete = useCallback(() => {
    // 短暂延迟后完成过渡
    setIsTextChanging(false)
  }, [])

  // 检测文本变化，触发淡入淡出
  useEffect(() => {
    if (text !== prevText) {
      setIsTextChanging(true)
      setPrevText(text)
      // 短暂延迟后开始显示新内容
      const timer = setTimeout(() => {
        setIsTextChanging(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [text, prevText])

  // 根据场景生成渐变背景样式
  const getSceneGradient = (bg?: string): string => {
    if (bg) {
      if (bg.includes('castle') || bg.includes('hall') || bg.includes('basement')) {
        return 'bg-gradient-to-b from-gray-800 via-gray-900 to-black'
      }
      if (bg.includes('garden')) {
        return 'bg-gradient-to-b from-green-800 via-green-900 to-black'
      }
      if (bg.includes('kitchen')) {
        return 'bg-gradient-to-b from-orange-800 via-orange-900 to-black'
      }
      if (bg.includes('library') || bg.includes('study')) {
        return 'bg-gradient-to-b from-amber-800 via-amber-900 to-black'
      }
      if (bg.includes('attic') || bg.includes('secret')) {
        return 'bg-gradient-to-b from-purple-800 via-purple-900 to-black'
      }
      if (bg.includes('space')) {
        return 'bg-gradient-to-b from-indigo-900 via-purple-900 to-black'
      }
      if (bg.includes('dragon')) {
        return 'bg-gradient-to-b from-red-800 via-red-900 to-black'
      }
      return 'bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900'
    }
    return ''
  }

  // 思考中状态
  if (isThinking && !displayedText) {
    return <ThinkingIndicator speaker={speaker} />
  }

  // 场景切换过渡
  const showTransition = sceneTransition

  return (
    <>
      {/* 场景切换过渡 */}
      <SceneTransition 
        isActive={showTransition} 
        onComplete={handleTransitionComplete} 
      />

      {/* 场景背景/插图 */}
      {background && (
        <div className={`mb-4 rounded-xl overflow-hidden ${getSceneGradient(background)} transition-opacity duration-200 ${
          isTextChanging ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="w-full h-48 flex items-center justify-center">
            <span className="text-gray-400 text-sm opacity-50">🏰 场景背景</span>
          </div>
        </div>
      )}
      
      {/* 对话框 */}
      <Card className={`bg-black/80 backdrop-blur-sm border-gray-700 transition-all duration-200 ${
        isTextChanging ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
      }`}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* 角色头像 */}
            {avatar && (
              <div className="flex-shrink-0 relative">
                <img
                  src={avatar}
                  alt={speaker || '角色'}
                  className="w-16 h-16 rounded-full border-2 border-gray-600"
                />
                {/* 打字时添加脉冲效果 */}
                {isTyping && (
                  <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-pulse opacity-30" />
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* 说话者名称 */}
              {speaker && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-amber-400 font-medium">{speaker}</span>
                  {/* 打字进度指示 */}
                  {isTyping && totalSegments > 1 && (
                    <span className="text-xs text-gray-500">
                      ({currentSegmentIndex + 1}/{totalSegments})
                    </span>
                  )}
                </div>
              )}

              {/* 对话内容 - 固定高度 180px */}
              <div
                className="relative h-[180px] overflow-hidden"
                style={{ contain: 'content layout style' }}
              >
                <div
                  ref={textContainerRef}
                  className="h-full overflow-y-auto text-white leading-relaxed whitespace-pre-wrap break-words pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                >
                  {displayedText}
                  {/* 打字光标 */}
                  {isTyping && (
                    <span className="inline-block w-0.5 h-5 bg-amber-400 ml-1 animate-blink" />
                  )}
                  {/* 滚动提示 */}
                  {!isTyping && text.length > 150 && (
                    <div className="text-xs text-gray-400 mt-2 text-center">
                      ↕️ 可滚动查看完整内容
                    </div>
                  )}
                </div>
                
                {/* 底部渐变遮罩 */}
                {isTyping && text.length > 150 && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                )}
              </div>

              {/* 跳过按钮 */}
              {showSkip && isTyping && (
                <button
                  onClick={handleSkip}
                  className="mt-2 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>⏭️</span>
                  <span>跳过动画</span>
                  <span className="text-gray-600">({currentSegmentIndex + 1}/{totalSegments})</span>
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSS 动画 */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </>
  )
}