import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core'

// 用户表
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
  nickname: varchar('nickname', { length: 50 }),
  apiKey: text('api_key'), // 用户自定义 API Key
  createdAt: timestamp('created_at').defaultNow(),
})

// 剧本表
export const scripts = pgTable('scripts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  genre: varchar('genre', { length: 20 }).notNull(), // 悬疑/奇幻/科幻
  cover: text('cover'), // 封面URL
  duration: integer('duration'), // 预计时长（分钟）
  difficulty: integer('difficulty'), // 1-5
  scenes: jsonb('scenes').notNull().$type<Record<string, any>>(), // 场景数据
  characters: jsonb('characters').$type<Record<string, any>>(), // 角色数据
  endings: jsonb('endings').$type<any[]>(), // 结局数据
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

// 游戏存档表
export const saves = pgTable('saves', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  scriptId: uuid('script_id').references(() => scripts.id),
  currentScene: varchar('current_scene', { length: 50 }),
  state: jsonb('state').$type<Record<string, any>>(), // 游戏状态
  history: jsonb('history').$type<any[]>(), // 对话历史
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 游戏记录表
export const gameRecords = pgTable('game_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  scriptId: uuid('script_id').references(() => scripts.id),
  endingId: varchar('ending_id', { length: 50 }),
  duration: integer('duration'), // 实际游玩时长（秒）
  completedAt: timestamp('completed_at').defaultNow(),
})

// 类型导出
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Script = typeof scripts.$inferSelect
export type NewScript = typeof scripts.$inferInsert
export type Save = typeof saves.$inferSelect
export type NewSave = typeof saves.$inferInsert
export type GameRecord = typeof gameRecords.$inferSelect
export type NewGameRecord = typeof gameRecords.$inferInsert