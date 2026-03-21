import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <main className="page-wrap px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--sea-ink)] mb-6">隐私政策</h1>
        <p className="text-sm text-[var(--sea-ink-soft)] mb-8">
          最后更新日期：2026年3月18日
        </p>

        <section className="space-y-6 text-[var(--sea-ink-soft)]">
          <div>
            <h2 className="text-xl font-semibold text-[var(--sea-ink)] mb-3">1. 信息收集</h2>
            <p className="leading-relaxed">
              我们收集以下信息以提供更好的游戏体验：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>游戏存档数据（存储在您的浏览器本地）</li>
              <li>游戏成就记录（存储在您的浏览器本地）</li>
              <li>您主动提供的 API Key（仅存储在您的浏览器本地，不会上传到服务器）</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--sea-ink)] mb-3">2. 数据存储</h2>
            <p className="leading-relaxed">
              所有游戏数据均存储在您的浏览器本地（LocalStorage），我们不会在服务器上存储您的个人信息、游戏进度或 API Key。您可以通过清除浏览器数据来删除这些信息。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--sea-ink)] mb-3">3. API Key 安全</h2>
            <p className="leading-relaxed">
              当您在设置页面添加自己的 AI API Key 时：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>API Key 仅存储在您的浏览器本地</li>
              <li>API Key 不会发送到我们的服务器</li>
              <li>您可以在任何时候删除已保存的 API Key</li>
              <li>请勿在公共计算机上保存 API Key</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--sea-ink)] mb-3">4. AI 生成内容</h2>
            <p className="leading-relaxed">
              本应用使用人工智能生成游戏内容。生成的内容可能不完全准确，我们不对 AI 生成的内容承担责任。我们已实施内容审核机制，但仍建议用户谨慎对待 AI 生成的内容。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--sea-ink)] mb-3">5. 第三方服务</h2>
            <p className="leading-relaxed">
              本应用可能使用以下第三方服务：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>阿里云百炼（AI 服务）- 用于生成游戏内容</li>
              <li>Cloudflare（托管服务）- 用于网站托管</li>
            </ul>
            <p className="mt-2">
              这些服务有各自的隐私政策，请您自行查阅。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--sea-ink)] mb-3">6. Cookie 使用</h2>
            <p className="leading-relaxed">
              本应用使用浏览器本地存储（LocalStorage 和 SessionStorage）来保存您的游戏进度、设置和偏好。这些不是传统意义上的 Cookie，但功能类似。您可以在浏览器设置中管理这些数据。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--sea-ink)] mb-3">7. 儿童隐私</h2>
            <p className="leading-relaxed">
              本应用适合 12 岁及以上用户。如果您是家长或监护人，发现您的孩子未经授权使用了本应用，请联系我们。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--sea-ink)] mb-3">8. 政策更新</h2>
            <p className="leading-relaxed">
              我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，建议您定期查阅。继续使用本应用即表示您同意更新后的政策。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--sea-ink)] mb-3">9. 联系我们</h2>
            <p className="leading-relaxed">
              如果您对本隐私政策有任何疑问，请通过以下方式联系我们：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>GitHub: <a href="https://github.com/chiga0/ai-story-game" className="text-[var(--lagoon-deep)] hover:underline">项目地址</a></li>
            </ul>
          </div>
        </section>

        <div className="mt-8">
          <a href="/" className="text-[var(--lagoon-deep)] hover:underline">
            ← 返回首页
          </a>
        </div>
      </div>
    </main>
  )
}