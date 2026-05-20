/**
 * buildNamePlate.ts
 * 
 * Physical 3D nameplates for each module in the simulation.
 * Replaces old sprite-based labels with canvas-based plates featuring:
 * - Canvas texture with gradient, border, and text
 * - Auto-chosen accent color per module type
 * - Positioned on the front face of each module
 * - Attached to moduleGroup — moves with the box
 */

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ProcessStep {
  id: string;
  name: string;
  short: string;
  type: string;
  color: number;
  x: number;
  z: number;
  temp?: number | null;
  time?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convert hex color to CSS string
 */
function hex2css(h: number): string {
  return `#${h.toString(16).padStart(6, '0')}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAMEPLATE CONSTRUCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Helper: rounded rect on canvas
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Attaches a nameplate to a module group
 */
function _attachNamePlate(grp: THREE.Group, step: ProcessStep): void {
  // ── Measure the module's bounding box in WORLD space ──
  const box = new THREE.Box3().setFromObject(grp);
  const size = new THREE.Vector3();
  box.getSize(size);
  
  // ── If box is degenerate (GLB not loaded yet), use fallback size ──
  const W = Math.max(size.x, 1.8);
  const H = Math.max(size.y, 1.2);
  const D = Math.max(size.z, 1.8);
  
  // ── Canvas texture ──
  const CW = 256, CH = 64;
  const canvas  = document.createElement('canvas');
  canvas.width  = CW;
  canvas.height = CH;
  const ctx = canvas.getContext('2d')!;
  
  // Background pill
  ctx.clearRect(0, 0, CW, CH);
  ctx.fillStyle = 'rgba(8, 16, 32, 0.92)';
  roundRect(ctx, 0, 0, CW, CH, 10);
  ctx.fill();
  
  // Accent left bar — use step's color directly
  ctx.fillStyle = hex2css(step.color);
  ctx.fillRect(0, 0, 6, CH);
  
  // Step ID
  ctx.fillStyle = 'rgba(120,180,255,0.55)';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(String(step.id).padStart(2, '0').toUpperCase(), 14, 20);
  
  // Short name — big, centered vertically
  ctx.fillStyle = '#e8f4ff';
  ctx.font      = 'bold 22px sans-serif';
  ctx.fillText(step.short ?? step.name.slice(0, 10), 14, 46);
  
  // Temp badge
  if (step.temp != null) {
    ctx.fillStyle = step.temp > 80 ? '#ff5522' : '#0088ff';
    ctx.font      = 'bold 13px monospace';
    ctx.fillText(`${step.temp}°C`, CW - 54, 46);
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map:         tex,
    transparent: true,
    depthWrite:  false,
    side:        THREE.DoubleSide,
  });
  
  // ── Plate geometry — stands vertically on the FRONT face ──
  const plateW = Math.min(W * 0.88, 2.2);
  const plateH = plateW * (CH / CW);          // keep aspect ratio
  const geo    = new THREE.PlaneGeometry(plateW, plateH);
  const plate  = new THREE.Mesh(geo, mat);
  plate.name   = '__nameplate__';
  
  // ── Position: ON THE SIDE of the box for better visibility ──
  // Get world space coordinates from bounding box
  const worldCenterX = box.min.x;  // Left side of the box
  const worldCenterY = (box.min.y + box.max.y) / 2;  // Vertical center
  const worldCenterZ = (box.min.z + box.max.z) / 2;  // Depth center
  
  // Convert to local coordinates relative to the group
  const localX = worldCenterX - grp.position.x - 0.08;  // slightly outside left face
  const localY = worldCenterY - grp.position.y;
  const localZ = worldCenterZ - grp.position.z;
  
  plate.position.set(localX, localY, localZ);
  
  // Rotate 90 degrees to face outward from the side
  plate.rotation.set(0, Math.PI / 2, 0);
  
  grp.add(plate);
}

/**
 * Attaches nameplates to all modules
 */
export function attachAllNamePlates(
  modObjs: Record<string, THREE.Group>,
  allSteps: ProcessStep[]
): void {
  allSteps.forEach((step) => {
    const grp = modObjs[step.id];
    if (!grp) return;
    
    // Remove any existing nameplate first
    const old = grp.getObjectByName('__nameplate__');
    if (old) grp.remove(old);
    
    _attachNamePlate(grp, step);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISIBILITY TOGGLE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Toggles nameplate visibility
 */
export function toggleNamePlates(
  modObjs: Record<string, THREE.Group>,
  visible: boolean
): void {
  Object.values(modObjs).forEach((grp) => {
    const plate = grp.getObjectByName('__nameplate__');
    if (plate) plate.visible = visible;
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// LED ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Animates LED indicators based on module activity
 */
export function tickNamePlateLEDs(
  modObjs: Record<string, THREE.Group>,
  busyMap: Record<string, number>,
  simTime: number
): void {
  Object.entries(modObjs).forEach(([id, grp]) => {
    const plate = grp.getObjectByName('__nameplate__') as THREE.Mesh | undefined;
    if (!plate) return;
    const mat = plate.material as THREE.MeshBasicMaterial;
    const isActive = busyMap[id] !== undefined;
    
    // Pulse opacity and add glow when module is active
    if (isActive) {
      const pulse = 0.5 + 0.5 * Math.sin(simTime * 8);
      mat.opacity = 0.85 + 0.15 * pulse;
      // Scale the plate slightly when active for emphasis
      plate.scale.setScalar(1.0 + pulse * 0.05);
    } else {
      mat.opacity = 0.75;
      plate.scale.setScalar(1.0);
    }
  });
}
