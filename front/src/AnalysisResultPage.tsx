import { useState } from 'react'
import type { VoiceMetrics } from './api'
import './AnalysisResultPage.css'

type AnalysisResult = {
  transcript: string
  voiceMetrics: VoiceMetrics
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

          {result?.voiceMetrics && (
            <section className="analysis-card analysis-voice-metrics" aria-labelledby="voice-metrics-title">
              <h2 id="voice-metrics-title">話し方の指標</h2>
              <dl className="voice-metrics-grid">
                <div>
                  <dt>発話中の話速</dt>
                  <dd>{result.voiceMetrics.speaking_rate_characters_per_minute} 文字/分</dd>
                </div>
                <div>
                  <dt>推定沈黙時間 / 割合</dt>
                  <dd>
                    {result.voiceMetrics.estimated_silence_seconds} 秒 /{' '}
                    {result.voiceMetrics.estimated_silence_ratio_percent}%
                  </dd>
                </div>
                <div>
                  <dt>1秒以上の間</dt>
                  <dd>{result.voiceMetrics.long_pause_count} 回</dd>
                </div>
                <div>
                  <dt>フィラー候補</dt>
                  <dd>
                    {result.voiceMetrics.filler_count} 回（{result.voiceMetrics.filler_per_minute} 回/分）
                  </dd>
                </div>
                <div>
                  <dt>繰り返し表現候補</dt>
                  <dd>{result.voiceMetrics.repeated_phrase_count} 箇所</dd>
                </div>
                <div>
                  <dt>発話文字数 / 発話時間</dt>
                  <dd>
                    {result.voiceMetrics.spoken_character_count} 文字 /{' '}
                    {result.voiceMetrics.speech_duration_seconds} 秒
                  </dd>
                </div>
              </dl>
              <p className="voice-metrics-note">
                文字起こしと発話区間からの自動推定です。沈黙・フィラー・繰り返しの判定には誤差があります。
              </p>
            </section>
          )}

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
          <span>音声指標は自動推定値</span>
          <span aria-hidden="true">|</span>
          <span>PC 1200px</span>
        </footer>
      </div>
    </main>
  )
}

export default AnalysisResultPage
