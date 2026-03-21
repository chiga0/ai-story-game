import { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface StatusBarProps {
  attributes: Record<string, number>
  relationships?: Record<string, number>
  characterNames?: Record<string, string>
}

export function StatusBar({ attributes, relationships, characterNames }: StatusBarProps) {
  const attributeLabels: Record<string, string> = {
    courage: '勇气',
    wisdom: '智慧',
    charm: '魅力',
    luck: '运气',
    health: '健康',
    sanity: '理智',
    clue: '线索',
    suspicion: '怀疑',
    evidence: '证据',
    leadership: '领导力',
    trust: '信任',
    dragonTrust: '龙族信任',
  }

  // NPC ID 的友好名称映射（后备方案）
  const friendlyNames: Record<string, string> = {
    // 神秘古堡
    'butler': '管家亨利',
    'maid': '女仆安娜',
    'doctor': '医生华生',
    'chef': '厨师玛莎',
    'gardener': '园丁汤姆',
    // 星际迷途
    'ai': 'ARIA',
    'engineer': '工程师杰克',
    // 龙之谷
    'elder': '长老',
    'dragon': '龙',
    'warrior': '战士',
    'healer': '治疗师',
  }

  // 获取角色名称（优先使用 characterNames，否则使用友好映射）
  const getCharacterName = (charId: string): string => {
    return characterNames?.[charId] || friendlyNames[charId] || charId
  }

  const getAttributeColor = (value: number): string => {
    if (value >= 80) return 'bg-green-500'
    if (value >= 60) return 'bg-blue-500'
    if (value >= 40) return 'bg-yellow-500'
    if (value >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // P0-2: 属性变化追踪和动画
  const prevAttributesRef = useRef<Record<string, number>>({})
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set())
  
  // 检测属性变化
  const attributeChanges = useMemo(() => {
    const changes: Record<string, { oldValue: number; newValue: number; diff: number }> = {}
    
    Object.entries(attributes).forEach(([key, value]) => {
      const oldValue = prevAttributesRef.current[key]
      if (oldValue !== undefined && oldValue !== value) {
        changes[key] = { oldValue, newValue: value, diff: value - oldValue }
      }
    })
    
    return changes
  }, [attributes])

  // 触发变化动画
  useEffect(() => {
    const changed = new Set(Object.keys(attributeChanges))
    if (changed.size > 0) {
      setChangedKeys(changed)
      
      // 清除动画状态
      const timer = setTimeout(() => {
        setChangedKeys(new Set())
      }, 600)
      
      return () => clearTimeout(timer)
    }
  }, [attributeChanges])

  // 更新上一次的值
  useEffect(() => {
    prevAttributesRef.current = { ...attributes }
  }, [attributes])

  // 检查是否有属性数据
  const hasAttributes = attributes && Object.keys(attributes).length > 0
  const hasRelationships = relationships && Object.keys(relationships).length > 0

  return (
    <Card className="bg-gray-900/90 border-gray-700">
      <CardContent className="p-3">
        {/* 属性 */}
        <div className="space-y-2 mb-3">
          <div className="text-xs text-gray-400 uppercase tracking-wider">属性</div>
          {hasAttributes ? (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(attributes).map(([key, value]) => {
                const hasChanged = changedKeys.has(key)
                const change = attributeChanges[key]
                const isPositive = change && change.diff > 0
                
                return (
                  <div 
                    key={key} 
                    className={`flex items-center gap-2 ${hasChanged ? 'attr-value-change' : ''}`}
                  >
                    <span className="text-sm text-gray-300 w-12">{attributeLabels[key] || key}</span>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getAttributeColor(value)} transition-all duration-500 ease-out ${
                          hasChanged ? 'attr-bar-change' : ''
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                      />
                    </div>
                    <span 
                      className={`text-xs w-8 transition-colors duration-300 ${
                        hasChanged 
                          ? (isPositive ? 'text-green-400 number-animate' : 'text-red-400 number-animate')
                          : 'text-gray-400'
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              游戏开始后将显示属性...
            </div>
          )}
        </div>

        {/* 关系 */}
        {hasRelationships && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 uppercase tracking-wider">关系</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(relationships).map(([charId, value]) => (
                <div
                  key={charId}
                  className={`flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-sm relation-change`}
                >
                  <span className="text-gray-300">{getCharacterName(charId)}</span>
                  <span
                    className={`font-mono ${
                      value >= 50
                        ? 'text-green-400'
                        : value >= 0
                          ? 'text-yellow-400'
                          : 'text-red-400'
                    }`}
                  >
                    {value > 0 ? '+' : ''}
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}