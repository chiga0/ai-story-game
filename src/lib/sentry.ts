/**
 * Sentry 错误监控配置
 * 用于追踪前端错误和性能问题
 */

import * as Sentry from '@sentry/react'

/**
 * 初始化 Sentry
 * 仅在生产环境且配置了 DSN 时启用
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn || import.meta.env.DEV) {
    console.log('[Sentry] Disabled in development or missing DSN')
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_COMMIT_SHA || 'unknown',

    // 性能监控采样率
    tracesSampleRate: 0.1,

    // 会话重播采样率
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // 忽略常见无意义错误
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Network request failed',
      'Failed to fetch',
    ],

    // 过滤敏感信息
    beforeSend(event) {
      // 移除可能包含敏感信息的字段
      if (event.request?.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
      }
      return event
    },
  })

  console.log('[Sentry] Initialized successfully')
}

/**
 * 捕获错误并发送到 Sentry
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.error('[Error]', error, context)
    return
  }

  Sentry.captureException(error, {
    extra: context,
  })
}

/**
 * 设置用户上下文
 */
export function setUserContext(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email,
  })
}

/**
 * 清除用户上下文
 */
export function clearUserContext() {
  Sentry.setUser(null)
}

/**
 * 添加面包屑（用于追踪用户操作路径）
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  })
}

export default {
  initSentry,
  captureError,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
}