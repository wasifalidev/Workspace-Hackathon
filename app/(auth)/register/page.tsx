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
      <p className="text-sm mb-6" style={{ color: "var(--color-on-surface-variant)" }}>
        Start managing your workspace with email &amp; password
      </p>

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
