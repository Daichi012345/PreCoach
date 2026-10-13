import './DashboardPage.css'

function DashboardPage() {
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
          <a className="dashboard-sidebar-login" href="/login">
            ログアウト
          </a>
        </aside>

        <section className="dashboard-main" id="home" aria-labelledby="dashboard-title">
          <header className="dashboard-header">
            <div>
              <p className="dashboard-eyebrow">PreCoach / 02 ホーム</p>
              <h1 id="dashboard-title">おかえりなさい！</h1>
            </div>
            <a className="dashboard-new-button" href="/practice-settings">
              新しい練習
            </a>
          </header>

          <section className="dashboard-stats" aria-label="練習サマリー">
            <article className="dashboard-stat-card">
              <span>練習回数</span>
              <strong>8回</strong>
              <small>今月の合計</small>
            </article>
            <article className="dashboard-stat-card">
              <span>最新スコア</span>
              <strong>78点</strong>
              <small className="positive">前回比 +6点</small>
            </article>
            <article className="dashboard-stat-card">
              <span>平均スコア</span>
              <strong>73点</strong>
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
                <a href="/analysis-result">
                  <span className="activity-icon">78</span>
                  <span>
                    <strong>卒業制作 中間発表</strong>
                    <small>10/08 ・ 5分</small>
                  </span>
                  <b>78点</b>
                </a>
                <a href="/analysis-result">
                  <span className="activity-icon">72</span>
                  <span>
                    <strong>ゼミ発表</strong>
                    <small>10/06 ・ 3分</small>
                  </span>
                  <b>72点</b>
                </a>
                <a href="/analysis-result">
                  <span className="activity-icon">68</span>
                  <span>
                    <strong>初回練習</strong>
                    <small>10/03 ・ 4分55秒</small>
                  </span>
                  <b>68点</b>
                </a>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}

export default DashboardPage
