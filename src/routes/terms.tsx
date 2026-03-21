import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

function TermsPage() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-[2rem] p-6 sm:p-10 max-w-4xl mx-auto">
        <h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
          用户协议
        </h1>
        <p className="mb-8 text-[var(--sea-ink-soft)]">
          最后更新日期：2026年3月20日
        </p>

        <div className="prose prose-lg max-w-none text-[var(--sea-ink)]">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--sea-ink)]">1. 服务条款</h2>
            <p className="text-[var(--sea-ink-soft)] mb-4">
              欢迎使用 AI Story Game（以下简称"本服务"）。在使用本服务之前，请您仔细阅读以下条款。
              使用本服务即表示您同意遵守本协议的所有条款。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--sea-ink)]">2. 用户责任</h2>
            <ul className="list-disc list-inside text-[var(--sea-ink-soft)] space-y-2">
              <li>用户应遵守当地法律法规，不得利用本服务从事违法活动</li>
              <li>用户不得上传、传播任何侵权、违法或有害内容</li>
              <li>用户应尊重其他用户的权利和隐私</li>
              <li>用户需对自己的账户安全负责</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--sea-ink)]">3. 知识产权</h2>
            <p className="text-[var(--sea-ink-soft)] mb-4">
              本服务的所有内容，包括但不限于文字、图片、音频、视频、软件等，均受著作权法和其他知识产权法律的保护。
            </p>
            <p className="text-[var(--sea-ink-soft)]">
              用户通过本服务创作的内容（如自定义剧本），其知识产权归用户所有。
              用户授权本服务在全球范围内使用、复制、展示该内容以提供相关服务。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--sea-ink)]">4. AI 生成内容</h2>
            <p className="text-[var(--sea-ink-soft)] mb-4">
              本服务使用人工智能技术生成游戏内容。用户理解并同意：
            </p>
            <ul className="list-disc list-inside text-[var(--sea-ink-soft)] space-y-2">
              <li>AI 生成的内容可能存在不确定性，本服务不保证内容的准确性或适用性</li>
              <li>用户对使用 AI 生成内容产生的结果自行承担风险</li>
              <li>本服务不对 AI 生成内容造成的任何损失承担责任</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--sea-ink)]">5. 免责声明</h2>
            <p className="text-[var(--sea-ink-soft)]">
              本服务按"现状"提供，不提供任何明示或暗示的保证。
              在法律允许的最大范围内，本服务不对任何间接、偶然、特殊或后果性损害承担责任。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--sea-ink)]">6. 服务变更与终止</h2>
            <p className="text-[var(--sea-ink-soft)]">
              本服务保留随时修改、暂停或终止服务的权利，恕不另行通知。
              如有重大变更，我们将通过应用内通知或其他合理方式告知用户。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--sea-ink)]">7. 年龄限制</h2>
            <p className="text-[var(--sea-ink-soft)]">
              本服务适合 12 岁及以上用户使用。未满 18 岁的用户应在监护人的指导下使用本服务。
              部分游戏内容可能包含轻微的虚构暴力元素或悬疑情节。
            </p>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-semibold text-gray-800">年龄分级：12+</p>
                  <p className="text-sm text-gray-600">适合 12 岁及以上用户</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--sea-ink)]">8. 隐私保护</h2>
            <p className="text-[var(--sea-ink-soft)]">
              我们重视用户隐私保护。有关我们如何收集、使用和保护您的个人信息，
              请参阅我们的<a href="/privacy" className="text-[var(--lagoon-deep)] hover:underline">隐私政策</a>。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--sea-ink)]">9. 争议解决</h2>
            <p className="text-[var(--sea-ink-soft)]">
              因本协议引起或与本协议相关的任何争议，双方应首先通过友好协商解决。
              如协商不成，争议应提交至本服务所在地有管辖权的人民法院解决。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--sea-ink)]">10. 联系我们</h2>
            <p className="text-[var(--sea-ink-soft)]">
              如您对本协议有任何疑问，请通过以下方式联系我们：
            </p>
            <ul className="list-none mt-4 text-[var(--sea-ink-soft)] space-y-2">
              <li>📧 邮箱：support@chigao.site</li>
              <li>🌐 网站：<a href="https://game.chigao.site" className="text-[var(--lagoon-deep)] hover:underline">https://game.chigao.site</a></li>
            </ul>
          </section>
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="/"
            className="rounded-full bg-[var(--lagoon-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90"
          >
            返回首页
          </a>
        </div>
      </section>
    </main>
  )
}