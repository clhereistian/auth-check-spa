import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  EventType,
  PublicClientApplication,
  type AuthenticationResult,
} from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import './index.css'
import App from './App.tsx'
import { msalConfig } from './auth/authConfig'

const msalInstance = new PublicClientApplication(msalConfig)

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult
    if (payload.account) {
      msalInstance.setActiveAccount(payload.account)
    }
  }
})

const renderApp = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </StrictMode>,
  )
}

msalInstance
  .initialize()
  .then(() => msalInstance.handleRedirectPromise())
  .then(() => {
    const accounts = msalInstance.getAllAccounts()
    if (!msalInstance.getActiveAccount() && accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0])
    }
    renderApp()
  })
  .catch((error) => {
    console.error('MSAL initialization failed', error)
    renderApp()
  })
