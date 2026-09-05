'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Welcome back!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo mobile */}
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>W</div>
        <span className="font-semibold" style={{ color: "var(--color-on-surface)" }}>Workspace Manager</span>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
        Welcome back
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-on-surface-variant)" }}>
        Sign in with your email and password
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="input-base w-full"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Password</label>
            <Link href="/forgot-password" className="text-xs" style={{ color: "var(--color-primary)" }}>
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="input-base w-full"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full h-10 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-base">login</span>
          )}
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium" style={{ color: "var(--color-primary)" }}>
          Create one free
        </Link>
      </p>
    </div>
  )
}
