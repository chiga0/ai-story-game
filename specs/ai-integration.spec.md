# AI Integration Specification

## 概述

AI 集成模块负责与百炼平台 GLM-5 模型通信，实现动态对话生成、NPC 个性化和随机事件生成。

## 配置

### 环境变量

```
BAILIAN_API_KEY=your-api-key
BAILIAN_BASE_URL=https://coding.dashscope.aliyuncs.com/v1
```

### 模型配置

- **Provider**: 百炼平台 (DashScope)
- **Model**: glm-5
- **兼容模式**: OpenAI API 格式

## 核心模块

### 1. AI Client (`src/lib/ai/client.ts`)

#### 接口设计

```typescript
// 对话上下文
interface DialogueContext {
  scene: string              // 当前场景描述
  speaker?: string           // 说话者名称
  playerHistory: string[]    // 玩家历史选择
  gameState: Record<string, any>  // 游戏状态
}

// 游戏上下文
interface GameContext {
  scriptId: string
  currentScene: string
  attributes: Record<string, number>
  relationships: Record<string, number>
}

// NPC 定义
interface NPC {
  id: string
  name: string
  avatar?: string
  personality: string
}

// 游戏事件
interface GameEvent {
  id: string
  type: 'random' | 'triggered'
  description: string
  effects?: Record<string, any>
}
```

#### 核心函数

1. **generateDialogue(context: DialogueContext): Promise<string>**
   - 生成单次对话文本
   - 非流式，适用于预览或测试

2. **streamDialogue(context: DialogueContext): Promise<StreamTextResult>**
   - 流式生成对话
   - 适用于实时显示打字机效果

3. **generateRandomEvent(context: GameContext): Promise<GameEvent>**
   - 生成随机游戏事件

4. **personalizeNPC(npc: NPC, playerChoices: string[]): NPC**
   - 根据玩家选择调整 NPC 性格

### 2. Prompt Templates (`src/lib/ai/prompts.ts`)

#### 系统提示词

```typescript
const SYSTEM_PROMPTS = {
  gameMaster: '游戏主持系统提示',
  npc: (name, personality) => 'NPC 角色提示',
  enhanceStory: '剧情增强提示',
}
```

#### 对话模板

```typescript
const DIALOGUE_TEMPLATES = {
  sceneDescription: (scene, atmosphere) => '场景描述',
  choiceGeneration: (context, numChoices) => '选择生成',
  endingCheck: (gameState) => '结局判定',
}
```

### 3. Chat API (`src/routes/api/chat.ts`)

#### 端点: POST /api/chat

**请求体:**
```json
{
  "scene": "庄园大厅",
  "speaker": "管家亨利",
  "playerHistory": ["进入庄园", "询问威廉爵士"],
  "gameState": { "courage": 5, "clues": 1 }
}
```

**响应:**
- Content-Type: text/event-stream
- 流式返回对话文本

## 流式响应处理

### Server-Sent Events 格式

```
data: {"text": "欢"}
data: {"text": "迎"}
data: {"text": "来"}
data: [DONE]
```

### 前端处理

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify(context),
  headers: { 'Content-Type': 'application/json' },
})

const reader = response.body.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  // 处理数据块
}
```

## 错误处理

1. **API Key 缺失**: 返回 500 错误
2. **请求超时**: 设置 30 秒超时
3. **模型错误**: 捕获并返回友好错误信息
4. **流式中断**: 客户端重连机制

## 性能要求

- 对话生成延迟: < 2s (首字)
- 流式输出速度: ~30 字符/秒
- 并发支持: 100 请求/秒

## 测试清单

### 单元测试

1. AI 客户端初始化
2. generateDialogue 返回正确格式
3. streamDialogue 返回可读流
4. generateRandomEvent 返回有效事件
5. personalizeNPC 正确调整 NPC
6. Prompt 模板构建正确

### 集成测试

1. POST /api/chat 返回流式响应
2. 流式响应可以被正确解析
3. 错误情况正确处理
4. 超时机制正常工作