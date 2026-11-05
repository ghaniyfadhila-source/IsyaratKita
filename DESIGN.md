---
name: IsyaratKita
description: Jembatan Komunikasi Bahasa Isyarat (SIBI) & Suara Dua Arah Real-Time
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  primary-soft: "#eff6ff"
  accent-mint: "#10b981"
  neutral-canvas: "#f8fafc"
  surface-pure: "#ffffff"
  text-primary: "#1e293b"
  text-secondary: "#475569"
  text-muted: "#64748b"
  border-subtle: "#e2e8f0"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface-pure}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  chip-quick:
    backgroundColor: "{colors.surface-pure}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  card-glass:
    backgroundColor: "{colors.surface-pure}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# Design System: IsyaratKita

## Overview

**Creative North Star: "The Translucent Civic Studio"**

IsyaratKita combines approachable civic clarity with tactile translucent glass surfaces ("Liquid Glass"). Because the platform serves as a real-time bridge between Deaf/hard-of-hearing signers (Teman Tuli) and hearing speakers (Teman Dengar), every surface prioritizes immediate legibility, calm visual hierarchy, and unambiguous status feedback.

Rather than heavy dark chrome or clinical medical styling, the interface floats translucent white-glass panels over a bright alabaster-slate canvas. Interactive states—whether microphone recording, 21-point hand landmark tracking, or hold-to-confirm gesture progress—are communicated through crisp cobalt-blue actions and living emerald-mint status pulses.

**Key Characteristics:**
- **Liquid Glass Surfaces:** Translucent white layers (`rgba(255, 255, 255, 0.65)` to `0.88`) paired with `backdrop-filter: blur(16px–20px)` and specular borders.
- **Single Humanist Sans-Serif:** Geometric warmth and high legibility across all scales using `Plus Jakarta Sans`.
- **Dual-Modality Status Signaling:** Cobalt blue anchors primary actions and speech-to-sign flows, while emerald mint signals active camera tracking and verified SIBI gestures.

## Colors

The palette pairs a bright, low-glare slate-alabaster canvas with high-trust cobalt blue and emerald mint semantic accents.

### Primary
- **Civic Cobalt** (`#2563eb`): Primary CTA buttons, active mode indicators, brand emblem badges, and primary interactive highlights.
- **Deep Cobalt** (`#1d4ed8`): Hover and active state for primary buttons.
- **Cobalt Tint** (`#eff6ff`): Soft badge fills, icon containers, and active filter highlights.

### Secondary
- **Signal Mint** (`#10b981`): Live camera status dots, verified gesture hold indicators, and learning module accents.

### Neutral
- **Alabaster Slate Canvas** (`#f8fafc`): Top and bottom gradient stops of the page background.
- **Pure Daylight Surface** (`#ffffff`): Active tab pills, elevated inner cards, and primary button text.
- **Slate Ink** (`#1e293b`): Primary headings, body copy, and detected sign titles.
- **Muted Slate** (`#475569`): Supporting descriptions, anatomical finger guides, and secondary labels.
- **Cool Steel** (`#64748b`): Captions, timestamps, and input placeholders.
- **Hairline Slate** (`#e2e8f0`): Structural card borders and subtle dividers.

### Named Rules
**The Dual-Signal Rule.** Reserve Civic Cobalt (`#2563eb`) for user-initiated controls and navigation, and reserve Signal Mint (`#10b981`) for live sensor readiness, verified hand tracking, and positive accuracy feedback.

## Typography

**Display Font:** `'Plus Jakarta Sans'` (with `system-ui, -apple-system, sans-serif` fallback)
**Body Font:** `'Plus Jakarta Sans'` (with `system-ui, -apple-system, sans-serif` fallback)

**Character:** Warm, modern humanist geometry with generous counters that keep Indonesian words, single-letter SIBI badges (`A`–`Z`), and instructional micro-copy effortless to scan at arm's length from a webcam.

### Hierarchy
- **Display** (`800`, `3rem` / `48px`, `line-height: 1.15`, `letter-spacing: -0.025em`): Hero headline introducing the platform.
- **Headline** (`800`, `1.5rem` / `24px`, `line-height: 1.25`, `letter-spacing: -0.015em`): Section headers (Translator workspace, Learning Modules, Dictionary modal).
- **Title** (`700`, `1rem` / `16px`, `line-height: 1.35`): Mode switcher titles, sign cards, and panel headers.
- **Body** (`500`, `0.875rem` / `14px`, `line-height: 1.6`): Finger-position descriptions, AI feedback explanations, and subtitles.
- **Label** (`700`, `0.75rem` / `12px`, `letter-spacing: 0.04em`): Pill badges, category tags (`Huruf A-Z`, `Kata Umum`), and compact button labels.

### Named Rules
**The Webcam-Distance Rule.** Never set active gesture readouts or live transcript text below `16px` (`1rem`), ensuring a signer standing back from their camera can read detections without squinting.

## Layout

Content is centered within a `1280px` (`max-w-7xl`) container with `16px`–`32px` horizontal padding. The vertical flow follows a clear three-tier progression:
1. **Floating Pill Navigation (`sticky top-4`):** Persistent access to Dictionary, Learning Modules, Sound toggle, and Usage Guide.
2. **Hero & Quick-Search Hub (`max-w-4xl`):** Centered typographic focal point with a glassmorphic search bar and mode switcher tabs.
3. **Two-Column Asymmetric Workspace:** Side-by-side panels (`grid-cols-1 lg:grid-cols-12`) pairing live input (microphone or MediaPipe camera feed) with visual output (animated SIBI hand cards or synthesized speech transcript).

## Elevation & Depth

Depth is achieved through translucent glass layering (`backdrop-filter: blur(16px–20px)`) combined with ultra-diffuse indigo-tinted ambient shadows (`rgba(31, 38, 135, 0.06–0.12)`).

### Shadow Vocabulary
- **Glass Rest** (`0 8px 32px 0 rgba(31, 38, 135, 0.07)`): Default elevation for `.liquid-glass` containers, navbar, and search bar.
- **Card Hover Lift** (`0 16px 36px 0 rgba(31, 38, 135, 0.10)`): Paired with `translateY(-5px)` and a soft blue border (`rgba(59, 130, 246, 0.35)`) on interactive SIBI sign cards.
- **Modal Float** (`0 20px 50px 0 rgba(31, 38, 135, 0.12)`): High-blur (`20px`) overlay surfaces for Dictionary, Practice Camera, and Guide modals.

### Named Rules
**The Specular Edge Rule.** Every blurred glass surface must pair its translucent background with a `1px solid` semi-opaque white or slate border (`rgba(255, 255, 255, 0.4–0.7)` or `#e2e8f0`) so card boundaries remain crisp against white backgrounds.

## Shapes

The system uses friendly, tactile curvature across all elements:
- **Full Pills (`9999px`):** Top floating navbar, primary CTA buttons, quick-search suggestion chips, and status badges.
- **Soft Panels (`16px` / `rounded-2xl`):** Search bars, mode switcher containers, and primary workspace panels.
- **Elevated Modals (`24px` / `rounded-3xl`):** Dictionary dialogs, mobile navigation drawers, and camera viewports.

## Components

### Buttons
- **Shape:** Full pill (`9999px`) for navbar CTAs and filter chips; rounded rectangle (`12px`) for workspace action buttons.
- **Primary:** Civic Cobalt (`#2563eb`) background, white text (`#ffffff`), bold `12px`–`14px` label, compact `8px 16px` padding.
- **Hover / Focus:** Shifts to Deep Cobalt (`#1d4ed8`) with `active:scale-98` tactile press feedback.

### Chips
- **Style:** Semi-translucent white (`rgba(255, 255, 255, 0.7)`) with `1px solid #e2e8f0` border and `#334155` text.
- **State:** Hover transitions to pure white background with Civic Cobalt (`#2563eb`) text.

### Cards / Containers
- **Corner Style:** `16px` (`rounded-2xl`) for workspace and sign cards.
- **Background:** `.liquid-glass` (`rgba(255, 255, 255, 0.65)`) with `16px` backdrop blur.
- **Shadow Strategy:** Glass Rest at rest; lifts `-5px` with Card Hover Lift on interactive dictionary cards.
- **Border:** `1px solid rgba(226, 232, 240, 0.9)`.
- **Internal Padding:** `16px` to `24px`.

### Inputs / Fields
- **Style:** `.liquid-glass-search` (`rgba(255, 255, 255, 0.8)`), `16px` radius, leading `36px` icon badge in `#eff6ff`.
- **Focus:** `2px` ring in `rgba(59, 130, 246, 0.3)` with `#60a5fa` border.

### Navigation
- **Style:** Sticky floating pill navbar (`.liquid-glass-nav`, `rounded-full`, `padding: 10px 24px`) housing brand identity on the left, pill links in the center, and sound toggle + primary guide CTA on the right.

## Do's and Don'ts

### Do:
- **Do** pair every audio/speech output control with a visible text transcript or status badge so Deaf and hearing users receive equivalent feedback.
- **Do** use `.liquid-glass` and `.liquid-glass-card` classes with `1px` borders to preserve depth on light backgrounds.
- **Do** display clear anatomical finger instructions alongside SIBI letter and word cards.

### Don't:
- **Don't** place unbordered white cards directly on the `#f8fafc`–`#ffffff` background where boundaries disappear.
- **Don't** rely on sound-only alerts or color-only error states without accompanying text and icons.
- **Don't** clutter the camera viewport overlay; keep landmark skeleton lines and hold-progress bars clean and unobstructed.
