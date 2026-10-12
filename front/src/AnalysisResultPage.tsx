import { useState } from 'react'
import './AnalysisResultPage.css'

function AnalysisResultPage() {
  const [message, setMessage] = useState('')

  return (
    <main className="analysis-shell">
      <div className="analysis-page">
        <header className="analysis-header">
          <p className="analysis-brand">PreCoach</p>
          <nav className="analysis-nav" aria-label="メインメニュー">
            <span>ホーム</span>
            <span aria-hidden="true">/</span>
            <span>練習を始める</span>
            <span aria-hidden="true">/</span>
            <span>練習履歴</span>
            <span aria-hidden="true">/</span>
            <span>設定</span>
          </nav>
        </header>

        <section className="analysis-content" aria-labelledby="analysis-title">
          <h1 id="analysis-title">分析結果</h1>

          <section className="analysis-card analysis-score" aria-label="総合スコア">
            <strong>総合スコア 78 / 100</strong>
            <span aria-hidden="true">|</span>
            <strong>前回比 +6点</strong>
            <span aria-hidden="true">|</span>
            <strong>初回比 +10点</strong>
          </section>

          <section className="analysis-card analysis-categories" aria-label="項目別スコア">
            <div className="category-scores">
              <strong>目線 62</strong>
              <span aria-hidden="true">/</span>
              <strong>姿勢 86</strong>
              <span aria-hidden="true">/</span>
              <strong>話し方 71</strong>
            </div>
            <p>声量 83&nbsp;&nbsp; / &nbsp;&nbsp;時間 94&nbsp;&nbsp; / &nbsp;&nbsp;内容 82</p>
          </section>

          <section className="analysis-card analysis-improvements" aria-labelledby="improvements-title">
            <h2 id="improvements-title">前回の指摘は改善できた？（サンプル）</h2>
            <p>話す速度：360 → 312文字/分&nbsp;&nbsp; | &nbsp;&nbsp;改善&nbsp;&nbsp; | &nbsp;&nbsp;目標 280〜320</p>
            <p>目線：正面を向く割合 45% → 58%&nbsp;&nbsp; | &nbsp;&nbsp;改善中&nbsp;&nbsp; | &nbsp;&nbsp;目標 70%</p>
            <p>フィラー：8 → 5回/分&nbsp;&nbsp; | &nbsp;&nbsp;改善中&nbsp;&nbsp; | &nbsp;&nbsp;目標 3回/分</p>
          </section>

          <section className="analysis-card analysis-advice" aria-labelledby="advice-title">
            <h2 id="advice-title">次の練習で意識すること</h2>
            <p>結論の前で一呼吸置いて、ゆっくり話しましょう。</p>
          </section>

          <section className="analysis-card analysis-recording" aria-label="録画の確認">
            <h2>02:13&nbsp; 画面を見る時間が長い → 録画を確認</h2>
            <p>03:20&nbsp; 話す速度が上がる → 録画を確認</p>
          </section>

          <button
            className="analysis-repeat-button"
            type="button"
            onClick={() => setMessage('練習機能は現在準備中です。')}
          >
            もう一度練習する
          </button>
          {message && (
            <p className="analysis-message" role="status">
              {message}
            </p>
          )}
        </section>

        <footer className="analysis-footer">
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

export default AnalysisResultPage
