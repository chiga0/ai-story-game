/**
 * 检测网络连接状态
 */

import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  // 默认为 true（在线），避免 SSR 或初次渲染时的误报
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // 在客户端初始化时获取真实状态
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}