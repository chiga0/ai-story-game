import { db } from '../db'
import { saves, gameRecords } from '../db/schema'
import type { GameState } from './engine'
import { eq, and, desc } from 'drizzle-orm'

export interface SaveData {
  id: string
  userId?: string
  scriptId: string
  scriptTitle?: string
  currentScene: string
  state: GameState
  createdAt: Date
  updatedAt: Date
}

// 存档管理器
export class SaveManager {
  private userId: string | null = null

  constructor(userId?: string) {
    this.userId = userId || null
  }

  // 设置用户ID
  setUserId(userId: string): void {
    this.userId = userId
  }

  // 保存游戏
  async save(state: GameState, scriptId: string): Promise<string> {
    if (!this.userId) {
      // 游客模式，保存到 localStorage
      const saves = this.getLocalSaves()
      const saveId = `local-${Date.now()}`
      saves.push({
        id: saveId,
        userId: 'guest',
        scriptId,
        currentScene: state.currentScene,
        state: state,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      localStorage.setItem('game-saves', JSON.stringify(saves))
      return saveId
    }

    // 已登录用户，保存到数据库
    const [save] = await db
      .insert(saves)
      .values({
        userId: this.userId,
        scriptId,
        currentScene: state.currentScene,
        state: state as any,
        history: state.history as any,
      })
      .returning()

    return save.id
  }

  // 加载游戏
  async load(saveId: string): Promise<GameState | null> {
    if (saveId.startsWith('local-')) {
      // 游客模式，从 localStorage 加载
      const saves = this.getLocalSaves()
      const save = saves.find((s) => s.id === saveId)
      return save?.state || null
    }

    // 从数据库加载
    const [save] = await db.select().from(saves).where(eq(saves.id, saveId))

    if (!save) return null

    return {
      ...save.state,
      history: save.history || [],
    } as GameState
  }

  // 获取存档列表
  async listSaves(scriptId?: string): Promise<SaveData[]> {
    if (!this.userId) {
      // 游客模式
      const saves = this.getLocalSaves()
      return scriptId ? saves.filter((s) => s.scriptId === scriptId) : saves
    }

    // 从数据库获取
    const query = db.select().from(saves).where(eq(saves.userId, this.userId))

    if (scriptId) {
      const results = await db
        .select()
        .from(saves)
        .where(and(eq(saves.userId, this.userId), eq(saves.scriptId, scriptId)))
        .orderBy(desc(saves.updatedAt))
      return results.map(r => ({
        id: r.id,
        userId: r.userId || undefined,
        scriptId: r.scriptId || '',
        currentScene: r.currentScene || '',
        state: r.state as GameState,
        createdAt: r.createdAt || new Date(),
        updatedAt: r.updatedAt || new Date(),
      })) as SaveData[]
    }

    const results = await query.orderBy(desc(saves.updatedAt))
    return results.map(r => ({
      id: r.id,
      userId: r.userId || undefined,
      scriptId: r.scriptId || '',
      currentScene: r.currentScene || '',
      state: r.state as GameState,
      createdAt: r.createdAt || new Date(),
      updatedAt: r.updatedAt || new Date(),
    })) as SaveData[]
  }

  // 删除存档
  async delete(saveId: string): Promise<void> {
    if (saveId.startsWith('local-')) {
      const saves = this.getLocalSaves()
      const filtered = saves.filter((s) => s.id !== saveId)
      localStorage.setItem('game-saves', JSON.stringify(filtered))
      return
    }

    await db.delete(saves).where(eq(saves.id, saveId))
  }

  // 记录游戏完成
  async recordCompletion(
    scriptId: string,
    endingId: string,
    duration: number
  ): Promise<void> {
    if (!this.userId) return

    await db.insert(gameRecords).values({
      userId: this.userId,
      scriptId,
      endingId,
      duration,
    })
  }

  // 本地存储辅助方法
  private getLocalSaves(): SaveData[] {
    if (typeof localStorage === 'undefined') return []
    const data = localStorage.getItem('game-saves')
    return data ? JSON.parse(data) : []
  }
}

// 创建存档管理器实例
export function createSaveManager(userId?: string): SaveManager {
  return new SaveManager(userId)
}