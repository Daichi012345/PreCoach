import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import './PracticeSettingsPage.css'

const practiceSettingsStorageKey = 'precoach-practice-settings'

function PracticeSettingsPage() {
  const [presentationTitle, setPresentationTitle] = useState(
    () => window.localStorage.getItem(`${practiceSettingsStorageKey}-title`) || '卒業制作 中間発表',
  )
  const [targetMinutes, setTargetMinutes] = useState(
    () => window.localStorage.getItem(`${practiceSettingsStorageKey}-minutes`) || '5',
  )
  const [slideName, setSlideName] = useState('')
  const [saveRecording, setSaveRecording] = useState(false)
  const [mediaStatus, setMediaStatus] = useState<'checking' | 'connected' | 'denied'>('checking')
  const [audioLevel, setAudioLevel] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    let stream: MediaStream | undefined
    let audioContext: AudioContext | undefined

    async function connectDevices() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaStatus('denied')
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        audioContext = new AudioContext()
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)
        const data = new Uint8Array(analyser.frequencyBinCount)

        const updateAudioLevel = () => {
          analyser.getByteFrequencyData(data)
          const average = data.reduce((sum, value) => sum + value, 0) / data.length
          setAudioLevel(Math.min(100, Math.round(average * 2)))
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }

        updateAudioLevel()
        setMediaStatus('connected')
      } catch {
        setMediaStatus('denied')
      }
    }

    void connectDevices()

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      stream?.getTracks().forEach((track) => track.stop())
      void audioContext?.close()
    }
  }, [])

  function handleSlideChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setSlideName(file?.name ?? '')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.localStorage.setItem(`${practiceSettingsStorageKey}-title`, presentationTitle)
    window.localStorage.setItem(`${practiceSettingsStorageKey}-minutes`, targetMinutes)
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
            <h2 id="presentation-settings-title">発表設定</h2>
            <div className="presentation-fields">
              <label>
                <span>発表タイトル</span>
                <input
                  type="text"
                  value={presentationTitle}
                  onChange={(event) => setPresentationTitle(event.target.value)}
                  placeholder="発表タイトルを入力"
                  required
                />
              </label>
              <label>
                <span>目標時間</span>
                <select value={targetMinutes} onChange={(event) => setTargetMinutes(event.target.value)}>
                  <option value="3">3分</option>
                  <option value="5">5分</option>
                  <option value="10">10分</option>
                  <option value="15">15分</option>
                  <option value="20">20分</option>
                </select>
              </label>
            </div>
          </section>

          <section className="settings-card device-card" aria-labelledby="device-settings-title">
            <h2 id="device-settings-title">カメラプレビュー・マイク入力レベル</h2>
            <div className="device-preview">
              <video ref={videoRef} autoPlay muted playsInline aria-label="カメラプレビュー" />
              <div className="microphone-meter">
                <span>マイク入力</span>
                <div className="microphone-meter-track" aria-label={`マイク入力レベル ${audioLevel}%`}>
                  <span style={{ width: `${audioLevel}%` }} />
                </div>
              </div>
            </div>
            <div className="device-status">
              <span>カメラ：{mediaStatus === 'connected' ? '接続済み' : mediaStatus === 'checking' ? '確認中' : '未接続'}</span>
              <span>マイク：{mediaStatus === 'connected' ? '接続済み' : mediaStatus === 'checking' ? '確認中' : '未接続'}</span>
            </div>
            {mediaStatus === 'denied' && (
              <p className="device-error">カメラとマイクを使用できません。ブラウザの権限を確認してください。</p>
            )}
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
