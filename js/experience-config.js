export const INTRO_TIMING = Object.freeze([
  [0, 'BLACK'], [400, 'BOOT'], [1100, 'INITIALIZE'], [2200, 'RESET'],
  [2450, 'BRAND'], [3150, 'LOADING'], [4350, 'VERIFY'],
  [4900, 'AUTHENTICATING'], [6650, 'VERIFIED'], [7100, 'CHECK'],
  [7750, 'LANDING'], [8500, 'COMPLETE']
]);
export const LANDING_TRANSITION = { duration: 950, reducedDuration: 100, returnDuration: 450 };
// CSS tokens also drive the WebGL backdrop, keeping the shell and terrain continuous.
export const LANDING_PALETTE = { backgroundVariable: '--viewer-bg', contourVariable: '--muted' };
export const AIRCRAFT_CONFIG = {
  model: '../reference/CP1_2024.glb',
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: -3 * Math.PI / 180 }, // Nose is -X: negative Z raises it.
  scale: 3,
  propeller: { node: 'Propellor 28in-1', radiansPerSecond: 8 },
  camera: { fov: 34, position: { x: -12, y: 7, z: 14 }, target: { x: 0, y: 0, z: 0 } },
  framing: { horizontal: 0.78, vertical: 0.65, centerX: 0.08, centerY: -0.01 },
  // Keep opacity at 1 for clean hidden-line occlusion; brightness controls body presence.
  surface: { color: 0x191d22, brightness: 3.35, opacity: 1, roughness: 1, metalness: 0, lightContribution: 0.28 },
  // Threshold is the minimum crease angle in degrees; silhouettes remain visible below it.
  edges: { color: 0xf0f1ed, brightness: 0.85, silhouetteOpacity: 0.48, internalOpacity: 0.16, threshold: 28 },
  lighting: { keyIntensity: 2.8, fillIntensity: 1.55 },
  idle: { yaw: 0.045, pitch: 0.022, bank: 0.035, vertical: 0.09, lateral: 0.14, longitudinal: 0.12, period: 12500, fps: 60 },
  interaction: { maxYaw: 0.35, maxTilt: 0.14, sensitivity: 0.0035,
    stiffness: 95, damping: 18, maxVelocity: 1.4, releaseMomentum: 0.07, deadzone: 1.5,
    idleTimeout: 500, returnDuration: 1200, dismissReturnDuration: 260 },
  pixelRatio: 1.5
};

// Immutable periodic heightfield; rigid translation keeps contours attached to the surface.
export const TERRAIN_CONFIG = {
  size: 64, segments: 256, lowSegments: 160, elevation: -8.2,
  heightScale: 14, valleyScale: 0.22, roughness: 0.58, cycles: 5, warp: 0.75,
  forwardSpeed: 0.52, direction: { x: 1, z: 0 }, // GLB nose is -X; terrain features travel aft (+X).
  contourDensity: 3.2, contourOpacity: 0.28, lineWidth: 1.15, aliasFade: [0.35, 0.85],
  fogNear: 24, fogFar: 55
};
