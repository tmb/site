# AsciiCube Technical Manual

A comprehensive guide to the interactive 3D ASCII cube component.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Concepts](#core-concepts)
4. [Constants System](#constants-system)
5. [Geometry Definition](#geometry-definition)
6. [Math Utilities](#math-utilities)
7. [Rendering Pipeline](#rendering-pipeline)
8. [Animation System](#animation-system)
9. [User Interaction](#user-interaction)
10. [Integration](#integration)

---

## Overview

AsciiCube renders an interactive 3D wireframe cube using ASCII characters. The cube displays letters (T, M, B) on its faces and automatically rotates to show each letter in sequence. Users can manually rotate the cube via mouse or touch drag.

### Key Features

- **ASCII wireframe rendering**: Cube edges drawn with `.` characters
- **Letter textures**: `#` characters form T, M, B letters on cube faces
- **Smooth animation**: Quaternion-based rotation with spherical linear interpolation (slerp)
- **Interactive rotation**: Arcball algorithm for intuitive mouse/touch control
- **Z-buffering**: Proper depth ordering for overlapping elements

---

## Architecture

### File Structure

```
AsciiCube/
├── index.ts              # Re-export for clean imports
├── AsciiCube.tsx         # Main React component
├── constants.ts          # All configurable values
├── types.ts              # TypeScript interfaces
├── math/
│   ├── quaternion.ts     # Quaternion operations
│   ├── vector.ts         # Vector operations
│   └── arcball.ts        # Arcball projection
├── geometry/
│   └── cubeData.ts       # Vertices, faces, letter patterns
└── rendering/
    └── asciiRenderer.ts  # Core rendering engine
```

### Data Flow

```
User Input (mouse/touch)
        ↓
   Arcball Projection
        ↓
   Quaternion Rotation
        ↓
 orientationRef (Quaternion)
        ↓
    renderFrame()
        ↓
   ASCII String Output
        ↓
    React State (frame)
        ↓
      <pre> element
```

---

## Core Concepts

### Coordinate Systems

**World Space**: The cube exists in a right-handed 3D coordinate system:

- X-axis: positive = right
- Y-axis: positive = up
- Z-axis: positive = toward viewer

**Screen Space**: The output character grid:

- Origin at top-left
- X increases rightward
- Y increases downward (inverted from world Y)

### Quaternions

Quaternions represent 3D rotations without gimbal lock. Format: `[x, y, z, w]` where `(x, y, z)` is the vector part and `w` is the scalar.

**Key properties**:

- Unit quaternions (length = 1) represent rotations
- Composition: multiply quaternions to combine rotations
- Interpolation: slerp smoothly transitions between orientations

**From axis-angle to quaternion**:

```
Given axis (ax, ay, az) and angle θ:
q = [ax * sin(θ/2), ay * sin(θ/2), az * sin(θ/2), cos(θ/2)]
```

### Orthographic Projection

The cube uses orthographic (parallel) projection, not perspective. This means:

- No foreshortening based on distance
- Parallel lines remain parallel
- Object size doesn't change with depth

**Projection formula**:

```
screenX = worldX * scaleX + offsetX
screenY = -worldY * scaleY + offsetY  // Y inverted
screenZ = worldZ  // preserved for z-buffer
```

### Z-Buffering

A 2D array stores the depth (Z value) of each rendered pixel. When drawing:

1. Calculate the Z value for the new pixel
2. Compare with existing Z in buffer
3. Only draw if new Z >= existing Z (closer to viewer)
4. Update buffer with new Z value

This ensures correct occlusion when elements overlap.

### Arcball Rotation

The arcball maps 2D mouse movement to 3D rotation:

1. Project mouse position onto a virtual sphere centered on the object
2. Track start and current positions on the sphere
3. Compute rotation axis (cross product of the two points)
4. Compute rotation angle (from dot product)
5. Apply rotation to object orientation

For positions outside the sphere, a hyperbolic falloff provides smooth edge behavior.

---

## Constants System

All magic numbers are centralized in `constants.ts`. The system is designed so values cascade from fundamental measurements.

### Fundamental Values

```typescript
// Character dimensions in pixels (JetBrains Mono at default size)
CHAR_WIDTH_PX = 9.6 // Width of one character
CHAR_HEIGHT_PX = 16 // Height of one character (line height)
```

### Derived Dimensions

**Face size** (ensures 1:1 pixel aspect ratio when rendered):

```typescript
FACE_HEIGHT_CHARS = 15  // Odd number for centered letters
FACE_WIDTH_CHARS = (15 * 16) / 9.6 = 25
```

**Canvas size** (large enough for 45° rotation, √2 factor):

```typescript
CANVAS_WIDTH = ceil(25 * √2) + 2 = 38
CANVAS_HEIGHT = ceil(15 * √2) + 2 = 24
```

**Projection settings**:

```typescript
PROJECTION_SCALE_X = floor(25 / 2) = 12   // Half face width
PROJECTION_SCALE_Y = floor(15 / 2) = 7    // Half face height
PROJECTION_OFFSET_X = floor(38 / 2) - 1 = 18  // Center X
PROJECTION_OFFSET_Y = floor(24 / 2) = 12      // Center Y
```

### Rendering Parameters

```typescript
FACE_VISIBILITY_THRESHOLD = 0.1 // Min Z-normal to render face
LETTER_SAMPLE_RESOLUTION = 40 // Samples per axis for letters
LETTER_MARGIN = 0.2 // Inset from face edges (0-1)
LETTER_SCALE = 0.6 // Letter size relative to face
LETTER_Z_OFFSET = 1 // Ensures letters above edges
LINE_SAMPLE_MULTIPLIER = 4 // Samples per pixel for lines
ARCBALL_RADIUS_PX = 150 // Virtual sphere size
```

### Whitespace Calculations

For page layout alignment:

```typescript
// How many empty chars on right side when cube faces camera
CUBE_RIGHT_WHITESPACE_CHARS = CANVAS_WIDTH - (PROJECTION_OFFSET_X + PROJECTION_SCALE_X + 1)
CUBE_RIGHT_WHITESPACE_PX = CUBE_RIGHT_WHITESPACE_CHARS * CHAR_WIDTH_PX  // ≈67.2px

// Empty lines at top of canvas
CUBE_TOP_WHITESPACE_CHARS = PROJECTION_OFFSET_Y - PROJECTION_SCALE_Y  // 5 lines
CUBE_TOP_WHITESPACE_PX = 5 * 16 = 80px
```

---

## Geometry Definition

### Cube Vertices

Eight vertices define a unit cube centered at origin (coordinates ±1):

```typescript
const CUBE_VERTICES: Point3D[] = [
  { x: -1, y: -1, z: -1 }, // 0: front-bottom-left
  { x: 1, y: -1, z: -1 }, // 1: front-bottom-right
  { x: 1, y: 1, z: -1 }, // 2: front-top-right
  { x: -1, y: 1, z: -1 }, // 3: front-top-left
  { x: -1, y: -1, z: 1 }, // 4: back-bottom-left
  { x: 1, y: -1, z: 1 }, // 5: back-bottom-right
  { x: 1, y: 1, z: 1 }, // 6: back-top-right
  { x: -1, y: 1, z: 1 }, // 7: back-top-left
]
```

**Spatial layout** (looking down -Z axis):

```
    7 ---- 6      (z = +1, back)
   /|     /|
  4 ---- 5 |
  | 3 ---| 2      (z = -1, front)
  |/     |/
  0 ---- 1
```

### Cube Faces

Six faces defined by vertex indices (counterclockwise when viewed from outside), normal vectors, and letters:

```typescript
const CUBE_FACES: CubeFace[] = [
  // Z-axis faces (front/back) - Letter T
  { verts: [4, 5, 6, 7], normal: { x: 0, y: 0, z: 1 }, letter: 'T' }, // +Z (back)
  { verts: [0, 3, 2, 1], normal: { x: 0, y: 0, z: -1 }, letter: 'T' }, // -Z (front)

  // X-axis faces (left/right) - Letter M
  { verts: [0, 4, 7, 3], normal: { x: -1, y: 0, z: 0 }, letter: 'M' }, // -X (left)
  { verts: [1, 2, 6, 5], normal: { x: 1, y: 0, z: 0 }, letter: 'M' }, // +X (right)

  // Y-axis faces (top/bottom) - Letter B
  { verts: [3, 7, 6, 2], normal: { x: 0, y: 1, z: 0 }, letter: 'B' }, // +Y (top)
  { verts: [0, 1, 5, 4], normal: { x: 0, y: -1, z: 0 }, letter: 'B' }, // -Y (bottom)
]
```

**Face-letter mapping**:

- T appears on Z-axis faces (front and back)
- M appears on X-axis faces (left and right)
- B appears on Y-axis faces (top and bottom)

### ASCII Letter Patterns

7×7 character grids where `#` is filled and space is empty:

```typescript
const ASCII_LETTERS = {
  T: [
    '#######',
    '#######',
    '  ###  ',
    '  ###  ',
    '  ###  ',
    '  ###  ',
    '  ###  ',
  ],
  M: [
    '##   ##',
    '### ###',
    '#######',
    '## # ##',
    '##   ##',
    '##   ##',
    '##   ##',
  ],
  B: [
    '###### ',
    '##   ##',
    '##   ##',
    '###### ',
    '##   ##',
    '##   ##',
    '###### ',
  ],
}
```

---

## Math Utilities

### Vector Operations (`math/vector.ts`)

**Normalize** - Scale vector to unit length:

```typescript
function vecNormalize(v: Point3D): Point3D {
  const length = sqrt(v.x² + v.y² + v.z²);
  return { x: v.x/length, y: v.y/length, z: v.z/length };
}
```

**Cross product** - Perpendicular vector:

```typescript
function vecCross(a: Point3D, b: Point3D): Point3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}
```

**Dot product** - Scalar projection:

```typescript
function vecDot(a: Point3D, b: Point3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}
```

### Quaternion Operations (`math/quaternion.ts`)

**Identity** (no rotation):

```typescript
function quatIdentity(): Quaternion {
  return [0, 0, 0, 1]
}
```

**From axis-angle**:

```typescript
function quatFromAxisAngle(axis: Point3D, angle: number): Quaternion {
  const halfAngle = angle / 2
  const sinHalf = sin(halfAngle)
  return [axis.x * sinHalf, axis.y * sinHalf, axis.z * sinHalf, cos(halfAngle)]
}
```

**Multiply** (combine rotations - applies b first, then a):

```typescript
function quatMultiply(a: Quaternion, b: Quaternion): Quaternion {
  const [ax, ay, az, aw] = a
  const [bx, by, bz, bw] = b
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ]
}
```

**Normalize** (maintain unit length):

```typescript
function quatNormalize(q: Quaternion): Quaternion {
  const length = sqrt(q[0]² + q[1]² + q[2]² + q[3]²);
  return [q[0]/length, q[1]/length, q[2]/length, q[3]/length];
}
```

**Rotate point** (apply quaternion rotation to 3D point):

```typescript
function quatRotatePoint(q: Quaternion, point: Point3D): Point3D {
  // Uses formula: q * p * q⁻¹
  // where p is treated as quaternion [p.x, p.y, p.z, 0]
  // and q⁻¹ (inverse) = [-qx, -qy, -qz, qw] for unit quaternions

  const [qx, qy, qz, qw] = q

  // First multiplication: q * p
  const ix = qw * point.x + qy * point.z - qz * point.y
  const iy = qw * point.y + qz * point.x - qx * point.z
  const iz = qw * point.z + qx * point.y - qy * point.x
  const iw = -qx * point.x - qy * point.y - qz * point.z

  // Second multiplication: (q * p) * q⁻¹
  return {
    x: ix * qw - iw * qx - iy * qz + iz * qy,
    y: iy * qw - iw * qy - iz * qx + ix * qz,
    z: iz * qw - iw * qz - ix * qy + iy * qx,
  }
}
```

### Arcball Projection (`math/arcball.ts`)

Maps 2D screen position to 3D point on virtual sphere:

```typescript
function arcballProject(x: number, y: number, radius: number): Point3D {
  const distSq = x * x + y * y
  const radiusSq = radius * radius

  if (distSq <= radiusSq / 2) {
    // Inside sphere: project to sphere surface
    return { x, y, z: sqrt(radiusSq - distSq) }
  } else {
    // Outside sphere: hyperbolic falloff for smooth edges
    return { x, y, z: radiusSq / 2 / sqrt(distSq) }
  }
}
```

---

## Rendering Pipeline

The `renderFrame()` function in `asciiRenderer.ts` executes on every animation frame.

### Step 1: Initialize Buffers

```typescript
const buffer: string[][] = [] // Character output
const zBuffer: number[][] = [] // Depth values

for (let row = 0; row < CANVAS_HEIGHT; row++) {
  buffer.push(new Array(CANVAS_WIDTH).fill(' '))
  zBuffer.push(new Array(CANVAS_WIDTH).fill(-Infinity))
}
```

### Step 2: Transform Vertices

Apply the current orientation quaternion to all cube vertices:

```typescript
const rotatedVertices = CUBE_VERTICES.map((vertex) =>
  quatRotatePoint(orientation, vertex),
)
const projectedVertices = rotatedVertices.map(project)
```

### Step 3: Render Visible Faces

For each face, check if it's front-facing:

```typescript
for (const face of CUBE_FACES) {
  const rotatedNormal = quatRotatePoint(orientation, face.normal)

  // Only render if facing viewer (Z > threshold)
  if (rotatedNormal.z > FACE_VISIBILITY_THRESHOLD) {
    // Draw edges
    // Draw letter
  }
}
```

### Step 4: Draw Edges

Each face has 4 edges. Draw dotted lines between consecutive vertices:

```typescript
function drawSmoothLine(buffer, zBuffer, p1, p2, z) {
  const distance = sqrt((p2.x-p1.x)² + (p2.y-p1.y)²);
  const steps = max(ceil(distance * LINE_SAMPLE_MULTIPLIER), 1);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = round(p1.x + (p2.x - p1.x) * t);
    const y = round(p1.y + (p2.y - p1.y) * t);

    if (inBounds(x, y) && z >= zBuffer[y][x]) {
      buffer[y][x] = ".";
      zBuffer[y][x] = z;
    }
  }
}
```

### Step 5: Draw Letters

Sample the letter pattern and map to face using UV coordinates:

```typescript
function drawLetterOnFace(buffer, zBuffer, face, rotatedVertices) {
  const pattern = ASCII_LETTERS[face.letter]
  const v0 = rotatedVertices[face.verts[0]]
  const v1 = rotatedVertices[face.verts[1]]
  const v3 = rotatedVertices[face.verts[3]]

  for (let sy = 0; sy < LETTER_SAMPLE_RESOLUTION; sy++) {
    for (let sx = 0; sx < LETTER_SAMPLE_RESOLUTION; sx++) {
      // Map sample to letter pattern pixel
      const px = round(
        (sx / (LETTER_SAMPLE_RESOLUTION - 1)) * (letterWidth - 1),
      )
      const py = round(
        (sy / (LETTER_SAMPLE_RESOLUTION - 1)) * (letterHeight - 1),
      )

      if (pattern[py][px] === '#') {
        // Calculate UV coordinates with margin
        const u =
          LETTER_MARGIN + (sx / (LETTER_SAMPLE_RESOLUTION - 1)) * LETTER_SCALE
        const v =
          LETTER_MARGIN + (sy / (LETTER_SAMPLE_RESOLUTION - 1)) * LETTER_SCALE

        // Bilinear interpolation on face
        const worldPos = {
          x: v0.x + (v1.x - v0.x) * u + (v3.x - v0.x) * v,
          y: v0.y + (v1.y - v0.y) * u + (v3.y - v0.y) * v,
          z: v0.z + (v1.z - v0.z) * u + (v3.z - v0.z) * v,
        }

        const projected = project(worldPos)
        const depth = projected.z + LETTER_Z_OFFSET

        if (inBounds(projected.x, projected.y) && depth > zBuffer[y][x]) {
          buffer[y][x] = '#'
          zBuffer[y][x] = depth
        }
      }
    }
  }
}
```

### Step 6: Output String

```typescript
return buffer.map((row) => row.join('')).join('\n')
```

---

## Animation System

### State Machine

The animation has two states:

1. **Showing face**: Cube holds position displaying a letter
2. **Transitioning**: Cube rotates from one letter to the next

```
  ┌──────────────┐     after 0.5s     ┌──────────────┐
  │              │ ─────────────────→ │              │
  │ Showing Face │                    │ Transitioning │
  │   (T/M/B)    │ ←───────────────── │  (via slerp)  │
  │              │    after 1.0s      │              │
  └──────────────┘                    └──────────────┘
```

### Timing Constants

```typescript
const FACE_SHOW_DURATION = 0.5 // Seconds to hold on each letter
const TRANSITION_DURATION = 1.0 // Seconds to rotate between letters
```

### Letter Sequence

Cycles through: T → M → B → T → M → B → ...

Each letter has two possible face orientations (opposite faces show same letter):

```typescript
const FACE_ORIENTATIONS = {
  T: [
    [0, 0, 1, 0], // Front face (+Z): Rz(180°)
    [-S, S, 0, 0], // Back face (-Z): Rz(90°) * Ry(180°)
  ],
  M: [
    [0.5, -0.5, 0.5, 0.5], // Right face (+X): Rz(90°) * Ry(-90°)
    [-S, 0, S, 0], // Left face (-X): Rz(180°) * Ry(90°)
  ],
  B: [
    [0.5, 0.5, 0.5, 0.5], // Top face (+Y): Rz(90°) * Rx(90°)
    [-S, 0, 0, S], // Bottom face (-Y): Rx(-90°)
  ],
}
// S = √2/2 ≈ 0.7071067811865476
```

### Spherical Linear Interpolation (Slerp)

Smoothly interpolates between quaternions along the shortest arc:

```typescript
function quatSlerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]

  // Take shorter path if dot < 0
  const b2 = dot < 0 ? [-b[0], -b[1], -b[2], -b[3]] : [...b]
  dot = abs(dot)

  // Near-parallel: use linear interpolation
  if (dot > 0.9995) {
    return quatNormalize([
      a[0] + t * (b2[0] - a[0]),
      a[1] + t * (b2[1] - a[1]),
      a[2] + t * (b2[2] - a[2]),
      a[3] + t * (b2[3] - a[3]),
    ])
  }

  // Standard slerp
  const theta = acos(dot)
  const sinTheta = sin(theta)
  const wa = sin((1 - t) * theta) / sinTheta
  const wb = sin(t * theta) / sinTheta

  return quatNormalize([
    wa * a[0] + wb * b2[0],
    wa * a[1] + wb * b2[1],
    wa * a[2] + wb * b2[2],
    wa * a[3] + wb * b2[3],
  ])
}
```

### Smoothstep Easing

Applied to transition progress for ease-in-out:

```typescript
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}
```

### Animation Loop

```typescript
useEffect(() => {
  let currentLetterIndex = 0
  let isShowingFace = true
  let faceShowStart = 0
  let transitionStart = 0
  let transitionFrom: Quaternion

  const animate = (timestamp: number) => {
    const currentTime = timestamp / 1000

    if (!isDragging) {
      if (isShowingFace) {
        // Hold exact orientation
        orientation =
          FACE_ORIENTATIONS[LETTER_SEQUENCE[currentLetterIndex]][faceIndex]

        if (currentTime - faceShowStart > FACE_SHOW_DURATION) {
          // Start transition
          isShowingFace = false
          transitionStart = currentTime
          transitionFrom = orientation
          targetLetterIndex = (currentLetterIndex + 1) % 3
          targetFaceIndex = random(0, 1)
        }
      } else {
        // Interpolate to next face
        const progress = min(
          (currentTime - transitionStart) / TRANSITION_DURATION,
          1,
        )
        const eased = smoothstep(progress)

        orientation = quatSlerp(
          transitionFrom,
          FACE_ORIENTATIONS[LETTER_SEQUENCE[targetLetterIndex]][
            targetFaceIndex
          ],
          eased,
        )

        if (progress >= 1) {
          isShowingFace = true
          faceShowStart = currentTime
          currentLetterIndex = targetLetterIndex
        }
      }
    }

    setFrame(renderFrame(orientation))
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}, [])
```

---

## User Interaction

### Mouse Events

```typescript
const handleMouseDown = (e: React.MouseEvent) => {
  isDragging = true
  dragStartPoint = getArcballPoint(e.clientX, e.clientY)
  dragStartOrientation = [...orientation]
  e.preventDefault()
}

const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDragging) return

  const currentPoint = getArcballPoint(e.clientX, e.clientY)
  const rotation = computeArcballRotation(dragStartPoint, currentPoint)
  orientation = quatNormalize(quatMultiply(rotation, dragStartOrientation))
}

const handleMouseUp = () => {
  isDragging = false
  dragEnded = true // Triggers smooth transition to next letter
}
```

### Touch Events

Touch events require `{ passive: false }` to call `preventDefault()`:

```typescript
useEffect(() => {
  const container = containerRef.current

  const handleTouchStart = (e: TouchEvent) => {
    isDragging = true
    const touch = e.touches[0]
    dragStartPoint = getArcballPoint(touch.clientX, touch.clientY)
    dragStartOrientation = [...orientation]
    e.preventDefault() // Prevent scrolling
  }

  // Similar for touchmove, touchend

  container.addEventListener('touchstart', handleTouchStart, { passive: false })
  // ...
}, [])
```

### Arcball Point Projection

Converts screen coordinates to sphere point:

```typescript
const getArcballPoint = (clientX: number, clientY: number): Point3D => {
  const rect = container.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  // Normalize to [-1, 1] range, Y inverted
  const normalizedX = (clientX - centerX) / ARCBALL_RADIUS_PX
  const normalizedY = -(clientY - centerY) / ARCBALL_RADIUS_PX

  return vecNormalize(arcballProject(normalizedX, normalizedY, 1))
}
```

### Computing Rotation

```typescript
const computeArcballRotation = (from: Point3D, to: Point3D): Quaternion => {
  const axis = vecCross(from, to);
  const axisLength = sqrt(axis.x² + axis.y² + axis.z²);

  if (axisLength < 0.0001) return quatIdentity();

  const dotProduct = clamp(vecDot(from, to), -1, 1);
  const angle = acos(dotProduct);

  return quatFromAxisAngle(vecNormalize(axis), angle);
};
```

### Post-Drag Behavior

When drag ends, the cube smoothly transitions to the next letter in sequence:

```typescript
if (dragEnded) {
  dragEnded = false
  isShowingFace = false
  transitionStart = currentTime
  transitionFrom = orientation
  targetLetterIndex = (currentLetterIndex + 1) % 3
  targetFaceIndex = random(0, 1)
}
```

---

## Integration

### React Component

```tsx
export default function AsciiCube() {
  const [frame, setFrame] = useState<string>(() =>
    renderFrame(INITIAL_ORIENTATION),
  )
  const orientationRef = useRef<Quaternion>([...INITIAL_ORIENTATION])
  const containerRef = useRef<HTMLPreElement>(null)

  // ... event handlers and animation loop ...

  return (
    <pre
      ref={containerRef}
      className="select-none cursor-grab active:cursor-grabbing w-fit touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {frame}
    </pre>
  )
}
```

### Required CSS

The component requires a monospace font with known character dimensions:

```css
pre {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  line-height: 16px;
  /* Character width: 9.6px, height: 16px */
}
```

### CSS Classes Used

- `select-none`: Prevents text selection during drag
- `cursor-grab`: Shows grab cursor on hover
- `active:cursor-grabbing`: Shows grabbing cursor during drag
- `w-fit`: Sizes container to content
- `touch-none`: Disables browser touch gestures

### Page Layout Considerations

The cube canvas has whitespace around the visible content. For alignment:

```tsx
// Vertical alignment: offset for empty lines at top
<div className="md:-mt-[92px]">
  <AsciiCube />
</div>

// Horizontal balance: add left padding equal to right whitespace
<div style={{ paddingLeft: `${32 + CUBE_RIGHT_WHITESPACE_PX}px` }}>
```

---

## Customization Guide

### Changing Letters

1. Edit `ASCII_LETTERS` in `cubeData.ts`
2. Update `CUBE_FACES` to assign letters to faces
3. Update `FACE_ORIENTATIONS` in `AsciiCube.tsx` if needed

### Adjusting Size

Modify in `constants.ts`:

```typescript
FACE_HEIGHT_CHARS = 21 // Must be odd for centering
// FACE_WIDTH_CHARS auto-calculates for 1:1 aspect
```

Canvas dimensions auto-scale. Projection settings may need manual tuning.

### Changing Timing

```typescript
const FACE_SHOW_DURATION = 1.0 // Longer pause
const TRANSITION_DURATION = 0.5 // Faster rotation
```

### Different Characters

In `asciiRenderer.ts`:

- Line character: change `"."` in `drawSmoothLine()`
- Fill character: change `"#"` in `drawLetterOnFace()`
- Background: change `" "` in buffer initialization

### Custom Rotation Path

Modify `FACE_ORIENTATIONS` to define different target poses, or add new letters with corresponding quaternions.

---

## Debugging Tips

### Stop Animation

In `AsciiCube.tsx`, set:

```typescript
let isRunning = false // At start of useEffect
```

### Log Orientations

```typescript
console.log(JSON.stringify(orientationRef.current))
```

### Visualize Depth Buffer

```typescript
// In renderFrame, after rendering:
console.log(
  zBuffer
    .map((row) =>
      row.map((z) => (z === -Infinity ? '.' : Math.round(z + 2))).join(''),
    )
    .join('\n'),
)
```

### Check Face Visibility

```typescript
for (const face of CUBE_FACES) {
  const normal = quatRotatePoint(orientation, face.normal)
  console.log(
    face.letter,
    normal.z.toFixed(2),
    normal.z > 0.1 ? 'visible' : 'hidden',
  )
}
```

---

## Performance Notes

- Rendering runs at 60fps via `requestAnimationFrame`
- Each frame iterates ~3,200 samples for letters (40×40×2 faces max)
- Z-buffer prevents overdraw in depth-complex regions
- State stored in refs to avoid React re-render cycles
- Only `setFrame()` triggers React updates

---

## Mathematical Reference

### Quaternion from Euler Angles

```
Rx(θ) = [sin(θ/2), 0, 0, cos(θ/2)]
Ry(θ) = [0, sin(θ/2), 0, cos(θ/2)]
Rz(θ) = [0, 0, sin(θ/2), cos(θ/2)]
```

### Common Rotations

| Rotation | Quaternion [x, y, z, w] |
| -------- | ----------------------- |
| Identity | [0, 0, 0, 1]            |
| Rz(180°) | [0, 0, 1, 0]            |
| Rx(90°)  | [√2/2, 0, 0, √2/2]      |
| Ry(90°)  | [0, √2/2, 0, √2/2]      |
| Rz(90°)  | [0, 0, √2/2, √2/2]      |

### Face Orientation Derivations

**T on +Z face** (facing viewer, letter upright):

- Need letter right-side up → Rz(180°) to flip
- `[0, 0, 1, 0]`

**M on +X face** (right side of cube):

- Rotate cube -90° around Y to bring +X forward
- Then rotate around Z for letter orientation
- Rz(90°) × Ry(-90°) = `[0.5, -0.5, 0.5, 0.5]`

**B on +Y face** (top of cube):

- Rotate cube -90° around X to bring +Y forward
- Then rotate around Z for letter orientation
- Rz(90°) × Rx(90°) = `[0.5, 0.5, 0.5, 0.5]`
