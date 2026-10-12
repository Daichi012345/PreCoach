import { useState, type FormEvent } from 'react'
import './AuthPage.css'

function RegisterPage() {
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')
    const passwordConfirmation = formData.get('passwordConfirmation')

    if (password !== passwordConfirmation) {
      setMessage('パスワードが一致しません。')
      return
    }

    setMessage('新規登録機能は現在準備中です。')
  }

  return (
    <main className="page">
      <header className="brand">
        <p className="brand-name">PreCoach</p>
        <p className="brand-tagline">AIと練習して、伝わるプレゼンへ。</p>
      </header>

      <h1 className="page-title">新規登録</h1>

      <section className="auth-card" aria-labelledby="register-heading">
        <h2 id="register-heading" className="visually-hidden">
          アカウントを作成
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
              placeholder="8文字以上"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="passwordConfirmation">パスワード（確認）</label>
            <input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              placeholder="パスワードをもう一度入力"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="form-actions">
            <button className="action-button" type="submit">
              アカウントを作成
            </button>
            <button
              className="action-button"
              type="button"
              onClick={() => setMessage('Googleでの新規登録機能は現在準備中です。')}
            >
              Googleで登録
            </button>
          </div>

          {message && (
            <p className="form-message" role="status">
              {message}
            </p>
          )}

          <nav className="account-links" aria-label="アカウント">
            <a href="/login">ログインはこちら</a>
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

export default RegisterPage
