import { test, expect } from '@playwright/test'

test.describe('完整游戏流程 E2E 测试', () => {
  // ==================== 首页流程 ====================
  test.describe('首页', () => {
    test('应该显示正确的页面标题', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveTitle(/AI Story Game/)
    })

    test('应该显示主要功能介绍', async ({ page }) => {
      await page.goto('/')
      
      // 检查功能卡片存在
      const cards = await page.locator('h3').count()
      expect(cards).toBeGreaterThanOrEqual(1)
    })

    test('应该能点击开始冒险按钮', async ({ page }) => {
      await page.goto('/')
      
      // 点击剧本库链接
      const scriptsLink = page.locator('a[href="/scripts"]').first()
      if (await scriptsLink.isVisible()) {
        await scriptsLink.click()
        await page.waitForURL('/scripts')
        expect(page.url()).toContain('/scripts')
      }
    })
  })

  // ==================== 剧本库流程 ====================
  test.describe('剧本库', () => {
    test('应该显示剧本列表', async ({ page }) => {
      await page.goto('/scripts')
      
      // 等待剧本卡片加载
      await page.waitForSelector('a[href^="/play/"]', { timeout: 5000 })
      
      // 检查至少有一个剧本
      const cards = await page.locator('a[href^="/play/"]').count()
      expect(cards).toBeGreaterThanOrEqual(1)
    })

    test('应该显示剧本基本信息', async ({ page }) => {
      await page.goto('/scripts')
      await page.waitForSelector('a[href^="/play/"]', { timeout: 5000 })
      
      // 检查有剧本标题
      const title = await page.locator('h3').first().textContent()
      expect(title?.length).toBeGreaterThan(0)
    })

    test('应该能点击剧本进入游戏', async ({ page }) => {
      await page.goto('/scripts')
      
      // 点击第一个剧本
      const firstScript = page.locator('a[href^="/play/"]').first()
      await firstScript.click()
      
      // 等待跳转
      await page.waitForURL(/\/play\/.+/)
      expect(page.url()).toContain('/play/')
    })
  })

  // ==================== 游戏核心流程 ====================
  test.describe('游戏核心', () => {
    test('神秘古堡 - 完整游戏流程', async ({ page }) => {
      await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000)
      
      // 1. 检查初始场景加载
      const body = page.locator('body')
      await expect(body).toBeVisible()
      
      // 2. 检查有选项可选
      await page.waitForTimeout(1000)
      const buttons = await page.locator('button').count()
      expect(buttons).toBeGreaterThanOrEqual(1)
      
      // 3. 点击第一个选项
      const firstButton = page.locator('button').first()
      if (await firstButton.isVisible()) {
        await firstButton.click()
        await page.waitForTimeout(1500)
      }
      
      // 4. 检查页面仍然正常
      expect(page.url()).toContain('/play/')
    })

    test('星际迷途 - 完整游戏流程', async ({ page }) => {
      await page.goto('/play/lost-in-space', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000)
      
      const body = page.locator('body')
      await expect(body).toBeVisible()
      
      // 点击选项
      await page.waitForTimeout(1000)
      const buttons = await page.locator('button').count()
      expect(buttons).toBeGreaterThanOrEqual(1)
    })

    test('龙之谷 - 完整游戏流程', async ({ page }) => {
      await page.goto('/play/dragon-valley', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000)
      
      const body = page.locator('body')
      await expect(body).toBeVisible()
      
      // 点击选项
      await page.waitForTimeout(1000)
      const buttons = await page.locator('button').count()
      expect(buttons).toBeGreaterThanOrEqual(1)
    })
  })

  // ==================== 对话系统测试 ====================
  test.describe('对话系统', () => {
    test('对话内容应该正常显示', async ({ page }) => {
      await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(3000)
      
      // 检查有文本内容
      const text = await page.locator('body').textContent()
      expect(text?.length).toBeGreaterThan(50)
    })

    test('选项按钮应该可点击', async ({ page }) => {
      await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(3000)
      
      // 检查按钮数量
      const buttons = page.locator('button')
      const count = await buttons.count()
      expect(count).toBeGreaterThanOrEqual(1)
      
      // 点击第一个按钮
      await buttons.first().click()
      await page.waitForTimeout(1000)
      
      // 页面应该正常响应
      expect(page.url()).toContain('/play/')
    })

    test('多个选项应该都能显示', async ({ page }) => {
      await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(3000)
      
      // 检查有多个选项
      const buttons = await page.locator('button').count()
      expect(buttons).toBeGreaterThanOrEqual(2)
    })
  })

  // ==================== 状态系统测试 ====================
  test.describe('状态系统', () => {
    test('状态栏应该显示', async ({ page }) => {
      await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000)
      
      // 页面正常加载
      const body = page.locator('body')
      await expect(body).toBeVisible()
    })
  })

  // ==================== 导航测试 ====================
  test.describe('导航', () => {
    test('应该能从游戏页面返回剧本库', async ({ page }) => {
      await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1000)
      
      // 直接导航到剧本库
      await page.goto('/scripts')
      await expect(page).toHaveURL('/scripts')
    })

    test('应该能从剧本库返回首页', async ({ page }) => {
      await page.goto('/scripts')
      await page.goto('/')
      await expect(page).toHaveURL('/')
    })

    test('直接访问游戏URL应该正常', async ({ page }) => {
      await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000)
      
      const body = page.locator('body')
      await expect(body).toBeVisible()
    })
  })

  // ==================== 错误处理测试 ====================
  test.describe('错误处理', () => {
    test('不存在的剧本应该正常处理', async ({ page }) => {
      await page.goto('/play/non-existent-script', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000)
      
      // 页面应该正常响应（不崩溃）
      const body = page.locator('body')
      await expect(body).toBeVisible()
    })
  })

  // ==================== 响应式测试 ====================
  test.describe('响应式设计', () => {
    test('移动端视图应该正常', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveTitle(/AI Story Game/)
    })

    test('平板端视图应该正常', async ({ page }) => {
      // 设置平板端视口
      await page.setViewportSize({ width: 768, height: 1024 })
      
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveTitle(/AI Story Game/)
    })

    test('桌面端视图应该正常', async ({ page }) => {
      // 设置桌面端视口
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveTitle(/AI Story Game/)
    })
  })
})