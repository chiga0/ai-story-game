import { createFileRoute, Link } from '@tanstack/react-router'
import { useFirstVisit } from '#/hooks/useFirstVisit'
import { OnboardingGuide } from '#/components/onboarding/OnboardingGuide'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const { isFirstVisit, markAsVisited, checked } = useFirstVisit()

  return (
    <>
      <main className="page-wrap px-4 pb-8 pt-8 sm:pt-12">
      {/* P0-1: 简化的首屏 - 沉浸式入口 */}
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-12 sm:py-16 text-center">
        {/* 背景装饰 */}
        <div className="pointer-events-none absolute -left-24 -top-32 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.38),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.22),transparent_66%)]" />
        
        {/* 主标题区域 */}
        <p className="island-kicker mb-4">AI 驱动的互动故事</p>
        <h1 className="display-title mb-6 max-w-2xl mx-auto text-4xl leading-[1.05] font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl lg:text-6xl">
          选择你的命运
        </h1>
        <p className="mb-8 max-w-xl mx-auto text-lg text-[var(--sea-ink-soft)] leading-relaxed">
          在 AI 构建的奇妙世界中，你的每一个选择都将影响故事的走向。
          准备好开始属于你的独特冒险了吗？
        </p>
        
        {/* P0-1: 醒目的 CTA 按钮 */}
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/scripts/mystery-castle"
            className="cta-primary inline-flex items-center gap-2 rounded-full bg-[var(--lagoon-deep)] px-8 py-4 text-lg font-semibold text-white no-underline transition hover:-translate-y-1 hover:opacity-90 shadow-lg"
          >
            <span className="text-2xl">✨</span>
            <span>立即开始体验</span>
          </Link>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            推荐：《神秘古堡》— 悬疑推理，15分钟畅玩
          </p>
        </div>
      </section>

      {/* 热门剧本 - 简化为 2 个 */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">热门剧本</h2>
          <Link
            to="/scripts"
            className="text-sm text-[var(--lagoon-deep)] hover:underline"
          >
            查看全部 →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/scripts/$id"
            params={{ id: 'mystery-castle' }}
            className="island-shell group flex items-center gap-4 p-4 rounded-2xl transition hover:-translate-y-1 hover:shadow-lg"
          >
            <img
              src="https://picsum.photos/seed/mystery-castle/120/120"
              alt="神秘古堡"
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs bg-[rgba(79,184,178,0.2)] text-[var(--lagoon-deep)] rounded-full">
                  推荐
                </span>
              </div>
              <h3 className="font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)] truncate">
                神秘古堡
              </h3>
              <p className="text-sm text-[var(--sea-ink-soft)] mt-1">
                悬疑推理 · 15分钟 · 5种结局
              </p>
            </div>
          </Link>
          <Link
            to="/scripts/$id"
            params={{ id: 'lost-in-space' }}
            className="island-shell group flex items-center gap-4 p-4 rounded-2xl transition hover:-translate-y-1 hover:shadow-lg"
          >
            <img
              src="https://picsum.photos/seed/lost-in-space/120/120"
              alt="星际迷途"
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)] truncate">
                星际迷途
              </h3>
              <p className="text-sm text-[var(--sea-ink-soft)] mt-1">
                科幻冒险 · 12分钟 · AI动态对话
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 简化的功能介绍 - 只保留核心特点 */}
      <section className="mt-8 island-shell rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[var(--sea-ink)] mb-4 text-center">
          为什么选择我们？
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🎭</div>
            <h3 className="font-medium text-[var(--sea-ink)]">AI 动态对话</h3>
            <p className="text-sm text-[var(--sea-ink-soft)] mt-1">
              每次选择都是独特的体验
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🔀</div>
            <h3 className="font-medium text-[var(--sea-ink)]">多线剧情</h3>
            <p className="text-sm text-[var(--sea-ink-soft)] mt-1">
              你的选择决定结局
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">💎</div>
            <h3 className="font-medium text-[var(--sea-ink)]">成就系统</h3>
            <p className="text-sm text-[var(--sea-ink-soft)] mt-1">
              解锁隐藏成就
            </p>
          </div>
        </div>
      </section>

      {/* 底部快捷入口 */}
      <section className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/create"
          className="text-sm text-[var(--sea-ink-soft)] hover:text-[var(--lagoon-deep)] transition-colors"
        >
          ✨ 创建剧本
        </Link>
        <span className="text-[var(--line)]">|</span>
        <Link
          to="/achievements"
          className="text-sm text-[var(--sea-ink-soft)] hover:text-[var(--lagoon-deep)] transition-colors"
        >
          🏆 成就
        </Link>
        <span className="text-[var(--line)]">|</span>
        <Link
          to="/saves"
          className="text-sm text-[var(--sea-ink-soft)] hover:text-[var(--lagoon-deep)] transition-colors"
        >
          💾 存档管理
        </Link>
      </section>
    </main>

      {/* 新手引导 */}
      {checked && isFirstVisit && <OnboardingGuide onComplete={markAsVisited} />}
    </>
  )
}