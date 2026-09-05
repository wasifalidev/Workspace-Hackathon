import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-surface-container-lowest text-on-surface">
      {/* ── Dynamic Ambient Background Glows ── */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float-slow pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float-reverse pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-tertiary) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full min-h-screen flex">
        {/* Left panel — branding & showcase */}
        <div
          className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12 relative overflow-hidden backdrop-blur-xl"
          style={{
            background: "var(--color-header-bg)",
            borderRight: "1px solid var(--color-outline-variant)",
          }}
        >
          {/* Subtle top ambient highlight */}
          <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full blur-2xl opacity-15 bg-primary pointer-events-none" />

          <div className="relative z-10">
            <Logo size="md" href="/" />

            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Universal Workspace Engine
            </div>
          </div>

          <div className="relative z-10 my-auto py-8">
            <blockquote className="text-2xl font-extrabold leading-tight mb-6 text-on-surface tracking-tight font-headline-lg">
              &ldquo;One Workspace.<br />
              <span className="text-gradient-animated">Every Project.</span><br />
              Complete Control.&rdquo;
            </blockquote>
            <p className="text-xs sm:text-sm text-on-surface-variant mb-8 leading-relaxed font-body-sm">
              Manage unlimited workspaces, coordinate high-velocity Kanban sprints, and collaborate with enterprise-grade Supabase RLS.
            </p>

            {/* Animated Feature highlights */}
            <div className="space-y-3.5">
              {[
                { icon: "view_kanban", text: "Interactive Kanban, List & Calendar views", color: "var(--color-primary)" },
                { icon: "bolt", text: "Instant cloud sync via Supabase PostgreSQL", color: "var(--color-secondary)" },
                { icon: "shield_lock", text: "Universal Row Level Security per member", color: "var(--color-tertiary)" },
                { icon: "analytics", text: "Real-time velocity graphs & task ticking", color: "var(--color-primary-fixed-dim)" },
              ].map(({ icon, text, color }, idx) => (
                <div
                  key={text}
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 hover:bg-white/[0.04] border border-transparent hover:border-white/5"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{
                      background: `color-mix(in srgb, ${color} 18%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
                    }}
                  >
                    <span className="material-symbols-outlined text-lg" style={{ color }}>{icon}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-on-surface-variant">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-outline pt-6 border-t border-white/5">
            <span>© 2026 Wasif&apos;s Workspace</span>
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Right panel — form container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 relative">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
