import { createFileRoute, Link } from '@tanstack/react-router'
import { useFirstVisit } from '#/hooks/useFirstVisit'
import { OnboardingGuide } from '#/components/onboarding/OnboardingGuide'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const { isFirstVisit, markAsVisited, checked } = useFirstVisit()

  return (
    <>
      <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">AI 驱动的互动故事</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          沉浸式剧本杀体验
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          在 AI 的引导下，探索精心设计的剧本世界。每一个选择都将影响故事的走向，
          创造属于你独一无二的冒险故事。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/create"
            className="rounded-full bg-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:opacity-90"
          >
            ✨ 创建剧本
          </Link>
          <Link
            to="/scripts"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            探索剧本库
          </Link>
          <Link
            to="/achievements"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
          >
            🏆 成就
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: 'AI 动态对话',
            desc: '智能 NPC 会根据你的选择产生独特的反应，每次游玩都有新体验。',
          },
          {
            title: '多线剧情',
            desc: '你的每个决定都将影响故事走向，解锁不同的结局。',
          },
          {
            title: '角色扮演',
            desc: '选择不同的角色身份，从不同视角体验故事。',
          },
          {
            title: '存档系统',
            desc: '随时保存游戏进度，方便继续你的冒险。',
          },
          {
            title: '属性系统',
            desc: '角色属性影响对话选项和剧情发展。',
          },
          {
            title: '关系追踪',
            desc: '与 NPC 的关系将影响他们的态度和可选行动。',
          },
        ].map(({ title, desc }, index) => (
          <article
            key={title}
            className="island-shell feature-card rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">{title}</h2>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{desc}</p>
          </article>
        ))}
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6">
        <p className="island-kicker mb-4">热门剧本</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/scripts/$id"
            params={{ id: 'mystery-castle' }}
            className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] transition hover:border-[var(--lagoon-deep)]"
          >
            <img
              src="https://picsum.photos/seed/mystery-castle/100/100"
              alt="神秘古堡"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
                神秘古堡
              </h3>
              <p className="text-sm text-[var(--sea-ink-soft)]">悬疑推理 · 25分钟</p>
            </div>
          </Link>
          <Link
            to="/scripts/$id"
            params={{ id: 'lost-in-space' }}
            className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] transition hover:border-[var(--lagoon-deep)]"
          >
            <img
              src="https://picsum.photos/seed/lost-in-space/100/100"
              alt="星际迷途"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
                星际迷途
              </h3>
              <p className="text-sm text-[var(--sea-ink-soft)]">科幻冒险 · 20分钟</p>
            </div>
          </Link>
          <Link
            to="/scripts/$id"
            params={{ id: 'dragon-valley' }}
            className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] transition hover:border-[var(--lagoon-deep)]"
          >
            <img
              src="https://picsum.photos/seed/dragon-valley/100/100"
              alt="龙之谷"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
                龙之谷
              </h3>
              <p className="text-sm text-[var(--sea-ink-soft)]">奇幻冒险 · 25分钟</p>
            </div>
          </Link>
        </div>
      </section>
    </main>

      {/* 新手引导 */}
      {checked && isFirstVisit && <OnboardingGuide onComplete={markAsVisited} />}
    </>
  )
}
