/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Umami Analytics
  readonly VITE_UMAMI_WEBSITE_ID?: string
  readonly VITE_UMAMI_SRC?: string

  // 添加更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}