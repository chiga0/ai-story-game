/**
 * NPC 关系面板组件
 * 显示与各 NPC 的关系等级和变化历史
 */

import { useState, useEffect } from 'react'
import {
  getNPCMemoryManager,
  getRelationshipTier,
  getRelationshipTierText,
  getRelationshipTierColor,
  type NPCMemory,
  type RelationshipTier,
} from '#/lib/game/npc-memory'

interface NPCRelationshipPanelProps {
  /** 剧本 ID */
  scriptId?: string
  /** 角色信息 */
  characters?: Record<string, { name: string; avatar?: string; personality?: string }>
  /** 是否可折叠 */
  collapsible?: boolean
  /** 是否默认展开 */
  defaultExpanded?: boolean
  /** 点击 NPC 回调 */
  onNPCClick?: (npcId: string) => void
}

interface RelationshipHistoryEntry {
  timestamp: number
  change: number
  reason: string
}

export function NPCRelationshipPanel({
  scriptId,
  characters = {},
  collapsible = true,
  defaultExpanded = true,
  onNPCClick,
}: NPCRelationshipPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [memories, setMemories] = useState<NPCMemory[]>([])
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null)

  // 加载 NPC 记忆
  useEffect(() => {
    const manager = getNPCMemoryManager()
    const allMemories = manager.getAllMemories()
    setMemories(allMemories)
  }, [])

  // 获取角色信息
  const getCharacterInfo = (npcId: string) => {
    return characters[npcId] || { name: npcId, avatar: '👤' }
  }

  // 获取关系进度条颜色
  const getProgressColor = (level: number): string => {
    if (level <= -60) return 'bg-red-500'
    if (level <= -20) return 'bg-orange-500'
    if (level <= 20) return 'bg-gray-400'
    if (level <= 60) return 'bg-green-500'
    return 'bg-blue-500'
  }

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 渲染单个 NPC 关系卡片
  const renderNPCCard = (memory: NPCMemory) => {
    const charInfo = getCharacterInfo(memory.npcId)
    const tier = getRelationshipTier(memory.relationshipLevel)
    const tierText = getRelationshipTierText(tier)
    const tierColor = getRelationshipTierColor(tier)

    return (
      <div
        key={memory.npcId}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedNPC(selectedNPC === memory.npcId ? null : memory.npcId)
          onNPCClick?.(memory.npcId)
        }}
      >
        {/* 头部和基本信息 */}
        <div className="flex items-center gap-3 mb-3">
          {/* 头像 */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${tierColor}20` }}
          >
            {charInfo.avatar || '👤'}
          </div>

          {/* 名称和等级 */}
          <div className="flex-1">
            <div className="font-semibold text-gray-900 dark:text-white">
              {charInfo.name}
            </div>
            <div
              className="text-sm"
              style={{ color: tierColor }}
            >
              {tierText} ({memory.relationshipLevel > 0 ? '+' : ''}{memory.relationshipLevel})
            </div>
          </div>

          {/* 情绪指示器 */}
          <div className="text-right">
            <div className="text-lg">
              {memory.currentMood === 'happy' && '😊'}
              {memory.currentMood === 'neutral' && '😐'}
              {memory.currentMood === 'angry' && '😠'}
              {memory.currentMood === 'sad' && '😢'}
              {memory.currentMood === 'suspicious' && '🤨'}
            </div>
            <div className="text-xs text-gray-500">
              信任 {memory.trustLevel}%
            </div>
          </div>
        </div>

        {/* 关系进度条 */}
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
          <div
            className={`absolute h-full transition-all duration-300 ${getProgressColor(memory.relationshipLevel)}`}
            style={{
              left: '50%',
              width: `${Math.abs(memory.relationshipLevel) / 2}%`,
              transform: memory.relationshipLevel < 0 ? 'translateX(-100%)' : 'none',
            }}
          />
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400" />
        </div>

        {/* 展开的详细信息 */}
        {selectedNPC === memory.npcId && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* 信任度进度条 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>信任度</span>
                <span>{memory.trustLevel}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${memory.trustLevel}%` }}
                />
              </div>
            </div>

            {/* 记住的关键选择 */}
            {memory.rememberedChoices.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  记住的选择
                </div>
                <div className="space-y-1">
                  {memory.rememberedChoices.slice(-3).map((choice, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1"
                    >
                      {choice}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 最近互动 */}
            {memory.playerInteractions.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  最近互动
                </div>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {memory.playerInteractions.slice(-5).reverse().map((interaction, index) => (
                    <div
                      key={index}
                      className="text-sm border-l-2 pl-2"
                      style={{
                        borderColor: interaction.sentiment === 'positive'
                          ? '#22c55e'
                          : interaction.sentiment === 'negative'
                          ? '#ef4444'
                          : '#6b7280',
                      }}
                    >
                      <div className="text-gray-700 dark:text-gray-300">
                        你：{interaction.playerChoice}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {formatTime(interaction.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // 渲染关系网络（简化版）
  const renderRelationshipNetwork = () => {
    if (memories.length < 2) return null

    return (
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          关系概览
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {memories.map((memory) => {
            const charInfo = getCharacterInfo(memory.npcId)
            const tier = getRelationshipTier(memory.relationshipLevel)
            const tierColor = getRelationshipTierColor(tier)

            return (
              <div
                key={memory.npcId}
                className="flex items-center gap-2 cursor-pointer hover:bg-white dark:hover:bg-gray-700 p-2 rounded"
                onClick={() => setSelectedNPC(memory.npcId)}
              >
                <span className="text-xl">{charInfo.avatar || '👤'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {charInfo.name}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: tierColor }}
                  >
                    {getRelationshipTierText(tier)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // 如果没有记忆数据
  if (memories.length === 0) {
    return null
  }

  return (
    <div className="npc-relationship-panel">
      {/* 标题栏 */}
      {collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              NPC 关系
            </span>
            <span className="text-sm text-gray-500">
              ({memories.length} 个角色)
            </span>
          </div>
          <span className="text-gray-500">
            {isExpanded ? '▼' : '▶'}
          </span>
        </button>
      ) : (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>👥</span>
          <span>NPC 关系</span>
        </h3>
      )}

      {/* 内容区域 */}
      {isExpanded && (
        <div>
          {/* 关系网络概览 */}
          {renderRelationshipNetwork()}

          {/* 详细 NPC 列表 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memories.map((memory) => renderNPCCard(memory))}
          </div>

          {/* 图例 */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>敌对</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>不友好</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span>中立</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>友好</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>亲密</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 紧凑版关系指示器
 * 用于在游戏界面显示简要的关系状态
 */
interface CompactRelationshipIndicatorProps {
  npcId: string
  characters?: Record<string, { name: string; avatar?: string }>
}

export function CompactRelationshipIndicator({
  npcId,
  characters = {},
}: CompactRelationshipIndicatorProps) {
  const [memory, setMemory] = useState<NPCMemory | null>(null)

  useEffect(() => {
    const manager = getNPCMemoryManager()
    setMemory(manager.getMemory(npcId))
  }, [npcId])

  if (!memory) return null

  const charInfo = characters[npcId] || { name: npcId, avatar: '👤' }
  const tier = getRelationshipTier(memory.relationshipLevel)
  const tierColor = getRelationshipTierColor(tier)

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
      style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
    >
      <span>{charInfo.avatar || '👤'}</span>
      <span>{charInfo.name}</span>
      <span className="opacity-70">
        {getRelationshipTierText(tier)}
      </span>
    </div>
  )
}

export default NPCRelationshipPanel