export const MAP_SIZE = 88
// Double ground area while preserving world/object coordinates.
export const GROUND_SIZE = MAP_SIZE * 2 * Math.SQRT2
export const PLAYER_RADIUS = 0.45
export const PLAYER_BASE_SPEED = 12
export const REGION_SIZE = 14
export const ACTIVE_REGION_RADIUS = 3

export const CAMERA_FOLLOW_OFFSET = {
  x: 0,
  y: 13,
  z: 11,
} as const
