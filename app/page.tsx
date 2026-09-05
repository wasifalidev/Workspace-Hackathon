import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-background)", color: "var(--color-on-surface)" }}>
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{ background: "rgba(10,14,22,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--color-outline-variant)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>W</div>
          <span className="font-semibold text-base tracking-tight" style={{ color: "var(--color-on-surface)" }}>Workspace Manager</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost px-4 py-2 text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Sign In</Link>
          <Link href="/register" className="btn-primary px-4 py-2 text-sm font-semibold rounded-lg">Get Started Free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "rgba(192,193,255,0.1)", color: "var(--color-primary)", border: "1px solid rgba(192,193,255,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: "var(--color-secondary)" }}></span>
          Now with Supabase Realtime — Live collaboration
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl leading-none mb-6"
          style={{ color: "var(--color-on-surface)", letterSpacing: "-0.03em" }}>
          One Workspace.<br />
          <span style={{ color: "var(--color-primary)" }}>Every Project.</span><br />
          Complete Control.
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
          The professional project-management platform built for high-output engineering, product, and operations teams.
          Kanban, List, Calendar — all synced in real-time.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/register"
            className="btn-primary px-8 py-3.5 text-base font-semibold rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">rocket_launch</span>
            Start for Free
          </Link>
          <Link href="/login"
            className="btn-ghost px-8 py-3.5 text-base font-medium rounded-xl flex items-center gap-2"
            style={{ border: "1px solid var(--color-outline-variant)" }}>
            <span className="material-symbols-outlined text-xl">play_circle</span>
            Sign In
          </Link>
        </div>
        <p className="mt-4 text-xs" style={{ color: "var(--color-outline)" }}>No credit card required · Free forever plan available</p>

        {/* App Preview */}
        <div className="mt-16 w-full max-w-6xl rounded-2xl overflow-hidden relative"
          style={{ background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)", boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8)" }}>
          {/* Fake browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: "var(--color-surface-container-lowest)", borderBottom: "1px solid var(--color-outline-variant)" }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: "#F59E0B" }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: "#10B981" }}></div>
            </div>
            <div className="flex-1 mx-4 h-6 rounded flex items-center px-3 text-xs"
              style={{ background: "var(--color-surface-container)", color: "var(--color-outline)" }}>
              app.workspacemanager.io/dashboard
            </div>
          </div>
          {/* Mini Dashboard Preview */}
          <div className="flex" style={{ minHeight: "400px" }}>
            {/* Sidebar */}
            <div className="w-56 flex-shrink-0 p-3 flex flex-col gap-2" style={{ background: "var(--color-surface-container-low)", borderRight: "1px solid var(--color-outline-variant)" }}>
              <div className="flex items-center gap-2 px-2 py-2 rounded-lg" style={{ background: "var(--color-surface-container)" }}>
                <div className="w-5 h-5 rounded" style={{ background: "var(--color-primary)", opacity: 0.3 }}></div>
                <div className="h-3 rounded flex-1" style={{ background: "var(--color-surface-container-highest)" }}></div>
              </div>
              {["Dashboard", "My Tasks", "Notifications"].map((item, i) => (
                <div key={item} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: i === 0 ? "var(--color-surface-container-high)" : "transparent" }}>
                  <div className="w-4 h-4 rounded" style={{ background: "var(--color-outline-variant)" }}></div>
                  <div className="h-2.5 rounded" style={{ background: "var(--color-surface-container-highest)", width: `${60 + i * 10}%` }}></div>
                </div>
              ))}
              <div className="mt-2 px-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-outline)" }}>Projects</div>
              {[["var(--color-primary)", "80%"], ["var(--color-secondary)", "70%"], ["var(--color-tertiary)", "60%"]].map(([color, w], i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                  <div className="w-4 h-4 rounded-full" style={{ background: color as string, opacity: 0.7 }}></div>
                  <div className="h-2.5 rounded" style={{ background: "var(--color-surface-container-highest)", width: w as string }}></div>
                </div>
              ))}
            </div>
            {/* Main content */}
            <div className="flex-1 p-5">
              {/* KPI cards */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[["14", "Total Projects", "var(--color-primary)"], ["86", "Active Tasks", "var(--color-primary-fixed-dim)"], ["142", "Completed", "var(--color-secondary)"], ["4", "Overdue", "var(--color-error)"]].map(([num, label, color]) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)" }}>
                    <div className="text-xs mb-1" style={{ color: "var(--color-on-surface-variant)" }}>{label}</div>
                    <div className="text-2xl font-bold" style={{ color: color as string }}>{num}</div>
                  </div>
                ))}
              </div>
              {/* Kanban preview */}
              <div className="grid grid-cols-3 gap-3">
                {[["Backlog", "var(--color-outline)", 2], ["In Progress", "var(--color-primary)", 3], ["Done", "var(--color-secondary)", 2]].map(([title, color, count]) => (
                  <div key={title as string} className="rounded-xl p-3" style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline-variant)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: color as string }}></div>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>{title} ({count})</span>
                    </div>
                    {Array.from({ length: count as number }).map((_, i) => (
                      <div key={i} className="mb-2 rounded-lg p-2.5" style={{ background: "var(--color-surface-container-high)", border: "1px solid var(--color-outline-variant)" }}>
                        <div className="h-2.5 rounded mb-2" style={{ background: "var(--color-surface-container-highest)", width: `${70 + i * 15}%` }}></div>
                        <div className="h-2 rounded" style={{ background: "var(--color-surface-container-highest)", width: "45%" }}></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>CAPABILITIES</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: "var(--color-on-surface-variant)" }}>
              Built for engineering and product teams who demand power, speed, and precision.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "view_kanban", color: "var(--color-primary)", title: "Kanban Board", desc: "Drag-and-drop task management with real-time sync. Customizable columns, WIP limits, and sprint tracking." },
              { icon: "format_list_bulleted", color: "var(--color-secondary)", title: "List View", desc: "Sortable, filterable data table with inline editing, bulk actions, and multi-dimensional grouping." },
              { icon: "calendar_month", color: "var(--color-tertiary)", title: "Calendar View", desc: "Visual deadline overview. Drag tasks to reschedule. Month and week perspectives." },
              { icon: "group", color: "var(--color-primary-fixed-dim)", title: "Team Collaboration", desc: "Real-time presence indicators, @mentions in comments, activity feeds, and role-based permissions." },
              { icon: "shield", color: "var(--color-secondary)", title: "Enterprise Security", desc: "Row Level Security, workspace isolation, role-based access control (Owner/Admin/Member/Viewer)." },
              { icon: "analytics", color: "var(--color-tertiary)", title: "Analytics Dashboard", desc: "KPI cards, velocity tracking, sprint burn-down, priority distribution, and overdue monitoring." },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} className="rounded-xl p-6 group hover:scale-[1.01] transition-transform"
                style={{ background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                  <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: "var(--color-on-surface)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow section ── */}
      <section id="workflow" className="px-6 md:px-12 py-20 md:py-28" style={{ background: "var(--color-surface-container-lowest)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-secondary)" }}>HIERARCHY</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
              Organized at every level
            </h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {[
              { icon: "corporate_fare", label: "Workspace", desc: "Your organization", color: "var(--color-primary)" },
              { icon: "account_tree", label: "Projects", desc: "Focus areas", color: "var(--color-primary-fixed-dim)" },
              { icon: "task_alt", label: "Tasks", desc: "Units of work", color: "var(--color-secondary)" },
              { icon: "checklist", label: "Subtasks", desc: "Granular steps", color: "var(--color-tertiary)" },
            ].map(({ icon, label, desc, color }, i) => (
              <div key={label} className="flex items-center gap-4">
                <div className="rounded-2xl p-5 text-center w-36" style={{ background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)" }}>
                  <span className="material-symbols-outlined text-3xl mb-2 block" style={{ color }}>{icon}</span>
                  <div className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>{desc}</div>
                </div>
                {i < 3 && <span className="material-symbols-outlined text-2xl hidden md:block" style={{ color: "var(--color-outline)" }}>arrow_forward</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security section ── */}
      <section id="security" className="px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-tertiary)" }}>SECURITY</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" style={{ color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
              Enterprise-grade<br />data protection
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--color-on-surface-variant)" }}>
              Built on Supabase with PostgreSQL Row Level Security. Every query is enforced at the database layer — no client-side trust.
            </p>
            <div className="space-y-4">
              {[
                ["shield", "Row Level Security", "Database-enforced isolation — users only access their workspace data"],
                ["lock", "Supabase Auth", "Secure session management, OAuth, and email authentication"],
                ["groups", "Role-Based Access", "Owner, Admin, Member, and Viewer roles with granular permissions"],
                ["verified_user", "Audit Trail", "Complete activity log for all workspace events"],
              ].map(([icon, title, desc]) => (
                <div key={title as string} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(78,222,163,0.12)", border: "1px solid rgba(78,222,163,0.2)" }}>
                    <span className="material-symbols-outlined text-lg" style={{ color: "var(--color-secondary)" }}>{icon}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--color-on-surface)" }}>{title}</div>
                    <div className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-6" style={{ background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)" }}>
            <div className="flex items-center gap-2 mb-4 text-xs font-mono" style={{ color: "var(--color-on-surface-variant)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-secondary)" }}></span>
              RLS Policy Example
            </div>
            <pre className="text-xs leading-relaxed overflow-x-auto" style={{ color: "var(--color-on-surface-variant)", fontFamily: "var(--font-mono)" }}>
{`-- Users can ONLY access workspaces
-- they are members of
create policy "workspace_access"
  on workspaces for select
  to authenticated
  using (
    exists (
      select 1 from workspace_members
      where workspace_id = id
        and user_id = auth.uid()
    )
  );`}
            </pre>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-12 py-20 md:py-28" style={{ background: "var(--color-surface-container-lowest)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6" style={{ color: "var(--color-on-surface)", letterSpacing: "-0.025em" }}>
            Ready to take control of<br />your workspace?
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--color-on-surface-variant)" }}>
            Set up in minutes. Add your Supabase credentials, run the SQL, and you have a production-ready project management platform.
          </p>
          <Link href="/register"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl">
            <span className="material-symbols-outlined text-xl">rocket_launch</span>
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 md:px-12 py-10" style={{ background: "var(--color-surface-container-lowest)", borderTop: "1px solid var(--color-outline-variant)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>W</div>
            <span className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>Workspace Manager</span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Get Started</Link>
            <a href="https://github.com/wasifalidev/Workspace-Hackathon" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="text-xs" style={{ color: "var(--color-outline)" }}>
            © 2026 Workspace Manager. Built with Next.js & Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
}
