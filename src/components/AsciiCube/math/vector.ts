/**
 * Vector math utilities for 3D calculations.
 */

import type { Point3D } from "../types";

/**
 * Normalizes a vector to unit length.
 *
 * @param v - The vector to normalize
 * @returns A unit vector in the same direction, or [0, 0, 1] if zero-length
 */
export function vecNormalize(v: Point3D): Point3D {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

  if (length === 0) {
    return { x: 0, y: 0, z: 1 };
  }

  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length,
  };
}

/**
 * Computes the cross product of two vectors.
 * The result is perpendicular to both input vectors.
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns The cross product a × b
 */
export function vecCross(a: Point3D, b: Point3D): Point3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/**
 * Computes the dot product of two vectors.
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns The scalar dot product a · b
 */
export function vecDot(a: Point3D, b: Point3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
