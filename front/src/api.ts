const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`
const tokenStorageKey = 'precoach-token'

export type User = {
  name: string
  organization: string
  email: string
}

export type Practice = {
  id: number
  date: string
  title: string
  duration: number
  score: number | null
  feedback: string | null
}

export type Transcription = {
  transcript: string
  language: string
  duration_seconds: number
  segments: Array<{
    start: number
    end: number
    text: string
  }>
}

export function getToken() {
  return window.localStorage.getItem(tokenStorageKey)
}

export function saveToken(token: string) {
  window.localStorage.setItem(tokenStorageKey, token)
}

export function clearToken() {
  window.localStorage.removeItem(tokenStorageKey)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch (error) {
    throw new Error(
      `APIに接続できません。バックエンドが起動しているか確認してください（${API_BASE_URL}）`,
      { cause: error },
    )
  }

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? ((await response.json()) as T | { detail?: string })
    : undefined
  if (!response.ok) {
    throw new Error(
      typeof body === 'object' && body !== null && 'detail' in body
        ? body.detail || '通信に失敗しました'
        : '通信に失敗しました',
    )
  }
  return body as T
}

export function register(data: {
  name: string
  organization: string
  email: string
  password: string
}) {
  return request<{ token: string; user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function login(data: { email: string; password: string }) {
  return request<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getCurrentUser() {
  return request<User>('/api/me')
}

export function getPractices() {
  return request<Practice[]>('/api/practices')
}

export async function transcribeAudio(audio: Blob) {
  const formData = new FormData()
  const extension = audio.type.includes('mp4') ? 'm4a' : 'webm'
  formData.append('audio', audio, `practice.${extension}`)

  const headers = new Headers()
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/transcribe`, {
      method: 'POST',
      headers,
      body: formData,
    })
  } catch (error) {
    throw new Error(
      `音声認識APIに接続できません。バックエンドが起動しているか確認してください（${API_BASE_URL}）`,
      { cause: error },
    )
  }

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? ((await response.json()) as Transcription | { detail?: string })
    : undefined
  if (!response.ok) {
    throw new Error(
      typeof body === 'object' && body !== null && 'detail' in body
        ? body.detail || '音声認識に失敗しました'
        : '音声認識に失敗しました',
    )
  }
  return body as Transcription
}

export async function analyzeContent(data: {
  transcript: string
  title?: string
  duration_seconds?: number
}) {
  return request<{ id: number; model: string; transcript: string; feedback: string }>('/api/analyze-content', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
