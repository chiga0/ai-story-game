# Umami Analytics 集成说明

## 概述

本项目已集成 [Umami](https://umami.is/) 网站访问统计，用于追踪用户行为数据。

**选择 Umami 的原因**：
- ✅ 开源、可自托管
- ✅ 隐私友好，符合 GDPR
- ✅ 轻量级脚本（<2KB）
- ✅ 支持自定义事件追踪

## 配置方式

### 1. Umami Cloud（推荐新手）

1. 注册 [Umami Cloud](https://umami.is/) 账号
2. 创建网站，获取 Website ID
3. 在 `.env` 中配置：

```env
VITE_UMAMI_WEBSITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# VITE_UMAMI_SRC 不需要配置，默认使用 Umami Cloud
```

### 2. 自托管 Umami

1. 参考 [官方文档](https://umami.is/docs/install) 部署 Umami 服务
2. 创建网站，获取 Website ID
3. 在 `.env` 中配置：

```env
VITE_UMAMI_WEBSITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_UMAMI_SRC=https://your-umami-server.com/script.js
```

## 追踪的事件

### 自动追踪（PV/UV）
- 页面访问量自动追踪，无需手动配置

### 自定义事件

| 事件名 | 触发时机 | 数据字段 |
|--------|----------|----------|
| `game-start` | 游戏开始 | scriptId, scriptTitle, genre |
| `script-select` | 剧本选择 | scriptId, scriptTitle, genre |
| `game-ending` | 结局达成 | scriptId, endingId, endingType, playTime, choiceCount |
| `game-save` | 存档保存 | scriptId |
| `game-load` | 存档加载 | scriptId |
| `achievement-unlock` | 成就解锁 | achievementId, achievementTitle |
| `share-card` | 分享卡片生成 | scriptId, endingId |
| `script-create` | 剧本创建 | genre |

## 手动追踪事件

```typescript
import { trackEvent, gameEvents } from '#/lib/analytics/umami'

// 方式一：使用预定义事件
gameEvents.start('script-1', '神秘岛屿', 'mystery')

// 方式二：自定义事件
trackEvent('custom-event', {
  key: 'value',
  anotherKey: 123,
})
```

## 开发环境

在开发环境下，事件追踪会输出到控制台日志，而非实际发送到 Umami 服务器。

```
[Analytics] game-start { scriptId: 'demo', scriptTitle: 'Demo Script', genre: 'mystery' }
```

## 隐私合规

- Umami 不使用 Cookies
- 不收集个人身份信息
- 符合 GDPR、CCPA 等隐私法规
- 用户可选择禁用 DNT（Do Not Track）