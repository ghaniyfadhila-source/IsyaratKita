# DESIGN.md — IsyaratKita

## 1. Visual Direction & Philosophy
**IsyaratKita** adopts a **Tactile Editorial & High-Clarity Reference Studio** aesthetic designed specifically for two-way Indonesian Sign Language (SIBI) communication and learning.

- **Warm Archival Ground, Crisp Specimen Cards**: Instead of generic translucent glassmorphism on cold pastel gradients, the interface sits on a warm archival stone paper canvas (`#F6F3EC`) with subtle architectural registration dots (`#D5CCB9`) and crisp warm ivory specimen cards (`#FFFDF9`) framed by high-contrast structural ink borders (`2px solid #1C1917`) and tactile press shadows (`4px 4px 0px #1C1917`).
- **Accessibility-First Typography**: Headings and large SIBI letter specimens use **`Bricolage Grotesque`** (`600`–`800`) for unmistakable geometric distinction; body copy and hand-formation instructions use **`Atkinson Hyperlegible`** (developed by the Braille Institute for maximum character legibility); live camera FPS, confidence percentages, and sequence indices use **`JetBrains Mono`** with `tabular-nums`.
- **Semantic Two-Way Color Coding**:
  - **Studio 01 (Bicara & Teks → Isyarat)**: Anchored in **Signal Cobalt** (`#1D4ED8`, tint `#DBEAFE`).
  - **Studio 02 (Kamera Isyarat → Suara)**: Anchored in **Optical Emerald** (`#047857`, tint `#D1FAE5`).
  - **Active Specimen & Highlights**: Anchored in **Warm Signal Gold** (`#FDE68A`) and **Terracotta** (`#C2410C`).

---

## 2. Color Tokens

### Surfaces & Backgrounds
| Token | Value | Usage |
| :--- | :--- | :--- |
| `bg.canvas` | `#F6F3EC` | Primary warm archival stone background |
| `bg.recessed` | `#EAE4D7` | Recessed control wells, tab tracks, and card footers |
| `bg.surface` | `#FFFDF9` | Crisp warm ivory card and panel surface |
| `bg.stage` | `#141210` | High-contrast dark charcoal studio stage, camera frame, and headers |

### Typography & Ink
| Token | Value | Usage |
| :--- | :--- | :--- |
| `text.primary` | `#141210` | Primary headings, labels, and body copy |
| `text.secondary` | `#44403C` | Descriptions, finger guides, and supporting copy |
| `text.muted` | `#57534E` | Metadata stamps, placeholders, and secondary counters |
| `text.onDark` | `#FFFDF9` | Text on dark charcoal studio headers and stage |

### Accents & Semantic Status
| Token | Value | Usage |
| :--- | :--- | :--- |
| `accent.cobalt` | `#1D4ED8` | Mode 01 (Speech-to-Sign), primary interactive accents |
| `accent.emerald` | `#047857` | Mode 02 (Sign-to-Speech), camera active, 2-hand detection |
| `accent.gold` | `#FDE68A` | Active badges, keycap highlights, and high-visibility CTAs |
| `accent.terracotta` | `#C2410C` | Dynamic gesture movement notes and alerts |
| `status.danger` | `#DC2626` | Active microphone recording stop state and error alerts |

---

## 3. Typography & Hierarchy

### Font Families
- **Display (`--font-display`)**: `'Bricolage Grotesque', system-ui, -apple-system, sans-serif`
- **Body (`--font-sans`)**: `'Atkinson Hyperlegible', system-ui, -apple-system, sans-serif`
- **Monospace (`--font-mono`)**: `'JetBrains Mono', monospace`

### Type Scale
- **Hero Display (`h1`)**: `clamp(2rem, 3.8vw, 3.25rem)`, `font-weight: 800`, `line-height: 1.08`, `letter-spacing: -0.025em`
- **Section Heading (`h2`)**: `1.5rem` – `2.25rem`, `font-weight: 800`
- **Panel / Card Heading (`h3`)**: `1.125rem` – `1.25rem`, `font-weight: 800`
- **Body Copy**: `0.875rem` – `1rem` (`14px`–`16px`), `line-height: 1.6`
- **Micro Labels & Telemetry**: Minimum `0.75rem` (`12px` / `text-xs`), `font-weight: 700`

---

## 4. Elevation, Borders & Tactile Physics
- **Panels (`.tactile-panel`)**: `background: #FFFDF9`, `border: 2px solid #1C1917`, `box-shadow: 6px 6px 0px #1C1917`, `border-radius: 1.5rem` (`24px`).
- **Specimen Cards (`.tactile-card`)**: `background: #FFFDF9`, `border: 1.5px solid #1C1917`, `box-shadow: 3px 3px 0px #1C1917`, hover lift `translate(-2px, -2px)` with `5px 5px 0px #1C1917`.
- **Tactile Buttons (`.tactile-btn`)**: `border: 1.5px solid #1C1917`, `box-shadow: 2px 2px 0px #1C1917`, active press `translate(1px, 1px)` with `0px 0px 0px #1C1917`.
