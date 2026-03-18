/**
 * 新手引导组件
 * 首次访问时显示，引导用户了解网站功能
 */

import { useState } from 'react'
import { Link } from '@tanstack/react-router'

interface OnboardingStep {
  title: string
  description: string
  icon: string
}

const steps: OnboardingStep[] = [
  {
    title: '选择剧本',
    description: '浏览剧本库，选择你感兴趣的故事类型，从悬疑推理到奇幻冒险应有尽有。',
    icon: '📖',
  },
  {
    title: '开始游戏',
    description: '阅读故事背景，了解角色关系，准备开始你的冒险之旅。',
    icon: '🎮',
  },
  {
    title: '做出选择',
    description: '每个选择都会影响剧情走向，创造属于你的独特故事体验。',
    icon: '🎯',
  },
]

interface OnboardingGuideProps {
  onComplete: () => void
}

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 进度指示器 */}
        <div className="flex gap-2 justify-center pt-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-[var(--lagoon-deep)]'
                  : index < currentStep
                    ? 'bg-[var(--lagoon)]'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* 内容区域 */}
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">{steps[currentStep].icon}</div>
          <h2 className="text-xl font-bold text-[var(--sea-ink)] mb-3">
            {steps[currentStep].title}
          </h2>
          <p className="text-[var(--sea-ink-soft)] leading-relaxed">
            {steps[currentStep].description}
          </p>
        </div>

        {/* 按钮区域 */}
        <div className="px-6 pb-6 flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 py-3 px-4 rounded-lg border border-gray-200 text-[var(--sea-ink)] hover:bg-gray-50 transition-colors"
            >
              上一步
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 rounded-lg bg-[var(--lagoon-deep)] text-white hover:opacity-90 transition-opacity"
            >
              下一步
            </button>
          ) : (
            <Link
              to="/scripts"
              onClick={handleComplete}
              className="flex-1 py-3 px-4 rounded-lg bg-[var(--lagoon-deep)] text-white text-center hover:opacity-90 transition-opacity"
            >
              开始探索
            </Link>
          )}
        </div>

        {/* 跳过按钮 */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm"
        >
          跳过
        </button>
      </div>
    </div>
  )
}