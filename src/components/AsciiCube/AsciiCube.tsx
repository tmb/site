"use client";

/**
 * AsciiCube - An interactive 3D ASCII art cube.
 *
 * Features:
 * - Smooth arcball rotation via mouse/touch drag
 * - Auto-rotation when not being interacted with
 * - Letters (T, M, B) displayed on cube faces
 * - Dotted line edges with anti-aliasing
 */

import { useEffect, useRef, useState } from "react";

import type { Point3D, Quaternion } from "./types";
import {
  quatIdentity,
  quatFromAxisAngle,
  quatMultiply,
  quatNormalize,
} from "./math/quaternion";
import { vecNormalize, vecCross, vecDot } from "./math/vector";
import { arcballProject } from "./math/arcball";
import { renderFrame } from "./rendering/asciiRenderer";
import { ARCBALL_RADIUS_PX } from "./constants";

/**
 * Initial orientation showing T face right-side up.
 * Matches FACE_ORIENTATIONS.T[0] = Rz(180°)
 */
const INITIAL_ORIENTATION: Quaternion = [0, 0, 1, 0];

/**
 * Smooth interpolation (ease in-out).
 */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Pre-computed orientations for each letter.
 * All quaternions are mathematically exact values - no runtime trig or multiplication.
 * Quaternion format: [x, y, z, w]
 *
 * S = √2/2 ≈ 0.7071067811865476
 */
const S = Math.SQRT1_2;

const FACE_ORIENTATIONS: Record<string, Quaternion[]> = {
  T: [
    // z+ (front): Rz(180°) = [0, 0, 1, 0]
    [0, 0, 1, 0],
    // z- (back): Rz(90°) * Ry(180°) = [-S, S, 0, 0]
    [-S, S, 0, 0],
  ],
  M: [
    // x+ (right): Rz(90°) * Ry(-90°) = [0.5, -0.5, 0.5, 0.5]
    [0.5, -0.5, 0.5, 0.5],
    // x- (left): Rz(180°) * Ry(90°) = [-S, 0, S, 0]
    [-S, 0, S, 0],
  ],
  B: [
    // y+ (top): Rz(90°) * Rx(90°) = [0.5, 0.5, 0.5, 0.5]
    [0.5, 0.5, 0.5, 0.5],
    // y- (bottom): Rx(-90°) = [-S, 0, 0, S]
    [-S, 0, 0, S],
  ],
};

const LETTER_SEQUENCE = ["T", "M", "B"] as const;

/**
 * Spherical linear interpolation between quaternions.
 */
function quatSlerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];

  // If dot is negative, negate one quaternion to take shorter path
  const b2: Quaternion = dot < 0 ? [-b[0], -b[1], -b[2], -b[3]] : [...b];
  dot = Math.abs(dot);

  // If very close, use linear interpolation
  if (dot > 0.9995) {
    return quatNormalize([
      a[0] + t * (b2[0] - a[0]),
      a[1] + t * (b2[1] - a[1]),
      a[2] + t * (b2[2] - a[2]),
      a[3] + t * (b2[3] - a[3]),
    ]);
  }

  const theta = Math.acos(dot);
  const sinTheta = Math.sin(theta);
  const wa = Math.sin((1 - t) * theta) / sinTheta;
  const wb = Math.sin(t * theta) / sinTheta;

  return quatNormalize([
    wa * a[0] + wb * b2[0],
    wa * a[1] + wb * b2[1],
    wa * a[2] + wb * b2[2],
    wa * a[3] + wb * b2[3],
  ]);
}

export default function AsciiCube() {
  const [frame, setFrame] = useState<string>(() =>
    renderFrame(INITIAL_ORIENTATION)
  );

  // Animation and interaction state refs
  const orientationRef = useRef<Quaternion>([...INITIAL_ORIENTATION]);
  const animationFrameRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLPreElement>(null);

  // Arcball drag state
  const dragStartPointRef = useRef<Point3D>({ x: 0, y: 0, z: 1 });
  const dragStartOrientationRef = useRef<Quaternion>([...INITIAL_ORIENTATION]);

  /**
   * Projects a screen position to a point on the arcball sphere.
   */
  const getArcballPoint = (clientX: number, clientY: number): Point3D => {
    if (!containerRef.current) return { x: 0, y: 0, z: 1 };

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Map to normalized arcball coordinates (centered, y-inverted)
    const normalizedX = (clientX - centerX) / ARCBALL_RADIUS_PX;
    const normalizedY = -(clientY - centerY) / ARCBALL_RADIUS_PX;

    return vecNormalize(arcballProject(normalizedX, normalizedY, 1));
  };

  /**
   * Computes the rotation quaternion between two arcball points.
   */
  const computeArcballRotation = (from: Point3D, to: Point3D): Quaternion => {
    const axis = vecCross(from, to);
    const axisLength = Math.sqrt(
      axis.x * axis.x + axis.y * axis.y + axis.z * axis.z
    );

    // Return identity if points are too close (avoid division by zero)
    if (axisLength < 0.0001) {
      return quatIdentity();
    }

    // Clamp dot product to valid acos range
    const dotProduct = Math.max(-1, Math.min(1, vecDot(from, to)));
    const angle = Math.acos(dotProduct);

    return quatFromAxisAngle(vecNormalize(axis), angle);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartPointRef.current = getArcballPoint(e.clientX, e.clientY);
    dragStartOrientationRef.current = [...orientationRef.current];
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;

    const currentPoint = getArcballPoint(e.clientX, e.clientY);
    const rotation = computeArcballRotation(
      dragStartPointRef.current,
      currentPoint
    );
    orientationRef.current = quatNormalize(
      quatMultiply(rotation, dragStartOrientationRef.current)
    );
  };

  // Track when drag ends to trigger smooth transition back
  const dragEndedRef = useRef(false);

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      dragEndedRef.current = true;
    }
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      dragEndedRef.current = true;
    }
  };

  // Touch event listeners - attached via useEffect with { passive: false } to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      isDraggingRef.current = true;
      const touch = e.touches[0];
      dragStartPointRef.current = getArcballPoint(touch.clientX, touch.clientY);
      dragStartOrientationRef.current = [...orientationRef.current];
      e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();

      const touch = e.touches[0];
      const currentPoint = getArcballPoint(touch.clientX, touch.clientY);
      const rotation = computeArcballRotation(
        dragStartPointRef.current,
        currentPoint
      );
      orientationRef.current = quatNormalize(
        quatMultiply(rotation, dragStartOrientationRef.current)
      );
    };

    const handleTouchEnd = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        dragEndedRef.current = true;
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    let isRunning = true;
    let startTimestamp: number | null = null;

    // Animation state
    let currentLetterIndex = 0;
    let currentFaceIndex = 0;
    let isShowingFace = true;
    let faceShowStart = 0;
    let transitionStart = 0;
    let transitionFromOrientation: Quaternion = [
      ...FACE_ORIENTATIONS[LETTER_SEQUENCE[0]][0],
    ];
    let targetLetterIndex = 0;
    let targetFaceIndex = 0;

    // Timing constants (in seconds)
    const FACE_SHOW_DURATION = 0.5; // How long to pause on each face
    const TRANSITION_DURATION = 1.0; // How long to transition between faces

    const animate = (timestamp: number) => {
      if (!isRunning) return;

      // Initialize start time
      if (startTimestamp === null) {
        startTimestamp = timestamp;
        faceShowStart = timestamp / 1000;
        // Use exact pre-computed quaternion
        orientationRef.current =
          FACE_ORIENTATIONS[LETTER_SEQUENCE[currentLetterIndex]][
            currentFaceIndex
          ];
      }

      // Apply animation when not dragging
      if (!isDraggingRef.current) {
        const currentTime = timestamp / 1000;

        // Handle transition back from drag
        if (dragEndedRef.current) {
          dragEndedRef.current = false;
          isShowingFace = false;
          transitionStart = currentTime;
          transitionFromOrientation = [...orientationRef.current];
          // Move to next letter in sequence (T → M → B → T → ...)
          targetLetterIndex =
            (currentLetterIndex + 1) % LETTER_SEQUENCE.length;
          // Randomly select one of the two faces showing this letter
          const faces = FACE_ORIENTATIONS[LETTER_SEQUENCE[targetLetterIndex]];
          targetFaceIndex = Math.floor(Math.random() * faces.length);
        }

        if (isShowingFace) {
          // Show face with exact pre-computed quaternion
          orientationRef.current =
            FACE_ORIENTATIONS[LETTER_SEQUENCE[currentLetterIndex]][
              currentFaceIndex
            ];

          // Check if it's time to transition to next face
          if (currentTime - faceShowStart > FACE_SHOW_DURATION) {
            isShowingFace = false;
            transitionStart = currentTime;
            transitionFromOrientation = [
              ...FACE_ORIENTATIONS[LETTER_SEQUENCE[currentLetterIndex]][
                currentFaceIndex
              ],
            ];
            // Move to next letter in sequence (T → M → B → T → ...)
            targetLetterIndex =
              (currentLetterIndex + 1) % LETTER_SEQUENCE.length;
            // Randomly select one of the two faces showing this letter
            const faces = FACE_ORIENTATIONS[LETTER_SEQUENCE[targetLetterIndex]];
            targetFaceIndex = Math.floor(Math.random() * faces.length);
          }
        } else {
          // Smooth transition between faces
          const elapsed = currentTime - transitionStart;
          const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
          const easedProgress = smoothstep(progress);

          // Slerp to next face
          const targetOrientation =
            FACE_ORIENTATIONS[LETTER_SEQUENCE[targetLetterIndex]][
              targetFaceIndex
            ];
          orientationRef.current = quatSlerp(
            transitionFromOrientation,
            targetOrientation,
            easedProgress
          );

          // Check if transition is complete
          if (progress >= 1) {
            isShowingFace = true;
            faceShowStart = currentTime;
            currentLetterIndex = targetLetterIndex;
            currentFaceIndex = targetFaceIndex;
            // Snap to exact orientation
            orientationRef.current =
              FACE_ORIENTATIONS[LETTER_SEQUENCE[currentLetterIndex]][
                currentFaceIndex
              ];
          }
        }
      }

      setFrame(renderFrame(orientationRef.current));
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

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
  );
}
