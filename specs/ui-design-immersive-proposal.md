# UI 设计师专项分析 - 沉浸式游戏体验优化

> **角色**: 资深游戏 UI/UX 设计师
> **分析日期**: 2026-03-20
> **参考文档**: `specs/immersive-experience-optimization.md`

---

## 一、视觉层次分析

### 1.1 当前布局问题诊断

```
┌─────────────────────────────────────────────────────────────────┐
│                         Header (~60px)                          │  ← 非游戏内容
├─────────┬───────────────────────────────────────────────────────┤
│         │  工具栏 (~48px)                                        │  ← UI元素
│ Branch  ├───────────────────────────────────────────────────────┤
│  Tree   │  StatusBar (~100px)                                    │  ← 状态信息
│ (288px) ├───────────────────────────────────────────────────────┤
│         │                                                         │
│  探索   │  ┌─────────────────────────────────────────────────┐  │
│  历史   │  │ 场景背景 (h-48 = 192px)                        │  │  ← 仅192px高度
│         │  └─────────────────────────────────────────────────┘  │
│         │                                                         │
│         │  ┌─────────────────────────────────────────────────┐  │
│         │  │ 对话框 (max-h-60, 动态高度)                    │  │  ← 不稳定
│         │  │                                                 │  │
│         │  └─────────────────────────────────────────────────┘  │
│         │                                                         │
│         │  [选项1] [选项2] [选项3]                                │  ← 选项区域
├─────────┴───────────────────────────────────────────────────────┤
│                         Footer (~100px)                         │  ← 非游戏内容
└─────────────────────────────────────────────────────────────────┘

游戏内容占比 ≈ 40-50%（理想值应 ≥ 90%）
```

**核心问题量化**:

| 元素 | 当前状态 | 问题 |
|------|----------|------|
| Header | 固定 60px | 游戏页面不需要导航 |
| Footer | ~100px | 完全无关的游戏外信息 |
| BranchTree | 288-320px 宽 | 分散注意力，占据黄金区域 |
| StatusBar | ~100px 高 | 顶部堆叠，视觉干扰 |
| 场景背景 | 192px 高 | 沉浸感不足，形同虚设 |
| 对话框 | max-h-60 动态 | 高度不稳定导致抖动 |

### 1.2 焦点引导不足之处

#### 问题 1: 视觉焦点分散
```
用户视线热力图（当前）:

  ┌─────────────────────────────────────┐
  │ 🔴  Header (导航、logo)              │  ← 无关焦点
  │ 🔴  分支树 (左侧大块区域)            │  ← 分散焦点
  │ 🟡  状态栏 (属性数值)                │  ← 中等干扰
  │ 🟢  对话框 (游戏核心内容)            │  ← 应为主焦点
  │ 🟡  选项按钮                         │  ← 次要焦点
  │ 🔴  Footer (版权信息)                │  ← 无关焦点
  └─────────────────────────────────────┘

问题: 用户注意力被分散到 5+ 个区域
理想: 用户注意力应聚焦在「对话+选项」核心区域
```

#### 问题 2: 层次关系混乱
```
当前视觉权重:

  分支树 ─────┐
             ├── 同等权重 → 层次不清
  对话框 ─────┘

  状态栏 ─────┐
             ├── 同等权重 → 信息过载
  对话框 ─────┘
```

#### 问题 3: 游戏氛围缺失
- 场景背景仅占 192px，无法营造沉浸感
- CSS 渐变背景单调，缺乏情感共鸣
- 无动态元素增强叙事张力

---

## 二、沉浸式设计方案

### 2.1 游戏页面布局重构方案

#### 2.1.1 沉浸式布局（推荐方案）

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─ 悬浮 UI 层 ─────────────────────────────────────────────┐  │
│   │  [🏠]  ⏱ 12分钟   [🔊] [💾] [🌳]    ← 悬浮在右上角      │  │
│   └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │   🏰 场景背景全屏    │                      │
│                    │   (动态渐变/图片)    │                      │
│                    │                      │                      │
│                    │   占满整个屏幕       │                      │
│                    │   可加粒子/光效      │                      │
│                    │                      │                      │
│                    └─────────────────────┘                      │
│                                                                 │
│   ┌─ 固定高度对话区 ─────────────────────────────────────────┐  │
│   │                                                          │  │
│   │  [头像]  说话者名称                                       │  │
│   │          对话内容...                                      │  │
│   │          (固定 180px 高度，内部滚动)                      │  │
│   │                                                          │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─ 选项区 ─────────────────────────────────────────────────┐  │
│   │  [1. 选项一]                                              │  │
│   │  [2. 选项二]                                              │  │
│   │  [3. 选项三]                                              │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─ 状态栏（底部悬浮，点击展开）────────────────────────────┐  │
│   │  📊 属性 ▼                                                │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

游戏内容占比 ≈ 95%+
```

#### 2.1.2 尺寸标注

**桌面端 (≥1024px)**:

```
┌─────────────────────────────────────────────────────────────────┐
│                             100vw                               │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    全屏场景背景                          │   │
│   │                                                         ↑ │   │
│   │                                                         │ │   │
│   │                       视觉区域                          │ │   │
│   │                       (100vh - 280px)                   │ │   │
│   │                                                         │ │   │
│   │                                                         ↓ │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │  对话区: 高度固定 180px, 宽度 max-width: 800px          │   │
│   │  内边距: padding: 24px                                   │   │
│   │  背景: rgba(0,0,0,0.85) backdrop-blur                    │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │  选项区: 高度 auto, 最大 240px, 宽度 max-width: 800px   │   │
│   │  选项按钮: 高度 48px, 间距 12px                          │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │  状态栏: 悬浮底部, 高度 48px (展开后 ~200px)            │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**移动端 (<768px)**:

```
┌───────────────────────┐
│        100vw          │
│                       │
│  ┌─────────────────┐  │
│  │   全屏场景背景   │  │
│  │                 │  │
│  │    100vh        │  │
│  │   - 300px       │  │
│  │                 │  │
│  └─────────────────┘  │
│  ┌─────────────────┐  │
│  │ 对话区          │  │
│  │ 固定高度 160px  │  │
│  │ padding: 16px   │  │
│  └─────────────────┘  │
│  ┌─────────────────┐  │
│  │ 选项区          │  │
│  │ 最大 200px      │  │
│  │ 按钮高度 44px   │  │
│  └─────────────────┘  │
│  ┌─────────────────┐  │
│  │ 状态栏(折叠)    │  │
│  │ 高度 40px       │  │
│  └─────────────────┘  │
│                       │
└───────────────────────┘
```

### 2.2 移动端 vs Web 端差异化设计

| 设计元素 | 桌面端 | 移动端 |
|----------|--------|--------|
| **分支树** | 悬浮按钮触发，右侧抽屉滑出 | 底部浮层，点击展开 |
| **状态栏** | 底部悬浮，默认折叠 | 底部悬浮，默认隐藏，上滑展开 |
| **对话区** | 最大宽度 800px，居中 | 100% 宽度，内边距 16px |
| **选项区** | 最大宽度 800px，居中 | 100% 宽度，按钮全宽 |
| **背景** | 全屏，可加粒子效果 | 全屏，简化动效节省性能 |
| **悬浮 UI** | 右上角，固定定位 | 底部或顶部，节省空间 |
| **打字机速度** | 30-50ms/字符 | 20-30ms/字符（更快） |

#### 移动端专属交互

```
┌───────────────────────┐
│                       │
│    👆 点击任意位置     │  ← 跳过打字动画
│                       │
│    👆👆 双击          │  ← 打开分支树
│                       │
│    👆👆👆 长按        │  ← 打开设置面板
│                       │
│    ⬅️➡️ 左右滑动      │  ← 查看历史对话
│                       │
│    ⬆️ 上滑            │  ← 展开状态栏
│                       │
└───────────────────────┘
```

### 2.3 氛围感提升建议

#### 2.3.1 背景设计

**方案 A: 动态渐变背景（推荐）**

```css
/* 根据场景类型设置基础色调 */
.scene-castle {
  background: 
    radial-gradient(ellipse at 50% 0%, rgba(30,30,50,0.8) 0%, transparent 70%),
    radial-gradient(ellipse at 50% 100%, rgba(20,20,40,0.9) 0%, transparent 60%),
    linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
}

.scene-garden {
  background:
    radial-gradient(ellipse at 30% 30%, rgba(34,139,34,0.2) 0%, transparent 50%),
    linear-gradient(180deg, #0d1f0d 0%, #1a2f1a 50%, #0a1a0a 100%);
}

.scene-tension {
  /* 紧张场景：脉动红色光晕 */
  background:
    radial-gradient(ellipse at 50% 50%, rgba(139,0,0,0.3) 0%, transparent 50%),
    linear-gradient(180deg, #1a0a0a 0%, #0d0505 100%);
  animation: pulse-danger 4s ease-in-out infinite;
}

@keyframes pulse-danger {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

**方案 B: 粒子效果层**

```tsx
// 添加在背景之上的 SVG 粒子层
<ParticleLayer 
  density={50}           // 粒子数量
  color="rgba(255,255,255,0.3)"
  speed={0.5}            // 移动速度
  pattern="float"        // 漂浮/下落/上升
/>
```

#### 2.3.2 动效设计

| 触发时机 | 动效类型 | 时长 | 缓动函数 |
|----------|----------|------|----------|
| 场景切换 | 淡入淡出 | 400ms | ease-out |
| 对话出现 | 滑入+淡入 | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| 选项出现 | 依次弹入 | 150ms/个 | spring(1, 100, 10) |
| 属性变化 | 数字浮动 | 800ms | ease-out |
| 成就解锁 | 爆发光圈 | 1000ms | ease-out |
| 分支树展开 | 从右侧滑入 | 300ms | ease-out |

#### 2.3.3 音效提示（UI 配合）

| 场景 | 音效 | 视觉反馈 |
|------|------|----------|
| 对话出现 | 轻柔打字声 | 文字逐字显现 |
| 紧张选择 | 心跳声 | 背景微红闪烁 |
| 重要发现 | 铃声 | 光圈扩散 |
| 结局达成 | 史诗音乐 | 全屏闪光 |

---

## 三、交互优化方案

### 3.1 对话框固定高度设计

#### 当前问题
```tsx
// 当前实现 - 动态高度导致抖动
<div className="max-h-60 overflow-y-auto">
  {displayedText}  {/* 动态内容，高度变化 */}
</div>
```

#### 优化方案

```tsx
// 优化后 - 固定高度 + 内部滚动
<div 
  className="relative h-[180px] overflow-hidden"
  style={{ 
    contain: 'content',  // 隔离重排影响
    contentVisibility: 'auto'  // 优化渲染
  }}
>
  <div className="h-full overflow-y-auto scrollbar-thin">
    <div className="min-h-full">
      {displayedText}
    </div>
  </div>
  
  {/* 渐变遮罩，提示可滚动 */}
  {isScrollable && (
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
  )}
</div>
```

**CSS 关键属性**:

```css
.dialogue-container {
  height: 180px;           /* 固定高度 */
  overflow: hidden;        /* 外层隐藏溢出 */
  contain: content;        /* 性能优化：隔离重排 */
  content-visibility: auto; /* 视口外不渲染 */
}

.dialogue-content {
  height: 100%;
  overflow-y: auto;
  overflow-anchor: auto;   /* 锚定滚动位置 */
  scroll-behavior: smooth; /* 平滑滚动 */
}

/* 禁用滚动条动画导致的跳动 */
.dialogue-content::-webkit-scrollbar {
  width: 4px;
  transition: none;
}
```

### 3.2 打字机效果优化

#### 当前问题
```tsx
// 每 30ms 触发 React 重渲染 + scrollTop 更新
setInterval(() => {
  setDisplayedText(text.slice(0, index + 1))
  if (textContainerRef.current) {
    textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight
  }
  index++
}, 30)
```

**问题点**:
1. `setInterval` 与屏幕刷新率不同步
2. 每次 state 更新触发完整组件重渲染
3. `scrollTop` 更新导致布局抖动

#### 优化方案 A: requestAnimationFrame + 批量更新

```tsx
import { useRef, useEffect, useCallback } from 'react'

interface UseTypewriterOptions {
  text: string
  speed?: number        // ms per character
  onComplete?: () => void
  batchSize?: number    // characters per frame
}

export function useTypewriter({
  text,
  speed = 30,
  onComplete,
  batchSize = 1
}: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const charIndexRef = useRef(0)

  useEffect(() => {
    // 重置状态
    setDisplayedText('')
    setIsTyping(true)
    charIndexRef.current = 0
    startTimeRef.current = null

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const targetChars = Math.floor(elapsed / speed)
      
      if (charIndexRef.current < text.length) {
        // 批量更新字符
        const newIndex = Math.min(targetChars, text.length)
        if (newIndex > charIndexRef.current) {
          charIndexRef.current = newIndex
          setDisplayedText(text.slice(0, newIndex))
        }
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsTyping(false)
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [text, speed, onComplete])

  const skip = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setDisplayedText(text)
    setIsTyping(false)
    onComplete?.()
  }, [text, onComplete])

  return { displayedText, isTyping, skip }
}
```

#### 优化方案 B: CSS 动画（适合短文本）

```css
@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink-caret {
  from, to { border-color: transparent; }
  50% { border-color: white; }
}

.typewriter-text {
  overflow: hidden;
  white-space: nowrap;
  display: inline-block;
  animation: 
    typewriter 2s steps(40) forwards,
    blink-caret 0.75s step-end infinite;
  border-right: 2px solid white;
}
```

#### 动画曲线建议

| 场景类型 | 速度 | 缓动 | 说明 |
|----------|------|------|------|
| 普通对话 | 35ms/字 | linear | 稳定节奏 |
| 紧张情节 | 25ms/字 | linear | 加快节奏 |
| 独白/回忆 | 50ms/字 | ease-out | 慢慢放缓 |
| 重要揭示 | 40ms/字 | steps(1) | 逐字停顿 |

### 3.3 减少布局抖动的技术建议

#### 3.3.1 使用 CSS Containment

```css
/* 在固定高度容器上应用 */
.game-container {
  contain: layout style paint;
  content-visibility: auto;
}

.dialogue-box {
  contain: content;
  will-change: opacity; /* 仅声明会变化的属性 */
}

.choice-button {
  contain: layout;
  transform: translateZ(0); /* 创建独立合成层 */
}
```

#### 3.3.2 避免触发重排的操作

```tsx
// ❌ 避免：频繁读取布局属性
useEffect(() => {
  const height = element.offsetHeight  // 触发重排
  element.style.height = `${height}px`
}, [text])

// ✅ 推荐：使用 CSS 固定尺寸
<div className="h-[180px]">  {/* 固定高度 */}
```

#### 3.3.3 批量 DOM 更新

```tsx
// ❌ 避免：多次独立更新
setDisplayedText(newText)
setIsTyping(true)
setShowSkip(true)

// ✅ 推荐：合并状态或使用 useReducer
const [state, dispatch] = useReducer(typewriterReducer, {
  displayedText: '',
  isTyping: false,
  showSkip: true
})

// 或使用 flushSync 批量更新（React 18）
import { flushSync } from 'react-dom'

flushSync(() => {
  setDisplayedText(newText)
  setIsTyping(true)
})
```

#### 3.3.4 虚拟化长列表

```tsx
// 对于历史对话记录等长列表
import { VirtualList } from '@tanstack/react-virtual'

<VirtualList
  count={messages.length}
  estimateSize={() => 80}  // 固定预估高度
  overscan={3}
>
  {/* 只渲染可见项 */}
</VirtualList>
```

---

## 四、参考案例

### 4.1 Lifeline（生命线）

**设计亮点**:

```
┌─────────────────────────────────────┐
│                                     │
│    极简设计，仅保留文字             │
│                                     │
│    ┌───────────────────────────┐   │
│    │ Taylor: 我需要你的帮助... │   │
│    │                           │   │
│    │ 实时感：消息按"发送时间"  │   │
│    │ 逐条出现，营造真实通讯感  │   │
│    └───────────────────────────┘   │
│                                     │
│    [帮 Taylor 做出决定]             │
│                                     │
└─────────────────────────────────────┘
```

**可借鉴元素**:

| 元素 | 描述 | 应用建议 |
|------|------|----------|
| 实时消息感 | 对话按时间逐条出现 | AI 对话可用"思考中..."过渡 |
| 极简布局 | 无多余 UI，纯文字 | 隐藏 Header/Footer，全屏文字 |
| 通知驱动 | 通过推送唤回用户 | 可加 PWA 通知功能 |
| 黑色主题 | 深色背景，护眼 | 采用深色沉浸式背景 |

### 4.2 80 Days（八十天环游地球）

**设计亮点**:

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │   🗺️ 地图背景               │    │
│  │   根据当前位置动态变化      │    │
│  │   精美的插画风格            │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 叙事文字                    │    │
│  │ 你到达了孟买...             │    │
│  │                             │    │
│  │ 优雅的衬线字体              │    │
│  │ 段落式呈现                  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 时间: 10月8日  ⏱️ 剩余天数  │    │
│  │ 资金: £2000                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  [继续] [查看地图] [管理行李]       │
│                                     │
└─────────────────────────────────────┘
```

**可借鉴元素**:

| 元素 | 描述 | 应用建议 |
|------|------|----------|
| 地图背景 | 根据剧情变化的地图 | 场景背景动态切换 |
| 状态悬浮 | 时间/资金悬浮显示 | 属性栏悬浮化 |
| 优雅字体 | 衬线字体增强叙事感 | 标题/关键文本用衬线体 |
| 段落过渡 | 淡入淡出切换段落 | 场景切换动画 |

### 4.3 Reigns（王权）

**设计亮点**:

```
┌─────────────────────────────────────┐
│                                     │
│   👑 [角色卡片]                      │
│   ┌─────────────────────────────┐   │
│   │     角色大头像               │   │
│   │     表情随对话变化           │   │
│   └─────────────────────────────┘   │
│                                     │
│   "陛下，百姓请求减税..."           │
│                                     │
│   ┌───────┐           ┌───────┐    │
│   │  ❌   │           │  ✅   │    │
│   │ 拒绝  │           │ 同意  │    │
│   │ 减税  │           │ 减税  │    │
│   └───────┘           └───────┘    │
│        👆 滑动选择                   │
│                                     │
│   ⚪ 教堂  ⚪ 军队  ⚪ 百姓  ⚪ 金库  │
│   (四维属性，简洁直观)               │
│                                     │
└─────────────────────────────────────┘
```

**可借鉴元素**:

| 元素 | 描述 | 应用建议 |
|------|------|----------|
| 卡片式对话 | 角色卡片 + 对话框 | 头像 + 对话一体化设计 |
| 滑动交互 | 左右滑动选择 | 移动端可加手势选择 |
| 四维属性 | 极简的属性展示 | 状态栏简化为核心属性 |
| 动态表情 | 角色表情随剧情变化 | 可加角色表情动画 |

### 4.4 综合借鉴方案

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   [借鉴 80 Days] 全屏场景背景，根据剧情动态变化                 │
│                                                                 │
│                                                                 │
│   [借鉴 Lifeline] 极简对话呈现，聚焦文字内容                    │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ [借鉴 Reigns]                                           │  │
│   │                                                         │  │
│   │  👤 角色头像 + 对话文字一体化                            │  │
│   │                                                         │  │
│   │  "你发现了管家亨利的秘密..."                            │  │
│   │                                                         │  │
│   │  [借鉴 Lifeline] 实时打字效果                           │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   [借鉴 Reigns] 悬浮属性栏，简洁直观                            │
│   ⚪ 勇气 75  ⚪ 智慧 60  ⚪ 线索 3                            │
│                                                                 │
│   [借鉴 80 Days] 优雅过渡动画                                   │
│   ┌─────────────────┐  ┌─────────────────┐                     │
│   │ 1. 检查房间     │  │ 2. 询问管家     │                     │
│   └─────────────────┘  └─────────────────┘                     │
│   [借鉴 Reigns] 按钮式选项，清晰明确                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 五、实现优先级建议

### Phase 1: 基础沉浸化（1-2 周）

| 任务 | 优先级 | 工时 | 影响 |
|------|--------|------|------|
| 隐藏 Header/Footer | P0 | 2h | ⭐⭐⭐⭐⭐ |
| 固定对话框高度 | P0 | 4h | ⭐⭐⭐⭐⭐ |
| 分支树默认隐藏 | P0 | 4h | ⭐⭐⭐⭐ |
| 优化打字机效果 | P0 | 4h | ⭐⭐⭐⭐ |

### Phase 2: 氛围增强（2-3 周）

| 任务 | 优先级 | 工时 | 影响 |
|------|--------|------|------|
| 全屏场景背景 | P1 | 8h | ⭐⭐⭐⭐ |
| 动态渐变效果 | P1 | 4h | ⭐⭐⭐ |
| 悬浮 UI 实现 | P1 | 8h | ⭐⭐⭐⭐ |
| 场景切换动画 | P1 | 4h | ⭐⭐⭐ |

### Phase 3: 高级体验（后续迭代）

| 任务 | 优先级 | 工时 | 影响 |
|------|--------|------|------|
| 粒子效果层 | P2 | 8h | ⭐⭐ |
| 手势交互（移动端） | P2 | 12h | ⭐⭐⭐ |
| 角色表情动画 | P2 | 16h | ⭐⭐ |
| 音效可视化 | P2 | 8h | ⭐⭐ |

---

## 六、设计规范参考

### 6.1 颜色系统

```css
:root {
  /* 沉浸式背景色 */
  --bg-immersive: #0a0a0f;
  --bg-scene-dark: #0d0d1a;
  --bg-scene-tension: #1a0a0a;
  --bg-scene-hope: #0a1a0d;
  
  /* 对话框 */
  --dialogue-bg: rgba(0, 0, 0, 0.85);
  --dialogue-border: rgba(255, 255, 255, 0.1);
  --dialogue-text: #ffffff;
  --dialogue-text-secondary: rgba(255, 255, 255, 0.7);
  
  /* 强调色 */
  --accent-gold: #f59e0b;
  --accent-danger: #ef4444;
  --accent-success: #22c55e;
  --accent-info: #3b82f6;
}
```

### 6.2 字体系统

```css
/* 叙事文本 */
font-family: 'Noto Serif SC', 'Source Han Serif CN', serif;
font-size: 16px;
line-height: 1.8;

/* UI 文本 */
font-family: 'Inter', 'Noto Sans SC', sans-serif;
font-size: 14px;
line-height: 1.5;

/* 标题 */
font-family: 'Noto Serif SC', serif;
font-size: 24px;
font-weight: 600;
```

### 6.3 间距系统

```css
/* 移动端 */
--spacing-xs: 8px;
--spacing-sm: 12px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* 桌面端 */
--spacing-xs: 12px;
--spacing-sm: 16px;
--spacing-md: 24px;
--spacing-lg: 32px;
--spacing-xl: 48px;
```

---

## 七、验收标准

### 7.1 沉浸感验收

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 游戏内容占比 | ≥ 90% | 截图测量 |
| 首屏渲染时间 | ≤ 1.5s | Lighthouse |
| 打字机帧率 | ≥ 55fps | Chrome DevTools |
| 布局抖动次数 | 0 次/场景 | 视觉检查 |

### 7.2 交互验收

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 对话框高度稳定性 | 100% 固定 | 多场景测试 |
| 场景切换动画 | ≥ 300ms | 视觉检查 |
| 选项响应时间 | ≤ 100ms | 性能监控 |
| 移动端手势响应 | ≤ 50ms | 触摸测试 |

---

*文档版本: v1.0*
*作者: UI 设计师 Agent*
*最后更新: 2026-03-20*