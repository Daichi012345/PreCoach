import { useEffect, useState } from 'react'
import './PracticePage.css'

const TARGET_SECONDS = 5 * 60

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function PracticePage() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRecording, setIsRecording] = useState(true)

  useEffect(() => {
    if (!isRecording) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => {
        if (current >= TARGET_SECONDS) {
          setIsRecording(false)
          return TARGET_SECONDS
        }
        return current + 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isRecording])

  return (
    <main className="practice-shell">
      <p className="practice-breadcrumb">PreCoach / 04 発表・録画</p>

      <div className="practice-page">
        <header className="practice-header">
          <a className="practice-brand" href="/dashboard">
            PreCoach
          </a>
          <nav className="practice-nav" aria-label="ページ">
            <a href="/dashboard">Dashboard</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-settings">練習設定</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-history">練習履歴</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-settings">設定</a>
          </nav>
        </header>

        <section className="practice-content" aria-labelledby="practice-title">
          <h1 id="practice-title">発表・録画</h1>

          <div className="recording-status">
            <div className="recording-status-main">
              <span className={`recording-dot${isRecording ? '' : ' is-stopped'}`} aria-hidden="true" />
              <strong>{isRecording ? '録画中' : '録画停止'}</strong>
              <strong>{formatTime(elapsedSeconds)} / 05:00</strong>
            </div>
            <div className="recording-status-actions">
              <span>目標 05:00</span>
              <a href="/practice-settings">設定を確認する</a>
            </div>
          </div>

          <section className="camera-card" aria-labelledby="camera-title">
            <h2 id="camera-title">カメラ映像エリア</h2>
            <p>発表者の映像を表示します。</p>
          </section>

          <section className="measurement-card" aria-labelledby="measurement-title">
            <h2 id="measurement-title">目線・姿勢・音声を計測中</h2>
            <p>リアルタイム分析の表示は設定で切り替え</p>
          </section>

          <p className="practice-note">録画終了後に結果を確認できます。</p>

          <button
            className="stop-recording-button"
            type="button"
            onClick={() => setIsRecording(false)}
            disabled={!isRecording}
          >
            {isRecording ? '録画を終了' : '録画終了済み'}
          </button>
        </section>

        <footer className="practice-footer">
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

export default PracticePage
