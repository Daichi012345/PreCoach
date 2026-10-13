import { useEffect } from 'react'
import './AnalysisLoadingPage.css'

const ANALYSIS_WAIT_MS = 4000

function AnalysisLoadingPage() {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      window.location.replace('/analysis-result')
    }, ANALYSIS_WAIT_MS)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <main className="analysis-loading-shell">
      <section className="analysis-loading-card" aria-labelledby="loading-title">
        <div className="analysis-loading-spinner" aria-hidden="true" />
        <h1 id="loading-title">AIが発表を採点しています</h1>
        <p className="analysis-loading-description">
          録画を分析しています。完了すると分析結果画面に移動します。
        </p>
        <div
          className="analysis-loading-progress"
          role="progressbar"
          aria-label="AI採点の進行状況"
        >
          <span />
        </div>
        <p className="analysis-loading-note" role="status" aria-live="polite">
          目線・姿勢・話し方を確認中…
        </p>
      </section>
    </main>
  )
}

export default AnalysisLoadingPage
