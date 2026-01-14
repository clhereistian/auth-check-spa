import { useEffect, useRef } from 'react'
import './App.css'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { loginRequest } from './auth/authConfig'

function App() {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const activeAccount = instance.getActiveAccount() ?? accounts[0]
  const attemptedAutoLogin = useRef(false)

  useEffect(() => {
    if (isAuthenticated || attemptedAutoLogin.current) {
      return
    }
    const params = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null
    const shouldAutoLogin = params?.get('autoLogin') === '1'
    const loginHint = params?.get('loginHint') ?? undefined
    if (!shouldAutoLogin) {
      return
    }
    attemptedAutoLogin.current = true
    const account = instance.getActiveAccount() ?? accounts[0]
    if (account) {
      instance
        .ssoSilent({ ...loginRequest, account, loginHint })
        .catch(() => undefined)
    } else if (loginHint) {
      instance.ssoSilent({ ...loginRequest, loginHint }).catch(() => undefined)
    }
  }, [accounts, instance, isAuthenticated])

  return (
    <div className="page">
      <div className="card">
        <h1>Auth Check</h1>
        <p className={`status ${isAuthenticated ? 'ok' : 'off'}`}>
          {isAuthenticated ? 'Signed in' : 'Signed out'}
        </p>
        {isAuthenticated && activeAccount ? (
          <p className="hint">Signed in as {activeAccount.username}</p>
        ) : (
          <p className="hint">No active session</p>
        )}
        <div className="actions">
          {!isAuthenticated ? (
            <button onClick={() => instance.loginRedirect(loginRequest)}>
              Sign in
            </button>
          ) : (
            <button
              className="secondary"
              onClick={() =>
                instance.logoutRedirect({ postLogoutRedirectUri: '/' })
              }
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
