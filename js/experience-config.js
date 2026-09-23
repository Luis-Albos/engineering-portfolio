export const INTRO_TIMING = Object.freeze([
  [0, 'BLACK'], [400, 'BOOT'], [1100, 'INITIALIZE'], [2200, 'RESET'],
  [2450, 'BRAND'], [3150, 'LOADING'], [4350, 'VERIFY'],
  [4900, 'AUTHENTICATING'], [6650, 'VERIFIED'], [7100, 'CHECK'],
  [7750, 'LANDING'], [8500, 'COMPLETE']
]);
export const LANDING_TRANSITION = { duration: 950, reducedDuration: 100, returnDuration: 450 };
// CSS tokens also drive the WebGL backdrop, keeping the shell and terrain continuous.
export const LANDING_PALETTE = { backgroundVariable: '--viewer-bg', contourVariable: '--muted' };
export const WYVERN_CONFIG = {
  model: '../assets/landing/x02s.mesh',
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1,
  camera: { fov: 34, position: { x: 12, y: 10, z: -14 }, target: { x: 0, y: 0, z: 0 } },
  framing: { horizontal: 0.84, vertical: 0.74, centerX: 0.06, centerY: 0.035 },
  edges: { majorThreshold: 28, secondaryThreshold: 14, silhouette: 0.88, major: 0.46, secondary: 0.10 },
  surface: { color: 0x343a40, roughness: 0.96, metalness: 0, normalCrease: 38 },
  lighting: { keyIntensity: 1.8, fillIntensity: 0.8 },
  idle: { yaw: 0.045, pitch: 0.022, bank: 0.035, vertical: 0.09, lateral: 0.14, longitudinal: 0.12, period: 12500, fps: 24 },
  pixelRatio: 1.5
};

// World-space procedural heightfield; motion samples new coordinates, never wraps a tile.
export const TERRAIN_CONFIG = {
  size: 64, segments: 180, lowSegments: 96, elevation: -4.2,
  heightScale: 2.2, roughness: 0.58, frequency: 0.17, warp: 1.6,
  forwardSpeed: 0.52, direction: { x: -1, z: 0 }, // Geometry nose is +X; terrain features travel aft (-X).
  contourDensity: 9.5, contourOpacity: 0.28, lineWidth: 0.85,
  fogNear: 14, fogFar: 40
};
