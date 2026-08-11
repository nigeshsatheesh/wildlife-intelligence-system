---
name: Ecological Intelligence
colors:
  surface: '#f7faf8'
  surface-dim: '#d8dbd9'
  surface-bright: '#f7faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f2'
  surface-container: '#eceeed'
  surface-container-high: '#e6e9e7'
  surface-container-highest: '#e0e3e1'
  on-surface: '#181c1b'
  on-surface-variant: '#414844'
  inverse-surface: '#2d3130'
  inverse-on-surface: '#eef1ef'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#116c4a'
  on-secondary: '#ffffff'
  secondary-container: '#a1f4c8'
  on-secondary-container: '#1b724f'
  tertiary: '#1f2825'
  on-tertiary: '#ffffff'
  tertiary-container: '#353e3a'
  on-tertiary-container: '#9fa9a3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#a1f4c8'
  secondary-fixed-dim: '#86d7ad'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#dbe5df'
  tertiary-fixed-dim: '#bfc9c3'
  on-tertiary-fixed: '#151d1a'
  on-tertiary-fixed-variant: '#3f4945'
  background: '#f7faf8'
  on-background: '#181c1b'
  surface-variant: '#e0e3e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is centered on **Scientific Minimalism**. It targets conservationists, ecologists, and policy makers who require high-density data presented with absolute clarity and calm authority. 

The aesthetic merges the organic essence of wildlife conservation with the precision of high-tech monitoring. It avoids clutter, favoring expansive whitespace and a refined visual hierarchy that allows critical population data to breathe. The emotional response is one of trust, environmental stewardship, and technological sophistication.

## Colors
The palette is rooted in the "Deep Forest" primary (#1B4332), providing a strong, authoritative base for navigation and primary actions. "Vibrant Moss" (#40916C) is utilized for success states and growth indicators, while "Soft Sage" (#D8E2DC) serves as a subtle background for secondary containers and chip elements.

The neutral palette uses cool grays to prevent visual fatigue during long monitoring sessions. Pure white is reserved for primary cards, ensuring maximum contrast against the $F8FAF9 off-white background.

## Typography
Inter is used across all levels to maintain a systematic, utilitarian feel. The hierarchy relies on substantial weight differentiation and generous line heights to ensure readability in complex data tables and maps. 

Labels are set in uppercase with increased letter spacing to provide a clear distinction from body text, serving as "meta-data" indicators. Headlines use slight negative letter spacing to feel tighter and more "editorial" at larger scales.

## Layout & Spacing
The design system utilizes a **12-column fluid grid** for desktop dashboards and a **4-column grid** for mobile views. The rhythm is based on a 4px baseline, with a standard 24px gutter to maintain an open, airy feel between data modules.

Large-scale monitoring views (maps) should use an "edge-to-edge" layout with floating UI panels, while administrative and reporting views should be contained within a max-width of 1440px to ensure line lengths remain readable.

## Elevation & Depth
Depth is conveyed through **Ambient Shadows** and tonal layering. Primary surfaces (cards) use a very soft, diffused shadow (0px 4px 20px rgba(27, 67, 50, 0.04)) to appear lifted from the sage-tinted background.

Active states and overlays utilize a secondary elevation level with a slightly higher blur and lower opacity to imply a temporary "hover" or "modal" state. Borders are used sparingly, primarily in a low-contrast gray (#E5E7E6) for table rows and input field boundaries to maintain the minimalist aesthetic.

## Shapes
This design system employs a **Rounded** shape language to soften the "industrial" feel of data monitoring. Cards and primary containers use `rounded-xl` (1.5rem / 24px) to create a premium, approachable feel. Buttons and input fields use `rounded-lg` (1rem / 16px). This consistent curvature suggests a modern, user-friendly interface that balances the "hard" data within.

## Components

### Buttons
- **Primary:** Deep Forest (#1B4332) background, white text. No border. High-density padding (12px 24px).
- **Secondary:** Soft Sage (#D8E2DC) background, Deep Forest text.
- **Tertiary/Ghost:** No background, Deep Forest text, subtle underline on hover.

### Cards
White background with `rounded-xl` corners and ambient shadows. Padding is consistently `32px` for desktop and `20px` for mobile. Card headers should feature a thin 1px bottom border in #F0F2F1.

### Data Inputs
Input fields use a light gray background (#F0F2F1) with no border in their default state. Upon focus, they transition to a 1px solid Deep Forest border with a soft green outer glow.

### Chips & Badges
Small, pill-shaped markers used for species status (e.g., "Stable", "Endangered"). Use high-contrast color pairings:
- **Stable:** Moss background, white text.
- **Critical:** Soft red background, dark red text.
- **General:** Sage background, Deep Forest text.

### Data Visualizations
Charts should use the Primary/Secondary greens as the dominant colors. Grid lines in charts must be extremely subtle (#F0F2F1). Use "Inter" for all axis labels to match the system's precision.

### Status Indicators
Small, pulsing circular pings are used on maps to represent live camera trap or GPS collar pings, reinforcing the "intelligence system" narrative.