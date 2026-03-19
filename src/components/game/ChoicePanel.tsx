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
  if (choices.length === 0) return null

  return (
    <div className="space-y-2">
      {choices.map((choice, index) => (
        <Button
          key={choice.id}
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-4 bg-gray-900/80 border-gray-700 hover:bg-gray-800 hover:border-gray-600 transition-all"
          onClick={() => onChoose(choice.id)}
          disabled={disabled || loading}
        >
          <span className="text-amber-400 mr-2 font-mono">{index + 1}.</span>
          <span className="text-white">{choice.text}</span>
          {loading && (
            <span className="ml-auto">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          )}
        </Button>
      ))}
    </div>
  )
}
