/**
 * 网络状态提示组件
 * 在网络断开时显示顶部提示条
 */

import { useOnlineStatus } from '#/hooks/useOnlineStatus'

export function NetworkStatus() {
  const isOnline = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-500 text-white text-center py-2 px-4 text-sm">
      <span className="mr-2">⚠️</span>
      网络连接已断开，请检查您的网络设置
    </div>
  )
}