import { Button } from '@/components/ui/button'
import type { Choice } from '@/lib/game/engine'

interface ChoicePanelProps {
  choices: Choice[]
  onChoose: (choiceId: string) => void
  disabled?: boolean
}

export function ChoicePanel({ choices, onChoose, disabled }: ChoicePanelProps) {
  if (choices.length === 0) return null

  return (
    <div className="space-y-2">
      {choices.map((choice, index) => (
        <Button
          key={choice.id}
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-4 bg-gray-900/80 border-gray-700 hover:bg-gray-800 hover:border-gray-600 transition-all"
          onClick={() => onChoose(choice.id)}
          disabled={disabled}
        >
          <span className="text-amber-400 mr-2 font-mono">{index + 1}.</span>
          <span className="text-white">{choice.text}</span>
        </Button>
      ))}
    </div>
  )
}