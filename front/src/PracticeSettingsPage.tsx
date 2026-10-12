import { useState, type ChangeEvent, type FormEvent } from 'react'
import './PracticeSettingsPage.css'

function PracticeSettingsPage() {
  const [slideName, setSlideName] = useState('')
  const [saveRecording, setSaveRecording] = useState(false)

  function handleSlideChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setSlideName(file?.name ?? '')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.location.assign('/practice')
  }

  return (
    <main className="practice-settings-shell">
      <p className="practice-settings-breadcrumb">PreCoach / 03 練習設定</p>

      <div className="practice-settings-page">
        <header className="practice-settings-header">
          <a className="practice-settings-brand" href="/dashboard">
            PreCoach
          </a>
          <nav className="practice-settings-nav" aria-label="ページ">
            <a href="/dashboard">Dashboard</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-settings">練習設定</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-history">練習履歴</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-settings">設定</a>
          </nav>
        </header>

        <form className="practice-settings-content" onSubmit={handleSubmit}>
          <h1>練習設定</h1>

          <section className="settings-card" aria-labelledby="presentation-settings-title">
            <h2 id="presentation-settings-title">発表タイトル</h2>
            <strong>卒業制作 中間発表</strong>
            <dl>
              <div>
                <dt>目標時間</dt>
                <dd>5分</dd>
              </div>
              <div>
                <dt>評価基準</dt>
                <dd>声量 / テンポ / 話の流れを解析</dd>
              </div>
            </dl>
          </section>

          <section className="settings-card device-card" aria-labelledby="device-settings-title">
            <h2 id="device-settings-title">カメラプレビュー・マイク入力レベル</h2>
            <div className="device-status">
              <span>カメラ：未接続</span>
              <span>マイク：未接続</span>
            </div>
          </section>

          <div className="settings-options">
            <label className="save-recording">
              <input
                type="checkbox"
                checked={saveRecording}
                onChange={(event) => setSaveRecording(event.target.checked)}
              />
              <span>録画の保存に同意する</span>
            </label>

            <label className="slide-upload">
              <span>{slideName || 'スライド添付（任意）'}</span>
              <span aria-hidden="true">＋</span>
              <input type="file" accept=".pdf,.ppt,.pptx" onChange={handleSlideChange} />
            </label>
          </div>

          <button className="start-practice-button" type="submit">
            練習して録音を開始
          </button>
        </form>

        <footer className="practice-settings-footer">
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

export default PracticeSettingsPage
