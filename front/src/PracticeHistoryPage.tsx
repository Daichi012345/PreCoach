import './PracticeHistoryPage.css'

const practiceHistory = [
  { date: '10/08', title: '卒業制作 中間発表', duration: '5:02', score: 78 },
  { date: '10/06', title: 'ゼミ発表', duration: '3:10', score: 72 },
  { date: '10/03', title: '初回練習', duration: '4:55', score: 68 },
]

function PracticeHistoryPage() {
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
