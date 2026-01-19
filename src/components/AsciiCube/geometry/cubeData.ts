/**
 * Cube geometry data: vertices, edges, faces, and ASCII letter patterns.
 */

import type { Point3D, CubeFace } from "../types";

/**
 * The 8 vertices of a unit cube centered at origin.
 * Indexed 0-7 for use by edges and faces.
 *
 * Vertex layout (looking down -Z axis):
 *
 *     7 ---- 6      (z = 1, top)
 *    /|     /|
 *   4 ---- 5 |
 *   | 3 ---| 2      (z = -1, bottom)
 *   |/     |/
 *   0 ---- 1
 */
export const CUBE_VERTICES: Point3D[] = [
  { x: -1, y: -1, z: -1 }, // 0: front-bottom-left
  { x: 1, y: -1, z: -1 }, // 1: front-bottom-right
  { x: 1, y: 1, z: -1 }, // 2: front-top-right
  { x: -1, y: 1, z: -1 }, // 3: front-top-left
  { x: -1, y: -1, z: 1 }, // 4: back-bottom-left
  { x: 1, y: -1, z: 1 }, // 5: back-bottom-right
  { x: 1, y: 1, z: 1 }, // 6: back-top-right
  { x: -1, y: 1, z: 1 }, // 7: back-top-left
];

/**
 * The 6 faces of the cube with vertex indices, normals, and display letters.
 * Opposite faces share the same letter (T, M, or B).
 * Vertex order is counterclockwise when viewed from outside the cube.
 */
export const CUBE_FACES: CubeFace[] = [
  // Front/Back faces (Z axis) - Letter T
  { verts: [4, 5, 6, 7], normal: { x: 0, y: 0, z: 1 }, letter: "T" },
  { verts: [0, 3, 2, 1], normal: { x: 0, y: 0, z: -1 }, letter: "T" },
  // Left/Right faces (X axis) - Letter M
  { verts: [0, 4, 7, 3], normal: { x: -1, y: 0, z: 0 }, letter: "M" },
  { verts: [1, 2, 6, 5], normal: { x: 1, y: 0, z: 0 }, letter: "M" },
  // Top/Bottom faces (Y axis) - Letter B
  { verts: [3, 7, 6, 2], normal: { x: 0, y: 1, z: 0 }, letter: "B" },
  { verts: [0, 1, 5, 4], normal: { x: 0, y: -1, z: 0 }, letter: "B" },
];

/**
 * ASCII art letter patterns for face textures.
 * Each letter is a 7x7 grid where '#' represents a filled pixel.
 */
export const ASCII_LETTERS: Record<string, string[]> = {
  T: [
    "#######",
    "#######",
    "  ###  ",
    "  ###  ",
    "  ###  ",
    "  ###  ",
    "  ###  ",
  ],
  M: [
    "##   ##",
    "### ###",
    "#######",
    "## # ##",
    "##   ##",
    "##   ##",
    "##   ##",
  ],
  B: [
    "###### ",
    "##   ##",
    "##   ##",
    "###### ",
    "##   ##",
    "##   ##",
    "###### ",
  ],
};
