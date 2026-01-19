/**
 * Type definitions for the ASCII cube component.
 */

/**
 * A point in 3D space.
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * A quaternion represented as [x, y, z, w] where w is the scalar component.
 * Quaternions are used for smooth, gimbal-lock-free 3D rotations.
 */
export type Quaternion = [number, number, number, number];

/**
 * Defines a face of the cube with its vertices, surface normal, and display letter.
 */
export interface CubeFace {
  /** Indices into the vertex array (4 vertices for a quad) */
  verts: number[];
  /** Unit normal vector pointing outward from the face */
  normal: Point3D;
  /** Single character to display on this face */
  letter: string;
}

/**
 * A 2D point with z-depth for rendering (after projection).
 */
export interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
}
