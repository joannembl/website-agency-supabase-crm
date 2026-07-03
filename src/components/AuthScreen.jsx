import React, { useState } from 'react'
import { Lock } from 'lucide-react'
import { supabase } from '../supabase'

export default function AuthScreen({ onAuthed }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('sign-in')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setMessage(''); setLoading(true)
    const action = mode === 'sign-up'
      ? supabase.auth.signUp({ email, password })
      : supabase.auth.signInWithPassword({ email, password })
    const { data, error } = await action
    setLoading(false)
    if (error) return setMessage(error.message)
    if (mode === 'sign-up' && !data.session) return setMessage('Account created. Check your email to confirm your login, then come back and sign in.')
    onAuthed(data.session)
  }

  return <div className="authPage"><form onSubmit={handleSubmit} className="authCard">
    <div className="authIcon"><Lock size={24}/></div>
    <h1>Website Agency CRM</h1><p>Sign in to manage your shared lead database.</p>
    {message && <div className="notice authNotice">{message}</div>}
    <label>Email</label><input type="email" required placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
    <label>Password</label><input type="password" required minLength="6" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
    <button type="submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button>
    <button type="button" className="secondaryBtn" onClick={()=>{ setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up'); setMessage('') }}>
      {mode === 'sign-up' ? 'Already have an account? Sign in' : 'Need an account? Create one'}
    </button>
  </form></div>
}
