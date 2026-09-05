'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Password updated! Please sign in.')
    router.push('/login')
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
        Set new password
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-on-surface-variant)" }}>
        Choose a strong password for your account.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" className="input-base w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" className="input-base w-full" />
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary w-full h-10 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <span className="material-symbols-outlined text-base">progress_activity</span> : <span className="material-symbols-outlined text-base">lock_reset</span>}
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
