import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AnalysisResultPage from './AnalysisResultPage.tsx'
import DashboardPage from './DashboardPage.tsx'
import GrowthRecordPage from './GrowthRecordPage.tsx'
import LoginPage from './LoginPage.tsx'
import PracticePage from './PracticePage.tsx'
import PracticeHistoryPage from './PracticeHistoryPage.tsx'
import PracticeSettingsPage from './PracticeSettingsPage.tsx'
import RegisterPage from './RegisterPage.tsx'
import './UnifiedPage.css'

const route = window.location.pathname.replace(/\/+$/, '') || '/'
const Page =
  route === '/dashboard' || route === '/home'
    ? DashboardPage
    : route === '/growth-record'
      ? GrowthRecordPage
    : route === '/analysis-result'
      ? AnalysisResultPage
    : route === '/practice'
      ? PracticePage
    : route === '/practice-history'
      ? PracticeHistoryPage
    : route === '/practice-settings'
      ? PracticeSettingsPage
    : route === '/register'
      ? RegisterPage
      : LoginPage

document.title =
  route === '/dashboard' || route === '/home'
    ? 'PreCoach | ダッシュボード'
    : route === '/growth-record'
      ? 'PreCoach | 成長記録'
    : route === '/analysis-result'
      ? 'PreCoach | 分析結果'
    : route === '/practice'
      ? 'PreCoach | 発表・録画'
    : route === '/practice-history'
      ? 'PreCoach | 練習履歴'
    : route === '/practice-settings'
      ? 'PreCoach | 練習設定'
    : route === '/register'
      ? 'PreCoach | 新規登録'
      : 'PreCoach | ログイン'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
