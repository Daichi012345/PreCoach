import { useState, type FormEvent } from 'react'
import './AuthPage.css'
import { register } from './api'

function RegisterPage() {
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')
    const passwordConfirmation = formData.get('passwordConfirmation')

    if (password !== passwordConfirmation) {
      setMessage('パスワードが一致しません。')
      return
    }

    try {
      await register({
        name: String(formData.get('name')).trim(),
        organization: String(formData.get('organization')).trim(),
        email: String(formData.get('email')).trim(),
        password: String(password),
      })
      setMessage('登録が完了しました。ログイン画面へ移動します。')
      window.setTimeout(() => window.location.assign('/login'), 800)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '登録に失敗しました')
    }
  }

  return (
    <main className="page-shell">
      <p className="page-breadcrumb">PreCoach / 01 新規登録</p>
      <div className="page">
        <header className="brand">
        <a className="brand-name" href="/dashboard">
          PreCoach
        </a>
        <p className="brand-tagline">AIと練習して、伝わるプレゼンへ。</p>
        <nav className="page-navigation" aria-label="ページ">
          <a href="/dashboard">Dashboard</a>
          <span aria-hidden="true">/</span>
          <a href="/login">Login</a>
        </nav>
        </header>

      <h1 className="page-title">新規登録</h1>

      <section className="auth-card" aria-labelledby="register-heading">
        <h2 id="register-heading" className="visually-hidden">
          アカウントを作成
        </h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">お名前</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="山田 太郎"
              autoComplete="name"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="organization">所属</label>
            <input
              id="organization"
              name="organization"
              type="text"
              placeholder="サンプル大学"
              autoComplete="organization"
              required
            />
          </div>

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
              placeholder="4文字以上"
              autoComplete="new-password"
              minLength={4}
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
              minLength={4}
              required
            />
          </div>

          <div className="form-actions">
            <button className="action-button" type="submit">
              アカウントを作成
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
      </div>
    </main>
  )
}

export default RegisterPage
