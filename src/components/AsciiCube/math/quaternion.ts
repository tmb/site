/**
 * Quaternion math utilities for 3D rotation.
 *
 * Quaternions provide a way to represent rotations without gimbal lock
 * and allow for smooth interpolation between orientations.
 *
 * Format: [x, y, z, w] where (x, y, z) is the vector part and w is the scalar.
 */

import type { Point3D, Quaternion } from "../types";

/**
 * Returns the identity quaternion (no rotation).
 */
export function quatIdentity(): Quaternion {
  return [0, 0, 0, 1];
}

/**
 * Creates a quaternion representing rotation around an axis.
 *
 * @param axis - The axis of rotation (will be normalized internally)
 * @param angle - The rotation angle in radians
 * @returns A unit quaternion representing the rotation
 */
export function quatFromAxisAngle(axis: Point3D, angle: number): Quaternion {
  const halfAngle = angle / 2;
  const sinHalf = Math.sin(halfAngle);
  return [
    axis.x * sinHalf,
    axis.y * sinHalf,
    axis.z * sinHalf,
    Math.cos(halfAngle),
  ];
}

/**
 * Multiplies two quaternions (combines rotations).
 * Note: Quaternion multiplication is not commutative.
 * The result represents applying rotation `b` first, then `a`.
 *
 * @param a - First quaternion
 * @param b - Second quaternion
 * @returns The product quaternion a * b
 */
export function quatMultiply(a: Quaternion, b: Quaternion): Quaternion {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;

  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

/**
 * Normalizes a quaternion to unit length.
 * Required periodically to prevent numerical drift.
 *
 * @param q - The quaternion to normalize
 * @returns A unit quaternion with the same rotation
 */
export function quatNormalize(q: Quaternion): Quaternion {
  const [x, y, z, w] = q;
  const length = Math.sqrt(x * x + y * y + z * z + w * w);

  if (length === 0) {
    return quatIdentity();
  }

  return [x / length, y / length, z / length, w / length];
}

/**
 * Rotates a 3D point by a quaternion.
 * Uses the formula: q * p * q^(-1) where p is treated as a quaternion [x, y, z, 0].
 *
 * @param q - Unit quaternion representing the rotation
 * @param point - The point to rotate
 * @returns The rotated point
 */
export function quatRotatePoint(q: Quaternion, point: Point3D): Point3D {
  const [qx, qy, qz, qw] = q;

  // Calculate q * p (treating p as quaternion [p.x, p.y, p.z, 0])
  const intermediateX = qw * point.x + qy * point.z - qz * point.y;
  const intermediateY = qw * point.y + qz * point.x - qx * point.z;
  const intermediateZ = qw * point.z + qx * point.y - qy * point.x;
  const intermediateW = -qx * point.x - qy * point.y - qz * point.z;

  // Calculate result * q^(-1) (conjugate for unit quaternion is [-x, -y, -z, w])
  return {
    x: intermediateX * qw - intermediateW * qx - intermediateY * qz + intermediateZ * qy,
    y: intermediateY * qw - intermediateW * qy - intermediateZ * qx + intermediateX * qz,
    z: intermediateZ * qw - intermediateW * qz - intermediateX * qy + intermediateY * qx,
  };
}
