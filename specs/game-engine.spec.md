# Game Engine Specification

## 概述

游戏引擎是核心模块，负责管理游戏状态、处理玩家选择、推进剧情、判定结局。

## 核心类：GameEngine

### 职责

1. 初始化游戏状态
2. 管理当前场景
3. 处理玩家选择
4. 应用效果（属性变化、关系变化）
5. 记录游戏历史
6. 判定结局

### 接口设计

```typescript
class GameEngine {
  // 初始化游戏
  init(script: Script): Promise<GameState>
  
  // 从存档恢复
  restore(savedState: GameState, script: Script): Promise<void>
  
  // 获取当前场景
  getCurrentScene(): Scene | null
  
  // 获取可用选项（过滤条件）
  getChoices(): Choice[]
  
  // 处理玩家选择
  processChoice(choiceId: string): Promise<Scene | null>
  
  // 检查是否达到结局
  checkEnding(): Ending | null
  
  // 获取游戏状态
  getState(): GameState | null
  
  // 获取游玩时长
  getPlayDuration(): number
}
```

## 游戏状态管理

### GameState 结构

```typescript
interface GameState {
  scriptId: string          // 剧本ID
  currentScene: string      // 当前场景ID
  attributes: Record<string, number>      // 属性值
  relationships: Record<string, number>   // 角色关系值
  history: HistoryEntry[]   // 历史记录
  startTime: number         // 开始时间戳
}
```

### 状态变更规则

1. **属性变更**：累加/减数值
2. **关系变更**：累加/减数值，范围 -100 ~ 100
3. **场景切换**：更新 currentSceneId

## 选项处理

### 条件判断

选项可能带有条件，只有满足条件才可选：

```typescript
interface Condition {
  attribute?: string
  min?: number
  max?: number
}
```

### 效果应用

选择后可能触发效果：

```typescript
interface Effect {
  attribute?: string
  change?: number
  relationship?: { charId: string; change: number }
}
```

## 结局判定

### 判定逻辑

1. 遍历所有结局定义
2. 检查属性条件是否满足
3. 返回第一个匹配的结局

### 结局条件

```typescript
interface Ending {
  id: string
  title: string
  description: string
  condition: Record<string, { min?: number; max?: number }>
}
```

## 历史记录

每次选择都会记录：

```typescript
interface HistoryEntry {
  sceneId: string
  text: string
  choice?: string
  timestamp: number
}
```

## 测试用例

### 单元测试清单

1. **初始化测试**
   - 正确初始化游戏状态
   - 从存档恢复状态

2. **场景测试**
   - 获取当前场景
   - 场景不存在时返回 null

3. **选项测试**
   - 获取所有选项
   - 过滤条件不满足的选项
   - 空选项列表处理

4. **选择处理测试**
   - 正确处理有效选择
   - 无效选择返回 null
   - 正确应用属性效果
   - 正确应用关系效果
   - 正确记录历史

5. **结局测试**
   - 条件满足时返回结局
   - 条件不满足时返回 null
   - 多结局优先级

6. **时间测试**
   - 正确计算游玩时长

## 性能要求

- 初始化时间：< 100ms
- 选择处理时间：< 50ms
- 内存占用：< 10MB