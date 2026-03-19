/**
 * 分支树可视化组件
 * 使用 SVG 绘制分支树，显示当前所在位置
 */

import { useState, useMemo, useCallback } from 'react'
import type { Scene, Choice } from '#/types'

// ============================================
// 类型定义
// ============================================

interface BranchNode {
  id: string
  label: string
  children: BranchNode[]
  isVisited: boolean
  isCurrent: boolean
  scene?: Scene
}

interface BranchTreeProps {
  /** 所有场景数据 */
  scenes: Record<string, Scene>
  /** 当前场景 ID */
  currentSceneId: string
  /** 已访问的场景 ID 列表 */
  visitedSceneIds: string[]
  /** 起始场景 ID */
  startSceneId?: string
  /** 最大显示深度 */
  maxDepth?: number
  /** 是否可折叠 */
  collapsible?: boolean
  /** 点击节点回调 */
  onNodeClick?: (sceneId: string) => void
}

// ============================================
// 辅助函数
// ============================================

/**
 * 构建分支树结构
 * 只显示已访问的节点和当前可选择的分支，不提前暴露未探索内容
 */
function buildBranchTree(
  scenes: Record<string, Scene>,
  startId: string,
  visitedIds: Set<string>,
  currentId: string,
  maxDepth: number,
  visitedInPath: Set<string> = new Set<string>(),
  depth: number = 0
): BranchNode | null {
  const scene = scenes[startId]
  if (!scene || maxDepth <= 0 || visitedInPath.has(startId)) {
    return null
  }

  const node: BranchNode = {
    id: startId,
    label: getSceneLabel(scene, startId),
    children: [],
    isVisited: visitedIds.has(startId),
    isCurrent: startId === currentId,
    scene,
  }

  // 防止循环
  const newPath = new Set(visitedInPath)
  newPath.add(startId)

  // 只在当前场景时显示子节点选项，或者子节点已被访问
  // 不再提前暴露未探索的路径
  const isCurrentScene = startId === currentId

  // 构建子节点
  if (scene.choices && scene.choices.length > 0) {
    for (const choice of scene.choices) {
      // 只显示：
      // 1. 已访问的子节点（显示探索历史）
      // 2. 当前场景的直接选择（但不递归显示它们的内容）
      const isVisited = visitedIds.has(choice.nextSceneId)
      const isDirectChoice = isCurrentScene
      
      if (isVisited || isDirectChoice) {
        // 对于当前场景的直接选择，只创建一个空节点（不递归展开）
        if (isDirectChoice && !isVisited) {
          node.children.push({
            id: choice.nextSceneId,
            label: getSceneLabel(scenes[choice.nextSceneId], choice.nextSceneId),
            children: [],
            isVisited: false,
            isCurrent: false,
          })
        } else {
          // 已访问的节点，正常构建
          const childNode = buildBranchTree(
            scenes,
            choice.nextSceneId,
            visitedIds,
            currentId,
            maxDepth - 1,
            newPath,
            depth + 1
          )
          if (childNode) {
            node.children.push(childNode)
          }
        }
      }
    }
  } else if (scene.nextSceneId) {
    const isVisited = visitedIds.has(scene.nextSceneId)
    const isDirectChoice = isCurrentScene
    
    if (isVisited || isDirectChoice) {
      if (isDirectChoice && !isVisited) {
        node.children.push({
          id: scene.nextSceneId,
          label: getSceneLabel(scenes[scene.nextSceneId], scene.nextSceneId),
          children: [],
          isVisited: false,
          isCurrent: false,
        })
      } else {
        const childNode = buildBranchTree(
          scenes,
          scene.nextSceneId,
          visitedIds,
          currentId,
          maxDepth - 1,
          newPath,
          depth + 1
        )
        if (childNode) {
          node.children.push(childNode)
        }
      }
    }
  }

  return node
}

/**
 * 获取场景标签
 */
function getSceneLabel(scene: Scene, sceneId: string): string {
  // 根据场景 ID 返回简短标签
  const labels: Record<string, string> = {
    start: '起点',
    hall: '大厅',
    'castle-history': '历史',
    'hall-examine': '检查',
    'safe-attempt': '保险箱',
    'photo-question': '照片',
    'butler-secret': '秘密',
    kitchen: '厨房',
    'chef-conversation': '厨师',
    'kitchen-search': '搜索',
    'take-bottle': '瓶子',
    'poison-info': '毒药',
    'doctor-info': '医生',
    library: '图书馆',
    'library-search': '搜索',
    'library-hidden': '隐藏',
    'secret-letter': '信件',
    'library-desk': '书桌',
    basement: '地下室',
    'basement-wall': '墙壁',
    'basement-search': '搜索',
    garden: '花园',
    'gardener-conversation': '园丁',
    'key-purpose': '钥匙',
    'garden-examine': '检查',
    'garden-box': '盒子',
    'footprint-trail': '脚印',
    'secret-passage': '通道',
    attic: '阁楼',
    'trunk-contents': '箱子',
    'attic-search': '搜索',
    study: '书房',
    letter: '信',
    search: '搜索',
    'window-clue': '窗户',
    'maid-conversation': '女仆',
    'maid-secret': '秘密',
    'maid-reassured': '安慰',
    'secret-room': '密室',
    'have-evidence': '证据',
    confrontation: '对峙',
    'truth-revealed': '真相',
    'partial-reveal': '部分',
    'failed-ending': '失败',
    'ending-perfect': '完美结局',
    'ending-good': '好结局',
    'ending-truth': '真相结局',
    'ending-bad': '坏结局',
  }

  // 如果有预定义标签则使用，否则截取前 4 个字符
  if (labels[sceneId]) {
    return labels[sceneId]
  }
  
  // 尝试从场景标题获取简短标签
  if (scene?.title) {
    return scene.title.length > 4 ? scene.title.slice(0, 4) : scene.title
  }
  
  return sceneId.slice(0, 4)
}

/**
 * 计算树的布局
 */
function calculateLayout(
  node: BranchNode,
  x: number,
  y: number,
  levelGap: number,
  siblingGap: number
): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  const nodes: LayoutNode[] = []
  const edges: LayoutEdge[] = []

  function traverse(n: BranchNode, nx: number, ny: number, depth: number): number {
    const layoutNode: LayoutNode = {
      id: n.id,
      label: n.label,
      x: nx,
      y: ny,
      isVisited: n.isVisited,
      isCurrent: n.isCurrent,
      width: 60,
      height: 30,
    }
    nodes.push(layoutNode)

    if (n.children.length === 0) {
      return ny
    }

    let currentY = ny - ((n.children.length - 1) * siblingGap) / 2

    for (let i = 0; i < n.children.length; i++) {
      const childY = traverse(
        n.children[i],
        nx + levelGap,
        currentY,
        depth + 1
      )

      edges.push({
        from: n.id,
        to: n.children[i].id,
        fromX: nx + 60,
        fromY: ny + 15,
        toX: nx + levelGap,
        toY: childY + 15,
      })

      currentY += siblingGap
    }

    return ny
  }

  traverse(node, x, y, 0)

  return { nodes, edges }
}

interface LayoutNode {
  id: string
  label: string
  x: number
  y: number
  isVisited: boolean
  isCurrent: boolean
  width: number
  height: number
}

interface LayoutEdge {
  from: string
  to: string
  fromX: number
  fromY: number
  toX: number
  toY: number
}

// ============================================
// 主组件
// ============================================

export function BranchTree({
  scenes,
  currentSceneId,
  visitedSceneIds,
  startSceneId = 'start',
  maxDepth = 5,
  collapsible = true,
  onNodeClick,
}: BranchTreeProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const visitedSet = useMemo(() => new Set(visitedSceneIds), [visitedSceneIds])

  const tree = useMemo(() => {
    return buildBranchTree(scenes, startSceneId, visitedSet, currentSceneId, maxDepth)
  }, [scenes, startSceneId, visitedSet, currentSceneId, maxDepth])

  const layout = useMemo(() => {
    if (!tree) return { nodes: [], edges: [] }
    return calculateLayout(tree, 20, 200, 120, 60)
  }, [tree])

  const toggleCollapse = useCallback(() => {
    if (collapsible) {
      setIsCollapsed((prev) => !prev)
    }
  }, [collapsible])

  if (!tree) return null

  if (isCollapsed) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-[var(--sea-ink-light)] p-2">
        <button
          onClick={toggleCollapse}
          className="flex items-center gap-2 text-sm text-[var(--sea-ink)] hover:bg-gray-100 px-2 py-1 rounded"
        >
          <span>🌳</span>
          <span>分支树</span>
          <span className="text-xs text-gray-400">({visitedSceneIds.length} 已探索)</span>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-[var(--sea-ink-light)] overflow-hidden">
      {/* 标题栏 */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b border-[var(--sea-ink-light)] ${
          collapsible ? 'cursor-pointer hover:bg-gray-50' : ''
        }`}
        onClick={toggleCollapse}
      >
        <div className="flex items-center gap-2">
          <span>🌳</span>
          <span className="font-medium text-[var(--sea-ink)]">分支树</span>
          <span className="text-xs text-gray-400">({visitedSceneIds.length} 已探索)</span>
        </div>
        {collapsible && (
          <span className="text-gray-400 text-sm">收起</span>
        )}
      </div>

      {/* SVG 画布 */}
      <div className="overflow-auto" style={{ maxHeight: '400px' }}>
        <svg
          width={Math.max(layout.nodes.length * 80, 400)}
          height={400}
          className="block"
        >
          {/* 背景网格 */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* 边 */}
          {layout.edges.map((edge, i) => (
            <line
              key={`edge-${i}`}
              x1={edge.fromX}
              y1={edge.fromY}
              x2={edge.toX}
              y2={edge.toY}
              stroke="#ddd"
              strokeWidth="2"
              strokeDasharray="4,2"
            />
          ))}

          {/* 节点 */}
          {layout.nodes.map((node) => (
            <g
              key={node.id}
              className="cursor-pointer"
              onClick={() => onNodeClick?.(node.id)}
            >
              {/* 节点背景 */}
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                rx="6"
                fill={
                  node.isCurrent
                    ? '#fef3c7'
                    : node.isVisited
                    ? '#dcfce7'
                    : '#f3f4f6'
                }
                stroke={
                  node.isCurrent
                    ? '#f59e0b'
                    : node.isVisited
                    ? '#22c55e'
                    : '#d1d5db'
                }
                strokeWidth={node.isCurrent ? 2 : 1}
              />

              {/* 节点文本 */}
              <text
                x={node.x + node.width / 2}
                y={node.y + node.height / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fill={
                  node.isCurrent
                    ? '#92400e'
                    : node.isVisited
                    ? '#166534'
                    : '#6b7280'
                }
              >
                {node.label}
              </text>

              {/* 当前位置指示器 */}
              {node.isCurrent && (
                <circle
                  cx={node.x + node.width / 2}
                  cy={node.y - 5}
                  r="3"
                  fill="#f59e0b"
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* 图例 */}
      <div className="px-3 py-2 border-t border-[var(--sea-ink-light)] flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-500" />
          <span className="text-gray-500">当前位置</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-500" />
          <span className="text-gray-500">已访问</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
          <span className="text-gray-500">未解锁</span>
        </div>
      </div>
    </div>
  )
}

export default BranchTree