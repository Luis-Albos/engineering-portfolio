export const LANDING_TRANSITION = { duration: 950, reducedDuration: 100, returnDuration: 450 };
// The landing scene reads its own light palette without recoloring the viewer.
export const LANDING_PALETTE = { backgroundVariable: '--landing-bg', contourVariable: '--landing-contour' };
export const AIRCRAFT_CONFIG = {
  model: '../reference/CP1_2024.glb',
  position: { x: 0, y: 1.3, z: 0 },
  rotation: { x: 0, y: 0, z: -3 * Math.PI / 180 }, // Nose is -X: negative Z raises it.
  scale: 3,
  propeller: { node: 'Propellor 28in-1', radiansPerSecond: 8 },
  camera: { fov: 34, position: { x: -12, y: 10, z: 14 }, target: { x: 0, y: 0, z: 0 } },
  framing: { horizontal: 0.68, vertical: 0.61, centerX: 0.17, centerY: -0.055 },
  // A paper-colored opaque fill hides rear edges and terrain through the model.
  surface: { color: 0xfefdfa, opacity: 1 },
  // Dark silhouette and crease lines carry the sketch without shaded surfaces.
  edges: { color: 0x24282c, brightness: 1, silhouetteOpacity: 0.86, internalOpacity: 0.31, threshold: 28 },
  idle: { yaw: 0.045, pitch: 0.022, bank: 0.035, vertical: 0.09, lateral: 0.14, longitudinal: 0.12, period: 12500, fps: 60 },
  interaction: { maxYaw: 0.35, maxTilt: 0.14, sensitivity: 0.0035,
    stiffness: 95, damping: 18, maxVelocity: 1.4, releaseMomentum: 0.07, deadzone: 1.5,
    idleTimeout: 500, returnDuration: 1200, dismissReturnDuration: 260 },
  pixelRatio: 1.5
};

// Immutable periodic heightfield; rigid translation keeps contours attached to the surface.
export const TERRAIN_CONFIG = {
  size: 64, segments: 256, lowSegments: 160, elevation: -10.5,
  heightScale: 14, valleyScale: 0.12, roughness: 0.72, cycles: 5, warp: 0.45,
  forwardSpeed: 0.28, direction: { x: 1, z: 0 }, // GLB nose is -X; terrain features travel aft (+X).
  contourDensity: 9.5, contourOpacity: 0.17, lineWidth: 0.85, aliasFade: [0.35, 0.85],
  fogNear: 27, fogFar: 66
};
