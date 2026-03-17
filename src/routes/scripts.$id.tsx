import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/scripts/$id')({
  component: ScriptDetailPage,
})

const scriptData = {
  id: '1',
  title: '神秘庄园',
  description: '在一个神秘的庄园中，你将扮演一位侦探，揭开隐藏的秘密。',
  fullDescription: `
    1920年代的英格兰，一座偏远的庄园里发生了一起离奇的失踪案。
    作为一名经验丰富的侦探，你被邀请到庄园调查这起案件。
    庄园的主人威廉爵士在一个月前的暴风雨夜晚神秘失踪，
    留下的只有一封未完成的信和一系列奇怪的线索。

    你需要通过与庄园里的每个人交谈，收集线索，
    最终揭开这个惊人的秘密。
  `,
  coverImage: 'https://picsum.photos/seed/mystery-manor/800/400',
  players: 4,
  duration: '2小时',
  difficulty: '中等' as const,
  characters: [
    { id: '1', name: '艾米莉夫人', role: '庄园女主人', description: '威廉爵士的妻子，优雅但神秘' },
    { id: '2', name: '管家亨利', role: '忠实管家', description: '在庄园工作了30年，知道所有秘密' },
    { id: '3', name: '园丁汤姆', role: '沉默的观察者', description: '看似普通，实则洞察一切' },
    { id: '4', name: '私家侦探', role: '主角', description: '你将扮演这个角色' },
  ],
}

function ScriptDetailPage() {
  const { id } = Route.useParams()

  return (
    <div className="page-wrap py-8">
      <Link to="/scripts" className="nav-link inline-flex items-center gap-1 mb-6">
        ← 返回剧本列表
      </Link>

      <div className="island-shell rounded-2xl overflow-hidden">
        <img
          src={scriptData.coverImage}
          alt={scriptData.title}
          className="w-full h-64 object-cover"
        />

        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 rounded-full text-sm bg-[var(--chip-bg)] border border-[var(--chip-line)]">
              {scriptData.players} 人
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-[var(--chip-bg)] border border-[var(--chip-line)]">
              {scriptData.duration}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-[var(--lagoon)] text-white">
              {scriptData.difficulty}
            </span>
          </div>

          <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)] mb-4">
            {scriptData.title}
          </h1>

          <p className="text-[var(--sea-ink-soft)] whitespace-pre-line mb-6">
            {scriptData.fullDescription}
          </p>

          <div className="mb-6">
            <h2 className="font-semibold text-lg text-[var(--sea-ink)] mb-4">可选角色</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scriptData.characters.map((char) => (
                <div
                  key={char.id}
                  className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--line)]"
                >
                  <div className="font-medium text-[var(--sea-ink)]">{char.name}</div>
                  <div className="text-sm text-[var(--lagoon-deep)]">{char.role}</div>
                  <div className="text-sm text-[var(--sea-ink-soft)] mt-1">{char.description}</div>
                </div>
              ))}
            </div>
          </div>

          <Link to="/play/$scriptId" params={{ scriptId: id }}>
            <Button size="lg" className="w-full md:w-auto">
              开始游戏
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
