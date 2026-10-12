import { useState } from 'react'
import './DashboardPage.css'

function DashboardPage() {
  const [message, setMessage] = useState('')

  return (
    <main className="dashboard-shell">
      <p className="dashboard-breadcrumb">PreCoach / 02 ホーム</p>

      <div className="dashboard-page">
        <header className="dashboard-header">
          <p className="dashboard-brand">PreCoach</p>
          <nav className="dashboard-nav" aria-label="メインメニュー">
            <a href="#home">ホーム</a>
            <span aria-hidden="true">/</span>
            <a href="#practice">練習を始める</a>
            <span aria-hidden="true">/</span>
            <a href="#history">練習履歴</a>
            <span aria-hidden="true">/</span>
            <a href="#settings">設定</a>
          </nav>
        </header>

        <section className="dashboard-content" id="home" aria-labelledby="dashboard-title">
          <h1 id="dashboard-title">ホーム</h1>

          <section className="welcome-card" aria-labelledby="welcome-title">
            <h2 id="welcome-title">次の発表に向けて練習しましょう</h2>
            <p>目標時間を設定して、カメラとマイクで発表を記録します。</p>
          </section>

          <button
            className="practice-button"
            type="button"
            onClick={() => setMessage('練習の準備を始めます。')}
          >
            新しい練習を始める
          </button>
          {message && (
            <p className="dashboard-message" role="status">
              {message}
            </p>
          )}

          <section className="stats-card" aria-label="練習サマリー">
            <div>
              <strong>練習回数 8回</strong>
              <span aria-hidden="true">/</span>
              <strong>最新スコア 78点</strong>
              <span aria-hidden="true">/</span>
              <strong>前回比 +6点</strong>
            </div>
          </section>

          <section className="presentation-card" aria-labelledby="presentation-title">
            <div className="presentation-main">
              <h2 id="presentation-title">卒業制作 中間発表</h2>
              <strong>10/08</strong>
              <strong>5分</strong>
              <strong>78点</strong>
            </div>
            <div className="presentation-detail">
              <span>ゼミ発表</span>
              <span>10/06</span>
              <span>3分</span>
              <span>72点</span>
            </div>
          </section>
        </section>

        <footer className="dashboard-footer">
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

export default DashboardPage
