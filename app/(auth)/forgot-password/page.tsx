'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(78,222,163,0.12)", border: "1px solid rgba(78,222,163,0.2)" }}>
          <span className="material-symbols-outlined text-3xl" style={{ color: "var(--color-secondary)" }}>mark_email_read</span>
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--color-on-surface)" }}>Check your email</h2>
        <p className="text-sm mb-6" style={{ color: "var(--color-on-surface-variant)" }}>
          We sent a password reset link to <strong style={{ color: "var(--color-on-surface)" }}>{email}</strong>
        </p>
        <Link href="/login" className="btn-ghost text-sm font-medium px-4 py-2 rounded-lg inline-flex items-center gap-2"
          style={{ border: "1px solid var(--color-outline-variant)" }}>
          <span className="material-symbols-outlined text-base">arrow_back</span> Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
          Reset your password
        </h1>
        <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="input-base w-full" />
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary w-full h-10 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <span className="material-symbols-outlined text-base">progress_activity</span> : <span className="material-symbols-outlined text-base">send</span>}
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm inline-flex items-center gap-1" style={{ color: "var(--color-on-surface-variant)" }}>
          <span className="material-symbols-outlined text-base">arrow_back</span> Back to sign in
        </Link>
      </div>
    </div>
  )
}
