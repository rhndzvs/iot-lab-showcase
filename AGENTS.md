# AGENTS.md

Design System Reference for **iot-lab-showcase**

This guide defines the visual language and implementation conventions for the IoT lab portfolio site. Follow these standards for all UI work unless a task explicitly overrides them.

## 1) Color Palette

Use these as design tokens (CSS custom properties recommended):

- Primary: `#0EA5E9` (Sky 500)
  - Purpose: Core brand actions, primary buttons, links, active states.
- Secondary: `#14B8A6` (Teal 500)
  - Purpose: Supporting highlights, secondary badges, data overlays.
- Accent: `#F59E0B` (Amber 500)
  - Purpose: Callouts, KPI highlights, warnings, chart emphasis.
- Background: `#F8FAFC` (Slate 50)
  - Purpose: App/page background in light mode.
- Surface: `#FFFFFF`
  - Purpose: Cards, panels, modal surfaces, nav containers.
- Text Primary: `#0F172A` (Slate 900)
  - Purpose: Main headings and body copy.
- Text Secondary: `#475569` (Slate 600)
  - Purpose: Metadata, helper text, less prominent labels.
- Border/Divider: `#E2E8F0` (Slate 200)
  - Purpose: Card borders, table dividers, subtle separators.

Suggested status colors for IoT signals:

- Success/Online: `#22C55E`
- Warning/Degraded: `#F59E0B`
- Error/Offline: `#EF4444`
- Info: `#3B82F6`

## 2) Typography

### Font Families

- Headings: `Sora, "Segoe UI", sans-serif`
- Body/UI: `Manrope, "Segoe UI", sans-serif`
- Mono/Data Readouts: `JetBrains Mono, Consolas, monospace`

### Type Scale

- Display: 48px / weight 700 / line-height 1.1
- H1: 40px / weight 700 / line-height 1.15
- H2: 32px / weight 700 / line-height 1.2
- H3: 24px / weight 600 / line-height 1.25
- H4: 20px / weight 600 / line-height 1.3
- Body Large: 18px / weight 400 / line-height 1.6
- Body: 16px / weight 400 / line-height 1.6
- Body Small: 14px / weight 400 / line-height 1.5
- Caption: 12px / weight 500 / line-height 1.4

### Weight Usage

- 700: Hero headlines, key section titles
- 600: Card titles, component headings
- 500: Labels, pills, nav items
- 400: Paragraphs and general UI text

## 3) Spacing & Layout

### Grid System

- Desktop: 12-column grid
- Tablet: 8-column grid
- Mobile: 4-column grid
- Gutter: 24px desktop/tablet, 16px mobile

### Spacing Scale (8pt system)

- `4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, 64px, 80px`

Use multiples of 8px whenever possible. 12px is allowed for compact UI adjustments.

### Container & Section Rules

- Max container width: `1200px`
- Container horizontal padding:
  - Desktop: `32px`
  - Tablet: `24px`
  - Mobile: `16px`
- Vertical section spacing:
  - Normal sections: `64px`
  - Feature/hero sections: `80px` to `96px`

## 4) Component Conventions

### Card Style (Project and Metric Cards)

- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`
- Radius: `16px`
- Padding: `24px` (desktop), `16px` (mobile)
- Shadow: `0 10px 30px rgba(15, 23, 42, 0.08)`
- Hover:
  - Translate Y: `-2px`
  - Shadow increase for depth
  - Border tint toward primary (`#0EA5E9` at low opacity)

### Button Variants

- Primary Button:
  - BG: `#0EA5E9`, text `#FFFFFF`
  - Hover: darken to `#0284C7`
- Secondary Button:
  - BG: `transparent`, border `#0EA5E9`, text `#0EA5E9`
  - Hover: light primary tint background
- Ghost Button:
  - BG: `transparent`, text `#0F172A`
  - Hover: `#F1F5F9`

Shared button rules:

- Height: `44px` minimum
- Radius: `10px`
- Horizontal padding: `16px` to `20px`
- Font: body family, weight 600
- Transition: `150ms ease` for color/background/shadow

### Section Structure

Each major page section should follow this order:

1. Eyebrow label (optional)
2. Section heading
3. Short supporting paragraph (1-2 lines)
4. Content region (cards, charts, project rows, etc.)
5. Optional action row (CTA or link)

Keep section headers left-aligned for technical/readability focus.

## 5) Tone & Imagery

### Visual Tone

- Clean, modern, technical, trustworthy
- Data-informed look: subtle grids, charts, telemetry cues
- Favor clarity over decorative complexity

### Imagery Guidelines

- Use project visuals with real devices, dashboards, sensors, and wiring setups
- Prefer screenshots/diagrams with clean framing and minimal clutter
- Use subtle overlays/gradients in hero backgrounds, not heavy textures

### Mode Preference

- Primary mode: Light mode
- Optional dark mode can be added later, but all baseline components must ship with excellent light mode contrast first

## 6) Naming Conventions

Use predictable, scalable naming for CSS classes and tokens.

### CSS Class Pattern

- Prefer BEM-style classes:
  - Block: `.project-card`
  - Element: `.project-card__title`
  - Modifier: `.project-card--featured`

### CSS Variable Pattern

- Global tokens: `--color-*`, `--space-*`, `--radius-*`, `--font-*`
- Examples:
  - `--color-primary: #0EA5E9;`
  - `--space-4: 16px;`
  - `--radius-md: 10px;`

### File/Component Naming

- React components: PascalCase (`ProjectCard.jsx`)
- Utility/style modules: kebab-case (`project-card.css`)
- Keep one primary component per file when practical.

## 7) Implementation Notes for Agents

- Reuse tokens before introducing new colors/sizes.
- Maintain AA contrast minimum for text and interactive controls.
- Keep interaction feedback subtle and fast (150-220ms).
- Preserve consistent spacing rhythm between adjacent components.
- Avoid visual styles that conflict with the clean tech-forward aesthetic.
