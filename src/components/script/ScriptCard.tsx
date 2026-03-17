import { Link } from '@tanstack/react-router'

interface ScriptCardProps {
  id: string
  title: string
  description: string
  coverImage: string
  players: number
  duration: string
  difficulty: '简单' | '中等' | '困难'
}

export function ScriptCard({
  id,
  title,
  description,
  coverImage,
  players,
  duration,
  difficulty,
}: ScriptCardProps) {
  const difficultyColors = {
    简单: 'bg-[var(--palm)]',
    中等: 'bg-[var(--lagoon)]',
    困难: 'bg-red-500',
  }

  return (
    <Link
      to="/scripts/$id"
      params={{ id }}
      className="feature-card block rounded-2xl overflow-hidden border border-[var(--line)]"
    >
      <img
        src={coverImage}
        alt={title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded text-xs text-white ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
          <span className="text-xs text-[var(--sea-ink-soft)]">
            {players} 人
          </span>
          <span className="text-xs text-[var(--sea-ink-soft)]">
            {duration}
          </span>
        </div>
        <h3 className="font-semibold text-[var(--sea-ink)] mb-1">{title}</h3>
        <p className="text-sm text-[var(--sea-ink-soft)] line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  )
}