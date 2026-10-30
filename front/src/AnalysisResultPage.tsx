import { useState } from 'react'
import './AnalysisResultPage.css'

type AnalysisResult = {
  transcript: string
  feedback: string
  model: string
  practiceId: number
}

function AnalysisResultPage() {
  const [result] = useState<AnalysisResult | null>(() => {
    const stored = window.sessionStorage.getItem('precoach-analysis-result')
    if (!stored) {
      return null
    }
    try {
      return JSON.parse(stored) as AnalysisResult
    } catch {
      return null
    }
  })

  return (
    <main className="analysis-shell">
      <p className="analysis-breadcrumb">PreCoach / 06 分析結果</p>
      <div className="analysis-page">
        <header className="analysis-header">
          <a className="analysis-brand" href="/dashboard">
            PreCoach
          </a>
          <nav className="analysis-nav" aria-label="メインメニュー">
            <a href="/dashboard">ホーム</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-settings">練習を始める</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-history">練習履歴</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-settings">設定</a>
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
            <p>{result?.feedback || '評価結果を取得できませんでした。練習履歴を確認してください。'}</p>
          </section>

          <section className="analysis-card analysis-transcript" aria-labelledby="transcript-title">
            <h2 id="transcript-title">音声の文字起こし結果</h2>
            <p>{result?.transcript || '文字起こし結果を取得できませんでした。'}</p>
          </section>

          <section className="analysis-card analysis-llm" aria-labelledby="llm-title">
            <h2 id="llm-title">LLMに送信した評価結果</h2>
            <p>{result?.feedback || 'LLM評価結果を取得できませんでした。'}</p>
            {result?.model && <small>使用モデル: {result.model}</small>}
          </section>

          <section className="analysis-card analysis-recording" aria-label="録画の確認">
            <h2>02:13&nbsp; 画面を見る時間が長い → 録画を確認</h2>
            <p>03:20&nbsp; 話す速度が上がる → 録画を確認</p>
          </section>

          <a
            className="analysis-repeat-button"
            href="/practice-settings"
          >
            もう一度練習する
          </a>
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
