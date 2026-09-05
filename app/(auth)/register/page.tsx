'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Account created! Check your email to confirm.')
    router.push('/login')
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) toast.error('Google sign-in is not configured. Please use email/password.')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>W</div>
        <span className="font-semibold" style={{ color: "var(--color-on-surface)" }}>Workspace Manager</span>
      </div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
        Create your account
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-on-surface-variant)" }}>
        Start managing your workspace for free
      </p>

      <button onClick={handleGoogleLogin} type="button"
        className="w-full flex items-center justify-center gap-3 h-10 rounded-lg text-sm font-medium mb-5 transition-colors"
        style={{ background: "var(--color-surface-container-high)", border: "1px solid var(--color-outline-variant)", color: "var(--color-on-surface)" }}>
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full" style={{ borderTop: "1px solid var(--color-outline-variant)" }}></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3" style={{ background: "var(--color-background)", color: "var(--color-outline)" }}>or</span>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Full Name</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Jane Smith" className="input-base w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="input-base w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" className="input-base w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" className="input-base w-full" />
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary w-full h-10 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <span className="material-symbols-outlined text-base">progress_activity</span> : <span className="material-symbols-outlined text-base">person_add</span>}
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
        Already have an account?{' '}
        <Link href="/login" className="font-medium" style={{ color: "var(--color-primary)" }}>Sign in</Link>
      </p>
    </div>
  )
}
