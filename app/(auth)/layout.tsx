import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-background)" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-10"
        style={{ background: "var(--color-surface-container-lowest)", borderRight: "1px solid var(--color-outline-variant)" }}>
        <Logo size="md" href="/" />

        <div>
          <blockquote className="text-xl font-semibold leading-relaxed mb-6" style={{ color: "var(--color-on-surface)", letterSpacing: "-0.015em" }}>
            &ldquo;One Workspace. Every Project.<br />Complete Control.&rdquo;
          </blockquote>
          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              ["view_kanban", "Kanban, List, and Calendar views", "var(--color-primary)"],
              ["bolt", "Real-time collaboration with Supabase", "var(--color-secondary)"],
              ["shield", "Enterprise-grade Row Level Security", "var(--color-tertiary)"],
              ["analytics", "Executive dashboard with live metrics", "var(--color-primary-fixed-dim)"],
            ].map(([icon, text, color]) => (
              <div key={text as string} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)` }}>
                  <span className="material-symbols-outlined text-base" style={{ color: color as string }}>{icon}</span>
                </div>
                <span className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "var(--color-outline)" }}>© 2026 Wasif&apos;s Workspace</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
