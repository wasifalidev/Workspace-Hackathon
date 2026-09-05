'use client'

import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setUser } from '@/store/slices/authSlice'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { useTheme, type Theme } from '@/components/providers/ThemeProvider'
import { AppIcon } from '@/components/ui/AppIcon'
import { toast } from 'sonner'

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(s => s.auth.user)
  const { theme, resolvedTheme, setTheme } = useTheme()

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
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

  function handleThemeChange(newTheme: Theme) {
    setTheme(newTheme)
    const labels: Record<Theme, string> = {
      light: 'Light (Solar Day)',
      dark: 'Dark (Kinetic Obsidian)',
      system: 'System Synchronized',
    }
    toast.success(`Theme updated to ${labels[newTheme]}`)
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
          <AppIcon name="person" size={20} color="var(--color-primary)" />
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

      {/* Appearance & Theming Section */}
      <div id="appearance" className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-on-surface font-headline-sm flex items-center gap-2">
              <AppIcon name="palette" size={20} color="var(--color-primary)" />
              <span>Appearance & Theme</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
              Effective: {resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Choose how Wasif&apos;s Workspace looks to you. Seamlessly switch between light, dark, or automatic system matching.
          </p>
        </div>

        {/* 3-Card Theme Visual Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Light Mode Card */}
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`group text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
              theme === 'light'
                ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-md'
                : 'bg-surface-container border-outline-variant/60 hover:border-primary/40 hover:bg-surface-container-high'
            }`}
          >
            <div>
              {/* Miniature Mockup Preview (Light) */}
              <div className="w-full h-24 rounded-lg bg-slate-100 border border-slate-300 p-2 overflow-hidden mb-3 relative shadow-inner">
                {/* Mock header */}
                <div className="w-full h-3 rounded bg-white border border-slate-200 flex items-center px-1.5 gap-1 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <div className="w-6 h-1 rounded bg-slate-200" />
                  <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                {/* Mock body with sidebar and cards */}
                <div className="flex gap-1.5 h-14">
                  <div className="w-1/4 h-full rounded bg-slate-200/80 p-1 flex flex-col gap-1">
                    <div className="w-full h-1.5 rounded bg-indigo-500/50" />
                    <div className="w-3/4 h-1.5 rounded bg-slate-300" />
                    <div className="w-1/2 h-1.5 rounded bg-slate-300" />
                  </div>
                  <div className="flex-1 h-full flex flex-col gap-1.5">
                    <div className="w-full h-6 rounded bg-white border border-slate-200 p-1 flex items-center justify-between">
                      <div className="w-8 h-1.5 rounded bg-slate-400" />
                      <div className="w-2.5 h-2.5 rounded bg-indigo-100 border border-indigo-400" />
                    </div>
                    <div className="w-full h-6 rounded bg-white border border-slate-200 p-1 flex items-center">
                      <div className="w-12 h-1.5 rounded bg-slate-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-lg">light_mode</span>
                  <span className="font-semibold text-sm text-on-surface">Light</span>
                </div>
                {theme === 'light' && (
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">
                Crisp solar day theme with high contrast slate surfaces and deep indigo accents.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[10px] text-on-surface-variant">
              <span>Daylight Mode</span>
              {theme === 'light' && <span className="font-semibold text-primary">Selected</span>}
            </div>
          </button>

          {/* 2. Dark Mode Card */}
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`group text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
              theme === 'dark'
                ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-md'
                : 'bg-surface-container border-outline-variant/60 hover:border-primary/40 hover:bg-surface-container-high'
            }`}
          >
            <div>
              {/* Miniature Mockup Preview (Dark) */}
              <div className="w-full h-24 rounded-lg bg-[#0a0e16] border border-[#2a2e3a] p-2 overflow-hidden mb-3 relative shadow-inner">
                {/* Mock header */}
                <div className="w-full h-3 rounded bg-[#181c24] border border-[#31353e] flex items-center px-1.5 gap-1 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]" />
                  <div className="w-6 h-1 rounded bg-[#31353e]" />
                  <div className="ml-auto w-2 h-2 rounded-full bg-[#4edea3]" />
                </div>
                {/* Mock body with sidebar and cards */}
                <div className="flex gap-1.5 h-14">
                  <div className="w-1/4 h-full rounded bg-[#181c24] p-1 flex flex-col gap-1">
                    <div className="w-full h-1.5 rounded bg-[#c0c1ff]/50" />
                    <div className="w-3/4 h-1.5 rounded bg-[#31353e]" />
                    <div className="w-1/2 h-1.5 rounded bg-[#31353e]" />
                  </div>
                  <div className="flex-1 h-full flex flex-col gap-1.5">
                    <div className="w-full h-6 rounded bg-[#1c2028] border border-[#31353e] p-1 flex items-center justify-between">
                      <div className="w-8 h-1.5 rounded bg-[#dfe2ee]/60" />
                      <div className="w-2.5 h-2.5 rounded bg-[#c0c1ff]/20 border border-[#c0c1ff]" />
                    </div>
                    <div className="w-full h-6 rounded bg-[#1c2028] border border-[#31353e] p-1 flex items-center">
                      <div className="w-12 h-1.5 rounded bg-[#31353e]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-lg">dark_mode</span>
                  <span className="font-semibold text-sm text-on-surface">Dark</span>
                </div>
                {theme === 'dark' && (
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">
                Space-age kinetic obsidian theme tailored for low eye fatigue and focused sprint execution.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[10px] text-on-surface-variant">
              <span>Obsidian Mode</span>
              {theme === 'dark' && <span className="font-semibold text-primary">Selected</span>}
            </div>
          </button>

          {/* 3. System Synchronized Card */}
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`group text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
              theme === 'system'
                ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-md'
                : 'bg-surface-container border-outline-variant/60 hover:border-primary/40 hover:bg-surface-container-high'
            }`}
          >
            <div>
              {/* Miniature Mockup Preview (Split Light/Dark) */}
              <div className="w-full h-24 rounded-lg border border-outline-variant p-0 overflow-hidden mb-3 relative flex shadow-inner">
                {/* Left: Light Half */}
                <div className="w-1/2 h-full bg-slate-100 p-2 flex flex-col justify-between border-r border-outline-variant/60">
                  <div className="w-full h-3 rounded bg-white border border-slate-200 flex items-center px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <div className="w-full h-10 rounded bg-white border border-slate-200 p-1 flex flex-col gap-1">
                    <div className="w-6 h-1 rounded bg-slate-400" />
                    <div className="w-10 h-1 rounded bg-slate-300" />
                  </div>
                </div>
                {/* Right: Dark Half */}
                <div className="w-1/2 h-full bg-[#0a0e16] p-2 flex flex-col justify-between">
                  <div className="w-full h-3 rounded bg-[#181c24] border border-[#31353e] flex items-center px-1 justify-end">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  </div>
                  <div className="w-full h-10 rounded bg-[#1c2028] border border-[#31353e] p-1 flex flex-col gap-1 items-end">
                    <div className="w-6 h-1 rounded bg-[#dfe2ee]/60" />
                    <div className="w-10 h-1 rounded bg-[#31353e]" />
                  </div>
                </div>
              </div>

              {/* Title & Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">desktop_windows</span>
                  <span className="font-semibold text-sm text-on-surface">System</span>
                </div>
                {theme === 'system' && (
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">
                Automatically adapts to your device&apos;s OS preference in real-time with zero manual adjustments.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[10px] text-on-surface-variant">
              <span>Auto-detect ({resolvedTheme})</span>
              {theme === 'system' && <span className="font-semibold text-primary">Selected</span>}
            </div>
          </button>
        </div>

        {/* Informational Status Card */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-container border border-outline-variant/50 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-base text-primary mt-0.5">info</span>
          <div className="space-y-0.5">
            <span className="font-semibold text-on-surface">Zero-Flicker Instant Loading</span>
            <p>
              Your theme choice is stored in your browser and automatically synchronized with the server layout using an inline anti-flash script.
            </p>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div id="preferences" className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-semibold text-on-surface font-headline-sm flex items-center gap-2">
          <AppIcon name="tune" size={20} color="var(--color-secondary)" />
          <span>Notification & Audio Preferences</span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-outline-variant/40">
            <div>
              <div className="text-xs font-semibold text-on-surface">Email Notifications</div>
              <div className="text-[11px] text-on-surface-variant">Receive daily summaries, mentions, and project updates</div>
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
              <div className="text-[11px] text-on-surface-variant">Play audio feedback when tasks or sprints are ticked complete</div>
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
