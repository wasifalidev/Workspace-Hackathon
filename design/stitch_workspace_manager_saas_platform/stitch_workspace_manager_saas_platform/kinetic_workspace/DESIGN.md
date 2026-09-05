---
name: Kinetic Workspace
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#dfe2ee'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dfe2ee'
  inverse-on-surface: '#2c3039'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0f131c'
  on-background: '#dfe2ee'
  surface-variant: '#31353e'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  code-metric:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  layout-sidebar-collapsed: 4rem
  layout-sidebar-expanded: 16rem
  layout-header-height: 3.25rem
  gutter-compact: 0.75rem
  gutter-default: 1rem
---

## Brand & Style

This design system targets high-output engineering, product, and operations teams who spend 6–10 hours a day inside dense project environments. The interface prioritizes deep focus, high signal-to-noise ratio, and tactile micro-interactions that feel instantaneous and exact.

The aesthetic blends **Modern Corporate** precision with **Technical Minimalism**:
- **Clarity over ornament:** Decoration is stripped away in favor of strict spacing, crisp hairline borders, and clear spatial hierarchy.
- **Instrumental tactile feedback:** Active controls, interactive table rows, and drag handles offer immediate, subtle visual feedback without visual clutter.
- **Restrained color balance:** 95% of the viewport is composed of slate and zinc structural neutrals. Vivid chromatic accents are strictly reserved for state changes, workflow statuses, priority signals, and direct primary calls to action.

## Colors

The system uses an intentional dark-first baseline built around deep slate anchors, complemented by a crisp light-mode counterpart.

### Surface Architecture
- **Dark Canvas Default (`#0B0F17`):** Deep, non-pure-black baseline preventing eye fatigue.
- **Dark Elevated Surfaces:** Layered panel tiers (`#111827`, `#1E293B`) create spatial depth through soft contrast steps.
- **Light Surfaces:** `#F8FAFC` foundation with stark pure `#FFFFFF` cards and floating popovers.
- **Structural Borders:** Hairline dividers using `#1E293B` (dark) and `#E2E8F0` (light) maintain component isolation without heavy visual mass.

### Functional Accents
- **Primary Accent (`#6366F1` / `#4F46E5`):** Reserved for primary interactive elements, active selection rings, and core navigation indicators.
- **Success / Done (`#10B981`):** Applied to resolved states, closed milestones, and positive metrics.
- **Warning / In Progress (`#F59E0B`):** Applied to active sprints, mid-flight tickets, and non-blocking dependencies.
- **Critical / Urgent (`#EF4444`):** Restricted to blockers, overdue deadlines, and urgent priority badges.

## Typography

Typography prioritizes density, optical balance, and scannability across massive datasets.

- **Primary Typeface (`Inter`):** Selected for its tall x-height, neutral geometric construction, and legibility at 12px–14px sizes.
- **Monospace Engine (`JetBrains Mono`):** Dedicated exclusively to ticket IDs (e.g., `ENG-1048`), cycle metrics, estimate points, and keyboard shortcuts.
- **Tabular Numerics:** Enable `font-feature-settings: "tnum" 1, "cv05" 1, "cv11" 1` across all tables, kanban counters, and metadata lists to avoid horizontal jitter during inline data updates.

## Layout & Spacing

The layout is built on a 4px base unit with a flexible multi-pane operational canvas.

### Layout Hierarchy
- **App Shell:** A collapsible primary navigation rail (64px collapsed, 256px expanded) anchored to the left, a fixed 52px global command header at the top, and an infinitely scrollable workspace pane.
- **Workspace Canvas:** Uses fluid width container models that scale seamlessly across dense multi-column board views, data grids, and split-pane detail drawers.
- **Detail Pane:** Slides in from the right edge at a fixed 580px width on desktop (or occupies full width below 1024px screen boundaries), sitting over the active grid without unmounting contextual state.

### Breakpoint Matrix
- **Desktop (≥ 1280px):** Full multi-column views (up to 6 Kanban lanes visible), split-pane active issue inspection, and sticky table headers.
- **Tablet (768px – 1279px):** Sidebar auto-collapses to icon rail (64px). Kanban switches to horizontal scroll-snap lanes. Detail panes switch from inline sidebars to layered sheets.
- **Mobile (< 768px):** Single-column focus mode. Board columns become segmented tab-controlled views. Primary bottom navigation replaces the lateral rail.

## Elevation & Depth

Visual hierarchy uses precise border contrasts and dark ambient diffusion instead of high-opacity drop shadows.

- **Level 0 (Canvas Base):** Dark `#0B0F17` / Light `#F8FAFC`. Zero elevation, structural divider borders only.
- **Level 1 (Card & Board Columns):** Dark `#111827` surface with a 1px border of `#1E293B`. Shadow: `0 1px 2px 0 rgba(0, 0, 0, 0.25)`.
- **Level 2 (Dropdowns, Menus & Tooltips):** Dark `#1A2234` surface with a 1px border of `#334155`. Shadow: `0 4px 12px -2px rgba(0, 0, 0, 0.45), 0 2px 4px -1px rgba(0, 0, 0, 0.3)`.
- **Level 3 (Modals & Command Palettes):** Dark `#0F172A` with an active highlight top-border `rgba(255, 255, 255, 0.08)`. Shadow: `0 24px 48px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.06)`. Backing backdrop blur: `backdrop-filter: blur(8px); background-color: rgba(3, 7, 18, 0.7)`.

## Shapes

The design system maintains a tight, compact shape vocabulary (`roundedness: 1`):
- **Micro controls (Badges, Chips, Indicators):** 4px (`rounded-sm`).
- **Standard UI (Inputs, Buttons, Cards, Cells):** 6px to 8px (`rounded` to `rounded-md`).
- **Containers & Overlays (Modals, Slide-over panels):** 8px to 10px (`rounded-lg`).
- **Avatars & Floating Action Dots:** Pure round (`rounded-full`).

## Components

### Buttons
- **Primary:** Background `#4F46E5`, hover `#6366F1`, text white, subtle top-edge inner highlight `inset 0 1px 0 rgba(255, 255, 255, 0.15)`. Height 32px (compact) or 36px (standard).
- **Secondary / Ghost:** Transparent background, text `#94A3B8`, hover background `#1E293B` (dark) or `#F1F5F9` (light), hover text `#FFFFFF`.
- **Destructive:** Background `rgba(239, 68, 68, 0.12)`, text `#EF4444`, border `1px solid rgba(239, 68, 68, 0.25)`, hover background `rgba(239, 68, 68, 0.2)`.

### Status & Priority Badges
Rendered at 20px height with 11px semi-bold text, containing a 6px status circle:
- **Urgent / Blocked:** Red fill `rgba(239, 68, 68, 0.12)`, text `#FCA5A5`, border `rgba(239, 68, 68, 0.25)`.
- **In Progress / Review:** Amber fill `rgba(245, 158, 11, 0.12)`, text `#FCD34D`, border `rgba(245, 158, 11, 0.25)`.
- **Done / Closed:** Emerald fill `rgba(16, 185, 129, 0.12)`, text `#6EE7B7`, border `rgba(16, 185, 129, 0.25)`.
- **Backlog / Todo:** Slate fill `rgba(148, 163, 184, 0.12)`, text `#94A3B8`, border `rgba(148, 163, 184, 0.2)`.

### Input Fields & Selects
- Height 32px for compact filters, 36px for edit forms.
- Dark canvas background `#0B0F17`, resting border `1px solid #1E293B`, placeholder `#64748B`.
- Focus state triggers a 1px border of `#6366F1` with an outer ring glow: `box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18)`.

### Interactive Cards & Board Tiles
- Resting background `#111827`, border `1px solid #1E293B`, border-radius 8px.
- Hover state: Border color lightens to `#334155`, surface subtly brightens to `#162032`, cursor shifts to grab.
- Active Drag: Surface lifts to Level 3 elevation with a 2-degree tilt and indigo glow border.

### Command Palette (Omni-search)
- Centered modal layout at 640px max width.
- Integrated search input with no visible outer border, featuring dynamic keyboard shortcut chips (`⌘K`, `Esc`) right-aligned in `JetBrains Mono`.