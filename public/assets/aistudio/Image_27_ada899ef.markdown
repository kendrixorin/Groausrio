---
name: Construct Technical Blueprint
colors:
  surface: '#fbf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#5a4137'
  inverse-surface: '#30312d'
  inverse-on-surface: '#f3f0eb'
  outline: '#8e7165'
  outline-variant: '#e2bfb2'
  surface-tint: '#a43e00'
  primary: '#a43e00'
  on-primary: '#ffffff'
  primary-container: '#ff6b1a'
  on-primary-container: '#591e00'
  inverse-primary: '#ffb596'
  secondary: '#5b5e66'
  on-secondary: '#ffffff'
  secondary-container: '#dfe2ec'
  on-secondary-container: '#61646c'
  tertiary: '#575f69'
  on-tertiary: '#ffffff'
  tertiary-container: '#929aa4'
  on-tertiary-container: '#2a323b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb596'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7d2d00'
  secondary-fixed: '#dfe2ec'
  secondary-fixed-dim: '#c3c6cf'
  on-secondary-fixed: '#181c22'
  on-secondary-fixed-variant: '#43474e'
  tertiary-fixed: '#dbe3ee'
  tertiary-fixed-dim: '#bfc7d2'
  on-tertiary-fixed: '#141c24'
  on-tertiary-fixed-variant: '#404850'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a high-precision, utilitarian aesthetic tailored for civil engineers, site managers, and commercial general contractors. It bridges architectural drafting culture with rigorous digital project tracking.

- **Personality:** Authoritative, industrial, pragmatic, and metric-driven.
- **Visual Movement:** Technical Neo-Brutalism paired with Architectural Drafting. The aesthetic avoids soft blurs and decorative gradients in favor of structural 2px borders, visible grid alignment, high tactile feedback, and crisp functional delineations.
- **Atmosphere:** Evokes field-ready physical clipboards, structural blueprints, and heavy industrial instrumentation.

## Colors

The palette is derived directly from industrial job sites and blueprint drafting linen:

- **Canvas Background (`#E7E5E0`):** Cast concrete tone serving as the foundational surface layer, underlaid with faint steel grid lines.
- **Safety Orange (`#FF6B1A`):** High-visibility hazard accent reserved strictly for active operations, primary actions, critical alerts, and real-time timeline metrics. **Crucial Rule:** Safety Orange fills must pair with Slate (`#2B2F36`) typography/iconography for optimal daytime contrast and legibility; never use white text on orange.
- **Structural Slate (`#2B2F36`):** The primary structural pigment. Defines high-contrast headings, 2px structural contours, hard offset drop shadows, and dark container fills.
- **Steel Gray (`#7A828C`):** Subordinate technical tone for dimension lines, inactive states, column gutters, and specification annotations.
- **Technical White (`#FFFFFF`):** Base fill for high-legibility cards, inspection forms, and data grids.

## Typography

Typography prioritizes tabular clarity and structural rigor:

- **Headings (Space Grotesk):** Set in bold weights, tight tracking, and uppercase for section markers, zone identifiers, and module crowns.
- **Data & Telemetry (JetBrains Mono):** Monospaced numerals for drawing revision IDs, coordinate points, dimension calculations, timestamps, and currency values. Prevents visual jitter across updating metrics.
- **Body & Captions (Space Grotesk):** High-readability technical sans-serif for inspection notes, logs, and user guidance.

## Layout & Spacing

The layout is anchored on a rigid 8px baseline rhythm across an intentional 12-column architectural grid:

- **Grid Model:** Fluid multi-column with fixed maximum container limits. On large screens (1280px+), maintain a 12-column grid with 24px gutters. Tablets (768px-1279px) compress into 6-column configurations, and mobile views (<768px) resolve into a unified single-column vertical flow with 16px margins.
- **Architectural Background:** The base viewport renders a drafting pattern using `#7A828C` at 12% opacity (24px x 24px grid squares) layered on top of the Concrete `#E7E5E0` canvas.
- **Component Flow:** Interfaces are broken into distinct structural modules separated by clear gaps (`space-lg`), eliminating overlapping floats.

## Elevation & Depth

Visual hierarchy does not use diffuse, blurry, or ambient drop shadows. Instead, depth is conveyed through hard-edge tactile offsets and mechanical layering:

- **Structural Outlines:** All interactive nodes, status panels, and data surfaces feature a mandatory `2px solid #2B2F36` border.
- **Hard Offsets:** Resting state elevation is achieved via directional offset shadows: `box-shadow: 2px 2px 0px #2B2F36`. Floating overlays and modal viewports double this offset to `4px 4px 0px #2B2F36`.
- **Mechanical Depress State:** When pressed or engaged, interactive elements shift physically: `translate(2px, 2px)` with shadow collapsing to `0px 0px 0px #2B2F36`.

## Shapes

The shape system enforces an exact, industrial geometry:

- **Radius Limit:** All buttons, cards, tags, and inputs carry a strictly uniform 4px corner radius (`rounded-[4px]`). Large containers do not exceed this radius.
- **Corners:** No fully rounded pill shapes are permitted, keeping components looking calibrated, stamped, and machined.

## Components

### Buttons
- **Primary CTA:** Background `#FF6B1A`, text `#2B2F36` (Space Grotesk, Bold, Uppercase), border `2px solid #2B2F36`, shadow `2px 2px 0px #2B2F36`. On active press: `translate(2px, 2px)` and shadow dissolves completely.
- **Secondary Utility:** Background `#FFFFFF`, text `#2B2F36`, border `2px solid #2B2F36`, shadow `2px 2px 0px #2B2F36`.
- **Destructive/Critical:** Background `#2B2F36`, text `#FF6B1A`, border `2px solid #2B2F36`.

### Cards & Blueprint Data Tiles
- Background `#FFFFFF`, border `2px solid #2B2F36`, shadow `2px 2px 0px #2B2F36`.
- Card headers feature an architectural sub-bar with a bottom border `2px solid #2B2F36`, displaying the module title in uppercase Space Grotesk alongside a monospaced module ID (e.g., `MOD-4091`).

### Status Chips & Badges
- Inline blocks with `2px solid #2B2F36`, font: JetBrains Mono (10px, uppercase, bold).
- **Approved/Active:** Background `#FF6B1A` with `#2B2F36` text.
- **Pending/Draft:** Background `#FFFFFF` with `#2B2F36` text.
- **Archived/Spec:** Background `#7A828C` with `#FFFFFF` text.

### Progress Trackers & Milestones
- **Linear Progress Bars:** Track height 12px, background `#FFFFFF`, border `2px solid #2B2F36`, filled with solid `#FF6B1A`. Progress fill demarcated with vertical 1px hash marks every 10%.
- **Milestone Stepper:** Segmented interlocking blocks with monospaced numerical labels. Active phases animate fill from left to right in solid safety orange.

### Input Fields & Controls
- Form inputs feature `#FFFFFF` fill, `2px solid #2B2F36` borders, and 4px radius. Focus state adds a solid offset ring (`ring-2 ring-[#FF6B1A]`).
- Checkboxes and radio buttons: 18px square modules with `2px solid #2B2F36` framing; selected state fills with `#FF6B1A` and a crisp, dark `#2B2F36` square check mark.