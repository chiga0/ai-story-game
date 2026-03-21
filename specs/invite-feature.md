# 邀请好友机制设计文档

## 一、概述

### 1.1 目标
通过邀请好友机制，利用现有用户的社交网络实现用户增长，同时增强用户粘性和社区氛围。

### 1.2 核心指标
- 邀请转化率：被邀请者注册并完成首次游戏的比例
- 邀请活跃度：每月发起邀请的用户占比
- K因子：平均每个用户带来的新用户数量
- 留存提升：被邀请用户的次日/7日留存率

---

## 二、邀请流程设计

### 2.1 整体流程

```
用户A（邀请者）                  用户B（被邀请者）
     │                                │
     ├─ 1. 点击"邀请好友"              │
     │                                │
     ├─ 2. 选择分享渠道 ─────────────────► 收到邀请链接
     │                                │
     │                                ├─ 3. 打开链接，查看剧本预览
     │                                │
     │                                ├─ 4. 注册/登录
     │                                │
     │                                ├─ 5. 完成首个剧本
     │                                │
     ├─ 6. 获得奖励 ◄─────────────────────┤
     │                                │
     └─ 7. 双方奖励到账                 └─ 8. 获得新手奖励
```

### 2.2 入口设计

| 入口位置 | 触发时机 | 优先级 |
|---------|---------|-------|
| 游戏结束页 | 达成结局后 | P0 |
| 成就页面 | 解锁成就后 | P0 |
| 个人中心 | 常驻入口 | P1 |
| 首页顶部横幅 | 限时活动 | P2 |

### 2.3 邀请码/链接规则

```typescript
interface InviteCode {
  code: string           // 6位字母数字组合，如 "ABC123"
  inviterId: string      // 邀请者用户ID
  createdAt: number      // 创建时间
  expiresAt: number      // 过期时间（可选，默认永久有效）
  usageLimit: number     // 使用次数限制（可选，默认无限制）
  usedCount: number      // 已使用次数
}
```

---

## 三、奖励机制

### 3.1 双向奖励设计

| 角色 | 奖励内容 | 触发条件 | 备注 |
|-----|---------|---------|-----|
| **邀请者** | +50 积分 | 被邀请者注册成功 | 即时到账 |
| | +100 积分 | 被邀请者完成首个剧本 | 限时24小时内 |
| | 专属成就「人脉王」 | 累计邀请3人 | 永久徽章 |
| | 专属剧本解锁 | 累计邀请5人 | VIP剧本内容 |
| **被邀请者** | +30 积分 | 通过邀请链接注册 | 新人礼包 |
| | 新手专属剧本 | 注册成功 | 低难度引导剧本 |
| | 双倍积分卡(24h) | 首次完成剧本后 | 限时增益 |

### 3.2 积分用途

积分可在「积分商城」兑换：
- 专属剧本解锁
- 角色皮肤/头像框
- 跳过广告卡
- 自定义剧本模板

### 3.3 阶梯奖励（月度）

| 邀请人数 | 额外奖励 |
|---------|---------|
| 3人 | +100 积分 |
| 5人 | 专属徽章「社交达人」 |
| 10人 | 一个月 VIP 会员 |
| 20人 | 创作工具解锁 + 专属称号 |

### 3.4 防刷机制

1. **设备限制**：同一设备注册的新账号不计入邀请奖励
2. **行为验证**：被邀请者需完成至少一个剧本才算有效邀请
3. **时间窗口**：被邀请者需在注册后7天内完成剧本
4. **异常检测**：检测短时间大量邀请、相同IP等异常行为
5. **人工审核**：大额奖励（如VIP）需人工审核

---

## 四、分享渠道

### 4.1 支持渠道

| 渠道 | 分享形式 | 优先级 | 备注 |
|-----|---------|-------|-----|
| **微信** | 小程序卡片/链接 | P0 | 最核心渠道 |
| **飞书** | 卡片消息 | P0 | 企业用户场景 |
| **复制链接** | 纯文本链接 | P0 | 通用兜底 |
| **二维码** | 图片 | P1 | 线下场景 |
| **微博** | 图文卡片 | P2 | 公域流量 |
| **QQ** | 卡片消息 | P2 | 年轻用户 |

### 4.2 分享内容模板

#### 微信分享卡片
```
标题：我在「AI剧本杀」解锁了「完美结局」！
描述：来和我一起探索沉浸式故事世界，点击体验 👇
图片：游戏截图 + 结局卡片
```

#### 飞书卡片
```json
{
  "title": "邀请你一起玩 AI 剧本杀",
  "description": "我刚刚完成了一个精彩的故事，邀请你来体验！",
  "button": "立即加入",
  "image": "剧本封面"
}
```

#### 通用链接
```
https://ai-story.game/invite/ABC123
  ?from=用户名
  &script=神秘古堡
  &ending=完美结局
```

### 4.3 链接参数设计

```
/invite/{inviteCode}
  ?utm_source=wechat    // 来源渠道
  &utm_medium=share     // 分享类型
  &ref_script=xxx       // 推荐剧本（可选）
  &ref_ending=xxx       // 结局类型（可选）
```

---

## 五、技术实现建议

### 5.1 数据库设计

```sql
-- 邀请码表
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  inviter_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- 邀请记录表
CREATE TABLE invite_records (
  id UUID PRIMARY KEY,
  invite_code_id UUID REFERENCES invite_codes(id),
  inviter_id UUID NOT NULL REFERENCES users(id),
  invitee_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, registered, completed
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  rewards_granted JSONB -- 已发放奖励
);

-- 奖励发放记录
CREATE TABLE reward_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- invite_register, invite_complete, etc.
  amount INTEGER,
  related_invite_id UUID REFERENCES invite_records(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 API 设计

```typescript
// 生成邀请链接
POST /api/invite/generate
Response: { code: string, link: string, qrCode: string }

// 验证邀请码
GET /api/invite/verify/:code
Response: { valid: boolean, inviter?: { name: string, avatar: string } }

// 绑定邀请关系
POST /api/invite/bind
Body: { code: string }
Response: { success: boolean, rewards: Reward[] }

// 获取邀请统计
GET /api/invite/stats
Response: { 
  totalInvites: number,
  completedInvites: number,
  rewards: RewardSummary 
}

// 获取邀请记录列表
GET /api/invite/records
Response: { records: InviteRecord[] }
```

### 5.3 前端组件

```tsx
// 邀请按钮组件
<InviteButton 
  scriptId="mystery-castle"
  endingId="perfect-ending"
  channels={['wechat', 'feishu', 'link']}
/>

// 邀请弹窗组件
<InviteModal 
  visible={showInvite}
  onClose={() => setShowInvite(false)}
  shareConfig={{
    title: '邀请好友一起玩',
    description: '我在 AI 剧本杀等你！',
    link: 'https://...',
    qrCode: 'data:image/png;base64,...'
  }}
/>

// 邀请记录组件
<InviteRecords 
  records={inviteRecords}
  onClaimReward={(recordId) => {}}
/>
```

---

## 六、数据埋点需求

### 6.1 核心事件

| 事件名称 | 触发时机 | 参数 |
|---------|---------|-----|
| `invite_button_click` | 点击邀请按钮 | position, script_id |
| `invite_channel_select` | 选择分享渠道 | channel |
| `invite_link_generated` | 生成邀请链接 | code, channel |
| `invite_link_opened` | 打开邀请链接 | code, utm_source |
| `invite_code_bound` | 绑定邀请码 | code, invitee_id |
| `invite_reward_granted` | 发放奖励 | type, amount, user_id |
| `invite_completed` | 被邀请者完成剧本 | invite_record_id |

### 6.2 转化漏斗

```
邀请按钮曝光
  └─ 邀请按钮点击 (CTR)
      └─ 分享渠道选择
          └─ 邀请链接生成
              └─ 链接打开 (点击率)
                  └─ 注册转化
                      └─ 首次游戏完成 (核心转化)
```

### 6.3 监控指标

```typescript
// 实时监控
{
  "invite_links_generated_24h": 1234,
  "invite_links_opened_24h": 567,
  "invite_registrations_24h": 89,
  "invite_completions_24h": 45,
  "conversion_rate": "7.9%"
}

// 日志示例
{
  "event": "invite_link_opened",
  "timestamp": "2024-03-20T12:00:00Z",
  "code": "ABC123",
  "utm_source": "wechat",
  "device": "mobile",
  "new_user": true
}
```

---

## 七、MVP 实施计划

### Phase 1: 基础功能（2周）

- [ ] 邀请码生成与验证
- [ ] 基础分享功能（复制链接）
- [ ] 注册绑定邀请关系
- [ ] 基础奖励发放（积分）

### Phase 2: 渠道扩展（1周）

- [ ] 微信分享卡片
- [ ] 飞书卡片消息
- [ ] 二维码生成

### Phase 3: 增强功能（2周）

- [ ] 阶梯奖励系统
- [ ] 邀请排行榜
- [ ] 积分商城（基础）
- [ ] 完整数据埋点

---

## 八、风险与应对

| 风险 | 影响 | 应对措施 |
|-----|-----|---------|
| 刷邀请套利 | 高 | 设备检测、行为验证、延迟发放 |
| 分享转化低 | 中 | 优化分享文案、A/B测试 |
| 用户反感 | 中 | 控制邀请提醒频率、提供关闭入口 |
| 跨平台追踪困难 | 低 | 使用统一标识、短链接服务 |