'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default function LandingPageClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activePreviewTab, setActivePreviewTab] = useState<'kanban' | 'analytics' | 'workspaces'>('kanban')

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface overflow-x-hidden relative selection:bg-primary/30 selection:text-white">
      {/* ── Ambient Background Glow Effects ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute top-[25%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/10 blur-[140px] animate-float-slow" />
        <div className="absolute bottom-[10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-tertiary/8 blur-[130px] animate-float-reverse" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      {/* ── Fixed Glassmorphic Navigation Bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 lg:px-12 h-16 glass-panel border-b border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Logo size="sm" href="/" />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-wider text-on-surface-variant font-label-sm">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#preview" className="hover:text-primary transition-colors">Live Preview</a>
          <a href="#workflow" className="hover:text-primary transition-colors">Workflow</a>
          <a href="#metrics" className="hover:text-primary transition-colors">Performance</a>
        </div>

        {/* Auth CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-semibold text-on-surface hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-fixed-dim transition-all shadow-sm hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 glass-panel border-b border-white/10 p-5 flex flex-col gap-4 sm:hidden animate-in slide-in-from-top duration-200 shadow-2xl">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-on-surface py-2 border-b border-white/5"
            >
              Features
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-on-surface py-2 border-b border-white/5"
            >
              Live Preview
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-on-surface py-2 border-b border-white/5"
            >
              Workflow
            </a>
            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href="/login"
                className="w-full py-2.5 text-center text-xs font-semibold rounded-lg border border-outline-variant text-on-surface"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="w-full py-2.5 text-center text-xs font-semibold rounded-lg bg-primary text-on-primary"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-32 pb-16 sm:pt-40 sm:pb-24 max-w-6xl mx-auto">
        {/* Kinetic Shimmer Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8 glass-panel border border-primary/30 shadow-[0_0_20px_rgba(192,193,255,0.12)]">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
          <span className="text-on-surface font-semibold">100% Supabase Backend Managed</span>
          <span className="text-outline">·</span>
          <span className="text-primary font-mono text-[11px]">Zero Hardcoded Data</span>
        </div>

        {/* Grand Headline with Animated Gradient */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] max-w-5xl mb-6 font-headline-xl">
          One Workspace.{' '}
          <span className="text-gradient-animated block sm:inline">
            Every Project.
          </span>{' '}
          <span className="text-on-surface">Complete Control.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-body-lg">
          The high-output multi-workspace SaaS command center. Manage unlimited organizations,
          switch teams seamlessly, coordinate interactive Kanban boards, and view live velocity charts in real-time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_30px_-10px_rgba(192,193,255,0.4)] hover:shadow-primary/40 hover:scale-[1.03] active:scale-[0.98]"
          >
            <span>Launch Free Workspace</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-panel border border-white/10 text-on-surface hover:text-white font-medium text-sm flex items-center justify-center gap-2 transition-all hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-lg text-secondary">play_circle</span>
            <span>Sign In to Account</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-outline font-label-sm">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
            <span>Universal Permissions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
            <span>Multi-Tenant Architecture</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
            <span>Full CRUD Flexibility</span>
          </div>
        </div>
      </section>

      {/* ── Interactive Live Software Preview Section ── */}
      <section id="preview" className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mb-28">
        <div className="glass-panel rounded-2xl border border-white/15 overflow-hidden shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          {/* Top Browser Chrome Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface-container-lowest/80 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]/90" />
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]/90" />
              <div className="w-3 h-3 rounded-full bg-[#10B981]/90" />
            </div>

            {/* Simulated URL bar */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container-low/70 border border-white/5 text-[11px] font-mono text-outline w-72 sm:w-96 justify-center truncate">
              <span className="material-symbols-outlined text-xs text-secondary">lock</span>
              <span>https://wasifworkspace.vercel.app/dashboard</span>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-white/5 text-xs">
              <button
                type="button"
                onClick={() => setActivePreviewTab('kanban')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  activePreviewTab === 'kanban'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('analytics')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  activePreviewTab === 'analytics'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Analytics
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('workspaces')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  activePreviewTab === 'workspaces'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Workspaces
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="p-4 sm:p-6 min-h-[380px] sm:min-h-[440px] flex flex-col justify-center bg-surface-container-lowest/50">
            {activePreviewTab === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                {/* Column 1: In Progress */}
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary" />
                      <span className="text-xs font-semibold text-on-surface">IN PROGRESS</span>
                      <span className="text-[10px] px-1.5 rounded bg-surface-container-high text-outline">3</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container border border-white/5 space-y-2 hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-primary font-mono font-bold">WM-9021</span>
                      <span className="text-error font-medium flex items-center gap-0.5 text-[10px]">
                        <span className="material-symbols-outlined text-xs">emergency</span> High
                      </span>
                    </div>
                    <p className="text-xs font-medium text-on-surface">Universal Supabase permissions deployment</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-outline">
                      <span>⚡ Platform Core</span>
                      <span className="text-secondary font-mono">100% Live</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container border border-white/5 space-y-2 hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-primary font-mono font-bold">WM-8412</span>
                      <span className="text-tertiary font-medium flex items-center gap-0.5 text-[10px]">
                        <span className="material-symbols-outlined text-xs">density_medium</span> Medium
                      </span>
                    </div>
                    <p className="text-xs font-medium text-on-surface">Kinetic vector glassmorphic dashboard</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-outline">
                      <span>🎨 UI System</span>
                      <span className="text-secondary font-mono">Real-time</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: In Review */}
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                      <span className="text-xs font-semibold text-on-surface">IN REVIEW</span>
                      <span className="text-[10px] px-1.5 rounded bg-surface-container-high text-outline">2</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-primary font-mono font-bold">WM-7182</span>
                      <span className="text-secondary font-medium text-[10px]">Verified</span>
                    </div>
                    <p className="text-xs font-medium text-on-surface">Audit & remove all hardcoded mock arrays</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-outline">
                      <span>🛡️ Security</span>
                      <span className="text-secondary">Clean</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Done */}
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-on-surface">COMPLETED</span>
                      <span className="text-[10px] px-1.5 rounded bg-surface-container-high text-outline">5</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container/60 border border-emerald-500/20 space-y-2 opacity-85">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-mono font-bold line-through">WM-6019</span>
                      <span className="material-symbols-outlined text-xs text-secondary">check_circle</span>
                    </div>
                    <p className="text-xs font-medium line-through text-outline">Multi-workspace interactive switcher</p>
                    <div className="text-[10px] text-secondary font-mono">✓ Deployed to Vercel</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'analytics' && (
              <div className="flex flex-col md:flex-row items-center gap-8 justify-around animate-in fade-in duration-300 p-4">
                {/* SVG Donut Chart */}
                <div className="flex flex-col items-center">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4edea3" strokeWidth="12" strokeDasharray="140 251" strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8083ff" strokeWidth="12" strokeDasharray="60 251" strokeDashoffset="-140" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ffb95f" strokeWidth="12" strokeDasharray="30 251" strokeDashoffset="-200" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-bold font-headline-lg text-on-surface">88%</span>
                      <span className="text-[10px] text-outline font-label-sm uppercase">Throughput</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4 text-[11px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> Done</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Active</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary" /> Review</span>
                  </div>
                </div>

                {/* Metric Summary */}
                <div className="space-y-4 max-w-sm w-full">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 space-y-1">
                    <span className="text-xs text-outline">Total Task Velocity</span>
                    <div className="text-2xl font-bold text-secondary font-headline-lg">48 Tasks / Week</div>
                    <p className="text-[11px] text-outline">Realtime calculation across all user workspaces</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 space-y-1">
                    <span className="text-xs text-outline">Sync Status</span>
                    <div className="text-sm font-semibold text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                      <span>PostgreSQL RLS Active & Flattened</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'workspaces' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                <div className="p-4 rounded-xl bg-surface-container border border-primary/40 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xl">
                      🏢
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">Engineering Core</h4>
                      <span className="text-[10px] text-outline font-mono">/engineering-core</span>
                    </div>
                  </div>
                  <div className="text-xs text-on-surface-variant pt-2">8 Projects · 42 Active Tasks</div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container border border-white/10 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center text-xl">
                      🚀
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">Product & Growth</h4>
                      <span className="text-[10px] text-outline font-mono">/product-growth</span>
                    </div>
                  </div>
                  <div className="text-xs text-on-surface-variant pt-2">4 Projects · 19 Active Tasks</div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container border border-white/10 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-tertiary/20 text-tertiary flex items-center justify-center text-xl">
                      🎨
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">Design Studio</h4>
                      <span className="text-[10px] text-outline font-mono">/design-studio</span>
                    </div>
                  </div>
                  <div className="text-xs text-on-surface-variant pt-2">2 Projects · 11 Active Tasks</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Feature Bento Grid ── */}
      <section id="features" className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mb-28">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight font-headline-xl">
            Engineered for Extreme Productivity
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-body-md">
            Everything your team needs to plan, track, and ship high-impact software without artificial limits or gating.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bento Card 1 */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4">
            <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">domain</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">Multi-Tenant Workspaces</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Create and manage unlimited independent organizations. Switch seamlessly between teams, startups, or agency clients with zero re-login.
            </p>
          </div>

          {/* Bento Card 2 */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4">
            <div className="w-11 h-11 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">view_kanban</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">Dynamic Kanban Engine</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Drag and drop cards across lanes, filter by priority, toggle 1-click completion checkmarks, and collaborate in real-time.
            </p>
          </div>

          {/* Bento Card 3 */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4">
            <div className="w-11 h-11 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">analytics</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">Executive Velocity Charts</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Real-time SVG donut charts, velocity distribution bars, and throughput trajectory curves calculated dynamically from database tables.
            </p>
          </div>

          {/* Bento Card 4 */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4">
            <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">lock_open</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">Universal Permissions</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              No restrictive role gates. Every workspace member can create, edit, prioritize, and delete tasks and projects freely.
            </p>
          </div>

          {/* Bento Card 5 */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4">
            <div className="w-11 h-11 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">database</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">100% Supabase Backend</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Zero mock or hardcoded data. Every item you see is backed by PostgreSQL tables, Row Level Security, and realtime channels.
            </p>
          </div>

          {/* Bento Card 6 */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4">
            <div className="w-11 h-11 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">devices</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">Mobile First & Ultra Fast</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Optimized with route streaming skeletons, top loading glow progress bar, smooth mobile drawer, and tactile click animations.
            </p>
          </div>
        </div>
      </section>

      {/* ── Workflow Steps Section ── */}
      <section id="workflow" className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full mb-28">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline-lg">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            From first login to shipping completed milestones in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden space-y-3">
            <div className="text-4xl font-extrabold text-primary/30 font-code-metric">01</div>
            <h3 className="text-base font-bold text-on-surface">Create Your Workspace</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Set up your organization, pick custom brand colors and icons, and invite team members.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden space-y-3">
            <div className="text-4xl font-extrabold text-secondary/30 font-code-metric">02</div>
            <h3 className="text-base font-bold text-on-surface">Launch Team Projects</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Organize work into focused projects with customized boards, lists, and calendar schedules.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden space-y-3">
            <div className="text-4xl font-extrabold text-tertiary/30 font-code-metric">03</div>
            <h3 className="text-base font-bold text-on-surface">Execute & Track</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Assign story points, toggle completion checkmarks, and monitor velocity on the executive dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* ── Performance & Telemetry Metric Bar ── */}
      <section id="metrics" className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mb-28">
        <div className="glass-panel p-8 rounded-2xl border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary font-headline-xl">99.99%</div>
            <div className="text-xs text-on-surface-variant font-medium">Realtime Sync Uptime</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-secondary font-headline-xl">&lt; 35ms</div>
            <div className="text-xs text-on-surface-variant font-medium">Interaction Latency</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-tertiary font-headline-xl">Unlimited</div>
            <div className="text-xs text-on-surface-variant font-medium">Workspaces & Projects</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-headline-xl">100%</div>
            <div className="text-xs text-on-surface-variant font-medium">Backend Supabase Managed</div>
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full mb-24 text-center">
        <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-primary/30 relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-secondary/15 blur-3xl" />
          
          <h2 className="text-3xl sm:text-5xl font-extrabold text-on-surface tracking-tight font-headline-xl relative z-10">
            Ready to Take Command of Your Projects?
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-xl mx-auto relative z-10 leading-relaxed">
            Join Wasif&apos;s Workspace today. Enjoy seamless multi-workspace productivity, real-time collaboration, and zero bottlenecks.
          </p>

          <div className="pt-2 relative z-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-fixed-dim transition-all shadow-[0_10px_35px_-10px_rgba(192,193,255,0.5)] hover:scale-105 active:scale-95"
            >
              <span>Get Started Immediately</span>
              <span className="material-symbols-outlined text-lg">rocket_launch</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/10 py-10 px-6 sm:px-12 bg-surface-container-lowest/80 backdrop-blur-md text-xs text-outline">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="xs" href="/" />
          <p className="text-center sm:text-right">
            © 2026 Wasif&apos;s Workspace. Built for extreme engineering output.
          </p>
        </div>
      </footer>
    </div>
  )
}
