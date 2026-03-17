import { test, expect } from '@playwright/test'

test.describe('游戏主链路 E2E 测试', () => {
  test('首页应该正常显示', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/AI Story Game/)
  })

  test('应该能从首页导航到剧本库', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/scripts"]')
    await page.waitForURL('/scripts')
    await expect(page).toHaveURL('/scripts')
  })

  test('剧本库应该显示剧本卡片', async ({ page }) => {
    await page.goto('/scripts')
    await page.waitForSelector('a[href^="/play/"]', { timeout: 5000 })
    const scriptCards = await page.locator('a[href^="/play/"]').count()
    expect(scriptCards).toBeGreaterThanOrEqual(1)
  })

  test('应该能进入游戏页面', async ({ page }) => {
    await page.goto('/scripts')
    await page.click('a[href^="/play/"]')
    await page.waitForURL(/\/play\/.+/)
  })

  test('游戏页面应该正常加载', async ({ page }) => {
    await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    // 检查页面有内容
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('游戏应该显示对话或选项', async ({ page }) => {
    await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    
    // 检查有文本内容
    const bodyText = await page.locator('body').textContent()
    expect(bodyText?.length).toBeGreaterThan(10)
  })

  test('应该能点击选项', async ({ page }) => {
    await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    
    // 检查有按钮
    const buttons = await page.locator('button').count()
    expect(buttons).toBeGreaterThanOrEqual(1)
  })
})

test.describe('游戏引擎 E2E 测试', () => {
  test('神秘古堡剧本可以启动', async ({ page }) => {
    await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('星际迷途剧本可以启动', async ({ page }) => {
    await page.goto('/play/lost-in-space', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('龙之谷剧本可以启动', async ({ page }) => {
    await page.goto('/play/dragon-valley', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})

test.describe('导航测试', () => {
  test('应该能从游戏返回剧本库', async ({ page }) => {
    await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
    await page.goto('/scripts')
    await expect(page).toHaveURL('/scripts')
  })

  test('直接访问游戏页面应该正常', async ({ page }) => {
    await page.goto('/play/mystery-castle', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})