/**
 * buildNamePlate.ts
 * 
 * Physical 3D nameplates for each module in the simulation.
 * 
 * REQUIREMENTS (Master Implementation):
 * 1. Scanner: ONE label only, facing Interface Module, reads "SCANNER / 193 nm"
 * 2. Interface: 4 labels (one per side), reads "INTERFACE MODULE"
 * 3. PAB: Shows "90°C" (not 118°C)
 * 4. PEB: Temperature removed, shows only "PEB"
 * 5. CP (Chill Plate): Temperature removed, shows only "CP"
 * 6. Second row: BOLD font-weight
 * 7. Spacing: Equal gap between table edge and name plate on all sides
 * 8. Remove all duplicate/floating/internal labels
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
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

// ── Stations to SKIP (no nameplate at all) ──
const SKIP_NAMEPLATE_IDS = new Set([
  'foup',
  'spindry',
  'rinse',      // Typically part of developer
]);

// Standard spacing between table edge and name plate
const STANDARD_GAP = 0.02;

// ═══════════════════════════════════════════════════════════════════════════════
// TEXTURE GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/** Make a 2-line nameplate texture with BOLD second line */
function makeNameplateTexture(line1: string, line2: string, flipHorizontal = false): THREE.Texture {
  const W = 1024;
  const H = 320;
  
  const cnv = document.createElement('canvas');
  cnv.width = W;
  cnv.height = H;
  const ctx = cnv.getContext('2d')!;
  
  // Flip horizontally if needed
  if (flipHorizontal) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  
  // Dark background
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, W, H);
  
  // Cyan border
  ctx.strokeStyle = '#33ddff';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, W - 12, H - 12);
  
  // Inner subtle border
  ctx.strokeStyle = '#1a4458';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  
  // ── LINE 1: Module name (96px, normal weight) ──
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 96px "Segoe UI", Arial, sans-serif';
  ctx.fillText(line1.toUpperCase(), W / 2, H * 0.36);
  
  // ── LINE 2: BOLD (78px, bold weight) ──
  if (line2) {
    ctx.fillStyle = '#33ddff';
    ctx.font = 'bold 78px "Segoe UI", Arial, sans-serif';  // Already bold
    ctx.fillText(line2, W / 2, H * 0.72);
  }
  
  const tex = new THREE.CanvasTexture(cnv);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAMEPLATE TEXT LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

/** 
 * Split module name into 2 lines with special rules:
 * - PAB: "Post-Apply Bake" / "90°C"
 * - PEB: "Post-Exposure Bake" / "" (no temp)
 * - CP: "Chill Plate" / "" (no temp)
 * - Scanner: "SCANNER" / "193 nm"
 * - Interface: "INTERFACE MODULE" / ""
 */
function splitNameForNameplate(mod: ProcessStep): [string, string] {
  // ── SPECIAL CASES ──
  
  // Scanner
  if (mod.id === 'scanner') {
    return ['SCANNER', '193 nm'];
  }
  
  // Interface (both iface_out and iface_in become "Interface Module")
  if (mod.id === 'iface_out' || mod.id === 'iface_in') {
    return ['INTERFACE MODULE', ''];
  }
  
  // PAB - force 90°C
  if (mod.id === 'pab') {
    return ['POST-APPLY BAKE', '90°C'];
  }
  
  // PEB - NO temperature
  if (mod.id === 'peb') {
    return ['POST-EXPOSURE BAKE', ''];
  }
  
  // Chill Plates - NO temperature
  if (mod.id.startsWith('chill')) {
    const num = mod.id.replace('chill', '');
    return ['CHILL PLATE', ''];
  }
  
  // ── DEFAULT BEHAVIOR ──
  const fullName = mod.name || mod.short || mod.id || 'Module';
  
  // Strip any embedded temperature from name
  const cleanName = fullName.replace(/\s*\d+°?C?\s*$/, '').trim();
  
  // Use mod.temp if explicitly set
  if (mod.temp !== undefined && mod.temp !== null) {
    return [cleanName, `${mod.temp}°C`];
  }
  
  // No temperature line
  return [cleanName, ''];
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAMEPLATE ATTACHMENT
// ═══════════════════════════════════════════════════════════════════════════════

/** Attach nameplates with standardized spacing */
function attachNamePlate(modGrp: THREE.Group, mod: ProcessStep) {
  // Skip excluded stations
  if (SKIP_NAMEPLATE_IDS.has(mod.id)) return;
  
  // ── Remove existing plates (prevents duplicates) ──
  const toRemove: THREE.Object3D[] = [];
  modGrp.traverse((obj) => {
    if (obj.name && obj.name.startsWith('__nameplate')) {
      toRemove.push(obj);
    }
  });
  toRemove.forEach((obj) => obj.parent?.remove(obj));
  
  const [line1, line2] = splitNameForNameplate(mod);
  
  // Calculate module bounding box for positioning
  modGrp.updateMatrixWorld(true);
  const bbox = new THREE.Box3().setFromObject(modGrp);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const halfDepth = Math.max(size.z * 0.5, 1.0);
  
  const PLATE_Y = 1.55;
  const PLATE_W = 2.6;
  const PLATE_H = 0.82;
  
  // ── SPECIAL: Scanner - ONE plate facing interface ONLY ──
  if (mod.id === 'scanner') {
    // Scanner faces NEGATIVE X direction (toward interface at x=19)
    // So place nameplate on the -X side
    const scannerTex = makeNameplateTexture(line1, line2, false);
    const scannerMat = new THREE.MeshBasicMaterial({
      map: scannerTex,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: true,
    });
    const scannerPlate = new THREE.Mesh(new THREE.PlaneGeometry(PLATE_W, PLATE_H), scannerMat);
    scannerPlate.name = '__nameplate_scanner_interface';
    // Position on -X side (facing interface)
    scannerPlate.position.set(-halfDepth - STANDARD_GAP, PLATE_Y, 0);
    scannerPlate.rotation.set(0, Math.PI / 2, 0);  // Rotate to face -X
    modGrp.add(scannerPlate);
    return;  // ONLY one plate for scanner
  }
  
  // ── SPECIAL: Interface - 4 plates (all sides) for both iface_out and iface_in ──
  if (mod.id === 'iface_out' || mod.id === 'iface_in') {
    const ifaceLine1 = 'INTERFACE MODULE';
    const ifaceLine2 = '';
    
    // Front (+Z)
    const tex1 = makeNameplateTexture(ifaceLine1, ifaceLine2, false);
    const mat1 = new THREE.MeshBasicMaterial({ map: tex1, transparent: true, side: THREE.DoubleSide, depthTest: true });
    const plate1 = new THREE.Mesh(new THREE.PlaneGeometry(PLATE_W, PLATE_H), mat1);
    plate1.name = '__nameplate_iface_front';
    plate1.position.set(0, PLATE_Y, halfDepth + STANDARD_GAP);
    plate1.rotation.set(0, 0, 0);
    modGrp.add(plate1);
    
    // Back (-Z)
    const tex2 = makeNameplateTexture(ifaceLine1, ifaceLine2, true);
    const mat2 = new THREE.MeshBasicMaterial({ map: tex2, transparent: true, side: THREE.DoubleSide, depthTest: true });
    const plate2 = new THREE.Mesh(new THREE.PlaneGeometry(PLATE_W, PLATE_H), mat2);
    plate2.name = '__nameplate_iface_back';
    plate2.position.set(0, PLATE_Y, -halfDepth - STANDARD_GAP);
    plate2.rotation.set(0, Math.PI, 0);
    modGrp.add(plate2);
    
    // Left (+X)
    const tex3 = makeNameplateTexture(ifaceLine1, ifaceLine2, false);
    const mat3 = new THREE.MeshBasicMaterial({ map: tex3, transparent: true, side: THREE.DoubleSide, depthTest: true });
    const plate3 = new THREE.Mesh(new THREE.PlaneGeometry(PLATE_W, PLATE_H), mat3);
    plate3.name = '__nameplate_iface_left';
    plate3.position.set(halfDepth + STANDARD_GAP, PLATE_Y, 0);
    plate3.rotation.set(0, -Math.PI / 2, 0);
    modGrp.add(plate3);
    
    // Right (-X)
    const tex4 = makeNameplateTexture(ifaceLine1, ifaceLine2, true);
    const mat4 = new THREE.MeshBasicMaterial({ map: tex4, transparent: true, side: THREE.DoubleSide, depthTest: true });
    const plate4 = new THREE.Mesh(new THREE.PlaneGeometry(PLATE_W, PLATE_H), mat4);
    plate4.name = '__nameplate_iface_right';
    plate4.position.set(-halfDepth - STANDARD_GAP, PLATE_Y, 0);
    plate4.rotation.set(0, Math.PI / 2, 0);
    modGrp.add(plate4);
    
    return;  // Interface handled, exit
  }
  
  // ── DEFAULT: 2 plates (inner + outer) with STANDARD_GAP ──
  const INNER_Z_SIGN = mod.z < 0 ? +1 : -1;
  const OUTER_Z_SIGN = -INNER_Z_SIGN;
  
  // Inner front plate
  const innerTex = makeNameplateTexture(line1, line2, INNER_Z_SIGN < 0);
  const innerMat = new THREE.MeshBasicMaterial({
    map: innerTex,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: true,
  });
  const innerPlate = new THREE.Mesh(new THREE.PlaneGeometry(PLATE_W, PLATE_H), innerMat);
  innerPlate.name = '__nameplate_inner';
  innerPlate.position.set(0, PLATE_Y, INNER_Z_SIGN * (halfDepth + STANDARD_GAP));
  innerPlate.rotation.set(0, INNER_Z_SIGN > 0 ? 0 : Math.PI, 0);
  modGrp.add(innerPlate);
  
  // Outer side plate
  const outerTex = makeNameplateTexture(line1, line2, OUTER_Z_SIGN < 0);
  const outerMat = new THREE.MeshBasicMaterial({
    map: outerTex,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: true,
  });
  const outerPlate = new THREE.Mesh(new THREE.PlaneGeometry(PLATE_W, PLATE_H), outerMat);
  outerPlate.name = '__nameplate_outer';
  outerPlate.position.set(0, PLATE_Y, OUTER_Z_SIGN * (halfDepth + STANDARD_GAP));
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
  console.log(`[NAMEPLATE] Attached plates to ${count} stations (special: Scanner=1, Interface=4)`);
}

/** Show/hide all nameplates (used by Labels button) */
export function toggleNamePlates(
  modObjs: Record<string, THREE.Group>,
  visible: boolean
) {
  Object.values(modObjs).forEach((grp) => {
    grp.traverse((obj) => {
      if (obj.name && obj.name.startsWith('__nameplate')) {
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
