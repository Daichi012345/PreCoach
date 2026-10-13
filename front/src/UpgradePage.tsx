import { useState } from 'react'
import './UpgradePage.css'

const plans = [
  {
    id: 'individual',
    name: '個人',
    price: '980',
    unit: '月額',
    description: '学生や就活生が個人でも始めやすいプラン。',
    features: ['詳細な発表分析', '成長記録・改善履歴', '模擬質疑練習'],
    action: '個人プランを選択',
    featured: true,
  },
  {
    id: 'school',
    name: '学校',
    price: '500',
    unit: '1人あたり / 月額',
    description: '授業やゼミなど、まとまった人数での利用に。',
    features: ['個人プランの有料機能', '人数に応じた一括契約', '学校での継続的な練習'],
    action: '学校での導入を相談',
    featured: false,
  },
  {
    id: 'enterprise',
    name: '企業',
    price: '1,200',
    unit: '1人あたり / 月額',
    description: '法人契約と導入後のサポートを含むプラン。',
    features: ['個人プランの有料機能', '法人としての契約', '導入支援・問い合わせ対応'],
    action: '企業での導入を相談',
    featured: false,
  },
]

function UpgradePage() {
  const [message, setMessage] = useState('')

  return (
    <main className="upgrade-shell">
      <div className="upgrade-page">
        <header className="upgrade-header">
          <a className="upgrade-brand" href="/dashboard">
            PreCoach
          </a>
          <a className="upgrade-back-link" href="/dashboard">
            ← ダッシュボードに戻る
          </a>
        </header>

        <section className="upgrade-content" aria-labelledby="upgrade-title">
          <p className="upgrade-eyebrow">PRECOACH PLANS</p>
          <h1 id="upgrade-title">あなたに合ったプランで、発表力を伸ばそう</h1>
          <p className="upgrade-intro">
            練習と振り返りを続けて、自信を持って伝えられる発表へ。
            利用スタイルに合わせてプランをお選びください。
          </p>

          <div className="upgrade-plan-grid">
            {plans.map((plan) => (
              <article
                className={`upgrade-plan-card${plan.featured ? ' is-featured' : ''}`}
                key={plan.id}
              >
                {plan.featured && <p className="upgrade-plan-badge">おすすめ</p>}
                <h2>{plan.name}</h2>
                <p className="upgrade-plan-description">{plan.description}</p>
                <p className="upgrade-plan-price">
                  <span className="upgrade-currency">¥</span>
                  <strong>{plan.price}</strong>
                  <span className="upgrade-price-unit">円</span>
                </p>
                <p className="upgrade-plan-billing">{plan.unit}</p>
                <ul className="upgrade-feature-list">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span aria-hidden="true">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`upgrade-plan-button${plan.featured ? ' is-primary' : ''}`}
                  type="button"
                  onClick={() =>
                    setMessage(
                      plan.id === 'individual'
                        ? '個人プランのお申し込みは現在準備中です。'
                        : `${plan.name}プランの導入相談は現在準備中です。`,
                    )
                  }
                >
                  {plan.action}
                </button>
              </article>
            ))}
          </div>

          {message && (
            <p className="upgrade-message" role="status">
              {message}
            </p>
          )}

          <p className="upgrade-footnote">
            ※ 学校・企業プランの料金は1人あたりの月額です。利用人数や契約内容は導入時にご相談ください。
          </p>
        </section>

        <footer className="upgrade-footer">
          <span>WIREFRAME v0.1</span>
          <span aria-hidden="true">|</span>
          <span>表示データはサンプル</span>
          <span aria-hidden="true">|</span>
          <span>PC 1200px</span>
        </footer>
      </div>
    </main>
  )
}

export default UpgradePage
