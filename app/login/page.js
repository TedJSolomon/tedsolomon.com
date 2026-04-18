'use client';

import { useActionState, useState } from 'react';
import { login } from './actions';

const initialState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-tag">Dashboard</div>
        <h1 className="login-heading">Sign in</h1>
        <p className="login-subtext">Enter the password to access the dashboard.</p>

        <form action={formAction} className="login-form">
          <div className="login-field">
            <label className="login-label" htmlFor="password">
              Password
            </label>
            <div className="login-input-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="••••••••"
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                className="login-toggle-vis"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {state?.error && (
              <p className="login-error" role="alert">{state.error}</p>
            )}
          </div>

          <button type="submit" className="btn-primary login-submit" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>
      </div>

      <div className="login-graphic" aria-hidden="true">
        <svg viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" fill="none">
          <rect x="24" y="24" width="432" height="432" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <path d="M24 84 L24 24 L84 24" stroke="rgba(232,168,56,0.3)" strokeWidth="1.5" />
          <path d="M396 24 L456 24 L456 84" stroke="rgba(232,168,56,0.3)" strokeWidth="1.5" />
          <path d="M24 396 L24 456 L84 456" stroke="rgba(232,168,56,0.3)" strokeWidth="1.5" />
          <path d="M396 456 L456 456 L456 396" stroke="rgba(232,168,56,0.3)" strokeWidth="1.5" />
          <circle cx="240" cy="240" r="80" stroke="rgba(232,168,56,0.08)" strokeWidth="1" />
          <circle cx="240" cy="240" r="40" stroke="rgba(232,168,56,0.12)" strokeWidth="1" />
          <circle cx="240" cy="240" r="6" fill="rgba(232,168,56,0.5)" />
          <line x1="160" y1="240" x2="220" y2="240" stroke="rgba(232,168,56,0.2)" strokeWidth="1" />
          <line x1="260" y1="240" x2="320" y2="240" stroke="rgba(232,168,56,0.2)" strokeWidth="1" />
          <line x1="240" y1="160" x2="240" y2="220" stroke="rgba(232,168,56,0.2)" strokeWidth="1" />
          <line x1="240" y1="260" x2="240" y2="320" stroke="rgba(232,168,56,0.2)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
