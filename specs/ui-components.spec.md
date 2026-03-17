# UI Components Specification

## 概述

游戏 UI 组件负责呈现游戏界面，包括对话显示、选项交互、状态展示。

## 组件列表

### 1. DialogueBox 对话框

**文件**: `src/components/game/DialogueBox.tsx`

**Props:**
```typescript
interface DialogueBoxProps {
  speaker?: string      // 说话者名称
  text: string          // 对话文本
  avatar?: string       // 头像 URL 或 emoji
  onTypingComplete?: () => void  // 打字完成回调
}
```

**功能:**
- 打字机效果显示文本
- 30ms/字符的打字速度
- 支持说话者名称和头像显示
- 打字时显示光标动画

**样式:**
- 半透明黑色背景 (bg-black/80)
- 毛玻璃效果 (backdrop-blur-sm)
- 灰色边框 (border-gray-700)
- 圆角头像带边框

### 2. ChoicePanel 选项面板

**文件**: `src/components/game/ChoicePanel.tsx`

**Props:**
```typescript
interface ChoicePanelProps {
  choices: Choice[]     // 选项列表
  onChoose: (choiceId: string) => void  // 选择回调
  disabled?: boolean    // 禁用状态
}

interface Choice {
  id: string
  text: string
}
```

**功能:**
- 显示选项按钮列表
- 支持数字快捷键 (1, 2, 3...)
- 禁用状态时按钮不可点击
- 空选项时不渲染

**样式:**
- 按钮垂直排列
- 半透明背景 (bg-gray-900/80)
- 悬停时背景变亮
- 左侧显示序号

### 3. StatusBar 状态栏

**文件**: `src/components/game/StatusBar.tsx`

**Props:**
```typescript
interface StatusBarProps {
  attributes: Record<string, number>        // 属性值
  relationships?: Record<string, number>    // 关系值
  characterNames?: Record<string, string>   // 角色名称映射
}
```

**功能:**
- 显示角色属性条
- 属性值颜色根据数值变化
- 显示与 NPC 的关系值
- 关系值正负颜色区分

**样式:**
- 属性条进度条样式
- 颜色映射:
  - ≥80: 绿色
  - ≥60: 蓝色
  - ≥40: 黄色
  - ≥20: 橙色
  - <20: 红色
- 关系值标签样式

### 4. ScriptCard 剧本卡片

**文件**: `src/components/script/ScriptCard.tsx`

**Props:**
```typescript
interface ScriptCardProps {
  id: string
  title: string
  description: string
  coverImage: string
  players: number
  duration: string
  difficulty: '简单' | '中等' | '困难'
}
```

**功能:**
- 展示剧本基本信息
- 点击跳转到剧本详情页
- 显示难度、人数、时长标签

**样式:**
- 卡片式布局
- 封面图片 16:9 比例
- 难度颜色:
  - 简单: 绿色
  - 中等: 蓝色
  - 困难: 红色

## 可访问性

1. 所有交互元素支持键盘操作
2. 适当使用 ARIA 标签
3. 颜色对比度符合 WCAG AA 标准
4. 打字动画可通过点击跳过

## 性能要求

- 组件渲染时间: < 16ms
- 打字动画不阻塞主线程
- 列表项使用 React key 优化

## 测试清单

### DialogueBox 测试

1. 正确渲染说话者名称
2. 正确渲染对话文本
3. 打字机效果正常工作
4. 打字完成触发回调
5. 无说话者时隐藏名称区域

### ChoicePanel 测试

1. 正确渲染所有选项
2. 点击选项触发回调
3. 禁用状态不可点击
4. 空选项不渲染

### StatusBar 测试

1. 正确显示属性值
2. 属性条宽度正确
3. 颜色根据值变化
4. 正确显示关系值

### ScriptCard 测试

1. 正确渲染所有信息
2. 点击正确跳转
3. 难度标签颜色正确