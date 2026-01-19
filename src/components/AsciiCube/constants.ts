/**
 * Constants for the ASCII cube rendering system.
 * All magic numbers are extracted here with descriptive names.
 */

// =============================================================================
// Character dimensions (fundamental - all layout calculations derive from these)
// =============================================================================
export const CHAR_WIDTH_PX = 9.6;
export const CHAR_HEIGHT_PX = 16;

// =============================================================================
// Cube face dimensions
// =============================================================================
// Face height in characters (odd number for centered letters)
export const FACE_HEIGHT_CHARS = 15;

// Face width calculated for 1:1 pixel aspect ratio:
// width × CHAR_WIDTH_PX = height × CHAR_HEIGHT_PX
// width = 15 × 16 / 9.6 = 25
export const FACE_WIDTH_CHARS = (FACE_HEIGHT_CHARS * CHAR_HEIGHT_PX) / CHAR_WIDTH_PX;

// =============================================================================
// Canvas dimensions (character grid)
// =============================================================================
// Must be large enough for rotated cube: face × √2
export const CANVAS_WIDTH = Math.ceil(FACE_WIDTH_CHARS * Math.SQRT2) + 2;
export const CANVAS_HEIGHT = Math.ceil(FACE_HEIGHT_CHARS * Math.SQRT2) + 2;

// =============================================================================
// Orthographic projection settings
// =============================================================================
// Projection scales = half the face dimensions
export const PROJECTION_SCALE_X = Math.floor(FACE_WIDTH_CHARS / 2);
export const PROJECTION_SCALE_Y = Math.floor(FACE_HEIGHT_CHARS / 2);

// Projection offsets center the cube in the canvas
// X offset has -1 adjustment for proper centering with even canvas width
export const PROJECTION_OFFSET_X = Math.floor(CANVAS_WIDTH / 2) - 1;
export const PROJECTION_OFFSET_Y = Math.floor(CANVAS_HEIGHT / 2);

// Initial cube orientation (radians)
// Provides an aesthetically pleasing starting view
export const INITIAL_TILT_X = 0;
export const INITIAL_TILT_Y = 0;

// Face visibility threshold
// Faces are only rendered if their z-normal exceeds this value
// Prevents rendering back-facing or edge-on faces
export const FACE_VISIBILITY_THRESHOLD = 0.1;

// Letter rendering settings
export const LETTER_SAMPLE_RESOLUTION = 40; // Samples per axis for letter texture mapping
export const LETTER_MARGIN = 0.2; // Inset from face edges (0-1 range)
export const LETTER_SCALE = 0.6; // Scale factor for letter within face

// Z-buffer offset for letters (ensures letters render above edges)
export const LETTER_Z_OFFSET = 1;

// Interaction settings
export const ARCBALL_RADIUS_PX = 150; // Virtual sphere radius for arcball rotation

// Auto-rotation settings
export const AUTO_ROTATE_SPEED = 0; // Radians per frame (set to 0 to stop rotation)
export const AUTO_ROTATE_AXIS = { x: 1, y: 1.3, z: 0 }; // Diagonal axis

// Line rendering settings
export const LINE_SAMPLE_MULTIPLIER = 4; // Samples per unit distance for smooth lines
export const ANTIALIAS_CENTER_THRESHOLD = 0.25; // Distance threshold for heavy vs light char

// =============================================================================
// Layout whitespace calculations (for page alignment)
// =============================================================================
// At head-on view (0° rotation), cube extends PROJECTION_SCALE from center

// Horizontal whitespace: chars from cube right edge to canvas right edge
const CUBE_HEADON_RIGHT_CHAR = PROJECTION_OFFSET_X + PROJECTION_SCALE_X + 1;
export const CUBE_RIGHT_WHITESPACE_CHARS = CANVAS_WIDTH - CUBE_HEADON_RIGHT_CHAR;
export const CUBE_RIGHT_WHITESPACE_PX = CUBE_RIGHT_WHITESPACE_CHARS * CHAR_WIDTH_PX;

// Vertical whitespace: empty lines from canvas top to cube top edge
export const CUBE_TOP_WHITESPACE_CHARS = PROJECTION_OFFSET_Y - PROJECTION_SCALE_Y;
export const CUBE_TOP_WHITESPACE_PX = CUBE_TOP_WHITESPACE_CHARS * CHAR_HEIGHT_PX;
