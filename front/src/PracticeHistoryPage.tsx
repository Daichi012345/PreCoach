import { useState } from 'react'
import './PracticeHistoryPage.css'

const practiceHistory = [
  { date: '10/08', title: '卒業制作 中間発表', duration: '5:02', score: 78 },
  { date: '10/06', title: 'ゼミ発表', duration: '3:10', score: 72 },
  { date: '10/03', title: '初回練習', duration: '4:55', score: 68 },
]

function PracticeHistoryPage() {
  const [message, setMessage] = useState('')

  return (
    <main className="history-shell">
      <div className="history-page">
        <header className="history-header">
          <p className="history-brand">PreCoach</p>
          <nav className="history-nav" aria-label="メインメニュー">
            <span>ホーム</span>
            <span aria-hidden="true">/</span>
            <span>練習を始める</span>
            <span aria-hidden="true">/</span>
            <span>練習履歴</span>
            <span aria-hidden="true">/</span>
            <span>設定</span>
          </nav>
        </header>

        <section className="history-content" aria-labelledby="history-title">
          <h1 id="history-title">練習履歴</h1>

          <section className="history-card history-progress" aria-labelledby="progress-title">
            <h2 id="progress-title">スコア推移（サンプル）</h2>
            <p>第1回 68点 → 第2回 72点 → 第3回 78点</p>
          </section>

          <section className="history-card history-table-card" aria-label="練習記録一覧">
            <table className="history-table">
              <thead>
                <tr>
                  <th scope="col">日付</th>
                  <th scope="col">タイトル</th>
                  <th scope="col">時間</th>
                  <th scope="col">スコア</th>
                </tr>
              </thead>
              <tbody>
                {practiceHistory.map((practice) => (
                  <tr key={practice.date}>
                    <td>{practice.date}</td>
                    <td>{practice.title}</td>
                    <td>{practice.duration}</td>
                    <td>{practice.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="history-actions">
            <button
              className="history-button"
              type="button"
              onClick={() => setMessage('練習結果の表示機能は現在準備中です。')}
            >
              結果を開く
            </button>
            <button
              className="history-button"
              type="button"
              onClick={() => setMessage('成長記録の表示機能は現在準備中です。')}
            >
              成長記録・改善点の履歴を見る
            </button>
          </div>
          {message && (
            <p className="history-message" role="status">
              {message}
            </p>
          )}
        </section>

        <footer className="history-footer">
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

export default PracticeHistoryPage
