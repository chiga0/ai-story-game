/**
 * AI 剧本生成 Prompts
 * 用于生成剧本大纲、角色、场景和结局
 */

// ============================================
// 大纲生成 Prompt
// ============================================

export const OUTLINE_GENERATION_PROMPT = `你是一个专业的剧本作家，擅长创作互动式剧本杀故事。

请根据以下要求创作一个剧本大纲：

**主题**：{theme}
**主题描述**：{themeDescription}
**难度**：{difficulty}
**预计时长**：{duration}
**场景数量**：{sceneRange} 个
**角色数量**：{characterRange} 个
{customElements}

**默认元素**：{defaultElements}

请返回 JSON 格式的大纲：
\`\`\`json
{
  "title": "剧本标题",
  "description": "剧本简介（50-100字）",
  "genre": "剧本类型",
  "setting": "故事背景设定",
  "mainPlot": "主要剧情线",
  "keyEvents": ["关键事件1", "关键事件2", "关键事件3"],
  "estimatedScenes": 15,
  "estimatedCharacters": 4
}
\`\`\`

要求：
1. 标题要有吸引力，能体现主题特色
2. 故事背景要详细，有代入感
3. 主要剧情要有起承转合
4. 关键事件要能推动剧情发展
5. 只返回 JSON，不要其他内容`

// ============================================
// 角色生成 Prompt
// ============================================

export const CHARACTER_GENERATION_PROMPT = `你是一个角色设计师，为互动剧本创建生动的角色。

**剧本信息**：
- 标题：{title}
- 简介：{description}
- 背景：{setting}
- 主线：{mainPlot}

**要求**：
- 创建 {characterCount} 个角色
- 每个角色要有独特的性格和说话风格
- 角色之间要有互动关系
- 至少有一个主角视角角色

请返回 JSON 数组格式的角色列表：
\`\`\`json
[
  {
    "id": "char-1",
    "name": "角色名称",
    "description": "角色描述（外貌、身份等）",
    "personality": "性格特点",
    "speakingStyle": "说话风格（如：温和、犀利、神秘等）",
    "avatar": "🎭"
  }
]
\`\`\`

要求：
1. id 格式为 "char-数字"
2. avatar 使用 emoji 表示
3. 每个角色性格要鲜明，有辨识度
4. 只返回 JSON 数组，不要其他内容`

// ============================================
// 场景生成 Prompt
// ============================================

export const SCENE_GENERATION_PROMPT = `你是一个场景设计师，为互动剧本创建分支剧情场景。

**剧本信息**：
- 标题：{title}
- 简介：{description}
- 背景：{setting}
- 主线：{mainPlot}

**关键事件**：
- {keyEvents}

**角色**：{characters}

**要求**：
- 创建 {sceneCount} 个场景
- 每个场景有 {choicesPerScene} 个选择
- 场景之间要有逻辑连接
- 包含起点场景（id: "start"）

请返回 JSON 数组格式的场景列表：
\`\`\`json
[
  {
    "id": "start",
    "text": "场景文本（对话或旁白）",
    "speaker": "char-1",
    "background": "可选的背景描述",
    "choices": [
      {
        "id": "choice-1",
        "text": "选择文本",
        "nextSceneId": "scene-2",
        "effects": [
          {
            "attribute": "勇气",
            "change": 5
          }
        ]
      }
    ]
  }
]
\`\`\`

要求：
1. 第一个场景 id 必须是 "start"
2. 场景 id 格式为 "start" 或 "scene-数字"
3. 选择 id 格式为 "choice-数字"
4. nextSceneId 必须指向存在的场景
5. effects 可选，用于改变属性或关系
6. 场景文本要生动，有代入感
7. 选择要有意义，不同选择导向不同结果
8. 只返回 JSON 数组，不要其他内容`

// ============================================
// 结局生成 Prompt
// ============================================

export const ENDING_GENERATION_PROMPT = `你是一个结局设计师，为互动剧本创建多种结局。

**剧本信息**：
- 标题：{title}
- 主线：{mainPlot}

**场景统计**：
- 总场景数：{sceneCount}
- 结局场景数：{endingSceneCount}
- 部分场景 ID：{sceneIds}

请创建 3-5 个不同的结局，包括：
- 好结局（完美结局）
- 普通结局
- 坏结局
- 隐藏结局（可选）

请返回 JSON 数组格式的结局列表：
\`\`\`json
[
  {
    "id": "ending-good",
    "title": "结局标题",
    "description": "结局描述（100-200字）",
    "condition": {
      "勇气": { "min": 80 },
      "智慧": { "min": 60 }
    }
  }
]
\`\`\`

要求：
1. id 格式为 "ending-类型"
2. title 要有感染力
3. description 要详细描述结局画面和感受
4. condition 定义触发条件（属性要求）
5. 不同结局要有明显区别
6. 只返回 JSON 数组，不要其他内容`

// ============================================
// 辅助 Prompt 片段
// ============================================

export const PROMPT_FRAGMENTS = {
  // 主题风格提示
  themeStyle: {
    mystery: '保持悬疑感，逐步揭示线索，制造反转',
    fantasy: '营造奇幻氛围，魔法元素要自洽，英雄成长弧线',
    scifi: '科技感与人性探讨并重，未来设定要合理',
    horror: '营造紧张氛围，心理恐惧与生存压力',
    romance: '情感细腻，关系发展自然，多角度展现',
    adventure: '节奏紧凑，探索与发现，成长与蜕变',
  },

  // 难度提示
  difficultyHint: {
    easy: '选择清晰明确，后果直观，适合新手',
    normal: '选择有一定复杂性，需要思考但不过分困难',
    hard: '选择后果复杂，多重影响，需要深思熟虑',
  },

  // 时长提示
  durationHint: {
    short: '剧情紧凑，快速进入高潮，简洁有力',
    medium: '剧情完整，有铺垫有高潮，节奏适中',
    long: '剧情丰富，多线发展，深度探索',
  },
}

/**
 * 构建完整的场景生成 Prompt
 */
export function buildScenePrompt(
  outline: { title: string; description: string; setting: string; mainPlot: string; keyEvents: string[] },
  characters: { id: string; name: string }[],
  options: { sceneCount: number; choicesPerScene: number }
): string {
  const characterList = characters.map((c) => `- ${c.name} (${c.id})`).join('\n')

  return `你是一个场景设计师，为互动剧本创建分支剧情场景。

**剧本信息**：
- 标题：${outline.title}
- 简介：${outline.description}
- 背景：${outline.setting}
- 主线：${outline.mainPlot}

**关键事件**：
${outline.keyEvents.map((e) => `- ${e}`).join('\n')}

**角色列表**：
${characterList}

**要求**：
- 创建 ${options.sceneCount} 个场景
- 每个场景有 ${options.choicesPerScene} 个选择
- 场景之间要有逻辑连接
- 包含起点场景（id: "start"）

请返回 JSON 数组格式的场景列表。`
}