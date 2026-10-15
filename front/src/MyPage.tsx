import { useState, type FormEvent } from 'react'
import './MyPage.css'
import { getProfile, saveProfile, type Profile } from './profile'

function MyPage() {
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState<Profile>(getProfile)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState(profile)

  function startEditingProfile() {
    setProfileDraft(profile)
    setIsEditingProfile(true)
    setMessage('')
  }

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveProfile(profileDraft)
    setProfile(profileDraft)
    setIsEditingProfile(false)
    setMessage('プロフィールを保存しました。')
  }

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
                  {profile.name.slice(0, 1)}
                </div>
              </div>

              {isEditingProfile ? (
                <form className="profile-edit-form" onSubmit={handleProfileSubmit}>
                  <div className="profile-edit-field">
                    <label htmlFor="profile-name">お名前</label>
                    <input
                      id="profile-name"
                      value={profileDraft.name}
                      onChange={(event) =>
                        setProfileDraft({ ...profileDraft, name: event.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="profile-edit-field">
                    <label htmlFor="profile-organization">所属</label>
                    <input
                      id="profile-organization"
                      value={profileDraft.organization}
                      onChange={(event) =>
                        setProfileDraft({ ...profileDraft, organization: event.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="profile-edit-actions">
                    <button className="my-page-secondary-button" type="button" onClick={() => setIsEditingProfile(false)}>
                      キャンセル
                    </button>
                    <button className="my-page-primary-button" type="submit">
                      保存する
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <dl className="profile-details">
                    <div>
                      <dt>お名前</dt>
                      <dd>{profile.name}</dd>
                    </div>
                    <div>
                      <dt>メールアドレス</dt>
                      <dd>{profile.email}</dd>
                    </div>
                    <div>
                      <dt>所属</dt>
                      <dd>{profile.organization}</dd>
                    </div>
                  </dl>

                  <button className="my-page-secondary-button" type="button" onClick={startEditingProfile}>
                    プロフィールを編集
                  </button>
                </>
              )}
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
