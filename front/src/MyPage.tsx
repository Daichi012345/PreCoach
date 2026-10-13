import { useState } from 'react'
import './MyPage.css'

function MyPage() {
  const [message, setMessage] = useState('')

  return (
    <main className="my-page-shell">
      <div className="my-page">
        <header className="my-page-header">
          <a className="my-page-brand" href="/dashboard">
            PreCoach
          </a>
          <a className="my-page-back" href="/dashboard">
            ← ダッシュボードに戻る
          </a>
        </header>

        <section className="my-page-content" aria-labelledby="my-page-title">
          <p className="my-page-eyebrow">ACCOUNT</p>
          <h1 id="my-page-title">マイページ</h1>
          <p className="my-page-intro">アカウント情報やご利用中のプランを確認できます。</p>

          <div className="my-page-grid">
            <section className="my-page-card profile-card" aria-labelledby="profile-title">
              <div className="my-page-card-heading">
                <div>
                  <h2 id="profile-title">プロフィール</h2>
                  <p>登録されているアカウント情報</p>
                </div>
                <div className="profile-avatar" aria-hidden="true">
                  山
                </div>
              </div>

              <dl className="profile-details">
                <div>
                  <dt>お名前</dt>
                  <dd>山田 太郎</dd>
                </div>
                <div>
                  <dt>メールアドレス</dt>
                  <dd>taro.yamada@example.com</dd>
                </div>
                <div>
                  <dt>所属</dt>
                  <dd>サンプル大学</dd>
                </div>
              </dl>

              <button
                className="my-page-secondary-button"
                type="button"
                onClick={() => setMessage('プロフィールの編集機能は現在準備中です。')}
              >
                プロフィールを編集
              </button>
            </section>

            <section className="my-page-card plan-card" aria-labelledby="plan-title">
              <div className="my-page-card-heading">
                <div>
                  <h2 id="plan-title">ご利用プラン</h2>
                  <p>現在の契約内容</p>
                </div>
                <span className="plan-status">無料プラン</span>
              </div>

              <div className="current-plan">
                <strong>PreCoach Free</strong>
                <span>基本的な発表練習をご利用いただけます。</span>
              </div>

              <ul className="plan-features">
                <li>発表練習の記録</li>
                <li>基本スコアの確認</li>
              </ul>

              <a className="my-page-primary-link" href="/upgrade">
                プランをアップグレード
              </a>
            </section>

            <section className="my-page-card settings-card" aria-labelledby="account-settings-title">
              <div className="my-page-card-heading">
                <div>
                  <h2 id="account-settings-title">設定</h2>
                  <p>ログインや通知などのアカウント設定</p>
                </div>
              </div>
              <div className="account-setting-row">
                <div>
                  <strong>パスワード</strong>
                  <span>定期的な変更をおすすめします</span>
                </div>
                <button
                  className="my-page-text-button"
                  type="button"
                  onClick={() => setMessage('パスワード変更機能は現在準備中です。')}
                >
                  変更
                </button>
              </div>
              <div className="account-setting-row">
                <div>
                  <strong>メール通知</strong>
                  <span>練習記録やサービスからのお知らせ</span>
                </div>
                <button
                  className="my-page-text-button"
                  type="button"
                  onClick={() => setMessage('通知設定機能は現在準備中です。')}
                >
                  設定
                </button>
              </div>
            </section>
          </div>

          {message && (
            <p className="my-page-message" role="status">
              {message}
            </p>
          )}
        </section>

        <footer className="my-page-footer">
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

export default MyPage
