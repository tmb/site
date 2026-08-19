# Claude Code Guide

## Project Overview

Personal website for Theo Bleier featuring an interactive 3D ASCII art cube.

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Font**: JetBrains Mono (monospace)
- **Language**: TypeScript

### Project Structure
```
src/
├── app/
│   ├── page.tsx          # "me" page content (bio paragraphs only)
│   ├── writing/page.tsx  # Substack posts list (RSS feed, ISR)
│   ├── not-banks/page.tsx# "(not) banks" list content
│   ├── layout.tsx        # Root layout: font setup + wraps children in SiteShell
│   └── globals.css       # Global styles
└── components/
    ├── SiteShell.tsx     # Shared layout: sidebar + <main> slot + cube (in layout, so cube persists across navigation)
    ├── Sidebar.tsx       # Left nav; name + dashed rule, nav links, socials; bolds active route via usePathname
    ├── ThemeToggle.tsx   # Light/dark mode toggle (currently disabled)
    └── AsciiCube/
        ├── index.ts      # Re-export
        ├── AsciiCube.tsx # Main component with animation loop
        ├── constants.ts  # All magic numbers (dimensions, scales, etc.)
        ├── types.ts      # TypeScript interfaces
        ├── math/
        │   ├── quaternion.ts  # Quaternion math for rotations
        │   ├── vector.ts      # Vector operations
        │   └── arcball.ts     # Arcball rotation projection
        ├── geometry/
        │   └── cubeData.ts    # Cube vertices, faces, letters
        └── rendering/
            └── asciiRenderer.ts  # Renders cube to ASCII string
```

### ASCII Cube Architecture

The cube renders a 3D wireframe with letters (T, M, B) on faces:

1. **Constants** (`constants.ts`): All dimensions derive from `CHAR_WIDTH_PX` (9.6) and `CHAR_HEIGHT_PX` (16). Face dimensions are calculated for 1:1 pixel aspect ratio.

2. **Rendering**: Each frame renders to a 38×24 character grid. Uses z-buffer for depth, projects 3D points to 2D, draws dotted edges and letter fills.

3. **Animation**: Cycles through T → M → B faces with smooth quaternion interpolation (slerp). Pauses on each face for 0.5s.

4. **Interaction**: Supports mouse/touch drag via arcball rotation.

5. **Route-aware play/pause** (`usePathname`): auto-plays only on the "me" page (`/`). On any other route it eases back to the T face and holds, showing a `play >` control to resume. State resets on navigation.

### Key Constants
- Canvas: 38 chars wide × 24 chars tall
- Face: 25×15 chars (240×240 pixels at 9.6×16 char size)
- Projection center: (18, 12) in char coords
- Initial orientation: `[0, 0, 1, 0]` (Rz 180° to show T right-side up)

---

## Pages & Content

`layout.tsx` wraps every route in `SiteShell` (sidebar + `<main>` slot + cube), so pages only render their inner content. `Sidebar.tsx` bolds the active route via `usePathname`.

- **`/` (me)** — bio paragraphs.
- **`/writing`** — lists Substack posts. Server component fetches `https://theombl.substack.com/feed` (RSS), parses `<item>` blocks with regex (title/link/pubDate), sorts newest-first, renders `- **title** (date)`. Uses ISR: `export const revalidate = 3600` (hourly). No API key; if the fetch fails it renders an empty-state.
- **`/not-banks`** — static list of companies with bank-like operations.
- **`/reading`** — static reading list grouped by category (bold `<h2>` headers, optional intro notes, posts as dashed `<li>` items). Post data lives inline in the page as a `sections` array; items become links only when a `href` is present (most are text pending URLs).

### Styling conventions (`globals.css`)
- Light/dark follow OS `prefers-color-scheme` via CSS vars (`--bg`, `--text`); no manual toggle (`ThemeToggle` is disabled).
- Body links (`main a`) are **always underlined**; sidebar/nav links are not (bracketed `[ label ]` style, underline on hover only).

---

## Top-Line Alignment (sidebar name · body text · cube)

Three things must share the same top edge: the **sidebar name**, the **first line of `<main>` body text**, and the **cube's dotted top border**. They live in three different type contexts (bold vs regular weight, different line-heights, and the cube "top" is a row of `.` periods, not letters), so there's no single shared baseline grid. It's solved in two independent pieces.

### 1. Sidebar name ↔ body text — exact match via `text-box-trim`

`globals.css` trims the half-leading above the first line of both, snapping each first line's **cap-height to its box top**:
```css
main { line-height: 1.75; }
aside .font-bold,          /* the sidebar name (nav uses font-extrabold, not matched) */
main :first-child {        /* first text block on every page: <p>, nested <p>, or <li> */
  text-box-trim: trim-start;
  text-box-edge: cap alphabetic;
}
```
Because both boxes start at the same `md:items-start` flex-row top and cap-height is a font-wide constant, their tops become **exactly equal (0.00px)** — independent of line-height or weight. Verified 0px on `/`, `/writing`, `/not-banks`.

- **Why this over just centering:** line-box centering depends on line-height *and* per-weight ascent, so bold name vs regular body never quite matched (best was ~0.26px, a lucky cancellation; nudging line-heights re-broke it). `text-box-trim` removes that coupling entirely.
- **Structural requirement:** the trimmed element needs a real line box. The `/writing` `<li>` was therefore changed from `flex` to a plain text block (inline `-` dash, like `/not-banks`); a `flex` container has no line box and the trim silently no-ops.
- **Browser support:** Chrome 133+ / Safari 18.2+. **Firefox has no support yet** — it no-ops back to the ~0.26px centering fallback (imperceptible). Progressive enhancement, safe to ship.

### 2. Cube dotted border — visual `-mt` tune

```tsx
<div className="md:-mt-[98px] ..."><AsciiCube /></div>   // SiteShell.tsx
```
The cube `<pre>` is a third coordinate system (line-height 1, and its "top" is periods that render near the *baseline*, low in their line box). It can't join the cap-height grid, so it's aligned **by eye**, not by metric. Guidance:
- Strict glyph-top alignment reads as sitting through the *middle* of the text; the visually-correct spot sits the dotted rule a few px higher. `-98px` puts the dots ~4.5px above the body cap-top, which reads as "at the top".
- This value depends on where the body text lands. If you change `main`'s line-height or the trim, the body first line moves and the cube `-mt` must be re-tuned (~1px per 1px of text shift). The trim currently pins the body cap-top, so line-height changes alone no longer move it.
- **Always confirm with a screenshot** — don't chase the metric to 0.

### Verification (browser JS, on a static non-"me" route)
```js
const nameTop = document.querySelector('aside .font-bold').getBoundingClientRect().top; // == cap-top after trim
const bodyTop = document.querySelector('main p, main li').getBoundingClientRect().top;   // == cap-top after trim
// nameTop - bodyTop should be ~0.00
```

---

## Balancing Horizontal Margins with Cube Whitespace

### Goal
Make the left margin of text equal to the visual right margin (accounting for cube's internal whitespace).

### Key Insight
The cube canvas is wider than the cube content. At head-on view, there's whitespace on the right side of the canvas that needs to be accounted for in the page layout.

### Solution
1. Calculate cube's internal right whitespace in `constants.ts`:
   ```ts
   const CUBE_HEADON_RIGHT_CHAR = PROJECTION_OFFSET_X + PROJECTION_SCALE_X + 1;
   export const CUBE_RIGHT_WHITESPACE_PX = (CANVAS_WIDTH - CUBE_HEADON_RIGHT_CHAR) * CHAR_WIDTH_PX;
   ```

2. Apply extra left padding only on desktop (md+), in `SiteShell.tsx`:
   ```tsx
   <div
     className="min-h-screen p-8 md:pl-[--balanced-left-padding]"
     style={{ "--balanced-left-padding": `${baseMargin + CUBE_RIGHT_WHITESPACE_PX}px` }}
   >
   ```

### Result
- Left padding on md+: 32px (base) + 67.2px (whitespace) = 99.2px
- Right visual margin: 32px (padding) + 67.2px (cube internal) = 99.2px
