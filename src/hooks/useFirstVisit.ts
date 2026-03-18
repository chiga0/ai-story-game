/**
 * 检测用户是否首次访问
 */

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ai-story-game-visited'

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // 只在客户端检查
    if (typeof window === 'undefined') return

    const visited = localStorage.getItem(STORAGE_KEY)
    setIsFirstVisit(!visited)
    setChecked(true)
  }, [])

  const markAsVisited = useCallback(() => {
    if (typeof window === 'undefined') return

    localStorage.setItem(STORAGE_KEY, 'true')
    setIsFirstVisit(false)
  }, [])

  return { isFirstVisit, markAsVisited, checked }
}