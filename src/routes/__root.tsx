import { HeadContent, Scripts, createRootRoute, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Footer from '../components/Footer'
import Header from '../components/Header'
import ErrorBoundary from '../components/ErrorBoundary'
import { NetworkStatus } from '../components/NetworkStatus'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'AI Story Game - 互动故事游戏',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
    scripts: [
      // Umami Analytics - 隐私友好的访问统计
      // 配置环境变量: VITE_UMAMI_WEBSITE_ID 和 VITE_UMAMI_SRC (可选，默认使用 Umami Cloud)
      ...(import.meta.env.VITE_UMAMI_WEBSITE_ID
        ? [
            {
              src: import.meta.env.VITE_UMAMI_SRC || 'https://analytics.umami.is/script.js',
              'data-website-id': import.meta.env.VITE_UMAMI_WEBSITE_ID,
              async: true,
            },
          ]
        : []),
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  // 游戏页面隐藏 Header/Footer，提供沉浸式体验
  const isGamePage = location.pathname.startsWith('/play/')
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <NetworkStatus />
        <ErrorBoundary>
          {!isGamePage && <Header />}
          {children}
          {!isGamePage && <Footer />}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Scripts />
        </ErrorBoundary>
      </body>
    </html>
  )
}