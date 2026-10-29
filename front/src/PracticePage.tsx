import { useEffect, useRef, useState } from 'react'
import { transcribeAudio, type Transcription } from './api'
import './PracticePage.css'

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
  const [transcription, setTranscription] = useState<Transcription | null>(null)
  const [transcriptionError, setTranscriptionError] = useState('')
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

  async function handleTranscribe() {
    if (!audioBlob) {
      return
    }

    setIsTranscribing(true)
    setTranscriptionError('')
    setTranscription(null)
    try {
      const result = await transcribeAudio(audioBlob)
      if (!result.transcript) {
        setTranscriptionError('音声から発話を認識できませんでした。録音を確認して再度お試しください。')
        return
      }
      setTranscription(result)
    } catch (error) {
      setTranscriptionError(
        error instanceof Error ? error.message : '音声認識に失敗しました。',
      )
    } finally {
      setIsTranscribing(false)
    }
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
              ? '録画終了後、音声を文字起こしできます。'
              : '録画終了後、音声を文字起こしして内容を確認できます。'}
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
              disabled={isTranscribing}
            >
              {isTranscribing ? '文字起こし中…' : '音声を文字起こし'}
            </button>
          )}
          {transcriptionError && (
            <p className="practice-error" role="alert">
              {transcriptionError}
            </p>
          )}
          {transcription && (
            <section className="transcription-result" aria-labelledby="transcription-title">
              <h2 id="transcription-title">文字起こし結果</h2>
              <p>{transcription.transcript}</p>
              <small>
                認識言語: {transcription.language} ・ 音声の長さ:{' '}
                {formatTime(Math.round(transcription.duration_seconds))}
              </small>
            </section>
          )}
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
