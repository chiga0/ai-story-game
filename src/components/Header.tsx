import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 sm:py-4">
        {/* Logo */}
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
            AI Story Game
          </Link>
        </h2>

        {/* 主导航 - 居中 */}
        <div className="hidden sm:flex items-center gap-6 text-sm font-semibold">
          <Link to="/" className="nav-link" activeProps={{ className: 'nav-link is-active' }}>
            首页
          </Link>
          <Link
            to="/scripts"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            剧本库
          </Link>
          <Link
            to="/achievements"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            成就
          </Link>
        </div>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 创建剧本入口 */}
          <Link
            to="/create"
            className="rounded-xl bg-[var(--lagoon-deep)] px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90 sm:px-4 sm:py-2 sm:text-sm"
          >
            ✨ 创建剧本
          </Link>

          {/* 设置入口 */}
          <Link
            to="/settings"
            className="rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
            title="设置"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>

          <ThemeToggle />
        </div>

        {/* 移动端导航 */}
        <div className="sm:hidden flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold">
          <Link to="/" className="nav-link" activeProps={{ className: 'nav-link is-active' }}>
            首页
          </Link>
          <Link
            to="/scripts"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            剧本库
          </Link>
          <Link
            to="/achievements"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            成就
          </Link>
        </div>
      </nav>
    </header>
  )
}
