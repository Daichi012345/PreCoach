import { useState, type FormEvent } from 'react'
import './AuthPage.css'

function LoginPage() {
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('ログイン機能は現在準備中です。')
  }

  return (
    <main className="page">
      <header className="brand">
        <p className="brand-name">PreCoach</p>
        <p className="brand-tagline">AIと練習して、伝わるプレゼンへ。</p>
      </header>

      <h1 className="page-title">ログイン</h1>

      <section className="auth-card" aria-labelledby="login-heading">
        <h2 id="login-heading" className="visually-hidden">
          アカウントにログイン
        </h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@school.ac.jp"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="パスワードを入力"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="form-actions">
            <button className="action-button" type="submit">
              ログイン
            </button>
            <button
              className="action-button"
              type="button"
              onClick={() => setMessage('Googleログイン機能は現在準備中です。')}
            >
              Googleでログイン
            </button>
          </div>

          {message && (
            <p className="form-message" role="status">
              {message}
            </p>
          )}

          <nav className="account-links" aria-label="アカウント">
            <a href="/register">新規登録</a>
            <span aria-hidden="true">/</span>
            <a href="/forgot-password">パスワードを忘れた方</a>
          </nav>
        </form>
      </section>

      <footer className="page-footer">
        <span>WIREFRAME v0.1</span>
        <span aria-hidden="true">|</span>
        <span>表示データはサンプル</span>
        <span aria-hidden="true">|</span>
        <span>PC 1200px</span>
      </footer>
    </main>
  )
}

export default LoginPage
