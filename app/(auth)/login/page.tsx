'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Logo from '@/components/ui/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [router])

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
    <div className="w-full glass-panel p-8 sm:p-10 rounded-2xl border border-white/10 shadow-2xl relative">
      {/* Top subtle highlight */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-primary/20 blur-xl pointer-events-none rounded-full" />

      {/* Logo mobile */}
      <div className="lg:hidden mb-6 flex justify-center">
        <Logo size="md" href="/" />
      </div>

      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
          <span className="material-symbols-outlined text-xs">lock</span>
          <span>Secure Sign In</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1.5 text-on-surface tracking-tight font-headline-lg">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Enter your credentials to access your workspaces and projects
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-on-surface-variant">
            Email Address
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-lg text-outline">
              alternate_email
            </span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full h-11 pl-10 pr-3.5 text-sm rounded-xl bg-surface-container-high/60 border border-outline-variant text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-lg text-outline">
              key
            </span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full h-11 pl-10 pr-3.5 text-sm rounded-xl bg-surface-container-high/60 border border-outline-variant text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-primary-fixed-dim active:scale-[0.99] transition-all shadow-lg shadow-primary/20 disabled:opacity-60 cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">login</span>
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline ml-1">
            Create account free
          </Link>
        </p>
      </div>
    </div>
  )
}
