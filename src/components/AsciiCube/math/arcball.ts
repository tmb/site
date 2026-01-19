/**
 * Arcball rotation utilities.
 *
 * The arcball is a virtual sphere for intuitive 3D rotation via mouse/touch.
 * When the user drags, the 2D mouse position is projected onto a sphere,
 * and the rotation between start and current points determines the object rotation.
 *
 * Reference: https://www.khronos.org/opengl/wiki/Object_Mouse_Trackball
 */

import type { Point3D } from "../types";

/**
 * Projects a 2D screen point onto the arcball sphere.
 *
 * For points inside the sphere's projection, maps directly to the sphere surface.
 * For points outside, uses a hyperbolic falloff for smooth behavior at edges.
 *
 * @param x - Normalized x coordinate (centered, scaled by radius)
 * @param y - Normalized y coordinate (centered, scaled by radius)
 * @param radius - The virtual sphere radius (in normalized units)
 * @returns A 3D point on or near the sphere surface
 */
export function arcballProject(x: number, y: number, radius: number): Point3D {
  const distanceSquared = x * x + y * y;
  const radiusSquared = radius * radius;

  if (distanceSquared <= radiusSquared / 2) {
    // Inside sphere: project directly to sphere surface
    // z = sqrt(r² - x² - y²)
    return {
      x,
      y,
      z: Math.sqrt(radiusSquared - distanceSquared),
    };
  } else {
    // Outside sphere: use hyperbolic sheet for smooth falloff
    // This prevents discontinuities when dragging past the sphere edge
    return {
      x,
      y,
      z: (radiusSquared / 2) / Math.sqrt(distanceSquared),
    };
  }
}
