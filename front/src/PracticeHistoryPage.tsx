import { useEffect, useState } from 'react'
import './PracticeHistoryPage.css'
import { getPractices, type Practice } from './api'

function PracticeHistoryPage() {
  const [practiceHistory, setPracticeHistory] = useState<Practice[]>([])
  const [message, setMessage] = useState('読み込み中...')

  useEffect(() => {
    getPractices()
      .then((practices) => {
        setPracticeHistory(practices)
        setMessage(practices.length === 0 ? 'まだ練習履歴がありません。' : '')
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : '履歴の取得に失敗しました')
      })
  }, [])

  return (
    <main className="history-shell">
      <p className="history-breadcrumb">PreCoach / 05 練習履歴</p>
      <div className="history-page">
        <header className="history-header">
          <a className="history-brand" href="/dashboard">
            PreCoach
          </a>
          <nav className="history-nav" aria-label="メインメニュー">
            <a href="/dashboard">Dashboard</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-settings">練習を始める</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-history">練習履歴</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-settings">設定</a>
          </nav>
        </header>

        <section className="history-content" aria-labelledby="history-title">
          <h1 id="history-title">練習履歴</h1>

          <section className="history-card history-progress" aria-labelledby="progress-title">
            <h2 id="progress-title">スコア推移</h2>
            <p>{message || '保存された練習のスコアを表示しています。'}</p>
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
                  <tr key={practice.id}>
                    <td>{new Date(practice.date).toLocaleDateString('ja-JP')}</td>
                    <td>{practice.title}</td>
                    <td>{Math.floor(practice.duration / 60)}分</td>
                    <td>{practice.score === null ? '-' : practice.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="history-actions">
            <a
              className="history-button"
              href="/analysis-result"
            >
              結果を開く
            </a>
            <a
              className="history-button"
              href="/growth-record"
            >
              成長記録・改善点の履歴を見る
            </a>
          </div>
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
