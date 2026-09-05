'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"; 
import Globe from "@/components/ui/globe";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { AppIcon } from "@/components/ui/AppIcon";
import { useTheme } from "@/components/providers/ThemeProvider";

// Reusable ScrollGlobe component following shadcn/ui patterns
export interface ScrollGlobeProps {
  sections: {
    id: string;
    badge?: string;
    title: string;
    subtitle?: string;
    description: string;
    align?: 'left' | 'center' | 'right';
    features?: { title: string; description: string }[];
    actions?: { label: string; variant: 'primary' | 'secondary'; href?: string; onClick?: () => void }[];
  }[];
  globeConfig?: {
    positions: {
      top: string;
      left: string;
      scale: number;
    }[];
  };
  className?: string;
}

const defaultGlobeConfig = {
  positions: [
    { top: "50%", left: "75%", scale: 1.4 },  // Hero: Right side, balanced
    { top: "25%", left: "50%", scale: 0.9 },  // Innovation: Top side, subtle
    { top: "15%", left: "90%", scale: 2 },  // Discovery: Left side, medium
    { top: "50%", left: "50%", scale: 1.8 },  // Future: Center, large backdrop
  ]
};

// Parse percentage string to number
const parsePercent = (str: string): number => parseFloat(str.replace('%', ''));

export function ScrollGlobe({ sections, globeConfig = defaultGlobeConfig, className }: ScrollGlobeProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [globeTransform, setGlobeTransform] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const animationFrameId = useRef<number | null>(null);
  
  // Pre-calculate positions for performance
  const calculatedPositions = useMemo(() => {
    return globeConfig.positions.map(pos => ({
      top: parsePercent(pos.top),
      left: parsePercent(pos.left),
      scale: pos.scale
    }));
  }, [globeConfig.positions]);

  // Simple, direct scroll tracking
  const updateScrollPosition = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(Math.max(scrollTop / (docHeight || 1), 0), 1);
    
    setScrollProgress(progress);

    // Simple section detection
    const viewportCenter = window.innerHeight / 2;
    let newActiveSection = 0;
    let minDistance = Infinity;

    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          newActiveSection = index;
        }
      }
    });

    // Direct position update
    const currentPos = calculatedPositions[newActiveSection] || calculatedPositions[0];
    const transform = `translate3d(${currentPos.left}vw, ${currentPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${currentPos.scale}, ${currentPos.scale}, 1)`;
    
    setGlobeTransform(transform);
    setActiveSection(newActiveSection);
  }, [calculatedPositions]);

  // Throttled scroll handler with RAF
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        animationFrameId.current = requestAnimationFrame(() => {
          updateScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollPosition();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [updateScrollPosition]);

  // Initial globe position
  useEffect(() => {
    const initialPos = calculatedPositions[0];
    const initialTransform = `translate3d(${initialPos.left}vw, ${initialPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${initialPos.scale}, ${initialPos.scale}, 1)`;
    setGlobeTransform(initialTransform);
  }, [calculatedPositions]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full max-w-screen overflow-x-hidden min-h-screen bg-background text-foreground",
        className
      )}
    >
      {/* Top Floating Glass Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-outline-variant bg-surface-container-lowest/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <Logo size="sm" href="/" />

        <div className="flex items-center gap-3">
          {/* Quick Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer flex items-center justify-center"
            title={`Current: ${theme}. Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle light/dark mode"
          >
            <span className="material-symbols-outlined text-lg">
              {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-lg text-on-surface hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed-dim transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Get Started Free</span>
            <AppIcon name="rocket" size={14} />
          </Link>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="fixed top-16 left-0 w-full h-0.5 bg-gradient-to-r from-border/20 via-border/40 to-border/20 z-50">
        <div 
          className="h-full bg-gradient-to-r from-primary via-emerald-400 to-indigo-500 will-change-transform shadow-sm"
          style={{ 
            transform: `scaleX(${scrollProgress})`,
            transformOrigin: 'left center',
            transition: 'transform 0.15s ease-out',
            filter: 'drop-shadow(0 0 4px rgba(128, 131, 255, 0.5))'
          }}
        />
      </div>

      {/* Enhanced Navigation with Section Badges */}
      <div className="hidden sm:flex fixed right-3 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-40">
        <div className="space-y-4 lg:space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="relative group">
              {/* Auto-hiding section label */}
              <div
                className={cn(
                  "nav-label absolute right-6 sm:right-8 lg:right-10 top-1/2 -translate-y-1/2 pointer-events-none",
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap",
                  "bg-surface-container-high/95 backdrop-blur-md border border-outline-variant shadow-2xl z-50 text-on-surface",
                  activeSection === index ? "opacity-100 scale-100 transition-all duration-300" : "opacity-0 scale-95 transition-all duration-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span>
                    {section.badge || `Section ${index + 1}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  sectionRefs.current[index]?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                  });
                }}
                className={cn(
                  "relative w-3 h-3 rounded-full border-2 transition-all duration-300 hover:scale-125 cursor-pointer",
                  activeSection === index 
                    ? "bg-primary border-primary shadow-lg shadow-primary/50 scale-125" 
                    : "bg-surface-container border-outline/50 hover:border-primary/80"
                )}
                aria-label={`Go to ${section.badge || `section ${index + 1}`}`}
              />
            </div>
          ))}
        </div>
        
        {/* Navigation line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent -translate-x-1/2 -z-10" />
      </div>

      {/* Ultra-smooth Globe with responsive scaling */}
      <div
        className="fixed z-10 pointer-events-none will-change-transform transition-all duration-[1400ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          transform: globeTransform,
          filter: `opacity(${activeSection === 3 ? 0.35 : 0.88})`,
        }}
      >
        <div className="scale-75 sm:scale-90 lg:scale-110">
          <Globe />
        </div>
      </div>

      {/* Dynamic sections */}
      {sections.map((section, index) => (
        <section
          key={section.id}
          ref={(el) => { sectionRefs.current[index] = el }}
          className={cn(
            "relative min-h-screen flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-24 z-20 py-24",
            "w-full max-w-full overflow-hidden",
            section.align === 'center' && "items-center text-center",
            section.align === 'right' && "items-end text-right",
            section.align !== 'center' && section.align !== 'right' && "items-start text-left"
          )}
        >
          <div className={cn(
            "w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl will-change-transform transition-all duration-700",
            "opacity-100 translate-y-0"
          )}>
            
            {section.badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span>{section.badge}</span>
              </div>
            )}

            <h1 className={cn(
              "font-extrabold mb-6 leading-[1.08] tracking-tight font-headline-xl",
              index === 0 
                ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl" 
                : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
            )}>
              {section.subtitle ? (
                <div className="space-y-1 sm:space-y-2">
                  <div className="bg-gradient-to-r from-on-surface via-on-surface to-on-surface/80 bg-clip-text text-transparent">
                    {section.title}
                  </div>
                  <div className="text-gradient-animated text-[0.65em] font-bold tracking-normal">
                    {section.subtitle}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-on-surface via-on-surface to-on-surface/80 bg-clip-text text-transparent">
                  {section.title}
                </div>
              )}
            </h1>
            
            <div className={cn(
              "text-on-surface-variant leading-relaxed mb-8 text-sm sm:text-base lg:text-lg font-light font-body-lg",
              section.align === 'center' ? "max-w-2xl mx-auto text-center" : "max-w-2xl"
            )}>
              <p className="mb-3 sm:mb-4">{section.description}</p>
              {index === 0 && (
                <div className="flex flex-wrap items-center gap-4 text-xs text-outline mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    <span>Real-time Supabase Engine</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <span>Scroll to explore the universe</span>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Features Grid */}
            {section.features && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8">
                {section.features.map((feature, featureIndex) => (
                  <div 
                    key={feature.title}
                    className={cn(
                      "group p-4 sm:p-5 rounded-xl border bg-surface-container-low/70 backdrop-blur-md hover:bg-surface-container transition-all duration-300 hover:shadow-xl hover:shadow-primary/5",
                      "border-outline-variant hover:border-primary/40 hover:-translate-y-1"
                    )}
                    style={{ animationDelay: `${featureIndex * 0.1}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 group-hover:scale-125 transition-transform flex-shrink-0" />
                      <div className="flex-1 space-y-1 min-w-0">
                        <h3 className="font-bold text-on-surface text-sm sm:text-base">{feature.title}</h3>
                        <p className="text-on-surface-variant leading-relaxed text-xs sm:text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {section.actions && (
              <div className={cn(
                "flex flex-col sm:flex-row flex-wrap gap-3.5",
                section.align === 'center' && "justify-center",
                section.align === 'right' && "justify-end",
                (!section.align || section.align === 'left') && "justify-start"
              )}>
                {section.actions.map((action, actionIndex) => {
                  const buttonContent = (
                    <span className="flex items-center justify-center gap-2">
                      <span className="relative z-10">{action.label}</span>
                      {action.variant === 'primary' ? (
                        <AppIcon name="rocket" size={16} />
                      ) : (
                        <AppIcon name="bolt" size={16} />
                      )}
                    </span>
                  );

                  if (action.href) {
                    return (
                      <Link
                        key={action.label}
                        href={action.href}
                        className={cn(
                          "group relative px-6 sm:px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base text-center cursor-pointer",
                          action.variant === 'primary' 
                            ? "bg-primary text-on-primary hover:bg-primary-fixed-dim shadow-xl shadow-primary/25 hover:shadow-primary/40" 
                            : "border border-outline-variant bg-surface-container/60 backdrop-blur-md hover:bg-surface-container-high text-on-surface hover:border-primary/40"
                        )}
                        style={{ animationDelay: `${actionIndex * 0.1 + 0.2}s` }}
                      >
                        {buttonContent}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className={cn(
                        "group relative px-6 sm:px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base cursor-pointer",
                        action.variant === 'primary' 
                          ? "bg-primary text-on-primary hover:bg-primary-fixed-dim shadow-xl shadow-primary/25 hover:shadow-primary/40" 
                          : "border border-outline-variant bg-surface-container/60 backdrop-blur-md hover:bg-surface-container-high text-on-surface hover:border-primary/40"
                      )}
                      style={{ animationDelay: `${actionIndex * 0.1 + 0.2}s` }}
                    >
                      {buttonContent}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Footer */}
      <footer className="relative z-20 border-t border-outline-variant bg-surface-container-lowest backdrop-blur-xl py-10 px-6 text-center text-xs text-outline space-y-2">
        <div className="flex items-center justify-center gap-2 text-on-surface font-semibold text-sm">
          <span>Wasif&apos;s Workspace</span>
          <span>&bull;</span>
          <span className="text-secondary font-mono">Supabase Cloud Engine</span>
        </div>
        <p>© 2026 Wasif&apos;s Workspace. All rights reserved. Enterprise-grade Row Level Security.</p>
      </footer>
    </div>
  );
}

// Default export demo tailored for Wasif's Workspace
export default function GlobeScrollDemo() {
  const demoSections = [
    {
      id: "hero",
      badge: "Welcome to Wasif's Workspace",
      title: "One Workspace.",
      subtitle: "Every Project. Complete Control.",
      description: "Step into an immersive executive command center built for engineering velocity, sprint execution, and full Supabase cloud agility. Watch perspectives shift with real-time reactive boards and multi-workspace intelligence.",
      align: "left" as const,
      actions: [
        { label: "Begin Journey Free", variant: "primary" as const, href: "/register" },
        { label: "Sign In to Workspace", variant: "secondary" as const, href: "/login" },
      ]
    },
    {
      id: "innovation",
      badge: "Global Scalability",
      title: "Universal Multi-Workspace Agility",
      description: "Create unlimited independent workspaces, seamlessly switch between high-stakes projects, and coordinate cross-functional teams with rock-solid Row Level Security.",
      align: "center" as const,
      actions: [
        { label: "Explore Dashboard", variant: "primary" as const, href: "/dashboard" },
      ]
    },
    {
      id: "discovery",
      badge: "Sprint Velocity",
      title: "Interactive",
      subtitle: "Kanban & Task Hub",
      description: "From drag-and-drop Kanban columns to instant 1-click task ticking, every detail is engineered to keep your team at maximum momentum without friction.",
      align: "left" as const,
      features: [
        { title: "Dynamic Task CRUD", description: "Create, edit, tick, and delete tasks instantly with real-time feedback." },
        { title: "Universal RLS", description: "Zero role roadblocks — every member collaborates with full permissions." },
        { title: "Vector SVG Engine", description: "Pixel-perfect, crisp vector icons throughout the entire platform." }
      ],
      actions: [
        { label: "Launch Your Sprint", variant: "primary" as const, href: "/register" }
      ]
    },
    {
      id: "future",
      badge: "Production Ready",
      title: "Your Command Center",
      subtitle: "Starts Today",
      description: "Join modern creators and engineering squads building the future with Wasif's Workspace. Complete control, zero hardcoding, and live cloud sync.",
      align: "center" as const,
      actions: [
        { label: "Create Your Account", variant: "primary" as const, href: "/register" },
        { label: "Access Live App", variant: "secondary" as const, href: "/login" }
      ]
    }
  ];

  return (
    <ScrollGlobe 
      sections={demoSections}
      className="bg-gradient-to-br from-background via-surface-container-lowest to-background"
    />
  );
}
