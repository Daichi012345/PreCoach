import { useEffect, useRef, useState } from 'react'
import { analyzeContent, transcribeAudio } from './api'
import './PracticePage.css'
import './AnalysisLoadingPage.css'

const TARGET_SECONDS = 5 * 60

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function PracticePage() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'connected' | 'denied'>('checking')
  const [recordingError, setRecordingError] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionError, setTranscriptionError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    let stream: MediaStream | undefined
    let disposed = false

    async function connectCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus('denied')
        setRecordingError('このブラウザではカメラとマイクを使用できません。')
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (disposed) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        if (stream.getAudioTracks().length === 0) {
          throw new Error('マイクが見つかりません。マイクを接続してから再読み込みしてください。')
        }

        const mimeType = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
        ].find((candidate) => MediaRecorder.isTypeSupported(candidate))
        const audioStream = new MediaStream(stream.getAudioTracks())
        const recorder = new MediaRecorder(
          audioStream,
          mimeType ? { mimeType } : undefined,
        )
        audioChunksRef.current = []
        recorder.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        })
        recorder.addEventListener('stop', () => {
          const blob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          })
          audioChunksRef.current = []
          if (blob.size > 0) {
            setAudioBlob(blob)
            void processAudioAndAnalyze(blob)
          }
          setIsRecording(false)
          stream?.getAudioTracks().forEach((track) => track.stop())
        })
        recorder.addEventListener('error', () => {
          setRecordingError('録音中にエラーが発生しました。再読み込みしてやり直してください。')
          setIsRecording(false)
        })
        recorderRef.current = recorder
        recorder.start()
        setIsRecording(true)
        setCameraStatus('connected')
      } catch (error) {
        if (!disposed) {
          setCameraStatus('denied')
          setRecordingError(
            error instanceof Error
              ? error.message
              : 'カメラまたはマイクに接続できません。ブラウザの権限を確認してください。',
          )
        }
      }
    }

    void connectCamera()

    return () => {
      disposed = true
      const recorder = recorderRef.current
      if (recorder?.state === 'recording') {
        recorder.stop()
      }
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (!isRecording) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => {
        if (current + 1 >= TARGET_SECONDS) {
          const recorder = recorderRef.current
          if (recorder?.state === 'recording') {
            recorder.stop()
          } else {
            setIsRecording(false)
          }
          return TARGET_SECONDS
        }
        return current + 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isRecording])

  function stopRecording() {
    const recorder = recorderRef.current
    if (recorder?.state === 'recording') {
      recorder.stop()
    }
    setIsRecording(false)
  }

  async function processAudioAndAnalyze(blob: Blob) {
    let phase: 'transcription' | 'analysis' = 'transcription'
    setIsTranscribing(true)
    setTranscriptionError('')
    setAnalysisError('')
    try {
      const result = await transcribeAudio(blob)
      if (!result.transcript) {
        setTranscriptionError('音声から発話を認識できませんでした。録音を確認して再度お試しください。')
        return
      }
      phase = 'analysis'
      setIsAnalyzing(true)
      const analysis = await analyzeContent({
        transcript: result.transcript,
        duration_seconds: Math.round(result.duration_seconds),
      })
      window.sessionStorage.setItem(
        'precoach-analysis-result',
        JSON.stringify({
          transcript: result.transcript,
          feedback: analysis.feedback,
          model: analysis.model,
          practiceId: analysis.id,
        }),
      )
      window.location.replace('/analysis-result')
    } catch (error) {
      if (phase === 'transcription') {
        setTranscriptionError(error instanceof Error ? error.message : '音声認識に失敗しました。')
      } else {
        setAnalysisError(error instanceof Error ? error.message : 'LLM評価に失敗しました。')
      }
    } finally {
      setIsTranscribing(false)
      setIsAnalyzing(false)
    }
  }

  async function handleTranscribe() {
    if (audioBlob) {
      await processAudioAndAnalyze(audioBlob)
    }
  }

  if (isTranscribing || isAnalyzing) {
    const isTranscribingNow = isTranscribing
    return (
      <main className="analysis-loading-shell">
        <section className="analysis-loading-card" aria-labelledby="loading-title">
          <div className="analysis-loading-spinner" aria-hidden="true" />
          <h1 id="loading-title">
            {isTranscribingNow ? '音声を文字起こししています' : 'LLMが評価を生成しています'}
          </h1>
          <p className="analysis-loading-description">
            {isTranscribingNow
              ? '録音した音声を解析しています。'
              : '文字起こし結果をLLMに送信して評価しています。'}
          </p>
          <div
            className="analysis-loading-progress"
            role="progressbar"
            aria-label={isTranscribingNow ? '文字起こし中' : 'LLM評価生成中'}
          >
            <span />
          </div>
          <p className="analysis-loading-note" role="status" aria-live="polite">
            完了すると分析結果画面に移動します…
          </p>
        </section>
      </main>
    )
  }

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
            <video
              ref={videoRef}
              className="practice-camera-preview"
              autoPlay
              muted
              playsInline
              aria-label="発表者のカメラ映像"
            />
            <p>
              {cameraStatus === 'connected'
                ? 'カメラ映像を表示中です。'
                : cameraStatus === 'checking'
                  ? 'カメラを確認しています。'
                  : 'カメラを使用できません。ブラウザの権限を確認してください。'}
            </p>
          </section>

          <p className="practice-note">
            {isRecording
              ? '録画終了後、音声を文字起こししてLLMで自動評価します。'
              : '音声の文字起こしとLLM評価を実行しています。'}
          </p>
          {recordingError && (
            <p className="practice-error" role="alert">
              {recordingError}
            </p>
          )}

          <button
            className="stop-recording-button"
            type="button"
            onClick={stopRecording}
            disabled={!isRecording}
          >
            {isRecording ? '録画を終了' : '録画終了済み'}
          </button>
          {audioBlob && (
            <button
              className="transcribe-recording-button"
              type="button"
              onClick={() => void handleTranscribe()}
              disabled={isTranscribing || isAnalyzing}
            >
              {isTranscribing ? '文字起こし中…' : isAnalyzing ? 'LLMで評価中…' : '再度LLM評価'}
            </button>
          )}
          {transcriptionError && (
            <p className="practice-error" role="alert">
              {transcriptionError}
            </p>
          )}
          {analysisError && (
            <p className="practice-error" role="alert">
              {analysisError}
            </p>
          )}
          {isTranscribing && <p className="practice-note" role="status">音声を解析しています…</p>}
          {isAnalyzing && <p className="practice-note" role="status">AIが評価しています…</p>}
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
