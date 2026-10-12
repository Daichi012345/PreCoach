import './GrowthRecordPage.css'

function GrowthRecordPage() {
  return (
    <main className="growth-record-shell">
      <p className="growth-record-breadcrumb">PreCoach / 07 成長記録・改善点の履歴</p>

      <div className="growth-record-page">
        <header className="growth-record-header">
          <a className="growth-record-brand" href="/dashboard">
            PreCoach
          </a>
          <nav className="growth-record-nav" aria-label="ページ">
            <a href="/dashboard">Dashboard</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-settings">練習を始める</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-history">練習履歴</a>
            <span aria-hidden="true">/</span>
            <a href="/growth-record">成長記録</a>
            <span aria-hidden="true">/</span>
            <a href="/practice-settings">設定</a>
          </nav>
        </header>

        <section className="growth-record-content" aria-labelledby="growth-record-title">
          <h1 id="growth-record-title">成長記録</h1>

          <section className="growth-card comparison-card" aria-labelledby="comparison-title">
            <div className="growth-card-heading">
              <h2 id="comparison-title">比較する練習：卒業制作 中間発表</h2>
              <strong>期間：直近1か月</strong>
            </div>
            <p>同じ発表・同じ評価基準の練習を比較　｜　基準：標準 v1</p>
          </section>

          <section className="growth-card summary-card" aria-label="成長サマリー">
            <div>
              <strong>初回から +10点</strong>
              <span aria-hidden="true">｜</span>
              <strong>練習 3回</strong>
              <span aria-hidden="true">｜</span>
              <strong>重点改善点 1/3達成</strong>
            </div>
            <p>改善した項目：話す速度　次に達成すること：正面を見る時間</p>
          </section>

          <section className="growth-card score-card" aria-labelledby="score-title">
            <h2 id="score-title">総合スコアの推移（サンプル）</h2>
            <div className="score-chart" aria-label="総合スコアの推移グラフ">
              <div className="chart-line chart-line-one" />
              <div className="chart-line chart-line-two" />
              <div className="chart-line chart-line-three" />
              <div className="chart-line chart-line-four" />
              <div className="chart-axis" />
              <div className="score-trend">
                <span className="score-point score-point-one" />
                <span className="score-point score-point-two" />
                <span className="score-point score-point-three" />
              </div>
            </div>
            <p className="chart-legend">縦軸：点数 100 / 90 / 80 / 70 / 60（上から）</p>
            <div className="score-dates">
              <span>10/03：68点</span>
              <span>10/06：72点</span>
              <span>10/08：78点</span>
            </div>
          </section>

          <section className="growth-card detail-card" aria-labelledby="detail-title">
            <div className="growth-card-heading">
              <h2 id="detail-title">項目別の変化</h2>
              <strong>初回 → 今回（100点満点）</strong>
            </div>
            <div className="detail-values">
              <span>目線 50 → 62（+12）</span>
              <span>姿勢 80 → 86（+6）</span>
              <span>話し方 60 → 71（+11）</span>
              <span>声量 75 → 83（+8）</span>
              <span>時間 85 → 94（+9）</span>
              <span>内容 70 → 82（+12）</span>
            </div>
          </section>

          <section className="growth-card history-card" aria-labelledby="history-title">
            <h2 id="history-title">指摘 → 練習 → 改善の履歴（サンプル）</h2>
            <p>10/03 指摘：話す速度が速い　｜　次回目標：結論の前で一呼吸</p>
            <p>10/06 改善中：360 → 340文字/分　｜　対策を継続</p>
            <p>10/08 改善：312文字/分　｜　正面で話す時間を維持</p>
          </section>

          <section className="growth-card next-goal-card">
            <h2>次の練習目標：正面を向く割合を70%以上にする</h2>
            <p>WIREFRAME v0.2　｜　数値・判定はサンプル、実際の判定基準は要検討。</p>
          </section>
        </section>
      </div>
    </main>
  )
}

export default GrowthRecordPage
