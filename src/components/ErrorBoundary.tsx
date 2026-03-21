/**
 * 错误边界组件
 * 捕获组件渲染错误，显示友好提示界面
 */

import React, { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * 错误边界组件
 * 用于捕获子组件树中的 JavaScript 错误，记录错误并显示回退 UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })

    // 调用自定义错误处理
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Sentry 错误上报（如果已配置）
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }

    // 开发环境下打印错误详情
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ErrorBoundary 捕获到错误')
      console.error('Error:', error)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = (): void => {
    window.location.href = '/'
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误界面
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] p-4">
          <div className="max-w-md w-full text-center space-y-6">
            {/* 错误图标 */}
            <div className="text-6xl">😢</div>

            {/* 错误标题 */}
            <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
              哎呀，出错了
            </h1>

            {/* 错误描述 */}
            <p className="text-[var(--sea-ink-soft)]">
              应用遇到了一个意外错误。请尝试刷新页面，或者返回首页重新开始。
            </p>

            {/* 开发环境显示错误详情 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left bg-red-50 border border-red-200 rounded-lg p-4 overflow-auto max-h-48">
                <p className="text-red-700 font-mono text-sm whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-red-600 font-mono text-xs mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-[var(--sea-ink)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                重试
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 border border-[var(--sea-ink)] text-[var(--sea-ink)] rounded-lg hover:bg-[var(--sea-ink-light)] transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'

  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`

  return ComponentWithErrorBoundary
}

export default ErrorBoundary