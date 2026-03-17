# Script System Specification

## 概述

剧本系统负责解析、验证和管理游戏剧本数据。剧本定义了游戏的所有场景、角色、选项和结局。

## 剧本数据结构

### Script 结构

```typescript
interface Script {
  id: string
  title: string
  description: string
  coverImage?: string
  genre: 'mystery' | 'fantasy' | 'scifi' | 'ancient' | 'modern'
  tags: string[]
  estimatedDuration: number  // 分钟
  difficulty: 'easy' | 'normal' | 'hard'
  
  // 剧本内容
  characters: Character[]
  scenes: Record<string, Scene>
  endings: Ending[]
  
  // 初始状态
  initialState: {
    attributes: Record<string, number>
    relationships: Record<string, number>
  }
  
  // 元数据
  playCount: number
  rating: number
  createdAt: string
  updatedAt: string
}
```

### Character 结构

```typescript
interface Character {
  id: string
  name: string
  avatar?: string
  description: string
  personality: string
  speakingStyle: string
}
```

### Scene 结构

```typescript
interface Scene {
  id: string
  speaker?: string       // 说话角色ID
  text: string           // 场景文本
  choices?: Choice[]     // 可选选项
  nextSceneId?: string   // 自动跳转场景
  effects?: Effect[]     // 进入场景的效果
  background?: string    // 背景图片
}
```

### Choice 结构

```typescript
interface Choice {
  id: string
  text: string
  nextSceneId: string
  effects?: Effect[]
  condition?: Condition
}
```

### Ending 结构

```typescript
interface Ending {
  id: string
  title: string
  description: string
  image?: string
  condition: Record<string, { min?: number; max?: number }>
  priority: number  // 结局优先级
}
```

## 剧本解析器：ScriptParser

### 职责

1. 解析 JSON 剧本数据
2. 验证剧本结构
3. 检查引用完整性（场景ID、角色ID）
4. 提取剧本元信息

### 接口设计

```typescript
class ScriptParser {
  // 解析剧本
  parse(json: string): Script
  
  // 验证剧本
  validate(script: Script): ValidationResult
  
  // 获取场景
  getScene(script: Script, sceneId: string): Scene | null
  
  // 获取角色
  getCharacter(script: Script, charId: string): Character | null
  
  // 获取起始场景
  getStartScene(script: Script): Scene | null
  
  // 检查场景引用
  checkSceneReferences(script: Script): string[]
}
```

### 验证规则

1. **必填字段检查**
   - id, title, genre 必填
   - scenes 至少有一个
   - endings 至少有一个

2. **引用完整性**
   - 所有 choice.nextSceneId 必须指向存在的场景
   - 所有 scene.speaker 必须指向存在的角色
   - 所有关系引用必须指向存在的角色

3. **数据类型检查**
   - attributes 必须是数值
   - relationships 必须是数值

## 剧本加载器：ScriptLoader

### 职责

1. 从文件系统加载剧本
2. 从 URL 加载剧本
3. 缓存已加载的剧本

### 接口设计

```typescript
class ScriptLoader {
  // 从文件加载
  loadFromFile(path: string): Promise<Script>
  
  // 从 URL 加载
  loadFromUrl(url: string): Promise<Script>
  
  // 获取缓存的剧本
  getFromCache(scriptId: string): Script | null
  
  // 清除缓存
  clearCache(): void
}
```

## 测试用例

### 解析测试

1. 正确解析有效 JSON
2. 无效 JSON 抛出错误
3. 缺少必填字段抛出错误

### 验证测试

1. 有效剧本通过验证
2. 缺少必填字段验证失败
3. 无效场景引用验证失败
4. 无效角色引用验证失败

### 场景获取测试

1. 正确获取存在的场景
2. 不存在的场景返回 null
3. 正确获取起始场景

### 角色获取测试

1. 正确获取存在的角色
2. 不存在的角色返回 null

### 引用检查测试

1. 正确识别无效场景引用
2. 正确识别无效角色引用
3. 无引用问题返回空数组

## 错误处理

### 错误类型

```typescript
class ScriptParseError extends Error {
  constructor(message: string, public path?: string) {
    super(message)
    this.name = 'ScriptParseError'
  }
}

class ScriptValidationError extends Error {
  constructor(message: string, public errors: string[]) {
    super(message)
    this.name = 'ScriptValidationError'
  }
}
```

## 文件格式示例

```json
{
  "id": "mystery-castle",
  "title": "神秘古堡",
  "description": "一个充满谜团的古老城堡...",
  "genre": "mystery",
  "tags": ["悬疑", "解谜"],
  "estimatedDuration": 60,
  "difficulty": "normal",
  "characters": [
    {
      "id": "butler",
      "name": "管家",
      "description": "古堡的管家，神秘莫测"
    }
  ],
  "scenes": {
    "start": {
      "id": "start",
      "text": "你站在古堡大门前...",
      "choices": [
        {
          "id": "enter",
          "text": "推门进入",
          "nextSceneId": "hall"
        }
      ]
    }
  },
  "endings": [
    {
      "id": "truth",
      "title": "真相大白",
      "description": "你揭开了古堡的秘密",
      "condition": { "clue": { "min": 5 } }
    }
  ],
  "initialState": {
    "attributes": { "clue": 0, "courage": 50 },
    "relationships": { "butler": 0 }
  }
}
```