/**
 * buildNamePlate.ts
 * 
 * Physical 3D nameplates for each module in the simulation.
 * Features:
 * - 2× bigger fonts (96px main + 78px subtitle)
 * - 2 lines per station (name + temperature/duration)
 * - All stations have plates (except FOUP + virtual modules)
 * - No unwanted plates near FOUP
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
// NAMEPLATES — 2 lines, fonts 2× bigger, all stations, no FOUP duplicates
// ═══════════════════════════════════════════════════════════════════════════════

// ── Stations to SKIP (no nameplate at all) ──
// FOUP excluded → fixes "unwanted name plates near foup"
// Virtual modules excluded → no plates for spindry / iface_in / iface_out
const SKIP_NAMEPLATE_IDS = new Set([
  'foup',
  'spindry',
  'iface_in',
  'iface_out',
]);

/** Make a 2-line nameplate texture with 2× bigger fonts */
function makeNameplateTexture(line1: string, line2: string): THREE.Texture {
  // ── Canvas size: 2× from typical 512×160 ──
  const W = 1024;
  const H = 320;
  
  const cnv = document.createElement('canvas');
  cnv.width = W;
  cnv.height = H;
  const ctx = cnv.getContext('2d')!;
  
  // Dark background
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, W, H);
  
  // Cyan border (thicker so it reads from distance)
  ctx.strokeStyle = '#33ddff';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, W - 12, H - 12);
  
  // Inner subtle border
  ctx.strokeStyle = '#1a4458';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  
  // ── LINE 1: Module name (BIG — 96px, was ~48px) ──
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 96px "Segoe UI", Arial, sans-serif';
  ctx.fillText(line1.toUpperCase(), W / 2, H * 0.36);
  
  // ── LINE 2: Temp / duration (cyan, 78px) ──
  if (line2) {
    ctx.fillStyle = '#33ddff';
    ctx.font = 'bold 78px "Segoe UI", Arial, sans-serif';
    ctx.fillText(line2, W / 2, H * 0.72);
  }
  
  const tex = new THREE.CanvasTexture(cnv);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Split a module name into 2 lines: name + temperature/duration */
function splitNameForNameplate(mod: ProcessStep): [string, string] {
  const fullName = mod.name || mod.short || mod.id || 'Module';
  
  // Prefer mod.temp if explicit
  if (mod.temp !== undefined && mod.temp !== null) {
    // Strip any "150°C" from the end of name
    const cleanName = fullName.replace(/\s*\d+°?C?\s*$/, '').trim();
    return [cleanName, `${mod.temp}°C`];
  }
  
  // Otherwise try to detect "...150°C" pattern in the name itself
  const tempMatch = fullName.match(/(\d+°?C?)/);
  if (tempMatch) {
    return [fullName.replace(tempMatch[0], '').trim(), tempMatch[1]];
  }
  
  // Fallback: use duration as line 2
  return [fullName, mod.time ? `${mod.time}s` : ''];
}

/** Attach inner+outer nameplates to one module group */
function attachNamePlate(modGrp: THREE.Group, mod: ProcessStep) {
  // Skip excluded stations (FOUP, virtual modules)
  if (SKIP_NAMEPLATE_IDS.has(mod.id)) return;
  
  // ── Remove any existing plates first (prevents duplicates on retry) ──
  const toRemove: THREE.Object3D[] = [];
  modGrp.traverse((obj) => {
    if (obj.name === '__nameplate_inner' || obj.name === '__nameplate_outer') {
      toRemove.push(obj);
    }
  });
  toRemove.forEach((obj) => obj.parent?.remove(obj));
  
  const [line1, line2] = splitNameForNameplate(mod);
  
  // Inner front = side facing the central robot walkway
  // Top row (z<0): inner front is +Z. Bottom row (z>0): inner front is -Z.
  const INNER_Z_SIGN = mod.z < 0 ? +1 : -1;
  const OUTER_Z_SIGN = -INNER_Z_SIGN;
  
  // Find module footprint depth
  modGrp.updateMatrixWorld(true);
  const bbox = new THREE.Box3().setFromObject(modGrp);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const halfDepth = Math.max(size.z * 0.5, 1.0);
  
  const PLATE_Y = 1.55;     // height above floor on the plinth face
  const PLATE_W = 2.6;      // physical plane width
  const PLATE_H = 0.82;     // physical plane height (matches 1024:320 aspect)
  
  // ── INNER FRONT plate ──
  const innerTex = makeNameplateTexture(line1, line2);
  const innerMat = new THREE.MeshBasicMaterial({
    map: innerTex,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: true,
  });
  const innerPlate = new THREE.Mesh(new THREE.PlaneGeometry(PLATE_W, PLATE_H), innerMat);
  innerPlate.name = '__nameplate_inner';
  innerPlate.position.set(0, PLATE_Y, INNER_Z_SIGN * (halfDepth + 0.02));
  // ONLY Y rotation — never X, or plate lies flat on floor
  innerPlate.rotation.set(0, INNER_Z_SIGN > 0 ? 0 : Math.PI, 0);
  modGrp.add(innerPlate);
  
  // ── OUTER SIDE plate ──
  const outerTex = makeNameplateTexture(line1, line2);
  const outerMat = new THREE.MeshBasicMaterial({
    map: outerTex,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: true,
  });
  const outerPlate = new THREE.Mesh(new THREE.PlaneGeometry(PLATE_W, PLATE_H), outerMat);
  outerPlate.name = '__nameplate_outer';
  outerPlate.position.set(0, PLATE_Y, OUTER_Z_SIGN * (halfDepth + 0.02));
  outerPlate.rotation.set(0, OUTER_Z_SIGN > 0 ? 0 : Math.PI, 0);
  modGrp.add(outerPlate);
}

/** Attach nameplates to every real station (called from Sim._build) */
export function attachAllNamePlates(
  modObjs: Record<string, THREE.Group>,
  allSteps: ProcessStep[]
) {
  let count = 0;
  allSteps.forEach((mod) => {
    if (SKIP_NAMEPLATE_IDS.has(mod.id)) return;
    const grp = modObjs[mod.id];
    if (!grp) {
      console.warn(`[NAMEPLATE] No module group for: ${mod.id}`);
      return;
    }
    attachNamePlate(grp, mod);
    count++;
  });
  console.log(`[NAMEPLATE] Attached plates to ${count} stations (skipped: FOUP + virtual)`);
}

/** Show/hide all nameplates (used by Labels button) */
export function toggleNamePlates(
  modObjs: Record<string, THREE.Group>,
  visible: boolean
) {
  Object.values(modObjs).forEach((grp) => {
    grp.traverse((obj) => {
      if (obj.name === '__nameplate_inner' || obj.name === '__nameplate_outer') {
        obj.visible = visible;
      }
    });
  });
}

/** Animates LED indicators based on module activity (optional) */
export function tickNamePlateLEDs(
  modObjs: Record<string, THREE.Group>,
  busy: Record<string, number>,
  simTime: number
): void {
  // LED pulse can be added here if needed
  // For now, nameplates are static
}
