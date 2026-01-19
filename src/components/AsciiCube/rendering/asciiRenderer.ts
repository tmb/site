/**
 * ASCII rendering engine for the 3D cube.
 *
 * Converts 3D geometry into a 2D character grid using:
 * - Orthographic projection (no perspective distortion)
 * - Z-buffering for proper depth ordering
 * - Anti-aliased line drawing with dotted characters
 * - Texture mapping for letters on faces
 */

import type { Point3D, Quaternion, CubeFace, ProjectedPoint } from "../types";
import { quatRotatePoint } from "../math/quaternion";
import { CUBE_VERTICES, CUBE_FACES, ASCII_LETTERS } from "../geometry/cubeData";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PROJECTION_SCALE_X,
  PROJECTION_SCALE_Y,
  PROJECTION_OFFSET_X,
  PROJECTION_OFFSET_Y,
  FACE_VISIBILITY_THRESHOLD,
  LETTER_SAMPLE_RESOLUTION,
  LETTER_MARGIN,
  LETTER_SCALE,
  LETTER_Z_OFFSET,
  LINE_SAMPLE_MULTIPLIER,
} from "../constants";

/**
 * Projects a 3D point to 2D screen coordinates using orthographic projection.
 * Preserves Z for depth sorting.
 *
 * @param point - The 3D point to project
 * @returns Screen coordinates with depth
 */
function project(point: Point3D): ProjectedPoint {
  return {
    x: point.x * PROJECTION_SCALE_X + PROJECTION_OFFSET_X,
    y: -point.y * PROJECTION_SCALE_Y + PROJECTION_OFFSET_Y, // Y is inverted for screen coords
    z: point.z,
  };
}

/**
 * Draws an anti-aliased line using ASCII characters.
 * Uses ':' for pixels close to line center, '.' for edge pixels.
 *
 * @param buffer - The character buffer to draw into
 * @param zBuffer - The depth buffer for visibility testing
 * @param p1 - Start point (screen coordinates)
 * @param p2 - End point (screen coordinates)
 * @param z - Depth value for z-buffer testing
 */
function drawSmoothLine(
  buffer: string[][],
  zBuffer: number[][],
  p1: ProjectedPoint,
  p2: ProjectedPoint,
  z: number
): void {
  const deltaX = p2.x - p1.x;
  const deltaY = p2.y - p1.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const steps = Math.max(Math.ceil(distance * LINE_SAMPLE_MULTIPLIER), 1);

  // Snap endpoints to integers to avoid floating point artifacts
  const x1 = Math.round(p1.x);
  const y1 = Math.round(p1.y);
  const x2 = Math.round(p2.x);
  const y2 = Math.round(p2.y);
  const snappedDeltaX = x2 - x1;
  const snappedDeltaY = y2 - y1;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const exactX = x1 + snappedDeltaX * t;
    const exactY = y1 + snappedDeltaY * t;
    const pixelX = Math.round(exactX);
    const pixelY = Math.round(exactY);

    if (
      pixelX >= 0 &&
      pixelX < CANVAS_WIDTH &&
      pixelY >= 0 &&
      pixelY < CANVAS_HEIGHT
    ) {
      if (z >= zBuffer[pixelY][pixelX]) {
        // Use consistent dot character for all edge pixels
        buffer[pixelY][pixelX] = ".";
        zBuffer[pixelY][pixelX] = z;
      }
    }
  }
}

/**
 * Draws a letter texture onto a cube face using bilinear sampling.
 *
 * The letter is mapped to the face using UV coordinates:
 * - U runs along the edge from vertex 0 to vertex 1
 * - V runs along the edge from vertex 0 to vertex 3
 *
 * @param buffer - The character buffer to draw into
 * @param zBuffer - The depth buffer for visibility testing
 * @param face - The face definition with vertex indices and letter
 * @param rotatedVertices - The transformed vertex positions
 */
function drawLetterOnFace(
  buffer: string[][],
  zBuffer: number[][],
  face: CubeFace,
  rotatedVertices: Point3D[]
): void {
  const letterPattern = ASCII_LETTERS[face.letter];
  if (!letterPattern) return;

  // Get the three vertices needed for UV mapping
  const v0 = rotatedVertices[face.verts[0]];
  const v1 = rotatedVertices[face.verts[1]];
  const v3 = rotatedVertices[face.verts[3]];

  const letterHeight = letterPattern.length;
  const letterWidth = letterPattern[0].length;

  // Sample the letter pattern at regular intervals
  for (let sampleY = 0; sampleY < LETTER_SAMPLE_RESOLUTION; sampleY++) {
    for (let sampleX = 0; sampleX < LETTER_SAMPLE_RESOLUTION; sampleX++) {
      // Map sample position to letter pixel using endpoint-to-endpoint sampling for symmetry
      const letterPixelX = Math.round(
        (sampleX / (LETTER_SAMPLE_RESOLUTION - 1)) * (letterWidth - 1)
      );
      const letterPixelY = Math.round(
        (sampleY / (LETTER_SAMPLE_RESOLUTION - 1)) * (letterHeight - 1)
      );

      // Only draw if this pixel is filled in the letter pattern
      if (letterPattern[letterPixelY][letterPixelX] === "#") {
        // Calculate UV coordinates with margin inset (endpoint-to-endpoint for full range)
        const textureU =
          LETTER_MARGIN +
          (sampleX / (LETTER_SAMPLE_RESOLUTION - 1)) * LETTER_SCALE;
        const textureV =
          LETTER_MARGIN +
          (sampleY / (LETTER_SAMPLE_RESOLUTION - 1)) * LETTER_SCALE;

        // Interpolate 3D position on the face using UV coordinates
        const worldX =
          v0.x + (v1.x - v0.x) * textureU + (v3.x - v0.x) * textureV;
        const worldY =
          v0.y + (v1.y - v0.y) * textureU + (v3.y - v0.y) * textureV;
        const worldZ =
          v0.z + (v1.z - v0.z) * textureU + (v3.z - v0.z) * textureV;

        // Project to screen coordinates
        const projected = project({ x: worldX, y: worldY, z: worldZ });
        const screenX = Math.round(projected.x);
        const screenY = Math.round(projected.y);

        // Draw if within bounds and passes z-test
        if (
          screenX >= 0 &&
          screenX < CANVAS_WIDTH &&
          screenY >= 0 &&
          screenY < CANVAS_HEIGHT
        ) {
          const letterDepth = projected.z + LETTER_Z_OFFSET; // Letters always on top of edges
          if (letterDepth > zBuffer[screenY][screenX]) {
            buffer[screenY][screenX] = "#";
            zBuffer[screenY][screenX] = letterDepth;
          }
        }
      }
    }
  }
}

/**
 * Renders a complete frame of the ASCII cube.
 *
 * Rendering pipeline:
 * 1. Clear buffers
 * 2. Transform all vertices by the orientation quaternion
 * 3. Draw all edges as dotted lines
 * 4. Draw letters on visible faces (front-facing only)
 * 5. Convert buffer to string
 *
 * @param orientation - The cube's current rotation as a unit quaternion
 * @returns The rendered frame as a multi-line string
 */
export function renderFrame(orientation: Quaternion): string {
  // Initialize character and depth buffers
  const buffer: string[][] = [];
  const zBuffer: number[][] = [];

  for (let row = 0; row < CANVAS_HEIGHT; row++) {
    buffer.push(new Array(CANVAS_WIDTH).fill(" "));
    zBuffer.push(new Array(CANVAS_WIDTH).fill(-Infinity));
  }

  // Transform vertices by current orientation
  const rotatedVertices = CUBE_VERTICES.map((vertex) =>
    quatRotatePoint(orientation, vertex)
  );
  const projectedVertices = rotatedVertices.map(project);

  // Draw edges and letters for visible faces only
  for (const face of CUBE_FACES) {
    const rotatedNormal = quatRotatePoint(orientation, face.normal);

    // Only render if face is sufficiently front-facing
    if (rotatedNormal.z > FACE_VISIBILITY_THRESHOLD) {
      // Draw the 4 edges of this face
      const verts = face.verts;
      for (let i = 0; i < 4; i++) {
        const startIdx = verts[i];
        const endIdx = verts[(i + 1) % 4];
        const averageDepth =
          (projectedVertices[startIdx].z + projectedVertices[endIdx].z) / 2;
        drawSmoothLine(
          buffer,
          zBuffer,
          projectedVertices[startIdx],
          projectedVertices[endIdx],
          averageDepth
        );
      }

      // Draw the letter
      drawLetterOnFace(buffer, zBuffer, face, rotatedVertices);
    }
  }

  // Convert buffer to string
  return buffer.map((row) => row.join("")).join("\n");
}
