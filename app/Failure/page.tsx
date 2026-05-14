

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../Failure.css';

// =============================================
// TYPES
// =============================================
interface ZoneData {
    label: string;
    temp: string;
    status: 'healthy' | 'danger';
    note: string;
}
interface AlarmData {
    id: string;
    name: string;
    level: 'critical' | 'warning' | 'info';
    time: string;
    params: Record<string, string>;
}
interface LifecycleStep {
    icon: string;
    label: string;
    state: 'done' | 'active' | 'error' | '';
}
interface FailureMode {
    id: string;
    name: string;
    severity: string;
    type: string;
    keyInfo: string;
    zones: ZoneData[];
    rtmLabel: string;
    rtmTarget: number;
    rtmUcl: number;
    rtmLcl: number;
    rtmData: number[];
    lifecycle: LifecycleStep[];
    spcCpk: string;
    spcSigma: string;
    spcData: number[];
    alarms: AlarmData[];
    ocap: string[];
    lotId: string;
    recipe: string;
    troubleshootingSteps: {
        icon: string;
        title: string;
        description: string;
        action: string;
        alertMessage: string;
    }[];
    restoreActions: {
        name: string;
        alertMessage: string;
        primary: boolean;
    }[];
    ocapFlow: {
        title: string;
        desc: string;
        btnLabel: string;
        btnClass: string;
        alertMsg: string;
        state: 'completed' | 'active' | '';
    }[];
}

type PEBScenario = 1 | 2 | 3 | null;
type TabType = 'troubleshooting' | 'ocap' | 'rtmspc';

// =============================================
// DATA
// =============================================
const FM_DATA: FailureMode[] = [
    {
        id: "FM-001",
        name: "PEB Temperature Deviation",
        severity: "CRITICAL",
        type: "THERMAL",
        lotId: "WF-2024-0447",
        recipe: "ArF_CAR_110C",
        keyInfo: "<strong>PEB Temperature Deviation</strong> occurs when one or more hotplate zones drift beyond ±0.3°C of the 110°C setpoint. This directly impacts acid diffusion length in CAR (Chemically Amplified Resist), causing CD (critical dimension) shift. Zone 4 is reporting a deviation. Immediate OCAP action required.",
        zones: [
            { label: "ZONE 1", temp: "110.01°C", status: "healthy", note: "NOMINAL" },
            { label: "ZONE 2", temp: "110.0°C", status: "healthy", note: "NOMINAL" },
            { label: "ZONE 3", temp: "110.02°C", status: "healthy", note: "NOMINAL" },
            { label: "ZONE 4", temp: "110.08°C", status: "danger", note: "CRITICAL" },
            { label: "ZONE 5", temp: "110.01°C", status: "healthy", note: "NOMINAL" },
        ],
        rtmLabel: "PEB TEMP (°C) — ZONE 3",
        rtmTarget: 110, rtmUcl: 110.3, rtmLcl: 109.7,
        rtmData: [110.0, 110.1, 110.0, 110.2, 110.1, 110.3, 110.5, 110.7, 111.0, 111.2, 111.5, 111.8, 111.8, 111.7, 111.9],
        lifecycle: [
            { icon: "🌡️", label: "Hotplate\nDrift", state: "done" },
            { icon: "⚗️", label: "Acid\nDiffusion", state: "done" },
            { icon: "📏", label: "CD\nShift", state: "error" },
            { icon: "🔍", label: "Metrology\nFlag", state: "active" },
            { icon: "⚠️", label: "Alarm\nTriggered", state: "active" },
            { icon: "🛑", label: "Lot\nHold", state: "" },
            { icon: "🔧", label: "OCAP\nAction", state: "" },
        ],
        spcCpk: "0.82", spcSigma: "1.8σ",
        spcData: [109.9, 110.0, 110.1, 110.0, 110.2, 110.1, 110.0, 110.3, 110.5, 110.7, 111.0, 111.2, 111.5, 111.8, 111.8, 111.7, 111.9, 111.8],
        alarms: [
            { id: "ALM-3841", name: "PEB Zone 4 High Temp", level: "critical", time: "14:23:07", params: { "Zone": "4", "Setpoint": "110.0°C", "Actual": "111.8°C", "Delta": "+1.8°C", "Lot": "WF-2024-0447" } },
            { id: "ALM-3842", name: "PEB Zone 4 Watch", level: "warning", time: "14:23:18", params: { "Zone": "4", "Actual": "110.4°C", "Delta": "+0.4°C" } },
            { id: "ALM-3843", name: "CD SPC Out-of-Control", level: "critical", time: "14:24:01", params: { "Cpk": "0.82", "Spec": "≥1.33", "Status": "OOC Rule 1" } },
        ],
        ocap: [
            "Immediately place affected lot on HOLD.",
            "Check zone 4 heater element resistance.",
            "Verify thermocouple calibration for Zone 4.",
            "Inspect PID controller setpoint (±0.3°C tolerance).",
            "Review last PM date for hotplate module.",
            "Escalate to process engineer if delta >1.5°C.",
        ],
        troubleshootingSteps: [
            { icon: "🔍", title: "Visual Inspection", description: "Check module interior for discoloration or anomalies on Zone 4 heating element", action: "VIEW MODULE INTERIOR", alertMessage: "Zone 4 heating element shows discoloration — localized hotspot detected." },
            { icon: "⚡", title: "TC Continuity Test", description: "Run diagnostic OHM test to verify thermocouple sensor integrity on Zone 4", action: "DIAGNOSTIC OHM TEST", alertMessage: "Resistance is INFINITE — TC is BROKEN" },
            { icon: "🔌", title: "SSR Verification", description: "Check power distribution log for Zone 4 SSR status", action: "POWER DISTRIBUTION LOG", alertMessage: "Zone 4 power is ON but temp is dropping — SSR FAILED" },
        ],
        restoreActions: [
            { name: "Recalibrate Offsets", alertMessage: "Recalibrating offsets... (linear drift <0.3°C)", primary: false },
            { name: "Replace Heater Element", alertMessage: "Replacing heater element — Zone 4 duty cycle was pinned at 100%", primary: true },
            { name: "Replace TC Sensor", alertMessage: "Replacing TC sensor — spiky/intermittent trace detected", primary: false },
        ],
        ocapFlow: [
            { title: "CONTAINMENT", desc: "Lock tool — stop current lot flow immediately", btnLabel: "LOCK TOOL", btnClass: "", alertMsg: "Tool locked — lot flow stopped", state: "completed" },
            { title: "METROLOGY VERIFICATION", desc: "Re-measure wafer — confirm real issue, not SEM error", btnLabel: "RE-MEASURE WAFER", btnClass: "", alertMsg: "Re-measurement confirms CD shift — real issue detected", state: "completed" },
            { title: "ROOT CAUSE ANALYSIS", desc: "Flag affected zone thermal trace as source of shift", btnLabel: "FLAG THERMAL TRACE", btnClass: "rca", alertMsg: "RCA: Heater element failure suspected — thermal trace flagged", state: "active" },
            { title: "HARDWARE RECOVERY", desc: "Replace failed component — Downtime: 30 min", btnLabel: "REPLACE COMPONENT", btnClass: "recovery", alertMsg: "Replacing failed component — 30 min downtime", state: "" },
            { title: "DISPOSITION", desc: "Scrap affected lot — thermal errors cannot be reworked", btnLabel: "SCRAP CURRENT LOT", btnClass: "disposition", alertMsg: "Lot marked for scrap — process profile permanently altered", state: "" },
            { title: "VALIDATION", desc: "Run validation wafers — all points return to Golden Mean", btnLabel: "RUN VALIDATION", btnClass: "", alertMsg: "Validation complete — all points returned to Golden Mean → Status GREEN", state: "" },
        ],
    },
    {
        id: "FM-002",
        name: "PR Coating Thickness Non-Uniformity",
        severity: "HIGH",
        type: "COATING",
        lotId: "WF-2024-0441",
        recipe: "PR_COAT_1800RPM",
        keyInfo: "<strong>PR Coating Non-Uniformity</strong> results from spin speed deviation or nozzle clogging causing >3% thickness variation across the wafer. Measured at 49 sites via ellipsometry, 1σ target is <2nm. Current lot shows 1σ = 4.7nm.",
        zones: [
            { label: "ZONE 1", temp: "99.8%", status: "healthy", note: "UNIFORM" },
            { label: "ZONE 2", temp: "98.1%", status: "healthy", note: "UNIFORM" },
            { label: "ZONE 3", temp: "93.2%", status: "danger", note: "NON-UNI" },
            { label: "ZONE 4", temp: "97.5%", status: "healthy", note: "UNIFORM" },
            { label: "ZONE 5", temp: "99.1%", status: "healthy", note: "UNIFORM" },
        ],
        rtmLabel: "PR THICKNESS (nm) — 49-SITE MAP",
        rtmTarget: 120, rtmUcl: 123, rtmLcl: 117,
        rtmData: [120, 120, 121, 120, 119, 120, 122, 124, 126, 128, 130, 131, 130, 132, 131],
        lifecycle: [
            { icon: "🔩", label: "Nozzle\nClog", state: "done" },
            { icon: "🌀", label: "Spin\nAnomaly", state: "done" },
            { icon: "📐", label: "Thick.\nVariation", state: "error" },
            { icon: "🔬", label: "Ellipso-\nmetry", state: "active" },
            { icon: "⚠️", label: "Alarm", state: "active" },
            { icon: "🛑", label: "Lot\nHold", state: "" },
            { icon: "🔧", label: "PM\nAction", state: "" },
        ],
        spcCpk: "0.71", spcSigma: "1.4σ",
        spcData: [120, 120, 121, 120, 119, 120, 122, 124, 126, 128, 130, 131, 130, 132, 131, 130, 129, 133],
        alarms: [
            { id: "ALM-3855", name: "PR Thickness OOC — Center Thick", level: "critical", time: "09:11:42", params: { "1σ": "4.7nm", "Spec": "<2nm", "Sites": "49", "Lot": "WF-2024-0441" } },
            { id: "ALM-3856", name: "Spin Speed Deviation", level: "warning", time: "09:10:15", params: { "Set RPM": "1800", "Actual": "1743 RPM", "Delta": "-57 RPM" } },
        ],
        ocap: [
            "Check PR dispense nozzle for clogging or partial block.",
            "Inspect spin motor torque and RPM feedback.",
            "Run dummy wafer and re-measure thickness map.",
            "Verify PR dispense volume (edge vs center).",
            "Check exhaust back-pressure in coat cup.",
        ],
        troubleshootingSteps: [
            { icon: "🔍", title: "Nozzle Inspection", description: "Inspect PR dispense nozzle for clogging or residue buildup", action: "VIEW NOZZLE", alertMessage: "Partial blockage at nozzle tip — dried resist residue visible." },
            { icon: "⚡", title: "Spin Motor Diagnostic", description: "Check spin motor torque and RPM feedback for deviation", action: "RUN SPIN DIAGNOSTIC", alertMessage: "RPM variance ±57 RPM — motor belt slipping." },
            { icon: "🗺️", title: "Thickness Map Analysis", description: "View 49-site thickness uniformity map for spatial pattern", action: "VIEW THICKNESS MAP", alertMessage: "Center-to-edge variation 4.7nm (spec <2nm) — non-uniform coating detected." },
        ],
        restoreActions: [
            { name: "Clean Nozzle", alertMessage: "Cleaning PR nozzle — removed dried resist residue", primary: false },
            { name: "Replace Spin Motor", alertMessage: "Replacing spin motor — 45 min downtime", primary: true },
            { name: "Run Dummy Wafer", alertMessage: "Running dummy wafer — thickness map verified", primary: false },
        ],
        ocapFlow: [
            { title: "CONTAINMENT", desc: "Lock coater — stop lot flow", btnLabel: "LOCK TOOL", btnClass: "", alertMsg: "Tool locked", state: "completed" },
            { title: "METROLOGY VERIFICATION", desc: "Re-measure 49-site thickness map", btnLabel: "RE-MEASURE", btnClass: "", alertMsg: "Re-measurement confirms non-uniformity 4.7nm", state: "completed" },
            { title: "ROOT CAUSE ANALYSIS", desc: "Identify spin speed or nozzle as root cause", btnLabel: "FLAG RCA", btnClass: "rca", alertMsg: "RCA: Motor belt slipping — spin speed deviation confirmed", state: "active" },
            { title: "HARDWARE RECOVERY", desc: "Replace spin motor or clean nozzle", btnLabel: "REPLACE/CLEAN", btnClass: "recovery", alertMsg: "Motor replaced — spin speed nominal", state: "" },
            { title: "DISPOSITION", desc: "Re-coat lot if within resist budget", btnLabel: "RE-COAT LOT", btnClass: "disposition", alertMsg: "Lot re-coated — thickness within spec", state: "" },
            { title: "VALIDATION", desc: "Run validation — uniformity 1σ <2nm confirmed", btnLabel: "RUN VALIDATION", btnClass: "", alertMsg: "Validation complete — coating uniform", state: "" },
        ],
    },
    {
        id: "FM-003",
        name: "Developer Dispense Flow Anomaly",
        severity: "MEDIUM",
        type: "CHEMICAL",
        lotId: "WF-2024-0449",
        recipe: "DEV_TMAH_800ML",
        keyInfo: "<strong>Developer Flow Anomaly</strong> causes incomplete resist dissolution, leading to bridging or incomplete development. Target TMAH flow is 800 mL/min ±50. Current reading is 621 mL/min — 22% below specification.",
        zones: [
            { label: "ZONE 1", temp: "OK", status: "healthy", note: "NORMAL" },
            { label: "ZONE 2", temp: "OK", status: "healthy", note: "NORMAL" },
            { label: "ZONE 3", temp: "LOW", status: "danger", note: "LOW FLOW" },
            { label: "ZONE 4", temp: "OK", status: "healthy", note: "NORMAL" },
            { label: "ZONE 5", temp: "OK", status: "healthy", note: "NORMAL" },
        ],
        rtmLabel: "DEVELOPER FLOW RATE (mL/min)",
        rtmTarget: 800, rtmUcl: 850, rtmLcl: 750,
        rtmData: [800, 802, 798, 801, 800, 799, 798, 785, 770, 745, 721, 699, 650, 621, 621],
        lifecycle: [
            { icon: "💧", label: "Flow\nDrop", state: "done" },
            { icon: "🧪", label: "TMAH\nPool", state: "done" },
            { icon: "🕳️", label: "Resist\nBridge", state: "error" },
            { icon: "🔬", label: "SEM\nInspect", state: "active" },
            { icon: "⚠️", label: "Alarm", state: "active" },
            { icon: "🛑", label: "Lot\nHold", state: "" },
            { icon: "🔧", label: "Flow\nRepair", state: "" },
        ],
        spcCpk: "1.05", spcSigma: "2.1σ",
        spcData: [800, 802, 798, 801, 800, 799, 798, 785, 770, 745, 721, 699, 650, 621, 621, 620, 624, 615],
        alarms: [
            { id: "ALM-3871", name: "Developer Flow Rate Low", level: "critical", time: "11:04:55", params: { "Flow Set": "800 mL/min", "Actual": "621 mL/min", "Delta": "-179 mL/min" } },
            { id: "ALM-3872", name: "Mass Flow Controller OOC", level: "warning", time: "11:05:01", params: { "MFC ID": "DEV-MFC-03", "Status": "DEGRADED" } },
        ],
        ocap: [
            "Check TMAH supply line for blockage or kink.",
            "Verify MFC (Mass Flow Controller) calibration.",
            "Inspect developer nozzle for crystallized TMAH.",
            "Switch to backup developer arm if available.",
            "Re-develop last 3 wafers if within hold limit.",
        ],
        troubleshootingSteps: [
            { icon: "🔍", title: "Supply Line Inspection", description: "Check TMAH supply line for blockage, kinks, or restrictions near manifold", action: "INSPECT SUPPLY LINE", alertMessage: "Kink detected near manifold — flow restricted by 22%" },
            { icon: "⚡", title: "MFC Calibration Test", description: "Verify Mass Flow Controller calibration and actual vs setpoint deviation", action: "RUN MFC TEST", alertMessage: "Actual flow 621 mL/min vs setpoint 800 — MFC out of calibration" },
            { icon: "💎", title: "Nozzle Inspection", description: "Check developer nozzle for crystallized TMAH deposits blocking flow area", action: "VIEW NOZZLE", alertMessage: "Crystallized TMAH deposits blocking 40% of flow area" },
        ],
        restoreActions: [
            { name: "Clear Supply Line", alertMessage: "Clearing supply line kink — flow restored", primary: false },
            { name: "Recalibrate MFC", alertMessage: "Recalibrating MFC — flow now 795 mL/min", primary: false },
            { name: "Replace Nozzle", alertMessage: "Replacing developer nozzle — crystallized deposits removed", primary: true },
        ],
        ocapFlow: [
            { title: "CONTAINMENT", desc: "Lock developer module — stop lot flow", btnLabel: "LOCK TOOL", btnClass: "", alertMsg: "Tool locked", state: "completed" },
            { title: "METROLOGY VERIFICATION", desc: "Run flow rate measurement", btnLabel: "MEASURE FLOW", btnClass: "", alertMsg: "Flow confirmed at 621 mL/min — 22% low", state: "completed" },
            { title: "ROOT CAUSE ANALYSIS", desc: "Identify line kink, MFC, or nozzle as root cause", btnLabel: "FLAG RCA", btnClass: "rca", alertMsg: "RCA: Crystallized TMAH at nozzle — primary cause", state: "active" },
            { title: "HARDWARE RECOVERY", desc: "Replace nozzle or clear supply line", btnLabel: "REPLACE NOZZLE", btnClass: "recovery", alertMsg: "Nozzle replaced — flow restored to 800 mL/min", state: "" },
            { title: "DISPOSITION", desc: "Re-develop affected wafers if within spec window", btnLabel: "RE-DEVELOP", btnClass: "disposition", alertMsg: "Affected wafers re-developed", state: "" },
            { title: "VALIDATION", desc: "Run test wafers — flow and CD verified", btnLabel: "RUN VALIDATION", btnClass: "", alertMsg: "Validation complete — flow nominal", state: "" },
        ],
    },
    {
        id: "FM-004",
        name: "EBR Solvent Arm Malfunction",
        severity: "CRITICAL",
        type: "MECHANICAL",
        lotId: "WF-2024-0455",
        recipe: "EBR_PGMEA_3MM",
        keyInfo: "<strong>Edge Bead Removal (EBR) Malfunction</strong> — The EBR arm failed to dispense PGMEA solvent at the wafer edge (3mm exclusion zone). This causes resist particles to flake off during transport, causing defect counts to spike on subsequent layers.",
        zones: [
            { label: "ZONE 1", temp: "ERR", status: "danger", note: "ARM FAIL" },
            { label: "ZONE 2", temp: "ERR", status: "danger", note: "ARM FAIL" },
            { label: "ZONE 3", temp: "OK", status: "healthy", note: "NORMAL" },
            { label: "ZONE 4", temp: "OK", status: "healthy", note: "NORMAL" },
            { label: "ZONE 5", temp: "OK", status: "healthy", note: "NORMAL" },
        ],
        rtmLabel: "EBR EDGE DEFECT COUNT (particles/wafer)",
        rtmTarget: 5, rtmUcl: 15, rtmLcl: 0,
        rtmData: [4, 3, 5, 4, 6, 5, 7, 12, 18, 25, 30, 38, 42, 45, 48],
        lifecycle: [
            { icon: "🦾", label: "Arm\nFail", state: "done" },
            { icon: "💦", label: "No EBR\nDispense", state: "done" },
            { icon: "🪨", label: "Edge\nParticles", state: "error" },
            { icon: "🔍", label: "Defect\nScan", state: "active" },
            { icon: "⚠️", label: "Alarm", state: "active" },
            { icon: "🛑", label: "Lot\nHold", state: "" },
            { icon: "🔧", label: "Arm\nRepair", state: "" },
        ],
        spcCpk: "0.45", spcSigma: "0.9σ",
        spcData: [4, 3, 5, 4, 6, 5, 7, 12, 18, 25, 30, 38, 42, 45, 48, 50, 47, 52],
        alarms: [
            { id: "ALM-3890", name: "EBR Arm No-Dispense", level: "critical", time: "16:45:03", params: { "Arm ID": "EBR-ARM-01", "Solvent": "PGMEA", "Status": "NO FLOW" } },
            { id: "ALM-3891", name: "Edge Defect Count Spike", level: "critical", time: "16:46:12", params: { "Count": "48/wafer", "Spec": "<15/wafer" } },
        ],
        ocap: [
            "Immediately halt lot — place on Scrap Review.",
            "Inspect EBR solvent line for blockage.",
            "Check solenoid valve on EBR arm module.",
            "Run EBR test pattern on dummy wafer.",
            "Inspect robot end-effector for contamination.",
        ],
        troubleshootingSteps: [
            { icon: "🔍", title: "Arm Visual Inspection", description: "Check EBR arm for physical damage, misalignment, or position offset from wafer edge", action: "VIEW EBR ARM", alertMessage: "Arm position offset by 1.3mm — misaligned from wafer edge" },
            { icon: "⚡", title: "Solvent Line Test", description: "Check PGMEA solvent line pressure and verify flow continuity through system", action: "RUN SOLVENT TEST", alertMessage: "Pressure high (45 PSI) but flow zero — line blockage" },
            { icon: "🔌", title: "Solenoid Valve Check", description: "Verify solenoid valve operation, electrical continuity, and switching response", action: "TEST SOLENOID", alertMessage: "Valve stuck in closed position — electrical failure suspected" },
        ],
        restoreActions: [
            { name: "Re-calibrate Arm", alertMessage: "Re-calibrating EBR arm — offset corrected", primary: false },
            { name: "Clear Solvent Line", alertMessage: "Clearing PGMEA line — blockage removed", primary: false },
            { name: "Replace Solenoid Valve", alertMessage: "Replacing solenoid valve — arm functioning normally", primary: true },
        ],
        ocapFlow: [
            { title: "CONTAINMENT", desc: "Halt lot flow — scrap review initiated", btnLabel: "HALT LOT", btnClass: "", alertMsg: "Lot halted — scrap review initiated", state: "completed" },
            { title: "METROLOGY VERIFICATION", desc: "KLA scan — confirm edge defect spike", btnLabel: "RUN KLA SCAN", btnClass: "", alertMsg: "Edge defects confirmed: 48/wafer (spec <15)", state: "completed" },
            { title: "ROOT CAUSE ANALYSIS", desc: "Identify solenoid, line blockage, or arm misalignment", btnLabel: "FLAG RCA", btnClass: "rca", alertMsg: "RCA: Solenoid valve failure — EBR no-dispense", state: "active" },
            { title: "HARDWARE RECOVERY", desc: "Replace solenoid valve — 20 min downtime", btnLabel: "REPLACE SOLENOID", btnClass: "recovery", alertMsg: "Solenoid replaced — EBR arm dispensing normally", state: "" },
            { title: "DISPOSITION", desc: "Scrap affected lot — edge particles on critical layer", btnLabel: "SCRAP LOT", btnClass: "disposition", alertMsg: "Lot scrapped — edge defects on critical layer", state: "" },
            { title: "VALIDATION", desc: "Run dummy wafer — EBR operation verified", btnLabel: "RUN VALIDATION", btnClass: "", alertMsg: "Validation complete — EBR nominal", state: "" },
        ],
    },
    {
        id: "FM-005",
        name: "HMDS Adhesion Promoter Failure",
        severity: "HIGH",
        type: "ADHESION",
        lotId: "WF-2024-0460",
        recipe: "HMDS_VAPOR_120C",
        keyInfo: "<strong>HMDS Adhesion Promoter Failure</strong> — The HMDS vapor prime step failed to achieve complete surface silanization. Contact angle dropped below 60° (target >75°), causing PR delamination during development. Delamination pattern is radially symmetric — likely oven temperature issue.",
        zones: [
            { label: "ZONE 1", temp: "74°", status: "healthy", note: "OK" },
            { label: "ZONE 2", temp: "75°", status: "healthy", note: "OK" },
            { label: "ZONE 3", temp: "52°", status: "danger", note: "LOW CA" },
            { label: "ZONE 4", temp: "71°", status: "healthy", note: "OK" },
            { label: "ZONE 5", temp: "76°", status: "healthy", note: "OK" },
        ],
        rtmLabel: "CONTACT ANGLE (°) — HMDS PRIME",
        rtmTarget: 75, rtmUcl: 85, rtmLcl: 65,
        rtmData: [76, 75, 76, 75, 74, 73, 72, 70, 68, 65, 62, 58, 54, 52, 52],
        lifecycle: [
            { icon: "🧴", label: "HMDS\nFail", state: "done" },
            { icon: "💧", label: "Poor\nPrime", state: "done" },
            { icon: "🪄", label: "PR\nDelam.", state: "error" },
            { icon: "🔬", label: "CA\nMeasure", state: "active" },
            { icon: "⚠️", label: "Alarm", state: "active" },
            { icon: "🛑", label: "Lot\nHold", state: "" },
            { icon: "🔧", label: "Re-prime\n& Recoat", state: "" },
        ],
        spcCpk: "0.91", spcSigma: "1.9σ",
        spcData: [76, 75, 76, 75, 74, 73, 72, 70, 68, 65, 62, 58, 54, 52, 52, 51, 53, 50],
        alarms: [
            { id: "ALM-3901", name: "HMDS Contact Angle OOL", level: "critical", time: "08:21:44", params: { "CA Target": ">75°", "Actual": "52°", "Delta": "-23°" } },
            { id: "ALM-3902", name: "PR Delamination Risk — High", level: "warning", time: "08:22:00", params: { "Pattern": "Radial", "Area": "~30% wafer" } },
        ],
        ocap: [
            "Check HMDS vapor oven temperature (target 120°C).",
            "Verify HMDS chemical level and expiry.",
            "Inspect N2 carrier gas flow rate.",
            "Run contact angle measurement on test wafer.",
            "If CA <65°, re-prime wafer batch.",
        ],
        troubleshootingSteps: [
            { icon: "🌡️", title: "Oven Temperature Check", description: "Verify HMDS vapor oven temperature uniformity across all zones", action: "CHECK OVEN TEMP", alertMessage: "Zone 3 reading 52°C vs setpoint 120°C — heater failure" },
            { icon: "🧪", title: "HMDS Level & Expiry", description: "Check HMDS chemical level in bubbler and expiration date on container", action: "CHECK CHEMICAL", alertMessage: "HMDS level at 8% — near empty; Expiry: 30 days remaining" },
            { icon: "📐", title: "Contact Angle Measurement", description: "Run contact angle test on test wafer to verify surface silanization quality", action: "MEASURE CA", alertMessage: "Contact Angle: 52° (target >75°) — poor surface silanization" },
        ],
        restoreActions: [
            { name: "Refill HMDS", alertMessage: "Refilling HMDS chemical — level restored to 100%", primary: false },
            { name: "Replace Heater", alertMessage: "Replacing oven heater element — temperature stabilizing", primary: true },
            { name: "Re-prime Batch", alertMessage: "Re-priming wafer batch — contact angle now 78°", primary: false },
        ],
        ocapFlow: [
            { title: "CONTAINMENT", desc: "Hold lot — prevent delamination defects from escaping", btnLabel: "HOLD LOT", btnClass: "", alertMsg: "Lot on hold — delamination risk contained", state: "completed" },
            { title: "METROLOGY VERIFICATION", desc: "Measure contact angle on affected wafers", btnLabel: "MEASURE CA", btnClass: "", alertMsg: "CA confirmed: 52° (target >75°)", state: "completed" },
            { title: "ROOT CAUSE ANALYSIS", desc: "Identify oven heater or HMDS supply as root cause", btnLabel: "FLAG RCA", btnClass: "rca", alertMsg: "RCA: HMDS oven heater failure in Zone 3", state: "active" },
            { title: "HARDWARE RECOVERY", desc: "Replace oven heater — 25 min downtime", btnLabel: "REPLACE HEATER", btnClass: "recovery", alertMsg: "Heater replaced — oven temp nominal at 120°C", state: "" },
            { title: "DISPOSITION", desc: "Re-prime batch — CA must be >75°", btnLabel: "RE-PRIME BATCH", btnClass: "disposition", alertMsg: "Re-primed — CA now 78°", state: "" },
            { title: "VALIDATION", desc: "Run dummy wafers — CA and adhesion verified", btnLabel: "RUN VALIDATION", btnClass: "", alertMsg: "Validation complete — HMDS nominal", state: "" },
        ],
    },
];

// PEB scenario data
function getPEBScenarioData(scenario: PEBScenario) {
    if (scenario === 1) {
        return {
            temps: [110.0, 109.5, 108.8, 107.9, 106.8, 105.5, 104.0, 102.3, 100.5, 98.5, 96.3, 94.0, 91.5, 89.0, 86.0],
            duty: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            dangerZone: 4,
            dangerTemp: '86.0°C',
            dangerStatus: 'DROPPING',
            icon: '🔥', label: 'SCENARIO 1 — Failing Heating Element',
            desc: 'Zone 4 temperature drops asymptotically toward ambient. Duty cycle pinned at 100%. PID controller is demanding full power but temperature keeps dropping — heater element is failing.',
            warn: null,
            cdData: [22.5, 22.4, 22.3, 22.2, 22.1, 22.0, 21.9, 21.8, 21.7, 21.6, 21.4, 21.2, 21.0, 20.8, 20.5, 20.2, 19.8, 19.3],
            cdUniformityData: [0.32, 0.34, 0.33, 0.35, 0.36, 0.38, 0.42, 0.48, 0.55, 0.65, 0.78, 0.85, 0.92, 0.98, 1.05, 1.12, 1.18, 1.22],
            waferMapType: 'heater' as const,
        };
    } else if (scenario === 2) {
        return {
            temps: [110.0, 95.0, 125.0, 88.0, 132.0, 92.0, 128.0, 85.0, 135.0, 90.0, 130.0, 87.0, 133.0, 89.0, 110.0],
            duty: [45, 0, 100, 0, 100, 0, 100, 0, 100, 0, 100, 0, 100, 0, 45],
            dangerZone: 3,
            dangerTemp: 'ERRATIC',
            dangerStatus: 'TC FAIL',
            icon: '⚡', label: 'SCENARIO 2 — Broken Thermocouple Sensor',
            desc: 'Zone 4 trace shows severe jagged spikes. Duty cycle chatters 0–100%. The thermocouple is sending erratic signals, causing the PID to oscillate wildly between full power and no power.',
            warn: null,
            cdData: [22.3, 22.8, 21.2, 23.1, 20.8, 22.5, 21.5, 23.5, 20.2, 22.9, 21.0, 23.8, 19.8, 22.2, 24.1, 20.5, 23.2, 21.8],
            cdUniformityData: [0.31, 0.45, 0.62, 0.58, 0.71, 0.49, 0.83, 0.67, 0.92, 0.55, 0.88, 0.73, 1.05, 0.61, 0.96, 0.79, 1.12, 0.85],
            waferMapType: 'tc' as const,
        };
    } else if (scenario === 3) {
        return {
            temps: [110.0, 109.5, 108.8, 107.9, 106.8, 105.5, 104.0, 102.3, 100.5, 98.5, 96.3, 94.0, 91.5, 89.0, 86.0],
            duty: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            dangerZone: 5,
            dangerTemp: '86.0°C',
            dangerStatus: 'SSR FAIL',
            icon: '🔌', label: 'SCENARIO 3 — Blown SSR (Stuck OFF)',
            desc: 'Visually identical to Scenario 1 — temperature drops with duty cycle pinned at 100%. The SSR is receiving the command to switch ON but is not passing power. Charts alone cannot distinguish this from Scenario 1.',
            warn: '⚠️ Diagnostic Trick: Run Ohm test on heater to distinguish SSR fail from heater fail!',
            cdData: [22.5, 22.4, 22.3, 22.2, 22.1, 22.0, 21.9, 21.8, 21.7, 21.6, 21.4, 21.2, 21.0, 20.8, 20.5, 20.2, 19.8, 19.3],
            cdUniformityData: [0.32, 0.34, 0.33, 0.35, 0.36, 0.38, 0.42, 0.48, 0.55, 0.65, 0.78, 0.85, 0.92, 0.98, 1.05, 1.12, 1.18, 1.22],
            waferMapType: 'ssr' as const,
        };
    }
    return null;
}

// =============================================
// WAFER CD MAP CANVAS COMPONENT
// =============================================
function drawWaferCDMap(
    canvas: HTMLCanvasElement,
    scenario: PEBScenario,
    isDark: boolean
) {
    const W = canvas.offsetWidth || 260;
    const H = canvas.offsetHeight || 260;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);

    const bg = isDark ? '#111927' : '#f5f8ff';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2 + 8;
    const R = Math.min(W, H) * 0.38;

    if (!scenario) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        grad.addColorStop(0, isDark ? '#1a2a40' : '#dce8f5');
        grad.addColorStop(1, isDark ? '#0d1a2a' : '#c8ddf0');
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = isDark ? 'rgba(0,229,255,0.3)' : 'rgba(0,100,200,0.3)';
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = isDark ? '#4a6a8a' : '#5a7a9a';
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT SCENARIO', cx, cy - 6);
        ctx.fillText('TO VIEW MAP', cx, cy + 10);
        return;
    }

    const scData = getPEBScenarioData(scenario)!;
    const mapType = scData.waferMapType;

    const stops =
        mapType === 'tc'
            ? ['#0000ff', '#0066ff', '#00aaff', '#00ffee', '#00ff88', '#aaff00', '#ffee00', '#ff8800', '#ff2200', '#cc0000']
            : ['#0000aa', '#0044ff', '#00aaff', '#00eeff', '#00ff88', '#88ff00', '#ffcc00', '#ff6600', '#ff2200', '#aa0000'];

    const getColor = (t: number) => {
        const idx = Math.min(stops.length - 1, Math.floor(t * (stops.length - 1)));
        return stops[idx];
    };

    const rings = 8;
    for (let r = rings; r >= 0; r--) {
        const frac = r / rings;
        const radius = frac * R;
        let cdVal: number;
        if (mapType === 'tc') {
            cdVal = 22 + Math.sin(r * 2.1) * 1.8 + Math.cos(r * 1.3) * 1.2;
        } else {
            cdVal = 22 - (frac * frac) * 3.5 + 0.1;
        }
        const t = Math.max(0, Math.min(1, (cdVal - 19) / 6));
        const color = getColor(t);
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    if (mapType === 'tc') {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const frac = 0.5 + Math.sin(i * 1.7) * 0.3;
            const color = getColor(frac);
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
            ctx.stroke();
            ctx.restore();
        }
    }

    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2; ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy + R - 4, 5, 0, Math.PI * 2);
    ctx.fillStyle = bg; ctx.fill();

    const zones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'];
    const zoneR = [R * 0.12, R * 0.28, R * 0.48, R * 0.68, R * 0.87];
    ctx.font = `${Math.max(7, R * 0.07)}px "Share Tech Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    zoneR.forEach((zr, i) => {
        ctx.fillText(zones[i], cx, cy - zr + 4);
    });

    ctx.font = `bold ${Math.max(9, R * 0.1)}px "Share Tech Mono", monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Center', cx, cy + 4);
    ctx.font = `${Math.max(8, R * 0.085)}px "Share Tech Mono", monospace`;
    ctx.fillText('(22nm)', cx, cy + 16);

    const barX = cx + R + 10;
    const barY = cy - R * 0.8;
    const barH = R * 1.6;
    const barW = 10;

    const barGrad = ctx.createLinearGradient(0, barY, 0, barY + barH);
    barGrad.addColorStop(0, '#aa0000');
    barGrad.addColorStop(0.25, '#ff6600');
    barGrad.addColorStop(0.5, '#ffee00');
    barGrad.addColorStop(0.75, '#00aaff');
    barGrad.addColorStop(1, '#0000aa');
    ctx.fillStyle = barGrad;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.font = `${Math.max(7, R * 0.07)}px "Share Tech Mono", monospace`;
    ctx.textAlign = 'left';
    ctx.fillStyle = isDark ? '#7ba3c8' : '#2a4a70';
    const barLabels = ['28', '26', '24', '22', '20', '18'];
    barLabels.forEach((lbl, i) => {
        const y = barY + (i / (barLabels.length - 1)) * barH;
        ctx.fillText(lbl, barX + barW + 4, y + 3);
    });

    ctx.save();
    ctx.translate(barX + barW + 26, barY + barH / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = `${Math.max(7, R * 0.065)}px "Share Tech Mono", monospace`;
    ctx.fillStyle = isDark ? '#4a6a8a' : '#5a7a9a';
    ctx.fillText('Average CD', 0, 0);
    ctx.restore();

    const titleY = cy - R - 12;
    ctx.font = `bold ${Math.max(9, R * 0.1)}px "Share Tech Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = isDark ? '#7ba3c8' : '#2a4a70';
    ctx.fillText('300mm Wafer CD Map', cx, titleY);

    if (mapType === 'ssr') {
        ctx.fillStyle = 'rgba(255,152,0,0.15)';
        ctx.strokeStyle = 'rgba(255,152,0,0.6)';
        ctx.lineWidth = 1;
        const bx = cx - R + 2, by = cy - R * 0.35, bw = R * 0.9, bh = 28;
        ctx.beginPath();
        ctx.rect(bx, by, bw, bh);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff9800';
        ctx.font = `bold ${Math.max(7, R * 0.07)}px "Share Tech Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('VISUALLY IDENTICAL', cx - R * 0.05, by + 10);
        ctx.fillText('TO HEATER FAIL.', cx - R * 0.05, by + 20);
    }
}

// =============================================
// CHART DATA GENERATORS  ← NEW
// =============================================
const CHART_N = 501;

// ZONE_COLORS — Zone 4 must be amber to match Image 2
const ZONE_COLORS = {
    z1: '#7abfbf',   // muted teal — Zone 1
    z2: '#e05c5c',   // red — Zone 2  
    z3: '#ccccaa',   // muted yellow — Zone 3
    z4: '#e8a020',   // AMBER — Zone 4 (the failing zone, amber/orange in both images)
    z5: '#7fc97f',   // green — Zone 5
};

function seededRand(seed: number) {
    let s = seed >>> 0;
    return () => {
        s = Math.imul(1664525, s) + 1013904223 >>> 0;
        return s / 0xffffffff;
    };
}

function genStableZone(seed: number, base: number, amp: number, n: number): number[] {
    const rand = seededRand(seed);
    const out: number[] = [];
    let v = base;
    for (let i = 0; i < n; i++) {
        v += (rand() - 0.5) * amp;
        v = v * 0.85 + base * 0.15;  // ← BUG: pulls toward base*0.15, not base!
        out.push(v);
    }
    return out;
}

// Scenarios 1 & 3 — zone 4 exponential drop after FAIL_PT
function getScenario13Temps(failPt: number): number[][] {
    const z1 = genStableZone(11, 108, 1.2, CHART_N);
    const z2 = genStableZone(22, 108, 1.0, CHART_N);
    const z3 = genStableZone(33, 108, 1.1, CHART_N);
    const z5 = genStableZone(55, 108, 1.3, CHART_N);
    const z4: number[] = [];
    for (let i = 0; i < CHART_N; i++) {
        if (i < failPt) {
            const r = seededRand(44 + i);
            z4.push(108 + (r() - 0.5) * 1.0);
        } else {
            const decay = 108 * Math.exp(-0.009 * (i - failPt));
            z4.push(Math.max(22, decay) + (seededRand(144 + i)() - 0.5) * 0.4);
        }
    }
    return [z1, z2, z3, z4, z5];
}

// Scenarios 1 & 3 — zone 4 pinned at 100% after DUTY_JUMP
function getScenario13Duty(dutyJump: number): number[][] {
    const makeDuty = (seed: number, base: number) => {
        const rand = seededRand(seed);
        return Array.from({ length: CHART_N }, () =>
            Math.min(65, Math.max(35, base + (rand() - 0.5) * 8))
        );
    };
    const dz1 = makeDuty(101, 50);
    const dz2 = makeDuty(102, 48);
    const dz3 = makeDuty(103, 46);
    const dz5 = makeDuty(105, 52);
    const dz4 = Array.from({ length: CHART_N }, (_, i) =>
        i < dutyJump ? 38 + seededRand(203 + i)() * 6 : 100
    );
    return [dz1, dz2, dz3, dz4, dz5];
}

// Scenario 2 — zone 4 erratic spikes 0–500°C
// function getScenario2Temps(): number[][] {
//     const z1 = genStableZone(11, 108, 1.2, CHART_N);
//     const z2 = genStableZone(22, 108, 1.0, CHART_N);
//     const z3 = genStableZone(33, 108, 1.1, CHART_N);
//     const z5 = genStableZone(55, 108, 1.3, CHART_N);
//     const SPIKE_START = 175;
//     // Replace the z4 generation in getScenario2Temps with this:
//     const z4: number[] = [];
//     for (let i = 0; i < CHART_N; i++) {
//         const r = seededRand(77 + i);
//         if (i < SPIKE_START) {
//             z4.push(108 + (r() - 0.5) * 1.5);
//         } else {
//             const phase = (i - SPIKE_START) % 18;
//             // INSTANT sharp spikes - no interpolation
//             if (phase < 3) z4.push(23 + r() * 30);      // Low spike
//             else if (phase < 6) z4.push(250 + r() * 250); // High spike to 500
//             else if (phase < 9) z4.push(23 + r() * 40);   // Drop instantly
//             else if (phase < 12) z4.push(300 + r() * 200); // Another high spike
//             else z4.push(108 + (r() - 0.5) * 20);          // Return to normal
//         }
//     }
//     return [z1, z2, z3, z4, z5];
// }



function getScenario2Temps(): number[][] {
    const z1 = genStableZone(11, 110, 0.3, CHART_N);
    const z2 = genStableZone(22, 110, 0.25, CHART_N);
    const z3 = genStableZone(33, 110, 0.28, CHART_N);
    const z5 = genStableZone(55, 110, 0.32, CHART_N);

    const z4: number[] = new Array(CHART_N).fill(110);

    // Irregular spike definitions: [peakIndex, peakHeight, leftWidth, rightWidth]
    // Left/right widths are asymmetric for natural jagged look
    // Heights grow from ~120 at x=200 to ~500 at x=490
    const spikes: [number, number, number, number][] = [
        // Small starts x=200-250
        [203, 122, 1, 2], [207, 118, 2, 1], [211, 130, 1, 3],
        [216, 115, 2, 1], [219, 128, 1, 2], [223, 135, 2, 2],
        [227, 120, 1, 1], [231, 142, 2, 3], [236, 125, 1, 2],
        [240, 150, 2, 2], [244, 138, 3, 1], [248, 155, 1, 3],

        // Medium x=250-310
        [253, 168, 2, 2], [258, 180, 1, 3], [263, 172, 3, 2],
        [268, 195, 2, 1], [272, 185, 1, 2], [276, 210, 2, 3],
        [281, 198, 3, 1], [285, 222, 1, 2], [290, 215, 2, 2],
        [295, 240, 1, 3], [300, 228, 3, 2], [305, 255, 2, 1],

        // Growing x=310-380
        [310, 268, 2, 3], [315, 280, 1, 2], [320, 295, 3, 1],
        [325, 278, 2, 2], [330, 310, 1, 3], [335, 298, 2, 2],
        [341, 325, 3, 1], [346, 315, 1, 2], [351, 340, 2, 3],
        [357, 330, 3, 2], [362, 358, 1, 2], [368, 345, 2, 1],
        [373, 372, 1, 3], [379, 360, 3, 2],

        // Large x=380-500
        [385, 388, 2, 2], [390, 375, 1, 3], [396, 405, 3, 1],
        [401, 395, 2, 2], [407, 420, 1, 2], [412, 410, 2, 3],
        [418, 438, 3, 1], [423, 428, 1, 2], [429, 450, 2, 2],
        [434, 442, 3, 2], [440, 465, 1, 3], [445, 458, 2, 1],
        [451, 478, 2, 2], [456, 470, 1, 3], [462, 488, 3, 2],
        [467, 480, 2, 1], [473, 495, 1, 2], [478, 488, 2, 3],
        [484, 498, 3, 1], [489, 492, 1, 2], [494, 500, 2, 2],
        [499, 495, 1, 1],
    ];

    for (const [peak, height, lw, rw] of spikes) {
        // Rising edge (left side)
        for (let d = lw; d >= 1; d--) {
            const idx = peak - d;
            if (idx >= 0 && idx < CHART_N) {
                const frac = (lw - d + 1) / (lw + 1);
                z4[idx] = Math.max(z4[idx], 110 + frac * (height - 110));
            }
        }
        // Peak
        if (peak < CHART_N) {
            z4[peak] = Math.max(z4[peak], height + (seededRand(peak * 7)() - 0.5) * height * 0.03);
        }
        // Falling edge (right side)
        for (let d = 1; d <= rw; d++) {
            const idx = peak + d;
            if (idx < CHART_N) {
                const frac = (rw - d + 1) / (rw + 1);
                z4[idx] = Math.max(z4[idx], 110 + frac * (height - 110));
            }
        }
    }

    // Ensure baseline stays at exactly 110
    for (let i = 0; i < CHART_N; i++) {
        z4[i] = Math.max(110, Math.min(502, z4[i]));
        // Add tiny noise only at baseline
        if (z4[i] <= 111) {
            z4[i] = 110 + (seededRand(77 + i)() - 0.5) * 0.3;
        }
    }

    return [z1, z2, z3, z4, z5];
}




function getScenario2Duty(): number[][] {
    const makeDuty = (seed: number, base: number) => {
        const rand = seededRand(seed);
        return Array.from({ length: CHART_N }, (_, i) => {
            const drift = (i / CHART_N) * 16;
            return Math.min(68, Math.max(28, base + drift + (rand() - 0.5) * 10));
        });
    };
    const dz1 = makeDuty(101, 38);
    const dz2 = makeDuty(102, 36);
    const dz3 = makeDuty(103, 34);
    const dz5 = makeDuty(105, 40);

    const SPIKE_START = 200;
    const dz4: number[] = [];

    // Duty cycle spikes: INVERSE of temperature
    // When temp spikes UP → duty 0%
    // When temp drops to 23°C → duty 95-100%
    // When temp at 110°C baseline → duty ~40-50%
    const dutyPoints: [number, number][] = [
        [0, 40], [199, 42],
        // Mirror the temperature spike table exactly but inverted
        [200, 42], [203, 2], [205, 42],
        [207, 4], [209, 42],
        [211, 2], [213, 96], [215, 42],
        [217, 3], [219, 42],
        [221, 4], [222, 97], [224, 42],
        [226, 2], [228, 42],
        [230, 3], [231, 95], [233, 42],
        [235, 2], [237, 42],
        [239, 4], [240, 96], [242, 42],
        [244, 2], [246, 42],
        [248, 97], [250, 42],

        [252, 2], [255, 42],
        [256, 96], [258, 42],
        [260, 2], [263, 42],
        [265, 97], [267, 42],
        [269, 2], [272, 42],
        [274, 96], [276, 42],
        [278, 2], [281, 42],
        [283, 97], [285, 42],
        [287, 2], [290, 42],
        [292, 96], [294, 42],
        [296, 2], [299, 42],

        [301, 95], [303, 42],
        [305, 2], [309, 42],
        [311, 96], [313, 42],
        [315, 2], [319, 42],
        [321, 97], [323, 42],
        [325, 2], [329, 42],
        [331, 95], [333, 42],
        [335, 2], [339, 42],
        [341, 96], [343, 42],
        [345, 2], [349, 42],
        [351, 97], [353, 42],
        [355, 2], [359, 42],
        [361, 95], [363, 42],
        [365, 2], [369, 42],
        [371, 96], [373, 42],
        [375, 2], [379, 42],

        [381, 96], [383, 42],
        [385, 2], [389, 42],
        [391, 95], [393, 42],
        [395, 2], [399, 42],
        [401, 97], [403, 42],
        [405, 2], [409, 42],
        [411, 96], [413, 42],
        [415, 2], [419, 42],
        [421, 95], [423, 42],
        [425, 2], [429, 42],
        [431, 96], [433, 42],
        [435, 2], [439, 42],
        [441, 97], [443, 42],
        [445, 2], [449, 42],
        [451, 96], [453, 42],
        [455, 2], [459, 42],
        [461, 95], [463, 42],
        [465, 2], [469, 42],
        [471, 97], [473, 42],
        [475, 2], [479, 42],
        [481, 96], [483, 42],
        [485, 2], [489, 42],
        [491, 95], [493, 42],
        [495, 2], [499, 42],
        [500, 42],
    ];

    for (let i = 0; i < CHART_N; i++) {
        let lo = dutyPoints[0];
        let hi = dutyPoints[dutyPoints.length - 1];
        for (let j = 0; j < dutyPoints.length - 1; j++) {
            if (dutyPoints[j][0] <= i && dutyPoints[j + 1][0] >= i) {
                lo = dutyPoints[j];
                hi = dutyPoints[j + 1];
                break;
            }
        }
        const t = hi[0] === lo[0] ? 0 : (i - lo[0]) / (hi[0] - lo[0]);
        const val = lo[1] + t * (hi[1] - lo[1]);
        const noise = (seededRand(203 + i * 3)() - 0.5) * 2;
        dz4.push(Math.max(0, Math.min(100, val + noise)));
    }

    return [dz1, dz2, dz3, dz4, dz5];
}

// =============================================
// MULTI-ZONE CANVAS RENDERER  ← NEW
// =============================================
function drawMultiZoneChart(
    canvas: HTMLCanvasElement,
    datasets: { data: number[]; color: string }[],
    yMin: number,
    yMax: number,
    yTickCount: number,
    yTickFmt: (v: number) => string,
    bgColor: string,
    annotationFn?: (
        ctx: CanvasRenderingContext2D,
        sx: (i: number) => number,
        sy: (v: number) => number,
        W: number,
        H: number,
        pad: { l: number; t: number; r: number; b: number }
    ) => void
) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    canvas.width = rect.width;
    canvas.height = 150;
    const W = rect.width, H = 150;
    const pad = { l: 48, t: 12, r: 16, b: 24 };
    const gW = W - pad.l - pad.r;
    const gH = H - pad.t - pad.b;
    const n = datasets[0]?.data.length ?? 1;

    const sx = (i: number) => pad.l + (i / (n - 1)) * gW;
    const sy = (v: number) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * gH;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Horizontal grid lines
    for (let i = 0; i <= yTickCount; i++) {
        const v = yMin + (yMax - yMin) * (i / yTickCount);
        const y = sy(v);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,0,0,0.07)';
        ctx.lineWidth = 0.8;
        ctx.moveTo(pad.l, y);
        ctx.lineTo(W - pad.r, y);
        ctx.stroke();
    }

    // Vertical grid lines at x = 0,100,200,300,400,500
    [0, 100, 200, 300, 400, 500].forEach(xVal => {
        const xi = Math.round((xVal / 500) * (n - 1));
        const x = sx(xi);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,0,0,0.07)';
        ctx.lineWidth = 0.8;
        ctx.moveTo(x, pad.t);
        ctx.lineTo(x, H - pad.b);
        ctx.stroke();
    });

    // Zone lines — clip to chart area so spikes don't overflow
    // In drawMultiZoneChart function, replace the datasets.forEach section with this:

    datasets.forEach(({ data, color }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;  // Thicker line for spikes
        ctx.lineJoin = 'round';  // SHARP corners (not rounded)
        ctx.lineCap = 'round';    // Sharp ends

        let firstPoint = true;
        data.forEach((v, i) => {
            const clampedV = Math.max(yMin - (yMax - yMin) * 0.1, Math.min(yMax + (yMax - yMin) * 0.1, v));
            if (firstPoint) {
                ctx.moveTo(sx(i), sy(clampedV));
                firstPoint = false;
            } else {
                ctx.lineTo(sx(i), sy(clampedV));
            }
        });
        ctx.stroke();
    });

    // Y-axis tick labels
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#555555';
    for (let i = 0; i <= yTickCount; i++) {
        const v = yMin + (yMax - yMin) * (i / yTickCount);
        ctx.fillText(yTickFmt(v), pad.l - 5, sy(v) + 3);
    }

    // X-axis tick labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#555555';
    [0, 100, 200, 300, 400, 500].forEach(xVal => {
        const xi = Math.round((xVal / 500) * (n - 1));
        ctx.fillText(String(xVal), sx(xi), H - pad.b + 12);
    });

    // Axis border lines
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, H - pad.b);
    ctx.lineTo(W - pad.r, H - pad.b);
    ctx.stroke();

    // Custom annotations (called after clip is restored)
    if (annotationFn) annotationFn(ctx, sx, sy, W, H, pad);
}

// =============================================
// COMPONENT
// =============================================
const Failure: React.FC = () => {
    const [currentFM, setCurrentFM] = useState<number>(0);
    const [isDark, setIsDark] = useState<boolean>(true);
    const [pebScenario, setPebScenario] = useState<PEBScenario>(null);
    const [activeTab, setActiveTab] = useState<TabType | null>(null);
    const [isMounted, setIsMounted] = useState<boolean>(false);

    const rtmCanvasRef = useRef<HTMLCanvasElement>(null);
    const spcCanvasRef = useRef<HTMLCanvasElement>(null);
    const dutyCanvasRef = useRef<HTMLCanvasElement>(null);
    const waferMapCanvasRef = useRef<HTMLCanvasElement>(null);

    const fm = FM_DATA[currentFM];
    const isPEB = currentFM === 0;

    useEffect(() => { setIsMounted(true); }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    };

    const selectFM = (idx: number) => {
        setCurrentFM(idx);
        setPebScenario(null);
        setActiveTab(null);
    };

    const toggleTroubleshooting = () => {
        setActiveTab(activeTab === 'troubleshooting' ? null : 'troubleshooting');
    };

    const toggleOCAP = () => {
        setActiveTab(activeTab === 'ocap' ? null : 'ocap');
    };

    const getColors = useCallback(() => ({
        red: isDark ? '#ff1744' : '#d90026',
        green: isDark ? '#00e676' : '#00a846',
        orange: '#ff9800',
        white: isDark ? '#ffffff' : '#000000',
        text: isDark ? '#7ba3c8' : '#2a4a70',
        text3: isDark ? '#4a6a8a' : '#5a7a9a',
        grid: isDark ? 'rgba(0,229,255,0.07)' : 'rgba(0,100,180,0.08)',
        bg: isDark ? '#111927' : '#f5f8ff',
        bg2: isDark ? '#192438' : '#e4ecf7',
        accent: isDark ? '#00e5ff' : '#0066cc',
    }), [isDark]);

    function drawChart(
        canvas: HTMLCanvasElement,
        data: number[],
        target: number, ucl: number, lcl: number,
        label: string, height: number,
        colors: ReturnType<typeof getColors>,
        lineColor?: string
    ) {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0) return;
        canvas.width = rect.width;
        canvas.height = height;
        const W = rect.width, H = height;
        const c = colors;
        const pad = { l: 42, t: 12, r: 44, b: 22 };
        const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;
        const allV = [...data, ucl, lcl, target];
        const minV = Math.min(...allV) - Math.abs(Math.min(...allV)) * 0.01 - 0.5;
        const maxV = Math.max(...allV) + Math.abs(Math.max(...allV)) * 0.01 + 0.5;
        const sx = (i: number) => pad.l + (i / (data.length - 1)) * gW;
        const sy = (v: number) => pad.t + (1 - (v - minV) / (maxV - minV)) * gH;
        const ctx = canvas.getContext('2d')!;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = c.grid; ctx.lineWidth = 0.5;
        for (let i = 0; i <= 5; i++) {
            const y = pad.t + (gH / 5) * i;
            ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
        }

        ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
        [[ucl, 'UCL'], [lcl, 'LCL']].forEach(([v, lbl]) => {
            ctx.strokeStyle = c.red;
            const y = sy(v as number);
            ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
            ctx.fillStyle = c.red; ctx.font = '9px "Share Tech Mono", monospace';
            ctx.fillText(lbl as string, W - pad.r + 4, y + 3);
        });

        ctx.strokeStyle = c.white; ctx.setLineDash([4, 6]); ctx.lineWidth = 1.5;
        const ty = sy(target);
        ctx.beginPath(); ctx.moveTo(pad.l, ty); ctx.lineTo(W - pad.r, ty); ctx.stroke();
        ctx.fillStyle = c.white; ctx.font = '9px "Share Tech Mono", monospace';
        ctx.fillText('TARGET', W - pad.r + 4, ty - 3);
        ctx.setLineDash([]);

        ctx.beginPath();
        data.forEach((v, i) => { i === 0 ? ctx.moveTo(sx(i), sy(v)) : ctx.lineTo(sx(i), sy(v)); });
        ctx.lineTo(sx(data.length - 1), H - pad.b);
        ctx.lineTo(sx(0), H - pad.b);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
        grad.addColorStop(0, isDark ? 'rgba(0,229,255,0.12)' : 'rgba(0,102,204,0.08)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad; ctx.fill();

        data.forEach((v, i) => {
            if (i === 0) return;
            const ooc = v > ucl || v < lcl;
            ctx.strokeStyle = lineColor || (ooc ? c.red : c.green);
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(sx(i - 1), sy(data[i - 1])); ctx.lineTo(sx(i), sy(v)); ctx.stroke();
        });

        data.forEach((v, i) => {
            const ooc = v > ucl || v < lcl;
            ctx.beginPath(); ctx.arc(sx(i), sy(v), 3.5, 0, Math.PI * 2);
            ctx.fillStyle = lineColor || (ooc ? c.red : c.green); ctx.fill();
            ctx.beginPath(); ctx.arc(sx(i), sy(v), 1.8, 0, Math.PI * 2);
            ctx.fillStyle = c.bg; ctx.fill();
        });

        ctx.fillStyle = c.text; ctx.font = '9px "Share Tech Mono", monospace'; ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const v = minV + (maxV - minV) * i / 5;
            ctx.fillText(v.toFixed(1), pad.l - 4, sy(v) + 3);
        }
        ctx.textAlign = 'left'; ctx.fillStyle = c.text3;
        ctx.fillText(label, pad.l, H - 4);
    }

    // =============================================
    // drawRTM  ← UPDATED
    // =============================================
    const drawRTM = useCallback(() => {
        if (!isMounted) return;
        const canvas = rtmCanvasRef.current;
        if (!canvas) return;

        if (isPEB && pebScenario) {
            const ZONE_COLORS = {
                z1: '#4ecdc4',
                z2: '#e05c5c',
                z3: '#a0a0a0',
                z4: '#e8a020',   // amber/orange — matches Image 1's Zone 4 line
                z5: '#7fc97f',
            };

            if (pebScenario === 1 || pebScenario === 3) {
                const FAIL_PT = 210;
                const temps = getScenario13Temps(FAIL_PT);
                const datasets = temps.map((data, i) => ({ data, color: ZONE_COLORS[`z${i + 1}`] }));


                const failLabel = pebScenario === 3 ? 'SSR FAIL' : 'HEATER FAIL';
                drawMultiZoneChart(
                    canvas,
                    datasets,
                    0,    // yMin = 0
                    520,  // yMax = 520
                    5,
                    (v) => {
                        if (v < 8) return '0';
                        if (v < 125) return '110.0';
                        if (v < 225) return '';
                        if (v < 310) return '300.0';
                        if (v < 410) return '400.0';
                        return '500.0';
                    },
                    '#ffffff',
                    (ctx, sx, sy, W, H, pad) => {
                        const arrowTipX = sx(325);
                        const arrowTipY = sy(310);
                        const labelX = arrowTipX - 95;
                        const labelY = arrowTipY - 28;

                        ctx.beginPath();
                        ctx.moveTo(labelX + 90, labelY + 5);
                        ctx.lineTo(arrowTipX - 2, arrowTipY - 4);
                        ctx.strokeStyle = 'rgba(232,160,32,0.95)';
                        ctx.lineWidth = 1.2;
                        ctx.setLineDash([]);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.moveTo(arrowTipX - 2, arrowTipY - 4);
                        ctx.lineTo(arrowTipX - 8, arrowTipY - 13);
                        ctx.lineTo(arrowTipX + 4, arrowTipY - 11);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(232,160,32,0.95)';
                        ctx.fill();

                        ctx.fillStyle = '#e8a020';
                        ctx.font = 'bold 9px "Share Tech Mono", monospace';
                        ctx.textAlign = 'left';
                        ctx.fillText('SEVERE TC SPIKES', labelX, labelY);
                    },
                
                );

            } else if (pebScenario === 2) {
                const temps = getScenario2Temps();
                const ZONE_DS_ORDER = [
                    ZONE_COLORS.z1, ZONE_COLORS.z2, ZONE_COLORS.z3,
                    ZONE_COLORS.z4, ZONE_COLORS.z5,
                ];
                const datasets = temps.map((data, i) => ({ data, color: ZONE_DS_ORDER[i] }));

                drawMultiZoneChart(
                    canvas,
                    datasets,
                    0, 520, 5,
                    (v) => {
                        if (v < 8) return '0';
                        if (v < 35) return '23.0';
                        if (v < 75) return '40.0';
                        if (v < 125) return '110.0';
                        if (v < 155) return '120.0';
                        if (v < 270) return '';
                        if (v < 360) return '300.0';
                        if (v < 455) return '400.0';
                        return '500.0';
                    },
                    '#ffffff',
                    (ctx, sx, sy, W, H, pad) => {
                        // Arrow from label → spike at ~x=320, y=300°C
                        const arrowTipX = sx(322);
                        const arrowTipY = sy(310);
                        const labelX = arrowTipX - 95;
                        const labelY = arrowTipY - 30;

                        ctx.beginPath();
                        ctx.moveTo(labelX + 90, labelY + 5);
                        ctx.lineTo(arrowTipX - 2, arrowTipY - 4);
                        ctx.strokeStyle = 'rgba(232,160,32,0.95)';
                        ctx.lineWidth = 1.2;
                        ctx.setLineDash([]);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.moveTo(arrowTipX - 2, arrowTipY - 4);
                        ctx.lineTo(arrowTipX - 8, arrowTipY - 13);
                        ctx.lineTo(arrowTipX + 4, arrowTipY - 11);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(232,160,32,0.95)';
                        ctx.fill();

                        ctx.fillStyle = '#e8a020';
                        ctx.font = 'bold 9px "Share Tech Mono", monospace';
                        ctx.textAlign = 'left';
                        ctx.fillText('SEVERE TC SPIKES', labelX, labelY);
                    }
                );
            }

        } else {
            // Non-PEB failure modes — original drawChart
            const c = getColors();
            drawChart(canvas, fm.rtmData, fm.rtmTarget, fm.rtmUcl, fm.rtmLcl, fm.rtmLabel, 150, c);
        }
    }, [fm, isDark, getColors, isPEB, pebScenario, isMounted]);

    // =============================================
    // drawDuty  ← UPDATED
    // =============================================
    const drawDuty = useCallback(() => {
        if (!isMounted) return;
        const canvas = dutyCanvasRef.current;
        if (!canvas) return;

        if (isPEB && pebScenario) {
            const ZONE_DS_ORDER = [
                ZONE_COLORS.z1,
                ZONE_COLORS.z2,
                ZONE_COLORS.z3,
                ZONE_COLORS.z4,
                ZONE_COLORS.z5,
            ];

            if (pebScenario === 1 || pebScenario === 3) {
                const DUTY_JUMP = 150;
                const duty = getScenario13Duty(DUTY_JUMP);
                const datasets = duty.map((data, i) => ({ data, color: ZONE_DS_ORDER[i] }));

                drawMultiZoneChart(
                    canvas,
                    datasets,
                    0, 100, 5,
                    (v) => `${Math.round(v)}%`,
                    '#ffffff',
                    (ctx, sx, sy, W, H, pad) => {
                        const labelX = sx(280);
                        const labelY = sy(94);
                        ctx.fillStyle = '#e8a020';
                        ctx.font = 'bold 9px "Share Tech Mono", monospace';
                        ctx.textAlign = 'left';
                        ctx.fillText('DUTY CYCLE CHATTERING', labelX, labelY);
                    }
                );


            } else if (pebScenario === 2) {
                const duty = getScenario2Duty();
                const ZONE_DS_ORDER = [
                    ZONE_COLORS.z1, ZONE_COLORS.z2, ZONE_COLORS.z3,
                    ZONE_COLORS.z4, ZONE_COLORS.z5,
                ];
                const datasets = duty.map((data, i) => ({ data, color: ZONE_DS_ORDER[i] }));

                drawMultiZoneChart(
                    canvas,
                    datasets,
                    0, 100, 5,
                    (v) => `${Math.round(v)}%`,
                    '#ffffff',
                    (ctx, sx, sy, W, H, pad) => {
                        const labelX = sx(240);
                        const labelY = sy(95);
                        ctx.fillStyle = '#e8a020';
                        ctx.font = 'bold 9px "Share Tech Mono", monospace';
                        ctx.textAlign = 'left';
                        ctx.fillText('DUTY CYCLE CHATTERING', labelX, labelY);
                    }
                );
            }
        } else {
            // Non-PEB — clear the canvas with white bg
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width || 300;
            canvas.height = 150;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, 150);
        }
    }, [isPEB, pebScenario, isDark, getColors, fm, isMounted]);

    const drawSPC = useCallback(() => {
        if (!isMounted) return;
        const canvas = spcCanvasRef.current; if (!canvas) return;
        const c = getColors();
        drawChart(canvas, fm.spcData, 100, 105, 95, 'WAFER NUMBER → | CD (nm)', 160, c);
    }, [fm, isDark, getColors, isMounted]);

    const drawWaferMap = useCallback(() => {
        if (!isMounted) return;
        const canvas = waferMapCanvasRef.current; if (!canvas) return;
        drawWaferCDMap(canvas, isPEB ? pebScenario : null, isDark);
    }, [isPEB, pebScenario, isDark, isMounted]);

    // Only draw charts when activeTab is null (not in troubleshooting/ocap view)
    useEffect(() => {
        if (!isMounted || activeTab !== null) return;
        const t = setTimeout(() => {
            drawRTM(); drawSPC(); drawDuty(); drawWaferMap();
        }, 100);
        return () => clearTimeout(t);
    }, [drawRTM, drawSPC, drawDuty, drawWaferMap, currentFM, pebScenario, isDark, isMounted, activeTab]);

    useEffect(() => {
        if (!isMounted) return;
        const h = () => {
            if (activeTab !== null) return;
            drawRTM(); drawSPC(); drawDuty(); drawWaferMap();
        };
        window.addEventListener('resize', h);
        return () => window.removeEventListener('resize', h);
    }, [drawRTM, drawSPC, drawDuty, drawWaferMap, isMounted, activeTab]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        }
    }, [isDark]);

    const getSevClass = (s: string) =>
        s === 'CRITICAL' ? 'sev-critical' : s === 'HIGH' ? 'sev-high' : 'sev-medium';

    const pebSc = isPEB && pebScenario ? getPEBScenarioData(pebScenario) : null;

    if (!isMounted) {
        return (
            <div className="failure-page">
                <div className="main-content">
                    <div className="loading">Loading...</div>
                </div>
            </div>
        );
    }

    const dangerZoneIndex = pebSc ? (pebSc.dangerZone - 1) : -1;

    return (
        <div className="failure-page">
            <div className="scanlines" />

            <nav className="top-nav">
                <div className="nav-logo">
                    <span className="logo-icon">⬡</span>
                    <span>SEM<span className="accent">ATI</span></span>
                </div>
                <div className="nav-links">
                    <a href="#" className="nav-link">HOME</a>
                </div>
                <div className="nav-right">
                    <span className="status-dot" />
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {isDark ? '☀ LIGHT MODE' : '🌙 DARK MODE'}
                    </button>
                </div>
            </nav>

            <div className="page-header">
                <div>
                    <div className="page-breadcrumb">SEMATI / MODULE 04</div>
                    <div className="page-title">FAILURE MODE <span>SIMULATION</span></div>
                </div>
                <div className="header-stats">
                    <div className="h-stat"><div className="h-stat-val">5</div><div className="h-stat-lbl">FMEA MODES</div></div>
                    <div className="h-stat"><div className="h-stat-val">{fm.alarms.length}</div><div className="h-stat-lbl">ACTIVE ALARMS</div></div>
                    <div className="h-stat"><div className="h-stat-val">300mm</div><div className="h-stat-lbl">WAFER SIZE</div></div>
                </div>
            </div>

            <div className="main-content">

                {/* FM TABS */}
                <div className="row-failure-modes">
                    {FM_DATA.map((mode, idx) => (
                        <div
                            key={mode.id}
                            className={`fm-tab ${getSevClass(mode.severity)} ${currentFM === idx ? 'active' : ''}`}
                            onClick={() => selectFM(idx)}
                        >
                            <div className="fm-tab-id">{mode.id} · {mode.type}</div>
                            <div className="fm-tab-name">{mode.name}</div>
                        </div>
                    ))}
                </div>

                {/* KEY INFO */}
                <div className="row-key-info">
                    <div className="key-info-label">⬡ KEY INFORMATION</div>
                    <div className="key-info-content" dangerouslySetInnerHTML={{ __html: fm.keyInfo }} />
                </div>

                {/* SCENARIOS + LOT */}
                <div className="row-scenarios">
                    <button
                        className={`scenario-btn ${isPEB && pebScenario === 1 ? 'active' : ''}`}
                        onClick={() => isPEB && setPebScenario(pebScenario === 1 ? null : 1)}
                        disabled={!isPEB}
                        style={{ opacity: isPEB ? 1 : 0.4, cursor: isPEB ? 'pointer' : 'not-allowed' }}
                    >
                        <span className="scenario-num">SCENARIO 1</span>
                        <span className="scenario-name">Failing Heating Element</span>
                        <span className="scenario-desc">
                            Zone <span style={{ color: '#ff0000', fontWeight: '700' }}>4</span> drops to ambient — duty cycle 100%
                        </span>
                    </button>

                    <button
                        className={`scenario-btn ${isPEB && pebScenario === 2 ? 'active' : ''}`}
                        onClick={() => isPEB && setPebScenario(pebScenario === 2 ? null : 2)}
                        disabled={!isPEB}
                        style={{ opacity: isPEB ? 1 : 0.4, cursor: isPEB ? 'pointer' : 'not-allowed' }}
                    >
                        <span className="scenario-num">SCENARIO 2</span>
                        <span className="scenario-name">Broken Thermocouple</span>
                        <span className="scenario-desc">
                            Zone <span style={{ color: '#ff0000', fontWeight: '700' }}>3</span> severe spikes — duty cycle chatters 0–100%
                        </span>
                    </button>

                    <button
                        className={`scenario-btn ${isPEB && pebScenario === 3 ? 'active' : ''}`}
                        onClick={() => isPEB && setPebScenario(pebScenario === 3 ? null : 3)}
                        disabled={!isPEB}
                        style={{ opacity: isPEB ? 1 : 0.4, cursor: isPEB ? 'pointer' : 'not-allowed' }}
                    >
                        <span className="scenario-num">SCENARIO 3</span>
                        <span className="scenario-name">Blown SSR (Stuck OFF)</span>
                        <span className="scenario-desc">
                            Zone <span style={{ color: '#ff0000', fontWeight: '700' }}>5</span> identical to Sc.1 — Ohm test required to distinguish
                        </span>
                    </button>
                    <div className="scenario-btn static-info-btn">
                        <span className="scenario-num">LOT ID</span>
                        <span className="scenario-name">{fm.lotId}</span>
                        <span className="scenario-desc">Production Lot Information</span>
                    </div>
                    <div className="scenario-btn static-info-btn">
                        <span className="scenario-num">RECIPE</span>
                        <span className="scenario-name">{fm.recipe}</span>
                        <span className="scenario-desc">Current Process Recipe</span>
                    </div>
                </div>

                {/* Scenario info bar */}
                {pebSc && (
                    <div className={`scenario-info-bar s${pebScenario}`}>
                        <div className="scenario-icon">{pebSc.icon}</div>
                        <div className="scenario-info-text">{pebSc.desc}</div>
                        {pebSc.warn && <div className="scenario-warn-badge">{pebSc.warn}</div>}
                    </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="row-zone-tabs">
                    <button
                        className={`zone-header-btn ${activeTab === 'rtmspc' ? 'active' : ''}`}
                        onClick={() => setActiveTab(activeTab === 'rtmspc' ? null : 'rtmspc')}
                    >
                        ⬡ Equipment RTM / Process SPC chart
                    </button>
                    <button
                        className={`zone-header-btn ${activeTab === 'troubleshooting' ? 'active' : ''}`}
                        onClick={toggleTroubleshooting}
                    >
                        ⬡ EQUIPMENT TROUBLESHOOTING
                    </button>
                    <button
                        className={`zone-header-btn ${activeTab === 'ocap' ? 'active' : ''}`}
                        onClick={toggleOCAP}
                    >
                        ⬡ PROCESS OCAP
                    </button>
                </div>

                {/* DANGER ZONE INDICATOR */}
                {isPEB && pebSc && (
                    <div className="danger-zone-banner">
                        <div className="danger-zone-header">
                            <span className="danger-zone-icon">⚠</span>
                            <span className="danger-zone-title">ZONE {pebSc.dangerZone} — CRITICAL DEVIATION DETECTED</span>
                            <span className="danger-zone-badge">{pebSc.dangerStatus}</span>
                        </div>
                        <div className="zone-indicators-row">
                            {fm.zones.map((z, idx) => {
                                const isDanger = idx === dangerZoneIndex;
                                return (
                                    <div
                                        key={z.label}
                                        className={`zone-indicator ${isDanger ? 'zone-indicator--danger' : 'zone-indicator--ok'}`}
                                    >
                                        <div className="zone-indicator-label">{z.label}</div>
                                        <div className="zone-indicator-temp">
                                            {isDanger ? pebSc.dangerTemp : z.temp}
                                        </div>
                                        <div className="zone-indicator-status">
                                            {isDanger ? pebSc.dangerStatus : z.note}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* EQUIPMENT TROUBLESHOOTING */}
                {activeTab === 'troubleshooting' && (
                    <div className="full-action-section">
                        <div className="troubleshooting-block">
                            <div className="action-section-header">
                                <span className="action-section-title">⬡ EQUIPMENT TROUBLESHOOTING</span>
                                <span className="action-section-sub">{fm.name}</span>
                            </div>
                            <div className="trouble-steps-grid">
                                {fm.troubleshootingSteps.map((step, idx) => (
                                    <div key={idx} className="trouble-item">
                                        <div className="trouble-item-number">{String(idx + 1).padStart(2, '0')}</div>
                                        <div className="trouble-item-body">
                                            <div className="trouble-item-title">
                                                <span className="trouble-item-icon">{step.icon}</span>
                                                {step.title}
                                            </div>
                                            <div className="trouble-item-desc">{step.description}</div>
                                            <button className="action-btn" onClick={() => alert(step.alertMessage)}>
                                                {step.action}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="restore-section">
                                <div className="restore-section-label">ACTIONS TO RESTORE CONDITION</div>
                                <div className="restore-buttons">
                                    {fm.restoreActions.map((a, idx) => (
                                        <button
                                            key={idx}
                                            className={`restore-btn ${a.primary ? 'primary' : ''}`}
                                            onClick={() => alert(a.alertMessage)}
                                        >
                                            {a.primary ? '★ ' : ''}{a.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PROCESS OCAP */}
                {activeTab === 'ocap' && (
                    <div className="full-action-section">
                        <div className="ocap-block">
                            <div className="action-section-header">
                                <span className="action-section-title">⬡ PROCESS OCAP</span>
                                <span className="action-section-sub">{fm.name}</span>
                            </div>
                            <div className="ocap-flow-grid">
                                {fm.ocapFlow.map((step, idx) => (
                                    <div key={idx} className={`ocap-flow-item ${step.state}`}>
                                        <div className="ocap-step-num">{idx + 1}</div>
                                        <div className="ocap-step-content">
                                            <div className="ocap-step-title">{step.title}</div>
                                            <div className="ocap-step-desc">{step.desc}</div>
                                            <button
                                                className={`ocap-step-btn ${step.btnClass}`}
                                                onClick={() => alert(step.alertMsg)}
                                            >
                                                {step.btnLabel}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="ocap-checklist-section">
                                <div className="ocap-checklist-title">OCAP CHECKLIST</div>
                                <div className="ocap-checklist-grid">
                                    {fm.ocap.map((item, idx) => (
                                        <div key={idx} className="checklist-item">
                                            <input type="checkbox" id={`ck-${currentFM}-${idx}`} />
                                            <label htmlFor={`ck-${currentFM}-${idx}`}>{item}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CHARTS — only shown when no panel is open */}
                {(activeTab === null || activeTab === 'rtmspc') && (
                    <>
                        <div className="charts-wafer-layout">
                            <div className="charts-grid-2x2">

                                {/* RTM Chart */}
                                <div className="chart-block">
                                    <div className="chart-block-label">
                                        <span>
                                            ⬡ {isPEB && pebSc
                                                ? ` TEMP — RTM (°C) Real Time Monitoring / (SPC) Statistical Process Control`
                                                : `RTM — ${fm.rtmLabel}`}
                                        </span>
                                    </div>

                                    {/* Zone Legend */}
                                    {/* Zone Legend */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '20px',
                                            marginBottom: '10px',
                                            fontSize: '12px',
                                            flexWrap: 'wrap'
                                        }}
                                    >
                                        {[
                                            { id: 1, color: '#3a3232' },
                                            { id: 2, color: '#4ecdc4' },
                                            { id: 3, color: '#ffe66d' },
                                            { id: 4, color: '#95e77e' },
                                            { id: 5, color: '#a78bfa' }
                                        ].map((zone) => {
                                            // scenario based active zone
                                            const activeZone =
                                                pebScenario === 1
                                                    ? 4
                                                    : pebScenario === 2
                                                        ? 4
                                                        : pebScenario === 3
                                                            ? 5
                                                            : null;

                                            const isActive = zone.id === activeZone;

                                            return (
                                                <div
                                                    key={zone.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: '20px',
                                                            height: '3px',
                                                            background: isActive ? '#ff0000' : zone.color,
                                                            boxShadow: isActive
                                                                ? '0 0 8px #ff0000'
                                                                : 'none',
                                                            transition: '0.3s ease'
                                                        }}
                                                    ></div>

                                                    <span
                                                        style={{
                                                            color: isActive ? '#ff0000' : '#000000',
                                                            fontWeight: isActive ? '700' : '500'
                                                        }}
                                                    >
                                                        Zone {zone.id}
                                                    </span>
                                                </div>
                                            );
                                        })}


                                    </div>

                                    {/* UCL/LCL Reference Line Labels */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '5px',
                                        fontSize: '11px',
                                        color: '#666'
                                    }}>
                                        <span>UCL: 110.1°C</span>
                                        <span>LCL: 109.9°C</span>
                                    </div>

                                    <canvas ref={rtmCanvasRef} style={{ width: '100%', display: 'block' }} height="150" />
                                </div>

                                {/* Duty Cycle / Alarm Summary */}
                                <div className="chart-block">
                                    <div className="chart-block-label">
                                        <span>
                                            ⬡ {isPEB && pebSc
                                                ? ` HEATER DUTY CYCLE (%)`
                                                : 'PROCESS LIFECYCLE — ALARM SUMMARY'}
                                        </span>
                                    </div>

                                    {/* Add same legend for Duty Cycle chart if needed */}
                                    {isPEB && pebSc && (
                                        <>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '20px',
                                                    marginBottom: '10px',
                                                    fontSize: '12px',
                                                    flexWrap: 'wrap'
                                                }}
                                            >
                                                {[
                                                    { id: 1, color: '#3c3434' },
                                                    { id: 2, color: '#4ecdc4' },
                                                    { id: 3, color: '#ffe66d' },
                                                    { id: 4, color: '#95e77e' },
                                                    { id: 5, color: '#a78bfa' }
                                                ].map((zone) => {

                                                    // scenario based active zone
                                                    const activeZone =
                                                        pebScenario === 1
                                                            ? 4
                                                            : pebScenario === 2
                                                                ? 3
                                                                : pebScenario === 3
                                                                    ? 5
                                                                    : null;

                                                    const isActive = zone.id === activeZone;

                                                    return (
                                                        <div
                                                            key={zone.id}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '5px'
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width: '20px',
                                                                    height: '3px',
                                                                    background: isActive ? '#ff0000' : zone.color,
                                                                    boxShadow: isActive
                                                                        ? '0 0 8px #ff0000'
                                                                        : 'none',
                                                                    transition: '0.3s ease'
                                                                }}
                                                            ></div>

                                                            <span
                                                                style={{
                                                                    color: isActive ? '#ff0000' : '#000000',
                                                                    fontWeight: isActive ? '700' : '500'
                                                                }}
                                                            >
                                                                Zone {zone.id}
                                                            </span>
                                                        </div>
                                                    );
                                                })}


                                            </div>

                                            {/* UCL/LCL Reference Line Labels for Duty Cycle */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: '5px',
                                                fontSize: '11px',
                                                color: '#666'
                                            }}>
                                                <span>UCL: 110.1°C</span>
                                                <span>LCL: 109.9°C</span>
                                            </div>
                                        </>
                                    )}

                                    {isPEB && pebSc ? (
                                        <canvas ref={dutyCanvasRef} style={{ width: '100%', display: 'block' }} height="150" />
                                    ) : (
                                        <div className="alarm-list">
                                            {fm.alarms.map((alarm) => (
                                                <div key={alarm.id} className={`alarm-item alarm-${alarm.level}`}>
                                                    <div className="alarm-header">
                                                        <span className="alarm-id">{alarm.id}</span>
                                                        <span className="alarm-time">{alarm.time}</span>
                                                    </div>
                                                    <div className="alarm-name">{alarm.name}</div>
                                                    {Object.entries(alarm.params).slice(0, 3).map(([k, v]) => (
                                                        <div key={k} className="alarm-param">
                                                            <span>{k}</span><span>{v}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Offline CD-SEM */}
                                <div className="chart-block">
                                    <div className="chart-block-label">
                                        <span>
                                            ⬡ OFFLINE CD-SEM (Average CD, <span className="lowercase-unit">nm</span>)
                                        </span>
                                        {isPEB && pebSc && (
                                            <span className="chart-badge-red">
                                                {pebScenario === 2 ? 'OOS MIXTURE' : 'DOWNWARD SHIFT'}
                                            </span>
                                        )}
                                    </div>
                                    {isPEB && pebSc ? (
                                        <img
                                            src={pebScenario === 2 ? '/scenario2-cdoffline1.png' : '/scenarion1graph.png'}
                                            alt="CD-SEM chart"
                                            style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'center', borderRadius: '6px' }}
                                        />
                                    ) : (
                                        <div className="chart-empty">Select PEB Scenario to view CD-SEM data</div>
                                    )}
                                </div>

                                {/* CD Uniformity */}
                                <div className="chart-block">
                                    <div className="chart-block-label">
                                        <span>
                                            ⬡ CD UNIFORMITY (Range, <span className="lowercase-unit">nm</span>)
                                        </span>
                                        {isPEB && pebSc && (
                                            <span className="chart-badge-orange">
                                                {pebScenario === 2 ? 'HIGH VARIABILITY' : 'SPIKING'}
                                            </span>
                                        )}
                                    </div>
                                    {isPEB && pebSc ? (
                                        <img
                                            src={pebScenario === 2 ? '/scenario2-cduniform2.png' : '/scenario13-cduniform.png'}
                                            alt="CD Uniformity chart"
                                            style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'center', borderRadius: '6px' }}
                                        />
                                    ) : (
                                        <div className="chart-empty">Select PEB Scenario to view CD Uniformity data</div>
                                    )}
                                </div>
                            </div>

                            {/* Wafer Map */}
                            <div className="wafer-map-block">
                                <div className="chart-block-label">
                                    <span>⬡ 300mm WAFER CD MAP</span>
                                    {isPEB && pebSc && (
                                        <span className={`chart-badge-${pebScenario === 3 ? 'orange' : 'red'}`}>
                                            {pebScenario === 1 ? 'ZONE DROP' : pebScenario === 2 ? 'ERRATIC' : 'IDENTICAL TO SC1'}
                                        </span>
                                    )}
                                </div>
                                <div className="wafer-map-canvas-wrap">
                                    <img
                                        src={
                                            pebScenario === 2
                                                ? "/waffermapscenario2.png"
                                                : "/wafercd.png"
                                        }
                                        alt="Wafer CD Map"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                            display: 'block',
                                            borderRadius: '6px'
                                        }}
                                    />
                                </div>
                                <div className="wafer-map-block">
                                    <div className="chart-block-label">
                                        <span>⬡ 300mm WAFER CD MAP</span>
                                        {isPEB && pebSc && (
                                            <span className={`chart-badge-${pebScenario === 3 ? 'orange' : 'red'}`}>
                                                {pebScenario === 1 ? 'ZONE DROP' : pebScenario === 2 ? 'ERRATIC' : 'IDENTICAL TO SC1'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="wafer-map-info">

                                        <div className="wafer-info-row">
                                            <span>Center CD</span>
                                            <strong>22nm</strong>
                                        </div>

                                        <div className="wafer-info-row">
                                            <span>Failure Zone</span>
                                            <strong>
                                                {pebScenario === 2 ? 'Zone 3' : 'Zone 4'}
                                            </strong>
                                        </div>

                                        <div className="wafer-info-row">
                                            <span>Thermal Pattern</span>
                                            <strong>
                                                {pebScenario === 2
                                                    ? 'Erratic Thermal Noise'
                                                    : 'Cold Ring Drift'}
                                            </strong>
                                        </div>

                                        <div className="wafer-info-row">
                                            <span>Process Impact</span>
                                            <strong>
                                                {pebScenario === 2
                                                    ? 'Random CD Variation / Scrap'
                                                    : 'CD Shift / Yield Loss'}
                                            </strong>
                                        </div>

                                        <div className="wafer-info-row">
                                            <span>Diagnosis</span>
                                            <strong>
                                                {pebScenario === 2
                                                    ? 'Broken Thermocouple Sensor'
                                                    : 'Heater / SSR Failure'}
                                            </strong>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default Failure;
