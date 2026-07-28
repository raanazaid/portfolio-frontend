# Add Global Light Theme to Portfolio

Add a premium Light Theme alongside the existing Dark Theme. No layout, typography, animation, or component structure changes — only color/appearance theming.

## Architecture Overview

The portfolio is a set of static HTML files with embedded `<style>` blocks:
- `index.html` — main portfolio (uses `:root` CSS vars + many hardcoded `rgba(255,255,255,...)` colors)
- `case-dispatch.html` — blue accent theme
- `case-glowere.html` — green accent theme
- `case-fittime.html` — orange accent theme
- `case-datascrap.html` — amber accent theme
- `chatbot-widget.css` — external CSS file (uses its own `:root` vars like `--bg-primary`, `--surface-primary`, etc.)

### Key Challenge
Each file has its own `:root` block with hardcoded dark-mode colors **and** many inline hardcoded `rgba(255,255,255,...)` values scattered throughout the CSS. The accent colors (blue, green, orange, amber) are unique per case study and must be preserved in both themes.

---

## Proposed Changes

### Strategy: `[data-theme="light"]` Attribute Selector

Use a `data-theme` attribute on the `<html>` element. Default = `"dark"` (preserves existing look). Light mode overrides the same CSS variables.

**FOUC Prevention:** A tiny inline script in `<head>` reads `localStorage` (or OS preference) and applies `data-theme` **before** any CSS renders.

---

### 1. New Shared Theme Files

#### [NEW] [theme.css](file:///g:/portfolio/theme.css)

A centralized CSS file defining **light-mode overrides** for the shared CSS variables. This file is linked by every HTML page.

Contents:
- `[data-theme="light"]` selector overriding `:root` vars for:
  - `--bg`, `--ink`, `--mid`, `--soft`, `--faint`, `--border`, `--surface`, `--white`, `--dim`, `--accent`
- Light-mode chatbot variable overrides:
  - `--bg-primary`, `--surface-primary`, `--surface-secondary`, `--surface-tertiary`, `--surface-elevated`, `--text-primary`, `--text-secondary`, `--accent-primary`, `--accent-primary-hover`, `--border-subtle`, `--shadow-soft`, `--shadow-layered`
- Light-mode overrides for hardcoded colors via targeted selectors (e.g., `[data-theme="light"] body`, `[data-theme="light"] nav`, `[data-theme="light"] .cursor`, etc.)
- Per-page accent color overrides are NOT needed since accent colors (blue, green, orange, amber) already work in both themes — they only need their glow/faint variants adjusted.

#### [NEW] [theme-toggle.js](file:///g:/portfolio/theme-toggle.js)

A small JS file (shared by all pages) that:
- Initializes theme from `localStorage` → OS preference → default dark
- Provides toggle functionality
- Dispatches a `themechange` custom event (for the WebGL background to react)

---

### 2. Modifications Per HTML File

#### [MODIFY] [index.html](file:///g:/portfolio/index.html)

1. **`<head>`**: Add inline `<script>` for FOUC prevention (reads localStorage/OS pref, sets `data-theme` on `<html>`)
2. **`<head>`**: Add `<link rel="stylesheet" href="./theme.css" />` after the existing styles
3. **`<head>`**: Add `<script src="./theme-toggle.js" defer></script>` before closing `</head>`
4. **`<nav>`**: Add a theme toggle button with Sun/Moon icon next to the hamburger
5. **`<nav-tray>`**: Add theme toggle button inside mobile nav tray
6. **Embedded CSS**: Add `[data-theme="light"]` overrides for hardcoded colors specific to `index.html` (preloader, hero glows, card backgrounds, form inputs, etc.)
7. **WebGL**: Make the background canvas react to theme — adjust orb opacity/color for light mode

#### [MODIFY] [case-dispatch.html](file:///g:/portfolio/case-dispatch.html)

1. **`<head>`**: Add FOUC prevention script + theme.css link + theme-toggle.js
2. **`<nav>`**: Add theme toggle button
3. **Embedded CSS**: Add `[data-theme="light"]` overrides for dispatch-specific hardcoded colors (hero backgrounds `#060810`, `#07090f`, glows, card backgrounds, etc.)

#### [MODIFY] [case-glowere.html](file:///g:/portfolio/case-glowere.html)

Same pattern as dispatch — add FOUC script, theme.css, theme-toggle.js, nav toggle button, and light-mode overrides for glowere-specific colors.

#### [MODIFY] [case-fittime.html](file:///g:/portfolio/case-fittime.html)

Same pattern — FOUC script, theme.css, theme-toggle.js, nav toggle button, and light-mode overrides for fittime-specific colors (orange accent).

#### [MODIFY] [case-datascrap.html](file:///g:/portfolio/case-datascrap.html)

Same pattern — FOUC script, theme.css, theme-toggle.js, nav toggle button, and light-mode overrides for datascrap-specific colors (amber accent).

#### [MODIFY] [chatbot-widget.css](file:///g:/portfolio/chatbot-widget.css)

Add `[data-theme="light"]` overrides for all chatbot CSS variables at the end of the file.

---

### 3. Light Theme Color Palette

| Token | Dark (current) | Light (new) |
|-------|----------------|-------------|
| `--bg` | `#0a0a0a` | `#f8f9fb` |
| `--ink` / `--white` | `#ffffff` | `#1a1a2e` |
| `--mid` | `#ccc` | `#555` |
| `--soft` | `#888` | `#777` |
| `--dim` | `rgba(255,255,255,0.5)` | `rgba(26,26,46,0.55)` |
| `--faint` | `rgba(255,255,255,0.03)` | `rgba(26,26,46,0.03)` |
| `--border` | `rgba(255,255,255,0.08)` | `rgba(26,26,46,0.1)` |
| `--surface` | `rgba(255,255,255,0.04)` | `rgba(26,26,46,0.04)` |
| `--accent` | `#e8e8e8` | `#2a2a3e` |
| Nav BG (scrolled) | `rgba(6,6,8,0.88)` | `rgba(248,249,251,0.92)` |
| Card hover shadow | `rgba(0,0,0,0.5)` | `rgba(26,26,46,0.08)` |
| Preloader BG | `#060608` | `#f8f9fb` |
| Hero glow | `rgba(255,255,255,…)` | `rgba(26,26,46,…)` |

Chatbot widget light overrides:

| Token | Dark | Light |
|-------|------|-------|
| `--bg-primary` | `#0a0a0a` | `#f8f9fb` |
| `--surface-primary` | `#1c1c1c` | `#ffffff` |
| `--surface-secondary` | `#2a2a2a` | `#f0f1f4` |
| `--surface-tertiary` | `#3a3a3a` | `#e2e4e9` |
| `--surface-elevated` | `#1c1c1c` | `#ffffff` |
| `--text-primary` | `#ffffff` | `#1a1a2e` |
| `--text-secondary` | `#d6d6d6` | `#555` |

---

### 4. Theme Toggle Button Design

- **Position**: In the navbar, between nav-links and hamburger
- **Icon**: Phosphor icons — `ph-sun` for dark → light, `ph-moon` for light → dark
- **Style**: Minimal circle button matching existing nav aesthetic
- **Animation**: Smooth 300ms icon crossfade + gentle rotation
- **Mobile**: Also accessible inside the nav tray

---

## User Review Required

> [!IMPORTANT]
> **Case study pages**: Each case study uses its own accent color. In light mode, the **accent colors stay the same** (blue, green, orange, amber) but the glow/background shading will be adjusted to look natural on light backgrounds. Is this acceptable, or do you want entirely different accent colors for light mode?

> [!IMPORTANT]
> **Custom cursor**: The current `mix-blend-mode: difference` cursor may look odd on light backgrounds. I plan to keep it as-is since `difference` blend mode naturally inverts. Should I keep it or hide the custom cursor in light mode?

> [!IMPORTANT]
> **WebGL background canvas**: The floating orbs are currently white/light on dark. In light mode, I'll make them dark/muted so they look subtle on the white background. Acceptable?

## Open Questions

1. **Preloader in light mode**: Should the loading screen match the theme (light bg with dark text), or always stay dark to maintain the dramatic intro?

---

## Verification Plan

### Automated Tests
- No automated test framework in this project.

### Manual Verification
- Build/serve locally and visually test both themes on all 6 pages
- Verify toggle persists across page navigation (`localStorage`)
- Verify OS preference detection on first visit
- Verify no FOUC on page load
- Check all interactive states (hover, focus, form inputs) in light mode
- Verify chatbot widget appearance in light mode
- Test mobile nav tray with toggle
- Push to GitHub → auto-deploy to Vercel → test live
