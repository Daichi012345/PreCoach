import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoginPage from './LoginPage.tsx'
import RegisterPage from './RegisterPage.tsx'

const isRegisterPage =
  window.location.pathname.replace(/\/+$/, '') === '/register'
const Page = isRegisterPage ? RegisterPage : LoginPage

document.title = isRegisterPage ? 'PreCoach | 新規登録' : 'PreCoach | ログイン'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
