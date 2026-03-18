import { test, expect } from '@playwright/test'

test.describe('首页 E2E 测试', () => {
  test('应该正确加载首页', async ({ page }) => {
    await page.goto('/')
    
    // 检查页面标题
    await expect(page).toHaveTitle(/AI Story Game/)
    
    // 检查主要内容存在
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('应该显示主标题', async ({ page }) => {
    await page.goto('/')
    
    // 检查主标题
    const title = page.locator('h1')
    await expect(title.first()).toContainText('沉浸式剧本杀体验')
  })

  test('应该显示功能介绍卡片', async ({ page }) => {
    await page.goto('/')
    
    // 检查功能卡片数量
    const cards = page.locator('article')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test('应该显示热门剧本区域', async ({ page }) => {
    await page.goto('/')
    
    // 检查热门剧本区域
    const hotSection = page.locator('section').filter({ hasText: '热门剧本' })
    await expect(hotSection).toBeVisible()
  })

  test('应该能点击开始探索剧本按钮', async ({ page }) => {
    await page.goto('/')
    
    // 点击剧本库链接
    const scriptsLink = page.locator('a[href="/scripts"]').first()
    await scriptsLink.click()
    
    // 等待跳转
    await page.waitForURL('/scripts')
    expect(page.url()).toContain('/scripts')
  })

  test('热门剧本链接应该正确跳转', async ({ page }) => {
    await page.goto('/')
    
    // 点击热门剧本卡片
    const scriptCard = page.locator('a[href^="/scripts/"]').first()
    await scriptCard.click()
    
    // 等待跳转到详情页
    await page.waitForURL(/\/scripts\/.+/)
    expect(page.url()).toContain('/scripts/')
  })
})

test.describe('剧本列表页 E2E 测试', () => {
  test('应该显示剧本列表', async ({ page }) => {
    await page.goto('/scripts')
    
    // 等待剧本卡片加载
    await page.waitForSelector('a[href^="/scripts/"]', { timeout: 5000 })
    
    // 检查至少有一个剧本
    const cards = await page.locator('a[href^="/scripts/"]').count()
    expect(cards).toBeGreaterThanOrEqual(1)
  })

  test('应该显示剧本标题和描述', async ({ page }) => {
    await page.goto('/scripts')
    await page.waitForSelector('a[href^="/scripts/"]', { timeout: 5000 })
    
    // 检查有剧本标题
    const title = await page.locator('h3').first().textContent()
    expect(title?.length).toBeGreaterThan(0)
    
    // 检查有剧本描述
    const desc = await page.locator('p').filter({ hasText: /./ }).first().textContent()
    expect(desc?.length).toBeGreaterThan(0)
  })

  test('应该能点击剧本卡片进入详情页', async ({ page }) => {
    await page.goto('/scripts')
    
    // 点击第一个剧本卡片
    const firstScript = page.locator('a[href^="/scripts/"]').first()
    await firstScript.click()
    
    // 等待跳转到详情页
    await page.waitForURL(/\/scripts\/.+/)
    expect(page.url()).toContain('/scripts/')
  })

  test('剧本详情页应该显示完整信息', async ({ page }) => {
    // 直接访问剧本详情页
    await page.goto('/scripts/mystery-castle')
    
    // 检查页面标题
    const title = page.locator('h1')
    await expect(title).toBeVisible()
    
    // 检查有开始游戏按钮
    const startButton = page.locator('button').filter({ hasText: '开始游戏' })
    await expect(startButton).toBeVisible()
  })

  test('剧本详情页应该能跳转到游戏页', async ({ page }) => {
    await page.goto('/scripts/mystery-castle')
    
    // 点击开始游戏按钮
    const startButton = page.locator('button').filter({ hasText: '开始游戏' })
    await startButton.click()
    
    // 等待跳转到游戏页
    await page.waitForURL(/\/play\/.+/)
    expect(page.url()).toContain('/play/')
  })
})

test.describe('导航测试', () => {
  test('应该能从首页导航到剧本列表', async ({ page }) => {
    await page.goto('/')
    
    const link = page.locator('a[href="/scripts"]').first()
    await link.click()
    
    await page.waitForURL('/scripts')
    expect(page.url()).toContain('/scripts')
  })

  test('应该能从剧本列表返回首页', async ({ page }) => {
    await page.goto('/scripts')
    
    // 点击首页链接（Header 中的）
    const homeLink = page.locator('a[href="/"]').first()
    await homeLink.click()
    
    await page.waitForURL('/')
    expect(page.url()).toBe(page.url().split('/scripts')[0] + '/')
  })

  test('应该能从剧本详情页返回列表', async ({ page }) => {
    await page.goto('/scripts/mystery-castle')
    
    // 点击返回链接
    const backLink = page.locator('a[href="/scripts"]').first()
    await backLink.click()
    
    await page.waitForURL('/scripts')
    expect(page.url()).toContain('/scripts')
  })
})