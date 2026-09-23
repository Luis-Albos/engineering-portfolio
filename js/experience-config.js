export const INTRO_TIMING = Object.freeze([
  [0, 'BLACK'], [400, 'BOOT'], [1100, 'INITIALIZE'], [2200, 'RESET'],
  [2450, 'BRAND'], [3150, 'LOADING'], [4350, 'VERIFY'],
  [4900, 'AUTHENTICATING'], [6650, 'VERIFIED'], [7100, 'CHECK'],
  [7750, 'LANDING'], [8500, 'COMPLETE']
]);
export const LANDING_TRANSITION = { duration: 950, reducedDuration: 100, returnDuration: 450 };
export const WYVERN_CONFIG = {
  model: '../assets/landing/x02s.mesh',
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1,
  camera: { fov: 34, position: { x: 12, y: 10, z: -14 }, target: { x: 0, y: 0, z: 0 } },
  framing: { horizontal: 0.88, vertical: 0.76, centerX: 0.06, centerY: 0.035 },
  edges: { majorThreshold: 28, secondaryThreshold: 2.5, silhouette: 0.85, major: 0.48, secondary: 0.12 },
  idle: { yaw: 0.012, pitch: 0.006, vertical: 0.018, period: 19000, fps: 24 },
  pixelRatio: 1.5
};
