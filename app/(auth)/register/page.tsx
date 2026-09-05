'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Logo from '@/components/ui/Logo'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [router])

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

  return (
    <div className="w-full glass-panel p-8 sm:p-10 rounded-2xl border border-outline-variant shadow-2xl relative">
      {/* Top subtle highlight */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-secondary/20 blur-xl pointer-events-none rounded-full" />

      {/* Logo mobile */}
      <div className="lg:hidden mb-6 flex justify-center">
        <Logo size="md" href="/" />
      </div>

      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary border border-secondary/20 mb-3">
          <span className="material-symbols-outlined text-xs">rocket_launch</span>
          <span>Fast Free Onboarding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1.5 text-on-surface tracking-tight font-headline-lg">
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Start managing unlimited workspaces, projects, and tasks
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-on-surface-variant">
            Full Name
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-lg text-outline">
              badge
            </span>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              placeholder="Wasif Ali"
              className="w-full h-11 pl-10 pr-3.5 text-sm rounded-xl bg-surface-container-high/60 border border-outline-variant text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

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
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-on-surface-variant">
            Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-lg text-outline">
              key
            </span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Min. 8 characters"
              className="w-full h-11 pl-10 pr-3.5 text-sm rounded-xl bg-surface-container-high/60 border border-outline-variant text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-on-surface-variant">
            Confirm Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-lg text-outline">
              check_circle
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Repeat password"
              className="w-full h-11 pl-10 pr-3.5 text-sm rounded-xl bg-surface-container-high/60 border border-outline-variant text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-emerald-400 active:scale-[0.99] transition-all shadow-lg shadow-secondary/20 disabled:opacity-60 cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Create Free Account</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-outline-variant text-center">
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline ml-1">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
