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
│   ├── page.tsx          # Main page with bio + cube layout
│   ├── layout.tsx        # Root layout with font setup
│   └── globals.css       # Global styles
└── components/
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

### Key Constants
- Canvas: 38 chars wide × 24 chars tall
- Face: 25×15 chars (240×240 pixels at 9.6×16 char size)
- Projection center: (18, 12) in char coords
- Initial orientation: `[0, 0, 1, 0]` (Rz 180° to show T right-side up)

---

## Aligning Text with ASCII Cube Top

### Goal
Align the top of text (e.g., "Theo Bleier") with the top of the cube's visual content (the dotted border).

### Key Insight
The cube's `<pre>` element has **empty lines at the top** before the visual content starts. These must be offset with a negative margin.

### Measurement Process

1. **Stop the animation** to get consistent measurements:
   ```tsx
   let isRunning = false; // in useEffect
   ```

2. **Measure positions via browser JS**:
   ```js
   // Count empty lines at top of cube
   const lines = cubePreElement.textContent.split('\n');
   let emptyCount = 0;
   for (const line of lines) {
     if (line.trim().length === 0) emptyCount++;
     else break;
   }

   // Calculate visual top of cube content
   const lineHeight = 16; // px
   const cubeVisualTop = cubePreTop + (emptyCount * lineHeight);

   // h1 text has 4px offset due to line-height centering (24px line-height, 16px font)
   const h1TextTop = h1BoxTop + 4;

   // Difference tells you how much to adjust
   const adjustment = cubeVisualTop - h1TextTop;
   ```

3. **Apply negative margin** to cube container:
   ```tsx
   <div className="md:-mt-[Xpx]">
     <AsciiCube />
   </div>
   ```
   Where `X = emptyLines × lineHeight + h1LineHeightOffset`

### Formula
```
margin-top = -(CUBE_TOP_WHITESPACE_CHARS × CHAR_HEIGHT_PX + 4px)
           = -(5 × 16 + 4)
           = -84px (base)
```

Then fine-tune based on actual measurements. Final value: **-92px** (includes additional offset for dot baseline vs text ascender positioning).

### Verification
Re-measure after each adjustment until `cubeVisualTop - h1TextTop ≈ 0`.

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

2. Apply extra left padding only on desktop (md+):
   ```tsx
   <div
     className="min-h-screen p-8 md:pl-[--balanced-left-padding]"
     style={{ "--balanced-left-padding": `${baseMargin + CUBE_RIGHT_WHITESPACE_PX}px` }}
   >
   ```

### Result
- Left padding on md+: 32px (base) + 67.2px (whitespace) = 99.2px
- Right visual margin: 32px (padding) + 67.2px (cube internal) = 99.2px
