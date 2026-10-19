import { useEffect, useState } from 'react'
import './DashboardPage.css'
import { clearToken, getCurrentUser, getPractices, type Practice, type User } from './api'

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [practices, setPractices] = useState<Practice[]>([])

  useEffect(() => {
    Promise.all([getCurrentUser(), getPractices()])
      .then(([currentUser, userPractices]) => {
        setUser(currentUser)
        setPractices(userPractices)
      })
      .catch(() => {
        clearToken()
        window.location.assign('/login')
      })
  }, [])

  const latestPractices = practices.slice(0, 3)
  const scoredPractices = practices.filter((practice) => practice.score !== null)
  const averageScore =
    scoredPractices.length === 0
      ? null
      : Math.round(
          scoredPractices.reduce((total, practice) => total + (practice.score || 0), 0) /
            scoredPractices.length,
        )

  function handleLogout() {
    clearToken()
    window.location.assign('/login')
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-page">
        <aside className="dashboard-sidebar">
          <a className="dashboard-sidebar-brand" href="/dashboard">
            PreCoach
          </a>
          <nav className="dashboard-sidebar-nav" aria-label="メインメニュー">
            <a className="is-active" href="/dashboard">
              <span aria-hidden="true">⌂</span> ホーム
            </a>
            <a href="/practice-settings">
              <span aria-hidden="true">＋</span> 練習を始める
            </a>
            <a href="/practice-history">
              <span aria-hidden="true">▣</span> 練習履歴
            </a>
            <a href="/analysis-result">
              <span aria-hidden="true">⌁</span> 分析結果
            </a>
            <a href="/growth-record">
              <span aria-hidden="true">✦</span> 成長記録
            </a>
            <a href="/upgrade">
              <span aria-hidden="true">↑</span> アップグレード
            </a>
            <a href="/mypage">
              <span aria-hidden="true">●</span> マイページ
            </a>
          </nav>
          <button className="dashboard-sidebar-login" type="button" onClick={handleLogout}>
            ログアウト
          </button>
        </aside>

        <section className="dashboard-main" id="home" aria-labelledby="dashboard-title">
          <header className="dashboard-header">
            <div>
              <p className="dashboard-eyebrow">PreCoach / 02 ホーム</p>
              <h1 id="dashboard-title">{user ? `${user.name}さん、おかえりなさい！` : 'おかえりなさい！'}</h1>
            </div>
            <a className="dashboard-new-button" href="/practice-settings">
              新しい練習
            </a>
          </header>

          <section className="dashboard-stats" aria-label="練習サマリー">
            <article className="dashboard-stat-card">
              <span>練習回数</span>
              <strong>{practices.length}回</strong>
              <small>今月の合計</small>
            </article>
            <article className="dashboard-stat-card">
              <span>最新スコア</span>
              <strong>{practices[0]?.score === null || practices[0]?.score === undefined ? '-' : `${practices[0].score}点`}</strong>
              <small className="positive">保存済みの最新スコア</small>
            </article>
            <article className="dashboard-stat-card">
              <span>平均スコア</span>
              <strong>{averageScore === null ? '-' : `${averageScore}点`}</strong>
              <small>直近1か月</small>
            </article>
            <article className="dashboard-stat-card">
              <span>改善達成率</span>
              <strong>67%</strong>
              <small>2 / 3項目達成</small>
            </article>
          </section>

          <div className="dashboard-panels">
            <section className="dashboard-panel overview-panel" aria-labelledby="overview-title">
              <div className="dashboard-panel-heading">
                <h2 id="overview-title">総合スコアの推移</h2>
                <span>直近1か月</span>
              </div>
              <div className="dashboard-chart" aria-label="総合スコアの推移グラフ">
                <div className="dashboard-gridline gridline-one" />
                <div className="dashboard-gridline gridline-two" />
                <div className="dashboard-gridline gridline-three" />
                <div className="dashboard-gridline gridline-four" />
                <div className="dashboard-chart-area" />
                <div className="dashboard-chart-line">
                  <i className="chart-point point-one" />
                  <i className="chart-point point-two" />
                  <i className="chart-point point-three" />
                  <i className="chart-point point-four" />
                </div>
              </div>
              <div className="dashboard-chart-labels">
                <span>10/03</span>
                <span>10/06</span>
                <span>10/08</span>
                <strong>78点</strong>
              </div>
            </section>

            <section className="dashboard-panel activity-panel" aria-labelledby="activity-title">
              <div className="dashboard-panel-heading">
                <h2 id="activity-title">最近の練習履歴</h2>
                <a href="/practice-history">すべて見る</a>
              </div>
              <div className="dashboard-activity-list">
                {latestPractices.length === 0 ? (
                  <p>まだ練習履歴がありません。</p>
                ) : (
                  latestPractices.map((practice) => (
                    <a href="/analysis-result" key={practice.id}>
                      <span className="activity-icon">{practice.score ?? '-'}</span>
                      <span>
                        <strong>{practice.title}</strong>
                        <small>
                          {new Date(practice.date).toLocaleDateString('ja-JP')} ・{' '}
                          {Math.floor(practice.duration / 60)}分
                        </small>
                      </span>
                      <b>{practice.score === null ? '-' : `${practice.score}点`}</b>
                    </a>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}

export default DashboardPage
