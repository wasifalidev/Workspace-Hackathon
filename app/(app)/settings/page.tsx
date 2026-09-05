'use client'

import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setUser } from '@/store/slices/authSlice'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { toast } from 'sonner'

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(s => s.auth.user)

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [theme, setTheme] = useState('dark')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      dispatch(
        setUser({
          ...user,
          fullName: fullName.trim(),
          avatarUrl: avatarUrl.trim() || null,
        })
      )
      toast.success('Profile updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface font-headline-lg">Account & Preferences</h1>
        <p className="text-xs text-on-surface-variant mt-1 font-body-sm">
          Manage your personal profile, notification defaults, and application theme.
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-on-surface mb-4 font-headline-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">person</span>
          <span>Personal Profile</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar src={avatarUrl || user?.avatarUrl} name={fullName || user?.email} size="lg" />
            <div className="space-y-1">
              <span className="text-xs font-medium text-on-surface">Profile Picture</span>
              <p className="text-[11px] text-on-surface-variant">
                Enter an image URL or leave blank to display your initials.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Your Full Name"
            />
            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
          </div>

          <Input
            label="Avatar Image URL (optional)"
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={saving}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      {/* Preferences Section */}
      <div id="preferences" className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-semibold text-on-surface font-headline-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-lg">tune</span>
          <span>Workspace Preferences</span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-outline-variant/40">
            <div>
              <div className="text-xs font-semibold text-on-surface">Interface Theme</div>
              <div className="text-[11px] text-on-surface-variant">Kinetic Workspace dark-first visual mode</div>
            </div>
            <select
              value={theme}
              onChange={e => setTheme(e.target.value)}
              className="text-xs rounded-lg p-2 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="dark">Dark (Kinetic Obsidian)</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-outline-variant/40">
            <div>
              <div className="text-xs font-semibold text-on-surface">Email Notifications</div>
              <div className="text-[11px] text-on-surface-variant">Receive daily summaries and mentions</div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={e => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-xs font-semibold text-on-surface">Sound Effects</div>
              <div className="text-[11px] text-on-surface-variant">Play audio chime on task completion</div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={e => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
