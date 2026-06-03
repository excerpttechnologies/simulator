

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../Failure.css';
import Image from "next/image";
import { useRouter } from "next/navigation";


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
    // New module extras
    fmeaScore?: string;
    physicsImpact?: string;
    rtmSensorLabel?: string;
    rtmNormalValue?: string;
    rtmFailureValue?: string;
    supportingGauges?: { label: string; value: string; status: 'ok' | 'warn' | 'danger' }[];
    spcMetrics?: string[];
    spcRulesTriggered?: string[];
    interlock?: string;
    interlockType?: 'hard' | 'soft';
}

type PEBScenario = 1 | 2 | 3 | null;
type TabType = 'troubleshooting' | 'ocap' | 'rtmspc';

// =============================================
// DATA — EXISTING (PEB + placeholders) — DO NOT TOUCH
// =============================================
const FM_DATA: FailureMode[] = [
    {
        id: "FM-001",
        name: "PEB Temperature Drift",
        severity: "CRITICAL",
        type: "",
        lotId: "WF-2024-0447",
        recipe: "ArF_CAR_110C",
        keyInfo: `
<strong>PEB Temperature Deviation</strong> occurs when one or more hotplate zones drift beyond the control limit from the setpoint. This directly impacts acid diffusion length in CAR (Chemically Amplified Resist), causing CD (critical dimension) shift. Zone 4 is reporting a deviation. Immediate OCAP action required.
<br/><br/>

<strong>Underbaked at PEB:</strong> Partially reacted PR polymerizes into a cross-linked crust. The stripping solvent cannot dissolve it, leaving behind an insoluble residue resulting in wafer scrap.
<br/><br/>

<strong>Overbaked at PEB:</strong> Photoacid diffuses entirely through the PR and chemically attacks the underlying substrate, leaving behind a permanent chemical ghost image on the surface. This causes adhesion or focus defects on the next coat resulting in wafer scrap.
`,
        zones: [
            { label: "ZONE 1", temp: "", status: "healthy", note: "" },
            { label: "ZONE 2", temp: "", status: "healthy", note: "" },
            { label: "ZONE 3", temp: "", status: "healthy", note: "" },
            { label: "ZONE 4", temp: "", status: "danger", note: "" },
            { label: "ZONE 5", temp: "", status: "healthy", note: "" },
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

    // =============================================
    // FM-002: RESIST DISPENSE BUBBLE (from Word doc)
    // =============================================
    {
        id: "FM-002",
        name: "Resist Dispense Bubble",
        severity: "CRITICAL",
        type: "",
        fmeaScore: "9/10 (High)",
        lotId: "WF-2024-0448",
        recipe: "PR_COAT_1800RPM",
        keyInfo: "<strong>Resist Dispense Bubble</strong> — Photoresist is an incompressible fluid. Introduction of air (a compressible gas) into the dispense line causes <em>pressure dampening</em>, leading to incomplete fluid volume delivery or a <em>splatter effect</em> at the nozzle. On the wafer, this manifests as a physical void or a <strong>\"Comet Tail\" defect</strong> where the resist failed to wet the surface, resulting in catastrophic patterning failure (broken circuits). Resist bottle level below 5% detected.",
        physicsImpact: "Air in the dispense line creates pressure dampening, causing incomplete resist delivery. Manifests as circular voids or Comet Tail defects — open circuits.",
        zones: [
            { label: "ZONE 1", temp: "OK", status: "healthy", note: "NORMAL" },
            { label: "ZONE 2", temp: "OK", status: "healthy", note: "NORMAL" },
            { label: "ZONE 3", temp: "WARN", status: "danger", note: "BUBBLE" },
            { label: "ZONE 4", temp: "OK", status: "healthy", note: "NORMAL" },
            { label: "ZONE 5", temp: "OK", status: "healthy", note: "NORMAL" },
        ],
        rtmLabel: "DISPENSE PUMP PRESSURE (PSI)",
        rtmSensorLabel: "Dispense Pump Pressure Transducer (PSI / kPa)",
        rtmNormalValue: "15.0 PSI — smooth square wave plateau",
        rtmFailureValue: "Cavitation spikes / concave dip in 15.0 PSI plateau",
        rtmTarget: 15.0, rtmUcl: 16.5, rtmLcl: 13.5,
        rtmData: [15.0, 15.0, 15.1, 15.0, 14.9, 15.0, 15.0, 14.2, 13.0, 11.5, 16.8, 9.5, 17.2, 10.0, 16.5, 8.8, 15.0, 15.1, 15.0],
        supportingGauges: [
            { label: "Resist Bottle Level", value: "4.2%", status: "danger" },
            { label: "Degasser Vacuum", value: "FLUCTUATING AMBER", status: "warn" },
            { label: "Dispense Pressure", value: "CAVITATION SPIKES", status: "danger" },
        ],
        interlock: "Soft Lock — current wafer finishes processing; 'Start Next Wafer' inhibited until line purge performed.",
        interlockType: "soft",
        lifecycle: [
            { icon: "🫧", label: "Air in\nLine", state: "done" },
            { icon: "💥", label: "Pressure\nDip", state: "done" },
            // { icon: "🕳️", label: "Void\nDefect", state: "error" },
            { icon: "🔬", label: "KLA\nScan", state: "active" },
            { icon: "⚠️", label: "Alarm\nTriggered", state: "active" },
            { icon: "🛑", label: "Lot\nHold", state: "" },
            { icon: "🔧", label: "Purge\nAction", state: "" },
        ],
        spcCpk: "0.41", spcSigma: "0.8σ",
        spcMetrics: ["Inline Thickness Uniformity (%)", "Offline Defect Adder Count (KLA Scan)"],
        spcRulesTriggered: [
            "Rule 1: 1 Point outside 3-Sigma Control Limits (Action Limit)",
            "Rule 3: Outlier detection — data point statistically impossible for stable process",
        ],
        spcData: [0.8, 0.8, 0.9, 0.8, 0.8, 0.9, 0.8, 1.2, 2.1, 4.5, 4.8, 4.6, 4.9, 4.7, 4.5, 4.8, 4.9, 5.0],
        alarms: [
            {
                id: "ALM-105", name: "DISPENSE PUMP PRESSURE FLUCTUATION — BUBBLE DETECT",
                level: "warning", time: "09:34:12",
                params: { "Trigger": "Pressure variance >1.5 PSI", "Window": "Active dispense", "Interlock": "Soft Lock", "Lot": "WF-2024-0448" }
            },
            {
                id: "ALM-106", name: "RESIST BOTTLE LEVEL CRITICAL LOW",
                level: "critical", time: "09:34:05",
                params: { "Level": "4.2%", "Threshold": "<5%", "Degasser": "FLUCTUATING AMBER" }
            },
            {
                id: "ALM-107", name: "DEFECT ADDER COUNT SPIKE",
                level: "critical", time: "09:35:01",
                params: { "Count": "500+ adders", "Baseline": "<5 adders", "Pattern": "Comet Tail / Circular Void" }
            },
        ],
        ocap: [
            "Select [HOLD LOT] — do not move wafers to Etch or Ion Implant.",
            "Select [VIEW DEFECT MAP] — confirm Circular Void or Comet Tail pattern.",
            "Toggle to Equipment Screen — flag Pressure Dip in Dispense RTM as RCA source.",
            "Select [BOTTLE CHANGE] — replace empty resist bottle with fresh vented lot.",
            "Select [SYSTEM PURGE] — perform dummy dispense (5 cycles) to clear air pockets.",
            "If bubble persists, perform Filter Prime to remove trapped micro-bubbles (<0.1 μm).",
        ],
        troubleshootingSteps: [
            {
                icon: "🔍", title: "Visual Inspection — Dispense Arm",
                description: "Observe PFA (Perfluoroalkoxy) tubing for silver streaks or physical gaps in the fluid column indicating air presence.",
                action: "VIEW DISPENSE ARM",
                alertMessage: "Silver streaks visible in PFA tubing — air gaps detected in dispense line. Resist bottle at 4.2% (below 5% threshold)."
            },
            {
                icon: "📊", title: "Filter Differential Pressure Test",
                description: "Run Filter ΔP Test to check pressure drop across filter membrane. High ΔP indicates outgassing filter requiring replacement.",
                action: "FILTER ΔP TEST",
                alertMessage: "ΔP across filter membrane is HIGH — filter is outgassing. Replacement required before resuming production."
            },
            {
                icon: "📉", title: "RTM Pressure Trace Review",
                description: "Review dispense RTM log for cavitation spikes or concave pressure dips in the 15.0 PSI plateau during active dispense window.",
                action: "FLAG PRESSURE DIP IN RTM",
                alertMessage: "RCA Confirmed: Pressure dip flagged in RTM log at 09:34:12 — cavitation spikes confirm air in dispense line."
            },
        ],
        restoreActions: [
            { name: "Bottle Change", alertMessage: "Replacing empty resist bottle with fresh vented lot — Level restored to 100%.", primary: false },
            { name: "Manual Purge (5x Dummy Dispense)", alertMessage: "Performing 5 dummy dispense cycles into drain — air pockets cleared from dispense tip.", primary: true },
            { name: "Filter Prime", alertMessage: "Performing filter prime — slowly saturating new filter membrane to remove trapped micro-bubbles (<0.1 μm).", primary: false },
        ],
        ocapFlow: [
            { title: "CONTAINMENT", desc: "Hold Lot — do not move to Etch or Ion Implant (open circuits risk)", btnLabel: "HOLD LOT", btnClass: "", alertMsg: "Lot on HOLD — wafers quarantined. No movement to downstream modules.", state: "completed" },
            { title: "METROLOGY VERIFICATION", desc: "View defect map — confirm Circular Void or Comet Tail pattern", btnLabel: "VIEW DEFECT MAP", btnClass: "", alertMsg: "Defect map confirmed: Comet Tail pattern at center — dispense bubble confirmed, not thermal or exhaust issue.", state: "completed" },
            { title: "ROOT CAUSE ANALYSIS", desc: "Toggle to Equipment Screen and flag Pressure Dip in Dispense RTM log", btnLabel: "FLAG PRESSURE DIP", btnClass: "rca", alertMsg: "RCA Confirmed: Pressure dip at 09:34:12 flagged — air ingestion from depleted resist bottle (Level 4.2%).", state: "active" },
            { title: "HARDWARE RECOVERY", desc: "Bottle Change + System Purge — 15 min downtime + $500 resist cost", btnLabel: "BOTTLE CHANGE + PURGE", btnClass: "recovery", alertMsg: "Bottle changed. System purge complete (5 dummy cycles). Pressure trace nominal at 15.0 PSI — no cavitation.", state: "" },
            { title: "DISPOSITION", desc: "Strip & Rework — coating defect is recoverable (unlike thermal/PEB)", btnLabel: "STRIP & REWORK", btnClass: "disposition", alertMsg: "Wafers sent to Pre-wet/Solvent Strip station — defective PR layer removed. Sequence restarted.", state: "" },
            { title: "VALIDATION", desc: "Run 3-wafer thickness check — uniformity must return to <1.0%", btnLabel: "3-WAFER THICKNESS CHECK", btnClass: "", alertMsg: "Validation complete: Uniformity = 0.8% (<1.0% spec) → Tool status GREEN (PROD).", state: "" },
        ],
    },


    {
        id: "FM-005",
        name: "EBR Nozzle Clog/Misalign",
        severity: "HIGH",
        type: "",
        fmeaScore: "8/10 (High)",
        lotId: "WF-2024-0461",
        recipe: "EBR_SOLVENT_15ML",
        keyInfo: "<strong>EBR Nozzle Clog / Misalignment</strong> — The Edge Bead Removal process uses a solvent stream to remove photoresist from the wafer's extreme periphery. A <strong>clog</strong> reduces solvent momentum → incomplete removal (<em>Residual PR</em>). A <strong>misalignment</strong> shifts the removal boundary — either leaving resist that flakes off in subsequent tools (causing particles) or encroaching into the active die area (reducing yield). Flow rate dropped to 8.0 ml/min vs 15.0 ml/min target.",
        physicsImpact: "Clog reduces solvent momentum causing incomplete edge PR removal (Residual PR). Misalignment causes either particle contamination in downstream tools or yield loss from encroachment into active die area.",
        zones: [
            { label: "EBR FLOW", temp: "8.0 ml/min", status: "danger", note: "LOW FLOW" },
            { label: "NOZZLE POS", temp: "147.2 mm", status: "danger", note: "MISALIGN" },
            { label: "ZONE 3", temp: "OK", status: "healthy", note: "NORMAL" },
            { label: "ZONE 4", temp: "OK", status: "healthy", note: "NORMAL" },
            { label: "ZONE 5", temp: "OK", status: "healthy", note: "NORMAL" },
        ],
        rtmLabel: "EBR SOLVENT FLOW RATE (ml/min)",
        rtmSensorLabel: "EBR Solvent Flow Meter (sccm / ml/min)",
        rtmNormalValue: "Flat plateau at 15.0 ml/min during 10-second EBR cycle",
        rtmFailureValue: "Drop to 8.0 ml/min or spiky delivery (backpressure from partially obstructed nozzle tip)",
        rtmTarget: 15.0, rtmUcl: 16.5, rtmLcl: 12.0,
        rtmData: [15.0, 15.0, 15.1, 14.9, 15.0, 14.8, 14.5, 13.5, 12.0, 10.5, 9.0, 8.5, 8.2, 8.0, 8.0, 7.8, 8.2, 8.0],
        supportingGauges: [
            { label: "Nozzle Position X", value: "Actual: 147.2 mm (Target: 148.5 mm)", status: "danger" },
            { label: "Nozzle Position Y", value: "Within spec", status: "ok" },
            { label: "EBR Flow Rate", value: "8.0 ml/min (spec: 15.0 ml/min)", status: "danger" },
        ],
        interlock: "Soft Lock — tool completes current wafer but inhibits 'Load' command for next wafer to prevent particle contamination excursion across lot.",
        interlockType: "soft",
        lifecycle: [
            { icon: "🚿", label: "Nozzle\nClog", state: "done" },
            { icon: "🔩", label: "Flow\nDrop", state: "done" },
            { icon: "🪨", label: "Residual\nPR Edge", state: "error" },
            { icon: "🔬", label: "KLA\nDefect Scan", state: "active" },
            { icon: "⚠️", label: "Alarm\nTriggered", state: "active" },
            { icon: "🛑", label: "Lot\nSoft Lock", state: "" },
            { icon: "🔧", label: "Nozzle\nRepair", state: "" },
        ],
        spcCpk: "0.67", spcSigma: "1.3σ",
        spcMetrics: [""],
        spcRulesTriggered: [
            "Rule 1: 1 Point outside 3-Sigma limits (Action Limit)",
            "Rule 2: Cluster detection — defects localized at 297–300 mm radius",
        ],
        spcData: [5, 6, 5, 7, 6, 8, 12, 25, 60, 110, 170, 195, 200, 205, 198, 202, 210, 208],
        alarms: [
            {
                id: "ALM-501", name: "EBR SOLVENT FLOW RATE LOW / UNSTABLE",
                level: "critical", time: "16:22:44",
                params: { "Trigger": "Flow <12.0 ml/min for >1 sec", "Actual": "8.0 ml/min", "Target": "15.0 ml/min", "Interlock": "Soft Lock", "Lot": "WF-2024-0461" }
            },
            {
                id: "ALM-502", name: "EBR NOZZLE POSITION DEVIATION",
                level: "warning", time: "16:22:40",
                params: { "Target X": "148.5 mm", "Actual X": "147.2 mm", "Delta": "-1.3 mm", "Impact": "Removal boundary shift" }
            },
            {
                id: "ALM-503", name: "EDGE DEFECT COUNT SPIKE — CLUSTER AT 297–300mm",
                level: "critical", time: "16:23:15",
                params: { "Count": ">200 adders", "Baseline": "<10", "Location": "297–300 mm radius", "Rule": "Cluster detection Rule 2" }
            },
        ],
        ocap: [
            "Soft Lock active — complete current wafer, inhibit next wafer load.",
            "Inspect EBR nozzle tip for photoresist residue buildup causing backpressure.",
            "Check nozzle XY position calibration — compare actual vs target coordinates.",
            "Run EBR test on dummy wafer to measure flow rate and removal boundary.",
            "If misalignment confirmed, run nozzle re-teach procedure.",
            "If clog confirmed, perform nozzle soak in solvent or replace tip insert.",
        ],
        troubleshootingSteps: [
            {
                icon: "🔍", title: "Nozzle Tip Inspection — Clog Check",
                description: "Visually inspect EBR nozzle tip for dried photoresist buildup. Check for discoloration or partial obstruction reducing flow area.",
                action: "INSPECT EBR NOZZLE TIP",
                alertMessage: "Dried resist crust visible on 40% of nozzle tip orifice — partial clog confirmed. Flow restricted to 8.0 ml/min (spec 15.0 ml/min)."
            },
            {
                icon: "📐", title: "Nozzle Position XY Verification",
                description: "Verify nozzle XY position coordinates against recipe setpoints. Check for arm teach drift or mechanical play in the positioning servo.",
                action: "CHECK NOZZLE XY POSITION",
                alertMessage: "Nozzle X-position: 147.2 mm (Target: 148.5 mm). Delta = -1.3 mm. Arm teach drift confirmed — re-teach required."
            },
            {
                icon: "💧", title: "Dummy Wafer EBR Flow Test",
                description: "Run EBR cycle on dummy wafer to measure actual flow rate and inspect removal boundary position and completeness.",
                action: "RUN EBR DUMMY TEST",
                alertMessage: "Dummy wafer test: Flow = 8.2 ml/min, Removal boundary at 147.0 mm (should be 148.5 mm). Both clog AND misalignment confirmed."
            },
        ],
        restoreActions: [
            { name: "Nozzle Soak & Clean", alertMessage: "Soaking EBR nozzle tip in solvent — resist crust dissolved. Flow rate returned to 15.0 ml/min.", primary: false },
            { name: "Replace Nozzle Tip Insert", alertMessage: "Replacing nozzle tip insert — clog cleared. Flow: 15.1 ml/min (within spec).", primary: true },
            { name: "Re-Teach Nozzle XY Position", alertMessage: "Re-teaching nozzle XY position. New coordinates: X = 148.5 mm ✓. Removal boundary verified on dummy wafer.", primary: false },
        ],
        ocapFlow: [
            { title: "CONTAINMENT", desc: "Soft Lock active — complete current wafer, inhibit next load", btnLabel: "CONFIRM SOFT LOCK", btnClass: "", alertMsg: "Soft Lock confirmed. Current wafer completing. Next wafer load inhibited — particle contamination risk contained.", state: "completed" },
            { title: "METROLOGY VERIFICATION", desc: "KLA scan — confirm edge defect cluster at 297–300 mm radius", btnLabel: "RUN KLA EDGE SCAN", btnClass: "", alertMsg: "KLA confirmed: >200 edge defects/wafer, clustered at 297–300 mm. Baseline <10. Both flow and position deviation confirmed.", state: "completed" },
            { title: "ROOT CAUSE ANALYSIS", desc: "Identify nozzle clog, misalignment, or both as root cause", btnLabel: "FLAG RCA — NOZZLE", btnClass: "rca", alertMsg: "RCA Confirmed: Dual failure — dried resist clog (40% orifice blocked) + arm teach drift (-1.3 mm X-offset).", state: "active" },
            { title: "HARDWARE RECOVERY", desc: "Replace nozzle tip + re-teach XY position. Run dummy wafer verification.", btnLabel: "REPLACE + RE-TEACH", btnClass: "recovery", alertMsg: "Nozzle tip replaced. XY re-taught to 148.5 mm. Dummy wafer: Flow = 15.1 ml/min, boundary correct.", state: "" },
            { title: "DISPOSITION", desc: "Evaluate lot — wafers with residual PR edge flaking risk may need strip", btnLabel: "EVALUATE EDGE WAFERS", btnClass: "disposition", alertMsg: "5 wafers with residual PR edge confirmed by SEM — sent for strip. Remaining lot released after re-inspect.", state: "" },
            { title: "VALIDATION", desc: "Run 3-wafer EBR validation — flow and edge defect count must be nominal", btnLabel: "RUN EBR VALIDATION", btnClass: "", alertMsg: "Validation complete: Flow = 15.0 ml/min, Edge defects <8/wafer → Tool status GREEN (PROD).", state: "" },
        ],
    },


    // =============================================
    // FM-004: EXHAUST FAN FAILURE (from Word doc)
    // =============================================
    {
        id: "FM-004",
        name: "Exhaust Fan Failure",
        severity: "CRITICAL",
        type: "",
        fmeaScore: "8/10 (High — Safety & Process Impact)",
        lotId: "WF-2024-0455",
        recipe: "PR_COAT_SPIN_3000RPM",
        keyInfo: "<strong>Exhaust Fan Failure</strong> — The track requires precise laminar airflow to remove solvent vapors (PGMEA) during spin-coating and drying. Fan failure causes solvent concentration to increase above the wafer surface, <strong>slowing evaporation rate</strong>. This results in a <em>thicker resist film</em> and <em>poor thickness uniformity</em>, as solvent mist may redeposit on the wafer creating <strong>drying marks</strong> or <strong>\"orange peel\"</strong> textures. <span style='color:#ff1744'>IMMEDIATE HARD LOCK triggered — safety hazard (flammable PGMEA vapors).</span>",
        physicsImpact: "Without laminar exhaust airflow, PGMEA solvent vapors accumulate above the wafer, slowing evaporation. Results in thicker film, poor uniformity, drying marks, and orange-peel defects. Safety risk from flammable vapor buildup.",
        zones: [
            { label: "EXHAUST", temp: "0.10 m/s", status: "danger", note: "FAIL" },
            { label: "FAN RPM", temp: "0 RPM", status: "danger", note: "STOPPED" },
            { label: "VAPOR PPM", temp: "AMBER", status: "danger", note: "HIGH" },
            { label: "COATER CUP", temp: "LOCKED", status: "danger", note: "HARD LOCK" },
            { label: "ROBOT WPR", temp: "INHIBIT", status: "danger", note: "NO LOAD" },
        ],
        rtmLabel: "CUP EXHAUST AIRFLOW (m/s)",
        rtmSensorLabel: "Cup Exhaust Differential Pressure (Pa) / Anemometer (m/s)",
        rtmNormalValue: "Stable 0.50 m/s ±0.02 m/s",
        rtmFailureValue: "Downward trend → sudden drop to 0.10 m/s (fan belt break / motor burnout)",
        rtmTarget: 0.50, rtmUcl: 0.55, rtmLcl: 0.35,
        rtmData: [0.50, 0.50, 0.49, 0.50, 0.50, 0.48, 0.47, 0.45, 0.42, 0.38, 0.32, 0.25, 0.18, 0.12, 0.10, 0.10, 0.10, 0.10],
        supportingGauges: [
            { label: "Fan Command", value: "100% (full demand)", status: "ok" },
            { label: "Actual Fan RPM", value: "0 RPM (STOPPED)", status: "danger" },
            { label: "Solvent Vapor PPM", value: "AMBER ZONE — HIGH", status: "warn" },
        ],
        interlock: "IMMEDIATE HARD LOCK — Robot (WPR) inhibited from placing new wafers. Spin-process aborted. Existing bake/chill wafers allowed to finish.",
        interlockType: "hard",
        lifecycle: [
            { icon: "💨", label: "Fan\nFail", state: "done" },
            { icon: "🌫️", label: "Vapor\nBuildup", state: "done" },
            { icon: "🍊", label: "Orange\nPeel", state: "error" },
            { icon: "📏", label: "Thick.\nShift", state: "active" },
            { icon: "⚠️", label: "Alarm\nHard Lock", state: "active" },
            { icon: "🛑", label: "Tool\nLocked", state: "" },
            { icon: "🔧", label: "Fan\nRepair", state: "" },
        ],
        spcCpk: "0.52", spcSigma: "1.1σ",
        spcMetrics: ["Inline Resist Thickness (Å)", "Thickness Uniformity (%)"],
        spcRulesTriggered: [
            "Rule 1: 1 Point outside 3-Sigma limits (Action Limit)",
            "Non-Uniformity Cluster: high variation across 49-point scan",
        ],
        spcData: [5000, 5010, 5005, 5000, 5002, 5010, 5050, 5100, 5150, 5200, 5230, 5245, 5250, 5248, 5252, 5250, 5249, 5251],
        alarms: [
            {
                id: "ALM-305", name: "COATER CUP EXHAUST FLOW LOW — HARD LOCK",
                level: "critical", time: "14:55:02",
                params: { "Trigger": "Flow <0.35 m/s for >2 sec", "Actual": "0.10 m/s", "Setpoint": "0.50 m/s", "Interlock": "IMMEDIATE HARD LOCK", "Lot": "WF-2024-0455" }
            },
            {
                id: "ALM-306", name: "EXHAUST FAN RPM = ZERO — MOTOR FAULT",
                level: "critical", time: "14:54:58",
                params: { "Fan Command": "100%", "Actual RPM": "0", "Diagnosis": "Motor burnout / belt break" }
            },
            {
                id: "ALM-307", name: "SOLVENT VAPOR CONCENTRATION — AMBER ZONE",
                level: "warning", time: "14:55:10",
                params: { "Status": "AMBER — approaching flammable threshold", "Action": "Evacuate coater bay if RED" }
            },
        ],
        ocap: [
            "IMMEDIATE: Confirm Hard Lock active — no new wafers into coater module.",
            "Check exhaust fan belt for breakage or slippage.",
            "Check fan motor for burnout — measure motor current draw.",
            "Verify exhaust duct for blockage or collapsed section.",
            "Monitor solvent vapor PPM — evacuate bay if vapor reaches RED zone.",
            "Allow existing bake/chill wafers to complete cycle before maintenance entry.",
        ],
        troubleshootingSteps: [
            {
                icon: "💨", title: "Exhaust Fan Belt & Motor Check",
                description: "Inspect exhaust fan belt for breakage or slippage. Measure motor current draw to determine burnout vs mechanical failure.",
                action: "INSPECT FAN MOTOR",
                alertMessage: "Fan belt BROKEN — zero resistance at pulley. Motor current normal (motor alive, belt mechanical failure). Replace belt — 20 min downtime."
            },
            {
                icon: "🌫️", title: "Solvent Vapor PPM Monitor",
                description: "Check real-time PPM sensor in coater cup. If approaching RED zone (flammable threshold), evacuate coater bay per safety protocol.",
                action: "CHECK VAPOR PPM",
                alertMessage: "Vapor PPM: 280 ppm (AMBER zone). Below RED threshold (500 ppm). Coater bay safe for maintenance entry with PPE."
            },
            {
                icon: "🔌", title: "Exhaust Duct Blockage Inspection",
                description: "Physically inspect exhaust duct path for collapsed sections, blockages, or disconnected joints reducing airflow.",
                action: "INSPECT EXHAUST DUCT",
                alertMessage: "Exhaust duct clear — no blockage found. Root cause confirmed as fan belt failure, not duct restriction."
            },
        ],
        restoreActions: [
            { name: "Replace Exhaust Fan Belt", alertMessage: "Replacing broken fan belt — 20 min downtime. Fan RPM restoring to nominal 1750 RPM.", primary: true },
            { name: "Replace Fan Motor", alertMessage: "Replacing fan motor — 45 min downtime. Required if motor current draw was abnormal.", primary: false },
            { name: "Clear Exhaust Duct Blockage", alertMessage: "Clearing exhaust duct restriction — airflow restored to 0.50 m/s.", primary: false },
        ],
        ocapFlow: [
            { title: "CONTAINMENT", desc: "Confirm Hard Lock — no new wafers. Monitor vapor PPM for safety.", btnLabel: "CONFIRM HARD LOCK", btnClass: "", alertMsg: "Hard Lock confirmed. Robot WPR inhibited. Vapor PPM monitoring active — AMBER zone, safe for entry.", state: "completed" },
            { title: "METROLOGY VERIFICATION", desc: "Measure airflow and confirm thickness shift on in-process wafers", btnLabel: "MEASURE AIRFLOW + THICKNESS", btnClass: "", alertMsg: "Airflow confirmed: 0.10 m/s (spec 0.50 m/s). Thickness: 5250 Å (target 5000 Å) — +5% shift confirmed.", state: "completed" },
            { title: "ROOT CAUSE ANALYSIS", desc: "Identify fan belt failure, motor burnout, or duct blockage as root cause", btnLabel: "FLAG RCA — FAN BELT", btnClass: "rca", alertMsg: "RCA Confirmed: Fan belt broken — mechanical failure. Motor intact. Duct clear.", state: "active" },
            { title: "HARDWARE RECOVERY", desc: "Replace fan belt — 20 min downtime. Verify RPM and airflow after repair.", btnLabel: "REPLACE FAN BELT", btnClass: "recovery", alertMsg: "Fan belt replaced. Fan RPM = 1750. Airflow = 0.52 m/s (within spec). Hard Lock released.", state: "" },
            { title: "DISPOSITION", desc: "Evaluate affected wafers — thickness >3% shift may require strip and rework", btnLabel: "EVALUATE LOT", btnClass: "disposition", alertMsg: "Lot evaluated: 3 wafers with orange-peel texture scrapped. Remaining wafers within CD tolerance — released.", state: "" },
            { title: "VALIDATION", desc: "Run 3-wafer uniformity check — thickness must return to 5000 ±150 Å", btnLabel: "RUN VALIDATION", btnClass: "", alertMsg: "Validation complete: Thickness = 5005 Å, Uniformity = 0.6% → Tool status GREEN (PROD).", state: "" },
        ],
    },

    // =============================================
    // FM-003: DEVELOPER CONCENTRATION (from Word doc)
    // =============================================
    {
        id: "FM-003",
        name: "Developer Concentration",
        severity: "HIGH",
        type: "",
        fmeaScore: "7/10 (High)",
        lotId: "WF-2024-0452",
        recipe: "DEV_TMAH_2.38PCT",
        keyInfo: "<strong>Developer Concentration Drift</strong> — TMAH (Tetramethylammonium hydroxide) dissolves exposed resist areas. Dissolution rate is highly sensitive to normality (concentration). <strong>Higher concentration</strong> → increased dissolution → <em>Line Slimming</em> (smaller CD). <strong>Lower concentration</strong> → <em>Scumming / Under-development</em> (larger CD or residual resist in trenches). In-line conductivity sensor showing step-change deviation from 2.38% TMAH setpoint.",
        physicsImpact: "TMAH dissolution rate is concentration-sensitive. Higher concentration causes Line Slimming (CD shrink). Lower concentration causes Scumming or Underdevelopment (CD grow, residual resist).",
        zones: [
            { label: "ZONE 1", temp: "2.38%", status: "healthy", note: "NOMINAL" },
            { label: "ZONE 2", temp: "2.38%", status: "healthy", note: "NOMINAL" },
            { label: "ZONE 3", temp: "2.51%", status: "danger", note: "HIGH CONC" },
            { label: "ZONE 4", temp: "2.38%", status: "healthy", note: "NOMINAL" },
            { label: "ZONE 5", temp: "2.38%", status: "healthy", note: "NOMINAL" },
        ],
        rtmLabel: "DEVELOPER CONDUCTIVITY (mS/cm — normalized)",
        rtmSensorLabel: "In-line Conductivity Sensor (mS/cm) — normalized at 1.0 for 2.38% TMAH",

        rtmChartImage: "/DeveloperconcentrationRTM.jpeg",
        rtmTarget: 1.0, rtmUcl: 1.04, rtmLcl: 0.96,
        rtmData: [1.0, 1.0, 1.01, 1.0, 1.0, 0.99, 1.0, 1.0, 1.02, 1.03, 1.05, 1.07, 1.08, 1.07, 1.09, 1.08, 1.10, 1.09],
        supportingGauges: [
            { label: "Developer Temp", value: "23.4°C (±0.2°C spec)", status: "warn" },
            { label: "TMAH Normality", value: "2.51% (target: 2.38%)", status: "danger" },
            { label: "Conductivity Sensor", value: "1.09 normalized (OOC)", status: "danger" },
        ],
        interlock: "Soft Lock — tool continues current wafer but flags OCAP required before next lot release.",
        interlockType: "soft",
        lifecycle: [
            { icon: "🧪", label: "Conc.\nDrift", state: "done" },
            { icon: "⚗️", label: "Dissolution\nRate Δ", state: "done" },
            { icon: "📏", label: "CD\nShift", state: "error" },
            { icon: "🔬", label: "CD-SEM\nReview", state: "active" },
            { icon: "⚠️", label: "Alarm\nTriggered", state: "active" },
            { icon: "🛑", label: "Lot\nHold", state: "" },
            { icon: "🔧", label: "Blending\nFix", state: "" },
        ],
        spcCpk: "0.88", spcSigma: "1.7σ",
        spcMetrics: ["Offline CD-SEM (Critical Dimension)", "Unresolved Feature / Scumming Count (KLA SEM Review)"],
        spcRulesTriggered: [
            "Rule 1: 1 Point outside 3-Sigma limits (Action Limit)",
            "Rule 6: 7 Points trending in one direction (slow aging / evaporation drift)",
        ],
        spcData: [22.0, 22.0, 22.0, 21.9, 21.9, 21.9, 21.8, 21.7, 21.6, 21.4, 21.2, 21.0, 20.8, 20.6, 20.4, 20.2, 20.0, 19.8],
        alarms: [
            {
                id: "ALM-602", name: "DEVELOPER NORMALITY OUT OF RANGE",
                level: "critical", time: "11:12:33",
                params: { "Trigger": "Conductivity deviation >±2% for >5 sec", "Setpoint": "2.38% TMAH", "Actual": "2.51% TMAH", "Delta": "+0.13%", "Lot": "WF-2024-0452" }
            },
            {
                id: "ALM-603", name: "CD-SEM TRENDING — LINE SLIMMING",
                level: "warning", time: "11:13:05",
                params: { "CD Target": "22.0 nm", "Actual": "19.8 nm", "Trend": "7-pt downward", "Rule": "SPC Rule 6" }
            },
        ],
        ocap: [
            "Check chemical blending system — verify TMAH dilution ratio and DI water flow.",
            "Check day-tank level — evaporation of DI water raises TMAH concentration.",
            "Verify in-line conductivity sensor calibration against reference standard.",
            "Review developer temperature — temperature drift changes dissolution rate independent of concentration.",
            "Hold current lot — send wafers to CD-SEM for dimensional verification.",
            "Flush and recirculate day-tank if concentration deviation >±5%.",
        ],
        troubleshootingSteps: [
            {
                icon: "📡", title: "Conductivity Sensor Verification",
                description: "Verify in-line conductivity reading against reference titration standard. Confirm step-change or gradual slope pattern in RTM trace.",
                action: "VERIFY CONDUCTIVITY READING",
                alertMessage: "Conductivity reading: 1.09 normalized (2.51% TMAH). Reference titration confirms HIGH concentration — sensor reading is accurate."
            },
            {
                icon: "🌡️", title: "Developer Temperature Check",
                description: "Check developer temperature at 23.0°C ±0.2°C. Temperature drift alters dissolution rate even with stable concentration.",
                action: "CHECK DEV TEMPERATURE",
                alertMessage: "Developer temperature: 23.4°C (0.4°C above target). Combined with high concentration — double contribution to CD shift."
            },
            {
                icon: "🧪", title: "Day-Tank Level & Blending Check",
                description: "Inspect day-tank DI water level for evaporation. Check blending system dilution ratio for controller fault.",
                action: "INSPECT DAY-TANK",
                alertMessage: "Day-tank DI water level LOW — evaporation has increased TMAH concentration from 2.38% to 2.51%. Blending controller fault confirmed."
            },
        ],
        restoreActions: [
            { name: "Refill Day-Tank DI Water", alertMessage: "Refilling DI water in day-tank — TMAH concentration returning to 2.38%. Conductivity stabilizing.", primary: false },
            { name: "Recalibrate Blending System", alertMessage: "Recalibrating chemical blending controller — dilution ratio corrected to 2.38% TMAH setpoint.", primary: true },
            { name: "Flush & Recirculate Day-Tank", alertMessage: "Flushing day-tank and recirculating at correct concentration — normality verified at 2.38%.", primary: false },
        ],
        ocapFlow: [
            { title: "CONTAINMENT", desc: "Hold lot — prevent under/over-developed wafers from escaping to etch", btnLabel: "HOLD LOT", btnClass: "", alertMsg: "Lot on HOLD — dimensional excursion contained. CD-SEM review initiated.", state: "completed" },
            { title: "METROLOGY VERIFICATION", desc: "CD-SEM review — confirm Line Slimming or Scumming pattern on wafers", btnLabel: "RUN CD-SEM REVIEW", btnClass: "", alertMsg: "CD-SEM confirmed: Line Slimming detected. Mean CD = 19.8 nm (target 22.0 nm) — high concentration confirmed.", state: "completed" },
            { title: "ROOT CAUSE ANALYSIS", desc: "Identify blending system fault or day-tank evaporation as root cause", btnLabel: "FLAG RCA — BLENDING", btnClass: "rca", alertMsg: "RCA Confirmed: Day-tank DI water evaporation raised TMAH from 2.38% to 2.51%. Blending controller fault contributing.", state: "active" },
            { title: "HARDWARE RECOVERY", desc: "Refill day-tank DI water + recalibrate blending controller", btnLabel: "REFILL + RECALIBRATE", btnClass: "recovery", alertMsg: "Day-tank refilled. Blending controller recalibrated. TMAH normality = 2.38% — conductivity nominal.", state: "" },
            { title: "DISPOSITION", desc: "Re-develop affected wafers if within CD budget window", btnLabel: "RE-DEVELOP WAFERS", btnClass: "disposition", alertMsg: "Affected wafers re-developed at correct concentration. CD remeasured.", state: "" },
            { title: "VALIDATION", desc: "Run 5-wafer lot — CD-SEM and conductivity trace must return to target", btnLabel: "RUN VALIDATION", btnClass: "", alertMsg: "Validation complete: CD = 22.0 nm, conductivity = 1.00 normalized → Tool status GREEN.", state: "" },
        ],
    },



    // =============================================
    // FM-005: EBR NOZZLE CLOG / MISALIGN (from Word doc)
    // =============================================

];

// =============================================
// NEW MODULE INDEX HELPER
// =============================================
const NEW_MODULE_IDS = ["FM-002", "FM-003", "FM-004", "FM-005"];

// =============================================
// PEB scenario data — UNTOUCHED
// =============================================
function getPEBScenarioData(scenario: PEBScenario) {
    if (scenario === 1) {
        return {
            temps: [110.0, 109.5, 108.8, 107.9, 106.8, 105.5, 104.0, 102.3, 100.5, 98.5, 96.3, 94.0, 91.5, 89.0, 86.0],
            duty: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            dangerZone: 4,
            dangerTemp: '',
            dangerStatus: '',
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
            dangerZone: 4,
            dangerTemp: '',
            dangerStatus: '',
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
            dangerZone: 4,
            dangerTemp: '',
            dangerStatus: '',
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
// WAFER CD MAP CANVAS — UNTOUCHED
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
// CHART DATA GENERATORS — UNTOUCHED
// =============================================
const CHART_N = 501;

const ZONE_COLORS = {
    z1: '#7abfbf',
    z2: '#e05c5c',
    z3: '#ccccaa',
    z4: '#d64343',
    z5: '#7fc97f',
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
        v = v * 0.85 + base * 0.15;
        out.push(v);
    }
    return out;
}

function getScenario13Temps(failPt: number): number[][] {
    const makeStable = (seed: number, base: number, amp: number) => {
        const rand = seededRand(seed);
        return Array.from({ length: CHART_N }, (_, i) => {
            const drift = Math.sin(i * 0.012) * 0.18;
            const noise = (rand() - 0.5) * amp;
            return base + drift + noise;
        });
    };
    const z1 = makeStable(11, 108.2, 0.45);
    const z2 = makeStable(22, 107.9, 0.40);
    const z3 = makeStable(33, 108.4, 0.42);
    const z5 = makeStable(55, 108.1, 0.48);
    const z4: number[] = [];
    for (let i = 0; i < CHART_N; i++) {
        if (i < failPt) {
            const r = seededRand(44 + i);
            z4.push(108 + Math.sin(i * 0.013) * 0.15 + (r() - 0.5) * 0.42);
        } else {
            const t = i - failPt;
            const decay = 108 * Math.exp(-0.0072 * t);
            const noise = (seededRand(144 + i)() - 0.5) * 0.18;
            z4.push(Math.max(22, decay + noise));
        }
    }
    return [z1, z2, z3, z4, z5];
}

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
    const dz4 = Array.from({ length: CHART_N }, (_, i) => {
        const rand = seededRand(203 + i);
        if (i < dutyJump) {
            // From start: zigzag erratically around 46% — merged with other zones
            const zigzag = Math.sin(i * 1.5) * 3 + Math.sin(i * 3.2) * 2 + Math.cos(i * 2.1) * 2;
            return Math.min(55, Math.max(38, 46 + zigzag + (rand() - 0.5) * 4));
        } else {
            // After failure: pinned flat at 100%
            return 100;
        }
    });
    return [dz1, dz2, dz3, dz4, dz5];
}

function getScenario2Duty(): number[][] {
    const makeDuty = (seed: number, base: number) => {
        const rand = seededRand(seed);
        return Array.from({ length: CHART_N }, () => {
            return Math.min(50, Math.max(28, base + (rand() - 0.5) * 6));
        });
    };
    const dz1 = makeDuty(101, 38);
    const dz2 = makeDuty(102, 36);
    const dz3 = makeDuty(103, 34);
    const dz5 = makeDuty(105, 40);
    const SPIKE_START = 200;
    const dz4: number[] = [];
    const dutyPoints: [number, number][] = [
        [0, 40], [199, 42],
        [200, 42], [203, 2], [205, 42],
        [207, 4], [209, 42],
        [211, 2], [213, 102], [215, 42],
        [217, 3], [219, 42],
        [221, 4], [222, 103], [224, 42],
        [226, 2], [228, 42],
        [230, 3], [231, 104], [233, 42],
        [235, 2], [237, 42],
        [239, 4], [240, 105], [242, 42],
        [244, 2], [246, 42],
        [248, 104], [250, 42],
        [252, 2], [255, 42],
        [256, 103], [258, 42],
        [260, 2], [263, 42],
        [265, 104], [267, 42],
        [269, 2], [272, 42],
        [274, 105], [276, 42],
        [278, 2], [281, 42],
        [283, 102], [285, 42],
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
        dz4.push(Math.max(0, Math.min(105, val + noise)));
    }
    return [dz1, dz2, dz3, dz4, dz5];
}

function getScenario2Temps(): number[][] {
    const CHART_N = 501;
    const makeFlat110 = (seed: number) => {
        const r = seededRand(seed);
        return Array.from({ length: CHART_N }, () => 110 + (r() - 0.5) * 0.4);
    };
    const z1 = makeFlat110(11);
    const z2 = makeFlat110(22);
    const z3 = makeFlat110(33);
    const z5 = makeFlat110(55);
    const z4: number[] = new Array(CHART_N).fill(120);
    const rP0 = seededRand(9901);
    for (let i = 0; i <= 200; i++) {
        z4[i] = 120 + (rP0() - 0.5) * 5;
    }
    const rH = seededRand(8821);
    const rPos = seededRand(3317);
    const rDir = seededRand(6643);
    const rW = seededRand(2291);
    const rNs = seededRand(5577);
    const spikes: Array<[number, number, boolean]> = [];
    let x = 202;
    while (x < 250) {
        const p = (x - 200) / 50;
        const amp = 30 + p * 70 + rH() * 30;
        const goUp = rDir() < 0.50;
        spikes.push([Math.round(x), amp, goUp]);
        x += 3 + Math.round(rPos() * 5);
    }
    x = 252;
    while (x < 330) {
        const p = (x - 250) / 80;
        const amp = 80 + p * 120 + rH() * 50;
        const goUp = rDir() < 0.50;
        spikes.push([Math.round(x), Math.min(380, amp), goUp]);
        x += 3 + Math.round(rPos() * 4);
    }
    x = 332;
    while (x < 420) {
        const p = (x - 330) / 90;
        const amp = 170 + p * 150 + rH() * 55;
        const goUp = rDir() < 0.50;
        spikes.push([Math.round(x), Math.min(380, amp), goUp]);
        x += 2 + Math.round(rPos() * 4);
    }
    x = 422;
    while (x < 500) {
        const p = (x - 420) / 80;
        const amp = 280 + p * 100 + rH() * 35;
        const goUp = rDir() < 0.50;
        spikes.push([Math.round(x), Math.min(380, amp), goUp]);
        x += 2 + Math.round(rPos() * 3);
    }
    for (const [px, amp, goUp] of spikes) {
        const peak = goUp ? 120 + amp : Math.max(23, 120 - amp);
        const hw = rW() < 0.45 ? 1 : 2;
        for (let d = hw; d >= 1; d--) {
            const idx = px - d;
            if (idx >= 200 && idx < CHART_N) {
                const frac = (hw - d + 1) / (hw + 1);
                const val = 120 + frac * (peak - 120);
                if (Math.abs(val - 120) > Math.abs(z4[idx] - 120)) z4[idx] = val;
            }
        }
        if (px >= 200 && px < CHART_N) {
            if (Math.abs(peak - 120) > Math.abs(z4[px] - 120)) z4[px] = peak;
        }
        for (let d = 1; d <= hw; d++) {
            const idx = px + d;
            if (idx < CHART_N) {
                const frac = (hw - d + 1) / (hw + 1);
                const val = 120 + frac * (peak - 120);
                if (Math.abs(val - 120) > Math.abs(z4[idx] - 120)) z4[idx] = val;
            }
        }
    }
    for (let i = 200; i < CHART_N; i++) {
        if (Math.abs(z4[i] - 120) < 0.5) {
            z4[i] = 120 + (rNs() - 0.5) * 2;
        }
    }
    return [z1, z2, z3, z4, z5];
}

// =============================================
// drawMultiZoneChart — UNTOUCHED
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
    const W = rect.width;
    const H = 150;
    const pad = { l: 56, t: 12, r: 16, b: 24 };
    const gW = W - pad.l - pad.r;
    const gH = H - pad.t - pad.b;
    const n = datasets[0]?.data.length ?? 1;
    const sx = (i: number) => pad.l + (i / (n - 1)) * gW;
    const sy = (v: number) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * gH;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
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
    ctx.save();
    ctx.beginPath();
    ctx.rect(pad.l, pad.t, gW, gH);
    ctx.clip();
    datasets.forEach(({ data, color }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        data.forEach((v, i) => {
            const clamped = Math.max(yMin, Math.min(yMax, v));
            if (i === 0) {
                ctx.moveTo(sx(i), sy(clamped));
            } else {
                ctx.lineTo(sx(i), sy(clamped));
            }
        });
        ctx.stroke();
    });
    ctx.restore();
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666666';
    for (let i = 0; i <= yTickCount; i++) {
        const v = yMin + (yMax - yMin) * (i / yTickCount);
        ctx.fillText(yTickFmt(v), pad.l - 8, sy(v));
    }
    ctx.textAlign = 'center';
    [0, 100, 200, 300, 400, 500].forEach(xVal => {
        const xi = Math.round((xVal / 500) * (n - 1));
        ctx.fillText(String(xVal), sx(xi), H - pad.b + 12);
    });
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, H - pad.b);
    ctx.lineTo(W - pad.r, H - pad.b);
    ctx.stroke();
    if (annotationFn) {
        annotationFn(ctx, sx, sy, W, H, pad);
    }
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
    const newRtmCanvasRef = useRef<HTMLCanvasElement>(null);
    const newSpcCanvasRef = useRef<HTMLCanvasElement>(null);
    const [scenario, setScenario] = useState<1 | 2 | 3>(1);
    const [selectedRepair, setSelectedRepair] = useState('');
    const [dpMode, setDpMode] = useState<'high' | 'normal'>('normal');
    const [ebrRootMode, setEbrRootMode] = useState<'clog' | 'misalign'>('clog');
    const [exfRootCause, setExfRootCause] = useState<"grates" | "motor" | null>(null);
    const [devRootCause, setDevRootCause] = useState<"diwater" | "chiller" | null>(null);
    const router = useRouter();

    const fm = FM_DATA[currentFM];
    const isPEB = currentFM === 0;
    const isNewModule = NEW_MODULE_IDS.includes(fm.id);

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
    // drawRTM — UNTOUCHED PEB LOGIC
    // =============================================
    const drawRTM = useCallback(() => {
        if (!isMounted) return;
        const canvas = rtmCanvasRef.current;
        if (!canvas) return;
        if (isPEB && pebScenario) {
            const ZONE_DS_ORDER = [ZONE_COLORS.z1, ZONE_COLORS.z2, ZONE_COLORS.z3, ZONE_COLORS.z4, ZONE_COLORS.z5];
            if (pebScenario === 1 || pebScenario === 3) {
                const FAIL_PT = 210;
                const temps = getScenario13Temps(FAIL_PT);
                const datasets = temps.map((data, i) => ({ data, color: ZONE_DS_ORDER[i] }));
                const failLabel = pebScenario === 3 ? 'SSR FAIL' : 'HEATER FAIL';
                drawMultiZoneChart(canvas, datasets, 0, 128, 6,
                    (v) => { if (v <= 0) return '0'; if (v < 30) return '23.0'; if (v < 50) return v.toFixed(0); return v.toFixed(1); },
                    '#ffffff',
                    (ctx, sx, sy, W, H, pad) => {
                        const dotX = sx(FAIL_PT);
                        const dotY = sy(108);
                        ctx.beginPath(); ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#888888'; ctx.lineWidth = 1.5;
                        ctx.fill(); ctx.stroke();
                        const tx = dotX + 52; const ty = dotY + 58;
                        ctx.beginPath(); ctx.moveTo(dotX + 4, dotY + 4); ctx.lineTo(tx - 2, ty - 6);
                        ctx.strokeStyle = '#c0a060'; ctx.lineWidth = 1.2; ctx.setLineDash([]); ctx.stroke();
                        ctx.fillStyle = '#fa0b0b'; ctx.font = 'bold 9px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
                        ctx.fillText('FAILURE POINT:', tx, ty + 2); ctx.fillText(failLabel, tx, ty + 13);
                    }
                );
            } else if (pebScenario === 2) {
                const SPIKE_START = 175;
                const temps = getScenario2Temps();
                const datasets = temps.map((data, i) => ({ data, color: ZONE_DS_ORDER[i] }));
                drawMultiZoneChart(canvas, datasets, 0, 520, 5,
                    (v) => { if (v <= 0) return '0'; if (Math.abs(v - 23) < 20) return '23.0'; if (Math.abs(v - 110) < 20) return '110.0'; if (Math.abs(v - 130) < 20) return '130.0'; return v.toFixed(0); },
                    '#ffffff',
                    (ctx, sx, sy, W, H, pad) => {
                        const arrowTipX = sx(SPIKE_START + 55); const arrowTipY = sy(370);
                        const labelX = arrowTipX - 12; const labelY = arrowTipY - 24;
                        ctx.beginPath(); ctx.moveTo(labelX + 2, labelY + 2); ctx.lineTo(arrowTipX, arrowTipY);
                        ctx.strokeStyle = 'rgba(232,160,32,0.7)'; ctx.lineWidth = 2.1; ctx.setLineDash([]); ctx.stroke();
                        ctx.fillStyle = '#e8a020'; ctx.font = 'bold 9px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
                        ctx.fillText('SEVERE TC SPIKES', labelX, labelY);
                    }
                );
            }
        } else if (!isNewModule) {
            const c = getColors();
            drawChart(canvas, fm.rtmData, fm.rtmTarget, fm.rtmUcl, fm.rtmLcl, fm.rtmLabel, 150, c);
        }
    }, [fm, isDark, getColors, isPEB, pebScenario, isMounted, isNewModule]);

    const drawDuty = useCallback(() => {
        if (!isMounted) return;
        const canvas = dutyCanvasRef.current;
        if (!canvas) return;
        if (isPEB && pebScenario) {
            const ZONE_DS_ORDER = [ZONE_COLORS.z1, ZONE_COLORS.z2, ZONE_COLORS.z3, ZONE_COLORS.z4, ZONE_COLORS.z5];
            if (pebScenario === 1 || pebScenario === 3) {
                const DUTY_JUMP = 150;
                const duty = getScenario13Duty(DUTY_JUMP);
                const datasets = duty.map((data, i) => ({ data, color: ZONE_DS_ORDER[i] }));
                drawMultiZoneChart(canvas, datasets, 20, 125, 5, (v) => `${Math.round(v)}%`, '#ffffff',
                    (ctx, sx, sy, W, H, pad) => {
                        const labelX = sx(280); const labelY = sy(94);
                        ctx.fillStyle = '#e8a020'; ctx.font = 'bold 9px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
                        ctx.fillText('DUTY CYCLE CHATTERING', labelX, labelY);
                    }
                );
            } else if (pebScenario === 2) {
                const duty = getScenario2Duty();
                const ZONE_DS_ORDER2 = [ZONE_COLORS.z1, ZONE_COLORS.z2, ZONE_COLORS.z3, ZONE_COLORS.z4, ZONE_COLORS.z5];
                const datasets = duty.map((data, i) => ({ data, color: ZONE_DS_ORDER2[i] }));
                drawMultiZoneChart(canvas, datasets, 20, 100, 5, (v) => v.toFixed(1), '#ffffff',
                    (ctx, sx, sy, W, H, pad) => {
                        const FAIL_PT = 210;
                        const dotX = sx(FAIL_PT); const dotY = sy(108);
                        ctx.beginPath(); ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff'; ctx.fill();
                        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1; ctx.stroke();
                        const labelX = dotX + 10; const labelY = dotY + 16;
                        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px "Share Tech Mono", monospace'; ctx.textAlign = 'left';
                        ctx.fillText('', labelX, labelY); ctx.fillText('', labelX, labelY + 12);
                    },
                );
            }
        } else {
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

    // New module RTM chart
    const drawNewRTM = useCallback(() => {
        if (!isMounted || !isNewModule) return;
        const canvas = newRtmCanvasRef.current; if (!canvas) return;
        const c = getColors();
        drawChart(canvas, fm.rtmData, fm.rtmTarget, fm.rtmUcl, fm.rtmLcl, fm.rtmLabel, 150, c);
    }, [fm, isDark, getColors, isMounted, isNewModule]);

    // New module SPC chart
    const drawNewSPC = useCallback(() => {
        if (!isMounted || !isNewModule) return;
        const canvas = newSpcCanvasRef.current; if (!canvas) return;
        const c = getColors();
        const spcLabel = fm.spcMetrics ? fm.spcMetrics[0] : 'WAFER NUMBER';
        const allV = fm.spcData;
        const target = allV.reduce((a, b) => a + b, 0) / allV.length;
        const std = Math.sqrt(allV.reduce((a, v) => a + (v - target) ** 2, 0) / allV.length);
        const ucl = target + 3 * std;
        const lcl = Math.max(0, target - 3 * std);
        drawChart(canvas, fm.spcData, target, ucl, lcl, spcLabel, 160, c);
    }, [fm, isDark, getColors, isMounted, isNewModule]);

    useEffect(() => {
        if (!isMounted || activeTab !== null) return;
        const t = setTimeout(() => {
            drawRTM(); drawSPC(); drawDuty(); drawWaferMap();
            if (isNewModule) { drawNewRTM(); drawNewSPC(); }
        }, 100);
        return () => clearTimeout(t);
    }, [drawRTM, drawSPC, drawDuty, drawWaferMap, drawNewRTM, drawNewSPC, currentFM, pebScenario, isDark, isMounted, activeTab, isNewModule]);

    useEffect(() => {
        if (!isMounted) return;
        const h = () => {
            if (activeTab !== null) return;
            drawRTM(); drawSPC(); drawDuty(); drawWaferMap();
            if (isNewModule) { drawNewRTM(); drawNewSPC(); }
        };
        window.addEventListener('resize', h);
        return () => window.removeEventListener('resize', h);
    }, [drawRTM, drawSPC, drawDuty, drawWaferMap, drawNewRTM, drawNewSPC, isMounted, activeTab, isNewModule]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        }
    }, [isDark]);

    const getSevClass = (s: string) =>
        s === 'CRITICAL' ? 'sev-critical' : s === 'HIGH' ? 'sev-high' : 'sev-medium';

    const pebSc = isPEB && pebScenario ? getPEBScenarioData(pebScenario) : null;

    const [ocapStep, setOcapStep] = useState(1);
    const [validationClicks, setValidationClicks] = useState({
        marathon: false,
        cdBaseline: false,
    });

    const showFlowError = () => {
        alert("Please follow the OCAP flow: Containment → Verification → Root Cause → Actions → Validation → Release");
    };

    const handleOcapClick = (requiredStep: number, successMsg: string, nextStep?: number) => {
        if (ocapStep !== requiredStep) {
            showFlowError();
            return false;
        }

        alert(successMsg);

        if (nextStep) {
            setOcapStep(nextStep);
        }

        return true;
    };





    const [rdbOcapStep, setRdbOcapStep] = useState(1);

    const [rdbActionsDone, setRdbActionsDone] = useState({
        filter: false,
        bottle: false,
    });

    const [rdbValidationClicks, setRdbValidationClicks] = useState({
        thicknessCheck: false,
        uniformityBaseline: false,
    });

    const showRdbFlowError = () => {
        alert(
            "Please follow the OCAP flow: Containment → Verification → Root Cause → Actions → Validation → Release"
        );
    };

    const handleRdbOcapClick = (
        requiredStep: number,
        successMsg: string,
        nextStep?: number
    ) => {
        if (rdbOcapStep !== requiredStep) {
            showRdbFlowError();
            return false;
        }

        alert(successMsg);

        if (nextStep) {
            setRdbOcapStep(nextStep);
        }

        return true;
    };

    const handleRdbActionClick = (
        actionType: 'filter' | 'bottle',
        successMsg: string
    ) => {
        if (rdbOcapStep !== 4) {
            showRdbFlowError();
            return false;
        }

        alert(successMsg);

        setRdbActionsDone(prev => {
            const updated = {
                ...prev,
                [actionType]: true,
            };

            if (dpMode === 'high') {
                if (updated.filter && updated.bottle) {
                    setRdbOcapStep(5);
                }
            } else {
                if (updated.bottle) {
                    setRdbOcapStep(5);
                }
            }

            return updated;
        });

        return true;
    };





    const handleRdbRootCauseClick = () => {
        if (rdbOcapStep !== 3) {
            showRdbFlowError();
            return false;
        }

        if (dpMode === 'high') {
            alert('Root cause completed: HIGH ΔP detected — filter replacement / filter prime required');
        } else {
            alert('Root cause completed: NORMAL ΔP detected — air pocket due to empty resist bottle');
        }

        setRdbOcapStep(4);
        return true;
    };


    const [ebrOcapStep, setEbrOcapStep] = useState(1);
    const [ebrValidationClicks, setEbrValidationClicks] = useState({
        dummyWafer: false,
        baseline: false,
    });

    const showEbrFlowError = () => {
        alert(
            "Please follow the OCAP flow: Containment → Verification → Root Cause → Actions → Validation → Release"
        );
    };

    const handleEbrOcapClick = (
        requiredStep: number,
        successMsg: string,
        nextStep?: number
    ) => {
        if (ebrOcapStep !== requiredStep) {
            showEbrFlowError();
            return false;
        }

        alert(successMsg);

        if (nextStep) {
            setEbrOcapStep(nextStep);
        }

        return true;
    };









    const [exfOcapStep, setExfOcapStep] = useState(1);
    const [exfValidationClicks, setExfValidationClicks] = useState({
        thicknessCheck: false,
        defectMap: false,
    });

    const showExfFlowError = () => {
        alert(
            "Please follow the OCAP flow: Containment → Verification → Root Cause → Actions → Validation → Release"
        );
    };

    const handleExfOcapClick = (
        requiredStep: number,
        successMsg: string,
        nextStep?: number
    ) => {
        if (exfOcapStep !== requiredStep) {
            showExfFlowError();
            return false;
        }

        alert(successMsg);

        if (nextStep) {
            setExfOcapStep(nextStep);
        }

        return true;
    };















    const [devOcapStep, setDevOcapStep] = useState(1);

    const showDevFlowError = () => {
        alert(
            "Please follow the OCAP flow: Containment → Verification → Root Cause → Actions → Validation → Release"
        );
    };

    const handleDevOcapClick = (
        requiredStep: number,
        successMsg: string,
        nextStep?: number
    ) => {
        if (devOcapStep !== requiredStep) {
            showDevFlowError();
            return false;
        }

        alert(successMsg);

        if (nextStep) {
            setDevOcapStep(nextStep);
        }

        return true;
    };













    const handlePebRepairAction = (
        expectedScenario: 1 | 2 | 3,
        repairType: 'heater' | 'tc' | 'ssr',
        successMsg: string
    ) => {
        if (ocapStep !== 4) {
            showFlowError();
            return;
        }

        if (pebScenario !== expectedScenario) {
            alert('ERROR: REPLACED PART DOES NOT MATCH FAILURE SCENARIO');
            return;
        }

        setSelectedRepair(repairType);
        alert(successMsg);
        setOcapStep(5);
    };







    const [devActionsDone, setDevActionsDone] = useState({
        primary: false,
        flush: false,
    });

    const handleDevActionClick = (
        actionType: "primary" | "flush",
        successMsg: string
    ) => {
        if (devOcapStep !== 4) {
            showDevFlowError();
            return false;
        }

        alert(successMsg);

        setDevActionsDone(prev => {
            const updated = {
                ...prev,
                [actionType]: true,
            };

            if (updated.primary && updated.flush) {
                setDevOcapStep(5);
            }

            return updated;
        });

        return true;
    };










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

    // =============================================
    // NEW MODULE RENDER
    // =============================================
    const renderNewModule = () => {
        if (!isNewModule) return null;

        const interlockColor = fm.interlockType === 'hard' ? 'nm-interlock--hard' : 'nm-interlock--soft';

        return (
            <>

                {/* Charts section */}
                {(activeTab === null || activeTab === 'rtmspc') && (
                    <div className={`nm-charts-layout ${fm.name === "Resist Dispense Bubble" ? "fm002-charts-row" : ""}`}>
                        {/* RTM Chart */}
                        <div className="nm-chart-panel">
                            <div className="nm-chart-header">
                                <span className="nm-chart-title">⬡ RTM — {fm.rtmLabel}</span>
                                <div className="nm-rtm-meta">
                                    <span className="nm-meta-item nm-meta-ok">NORMAL: {fm.rtmNormalValue}</span>
                                    <span className="nm-meta-item nm-meta-danger">FAILURE: {fm.rtmFailureValue}</span>
                                </div>
                            </div>
                            <div className="nm-sensor-badge">
                                <span>📡 SENSOR: {fm.rtmSensorLabel}</span>
                            </div>
                            {
                                fm.name === "Resist Dispense Bubble" ? (
                                    <div className="nm-rtm-image-wrapper">
                                        <Image
                                            src="/RTMPUMPResistDispenseBubble.png"
                                            alt="RTM Pump Pressure"
                                            width={1400}
                                            height={500}
                                            className="nm-rtm-image"
                                        />
                                    </div>
                                ) : fm.name === "Developer Concentration" ? (
                                    <div className="nm-rtm-image-wrapper">
                                        <Image
                                            src="/DeveloperconcentrationRTM.png"
                                            alt="Developer Concentration RTM"
                                            width={1400}
                                            height={500}
                                            className="nm-rtm-image"
                                        />
                                    </div>
                                ) : fm.name === "Exhaust Fan Failure" ? (
                                    <div className="nm-rtm-image-wrapper">
                                        <Image
                                            src="/ExhaustFanFailureRTMAlaram.png"
                                            alt="Exhaust Fan Failure RTM"
                                            width={1400}
                                            height={500}
                                            className="nm-rtm-image"
                                        />
                                    </div>
                                ) : fm.name === "EBR Nozzle Clog/Misalign" ? (
                                    <div className="nm-rtm-image-wrapper">
                                        <Image
                                            src="/EBBNozzleClogMisalignRTM.png"
                                            alt="EBR Nozzle RTM"
                                            width={1400}
                                            height={500}
                                            className="nm-rtm-image"
                                        />
                                    </div>
                                ) : (
                                    <canvas
                                        ref={newRtmCanvasRef}
                                        style={{ width: '100%', display: 'block' }}
                                        height="220"
                                    />
                                )
                            }
                        </div>

                        {/* FM-005 ONLY — Wafer Map fills the 50% right space */}
                        {fm.name === "EBR Nozzle Clog/Misalign" && (
                            <div className="nm-chart-panel" style={{ maxHeight: '360px', overflow: 'hidden' }}>
                                <div className="nm-chart-header">
                                    <span className="nm-chart-title">⬡ FAILURE DIAGNOSTICS</span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    flex: 1,
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Image
                                        src="/deffectspret.png"
                                        alt="EBR Wafer Defect Map"
                                        width={400}
                                        height={320}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'fill',
                                            display: 'block',
                                        }}
                                    />
                                </div>
                            </div>
                        )}















                        {fm.name === "Exhaust Fan Failure" && (
                            <div className="exhaust-bottom-row">
                                <div className="exhaust-bottom-card">
                                    <Image
                                        src="/viewthikness.png"
                                        alt="View Thickness"
                                        width={1200}
                                        height={780}
                                        className="exhaust-bottom-image"
                                    />
                                </div>

                                <div className="exhaust-bottom-card exhaust-info-card">
                                    <h3 className="exhaust-info-title">
                                        Exhaust Failure Analysis
                                    </h3>

                                    <div className="exhaust-info-row">
                                        <strong>Severity:</strong> High
                                    </div>

                                    <div className="exhaust-info-row">
                                        <strong>Impact:</strong> Reduced exhaust airflow causes solvent accumulation and resist thickness variation.
                                    </div>

                                    <div className="exhaust-info-row">
                                        <strong>RTM Indicator:</strong> Cup exhaust velocity drops below normal operating range.
                                    </div>

                                    <div className="exhaust-info-row">
                                        <strong>Wafer Effect:</strong> Thickness non-uniformity, drying marks and process instability.
                                    </div>




                                </div>
                            </div>
                        )}









                        {fm.name === "Exhaust Fan Failure" && (
                            <div
                                className="nm-chart-panel exhaust-full-width-panel"
                                style={{
                                    maxHeight: '360px',
                                    overflow: 'hidden',
                                    width: '100%',
                                    gridColumn: '1 / -1',
                                }}
                            >
                                <div className="nm-chart-header">
                                    <span className="nm-chart-title">⬡ WAFER DEFECT MAP</span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    flex: 1,
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Image
                                        src="/ExhaustFanFailureProcessscreen.png"
                                        alt="EBR Wafer Defect Map"
                                        width={400}
                                        height={320}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'fill',
                                            display: 'block',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

















                        {fm.name === "Developer Concentration" && (
                            <div
                                className="nm-chart-panel"
                                style={{
                                    height: 'auto',
                                    maxHeight: 'none',
                                    overflow: 'visible',
                                }}
                            >
                                <div className="nm-chart-header">
                                    <span className="nm-chart-title">
                                        ⬡ FAILURE MODE DEVELOPER CONCENTRATION
                                    </span>
                                </div>


                                <div style={{
                                    width: '100%',
                                    flex: 1,
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <div
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            gap: '16px',
                                            alignItems: 'stretch',
                                            marginTop: '10px',
                                        }}
                                    >
                                        {/* LEFT IMAGE */}
                                        <div
                                            style={{
                                                width: '60%',
                                                border: '1px solid var(--border2)',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                background: '#fff',
                                            }}
                                        >
                                            <Image
                                                src="/regonia5thmodule.png"
                                                alt="Developer Concentration"
                                                width={240}
                                                height={320}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    display: 'block',
                                                }}
                                            />
                                        </div>

                                        {/* RIGHT INFO CARD */}
                                        <div
                                            className="dev-conc-side-info-box"
                                            style={{
                                                width: '60%',
                                                background: '#f8faff',
                                                border: '1px solid #d7dde8',
                                                borderRadius: '10px',
                                                padding: '18px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            }}
                                        >




                                            <div className="dev-conc-info-row">
                                                <strong>FMEA Severity:</strong> High
                                            </div>

                                            <div className="dev-conc-info-row">
                                                <strong>Impact:</strong> Incorrect concentration causes CD variation and line slimming.
                                            </div>

                                            <div className="dev-conc-info-row">
                                                <strong>RTM:</strong> Developer conductivity drift / concentration increase.
                                            </div>

                                            <div className="dev-conc-info-row">
                                                <strong>SPC:</strong> Offline CD-SEM critical dimension trend.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}








                        {/* Alarm Log */}
                        {
                            fm.name === "Resist Dispense Bubble" && (

                                <div className="nm-chart-panel">
                                    <div className="nm-chart-header">
                                        <span className="nm-chart-title">⬡ ACTIVE ALARM LOG</span>

                                        {/* <span className={`nm-alarm-count nm-alarm-count-${fm.alarms.some(a => a.level === 'critical') ? 'critical' : 'warning'}`}>
                                            {fm.alarms.length} ACTIVE
                                        </span> */}
                                    </div>

                                    <div className="nm-alarm-list">
                                        <div className="nm-alarm-image-wrapper">
                                            <Image
                                                src="/RTMPUMPResist.png"
                                                alt="Alarm Log"
                                                width={1400}
                                                height={500}
                                                className="nm-alarm-image"
                                            />
                                        </div>
                                    </div>
                                </div>

                            )
                        }
                        {/* FM-002 ONLY — Wafer Map fills the 30% right space */}
                        {fm.name === "Resist Dispense Bubble" && (
                            <div className="nm-chart-panel" style={{ maxHeight: '360px', overflow: 'hidden' }}>
                                <div className="nm-chart-header">
                                    <span className="nm-chart-title">⬡ WAFER DEFECT MAP</span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    flex: 1,
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Image
                                        src="/waffermapmodule.png"
                                        alt="Wafer Defect Map"
                                        width={400}
                                        height={320}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'fill',
                                            display: 'block',
                                        }}
                                    />
                                </div>
                            </div>
                        )}



                        {/* SPC Chart */}
                        {/* SPC Chart */}
                        {fm.name !== "Exhaust Fan Failure" && (
                            fm.name === "Developer Concentration" ? (
                                <div className="dev-conc-spc-row">
                                    {/* LEFT SPC CARD */}
                                    <div
                                        className="nm-chart-panel nm-spc-panel"
                                        style={{ width: "50%", flex: "0 0 50%" }}
                                    >
                                        <div className="nm-chart-header">
                                            <span className="nm-chart-title">
                                                ⬡ PROCESS SPC CHART Thickness Uniformity
                                            </span>
                                            <div className="nm-spc-stats"></div>
                                        </div>

                                        {fm.spcMetrics && (
                                            <div className="nm-spc-metrics">
                                                {fm.spcMetrics
                                                    .filter(
                                                        (m) =>
                                                            !(
                                                                fm.name === "Developer Concentration" &&
                                                                m === "Unresolved Feature / Scumming Count (KLA SEM Review)"
                                                            )
                                                    )
                                                    .map((m, i) => (
                                                        <span
                                                            key={i}
                                                            className={
                                                                m.includes("Offline")
                                                                    ? "nm-spc-metric-chip right-heading"
                                                                    : "nm-spc-metric-chip left-heading"
                                                            }
                                                        >
                                                            {m}
                                                        </span>
                                                    ))}
                                            </div>
                                        )}

                                        <div className="nm-spc-dual-layout" style={{ display: "block" }}>
                                            <div className="nm-spc-left" style={{ width: "100%", height: "320px" }}>
                                                <div
                                                    className="nm-spc-image-wrapper"
                                                    style={{ width: "100%", height: "320px" }}
                                                >
                                                    <Image
                                                        src="/DeveloperconcentrationSPC.png"
                                                        alt="SPC Chart"
                                                        width={700}
                                                        height={300}
                                                        className="nm-spc-image"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {/* 
                                        {fm.spcRulesTriggered && (
                                            <div className="nm-spc-rules">
                                                <div className="nm-rules-label">SPC RULES TRIGGERED</div>
                                                {fm.spcRulesTriggered.map((rule, i) => (
                                                    <div key={i} className="nm-rule-item">
                                                        ⚡ {rule}
                                                    </div>
                                                ))}
                                            </div>
                                        )} */}
                                    </div>


























                                    <div
                                        className="dev-conc-side-card"
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                        }}
                                    >
                                        {/* Heading - Left Aligned */}
                                        <div
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'flex-start',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <span className="nm-chart-title">
                                                ⬡ WAFER DEFECT TREND
                                            </span>
                                        </div>

                                        {/* Subtitle */}
                                        <div
                                            style={{
                                                alignSelf: 'flex-start',
                                                padding: '6px 12px',
                                                border: '1px solid #d7dde8',
                                                borderRadius: '9px',
                                                background: '#f8faff',
                                                fontSize: '13px',
                                                color: '#2d4f7c',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Unresolved Feature / Scumming Count (KLA SEM Review)
                                        </div>

                                        {/* Full Width Image */}
                                        <div
                                            style={{
                                                width: '100%',
                                                border: '1px solid var(--border2)',
                                                borderRadius: '10px',
                                                background: '#fff',
                                                padding: '10px',
                                                minHeight: '520px', // <-- add this
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Image
                                                src="/DeveloperConcentrationklascan.png"
                                                alt="Developer Concentration"
                                                width={1400}
                                                height={700}
                                                style={{
                                                    width: '95%',
                                                    height: '485px',
                                                    display: 'block',
                                                    margin: '0 auto',
                                                }}
                                            />
                                        </div>
                                    </div>















                                </div>
                            ) : (
                                <div
                                    className={`nm-chart-panel nm-spc-panel ${fm.name === "EBR Nozzle Clog/Misalign"
                                        ? "ebr-entire-spc-card-small"
                                        : ""
                                        }`}
                                >
                                    <div className="nm-chart-header">
                                        <span className="nm-chart-title">
                                            ⬡ PROCESS SPC CHART Thickness Uniformity
                                        </span>
                                        <div className="nm-spc-stats"></div>
                                    </div>

                                    {fm.spcMetrics && (
                                        <div className="nm-spc-metrics">
                                            {fm.spcMetrics.map((m, i) => (
                                                <span
                                                    key={i}
                                                    className={
                                                        m.includes("Offline")
                                                            ? "nm-spc-metric-chip right-heading"
                                                            : "nm-spc-metric-chip left-heading"
                                                    }
                                                >
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="nm-spc-dual-layout">
                                        <div className="nm-spc-left">
                                            <div className="nm-spc-image-wrapper">
                                                <Image
                                                    src={
                                                        fm.name === "Resist Dispense Bubble"
                                                            ? "/spc-ResistDispenseBubble.png"
                                                            : fm.name === "EBR Nozzle Clog/Misalign"
                                                                ? "/EBBNozzleClogMisalignSPC.jpeg"
                                                                : "/EBBNozzleClogMisaligndeffect.png"
                                                    }
                                                    alt="SPC Chart"
                                                    width={700}
                                                    height={300}
                                                    className="nm-spc-image"
                                                />
                                            </div>
                                        </div>

                                        <div className="nm-spc-right">
                                            <div className="nm-offline-title">
                                                {fm.name === "EBR Nozzle Clog/Misalign" ? "" : ""}
                                            </div>

                                            <div
                                                className={`nm-offline-image-wrapper ${fm.name === "EBR Nozzle Clog/Misalign"
                                                    ? "ebr-wafer-map-small"
                                                    : ""
                                                    }`}
                                            >
                                                <Image
                                                    src={
                                                        fm.name === "Resist Dispense Bubble"
                                                            ? "/defect-ResistDispenseBubble.png"
                                                            : fm.name === "EBR Nozzle Clog/Misalign"
                                                                ? "/EBBNozzleClogMisaligndeffect.png"
                                                                : "/EBBNozzleClogMisaligndeffect.png"
                                                    }
                                                    alt="Offline Defect"
                                                    width={500}
                                                    height={300}
                                                    className="nm-offline-image"
                                                />
                                            </div>

                                            {fm.name === "EBR Nozzle Clog/Misalign" && (
                                                <div className="ebr-wafer-info-box">
                                                    <div className="ebr-info-title">FAILURE MODE</div>
                                                    <div className="ebr-info-main">EBR NOZZLE CLOG / MISALIGN</div>

                                                    <div className="ebr-info-row">
                                                        <strong>FMEA Severity:</strong> 8/10 High
                                                    </div>

                                                    <div className="ebr-info-row">
                                                        <strong>Physics Impact:</strong> Clog reduces solvent momentum causing residual PR.
                                                        Misalignment shifts removal boundary, causing particles or yield loss.
                                                    </div>

                                                    <div className="ebr-info-row">
                                                        <strong>RTM Sensor:</strong> EBR Solvent Flow Meter
                                                    </div>

                                                    <div className="ebr-info-row">
                                                        <strong>Alarm:</strong> ALM-501 — EBR solvent flow rate low / unstable
                                                    </div>

                                                    <div className="ebr-info-row">
                                                        <strong>SPC Metric:</strong> Offline Defect Adder Count — Edge Exclusion Zone
                                                    </div>

                                                    <div className="ebr-info-row">
                                                        <strong>Rules:</strong> 1 point outside 3-Sigma + edge cluster detection
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                </div>
                            )
                        )}



                    </div>




                )}
            </>
        );
    };





    return (
        <div className="failure-page">
            <div className="scanlines" />

            <nav className="top-nav">
                <div className="nav-logo">
                    <span className="logo-icon">⬡</span>
                    <span>SMa<span className="accent">RT</span></span>
                </div>
                <div className="nav-links">
                    <a href="/" className="nav-link">HOME</a>
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

                    <div className="page-title">SMaRT  <span>Simulator</span></div>
                </div>
                <div className="header-stats">
                    <div className="h-stat">
                        <div className="h-stat-val">300mm</div>
                        <div className="h-stat-lbl">WAFER SIZE</div>
                    </div>

                    <button
                        className="recipe-module-btn"
                        onClick={() => router.push("/Recipe")}
                    >
                        Recipe Module
                    </button>
                </div>
            </div>

            <div className="main-content">

                {/* FM TABS — UNCHANGED */}
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


                {/* KEY INFO + WAFER IMAGE SIDE BY SIDE */}
                <div
                    style={{
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'flex-start',
                        marginBottom:
                            fm.name === "EBR Nozzle Clog/Misalign" || fm.name === "Developer Concentration" || fm.name === "Exhaust Fan Failure"
                                ? "48px"
                                : "0px"
                    }}
                >
                    <div
                        className="row-key-info"
                        style={
                            fm.name === "EBR Nozzle Clog/Misalign" || fm.name === "Developer Concentration" || fm.name === "Exhaust Fan Failure"
                                ? { flex: 1, maxWidth: "100%", width: "100%" }
                                : { flex: 1 }
                        }
                    >



                        <div className="key-info-label">⬡ KEY INFORMATION</div>
                        <div className="key-info-content" dangerouslySetInnerHTML={{ __html: fm.keyInfo }} />
                    </div>

                    {isPEB && (
                        <div style={{ flexShrink: 0, width: '420px' }}>
                            <Image
                                src="/thermo-couple.png"
                                alt="Thermocouple Image"
                                width={320}
                                height={300}
                                style={{ width: '100%', height: '190px', borderRadius: '8px', display: 'block' }}
                            />
                        </div>
                    )}

                    {fm.name === "Resist Dispense Bubble" && (
                        <div style={{ flexShrink: 0, width: '440px' }}>
                            <Image
                                src="/visualinspection.png"
                                alt="EBR Nozzle Clog/Misalign Image"
                                width={320}
                                height={300}
                                style={{ width: '200%', height: '200px', borderRadius: '8px', display: 'block' }}
                            />
                        </div>
                    )}

                    {/* Removed EBR image/spacer block */}




                </div>


                {fm.name === "EBR Nozzle Clog/Misalign" && (
                    <div style={{ height: "28px", width: "100%" }} />
                )}

                {(
                    fm.name === "Developer Concentration" ||
                    fm.name === "Exhaust Fan Failure"
                ) && (
                        <div style={{ height: "28px", width: "100%" }} />
                    )}

                {/* SCENARIOS + LOT/RECIPE */}
                <div className="row-scenarios">

                    {/* Scenario buttons ONLY for FM-001 */}
                    {fm.id === "FM-001" && (
                        <>
                            <button
                                className={`scenario-btn ${pebScenario === 1 ? 'active' : ''}`}
                                onClick={() => setPebScenario(pebScenario === 1 ? null : 1)}
                            >
                                <span className="scenario-num">SCENARIO 1</span>
                                <span className="scenario-name">Failing Heating Element</span>
                            </button>

                            <button
                                className={`scenario-btn ${pebScenario === 2 ? 'active' : ''}`}
                                onClick={() => setPebScenario(pebScenario === 2 ? null : 2)}
                            >
                                <span className="scenario-num">SCENARIO 2</span>
                                <span className="scenario-name">Broken Thermocouple</span>
                            </button>

                            <button
                                className={`scenario-btn ${pebScenario === 3 ? 'active' : ''}`}
                                onClick={() => setPebScenario(pebScenario === 3 ? null : 3)}
                            >
                                <span className="scenario-num">SCENARIO 3</span>
                                <span className="scenario-name">Blown Solid State Relay (SSR)</span>
                            </button>
                        </>
                    )}

                    {/* LOT ID + RECIPE show for ALL modules */}
                    <div
                        className={`lot-recipe-column ${fm.id !== "FM-001" ? "new-module-lot-recipe" : ""}`}
                        style={
                            fm.name === "EBR Nozzle Clog/Misalign" || fm.name === "Developer Concentration" || fm.name === "Exhaust Fan Failure"
                                ? {
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "12px",
                                    width: "10%",
                                    marginBottom: "2px",
                                    marginLeft: "230px"
                                }
                                : {}
                        }
                    >
                        <div className="scenario-btn static-info-btn">
                            <span className="scenario-text">
                                <strong>LOT ID :</strong> {fm.lotId}
                            </span>
                        </div>

                        <div className="scenario-btn static-info-btn">
                            <span className="scenario-text">
                                <strong>RECIPE :</strong> {fm.recipe}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Scenario info bar — PEB only, UNCHANGED */}
                {pebSc && (
                    <div className={`scenario-info-bar s${pebScenario}`}>
                        <div className="scenario-icon">{pebSc.icon}</div>
                        <div className="scenario-info-text">{pebSc.desc}</div>
                        {pebSc.warn && <div className="scenario-warn-badge">{pebSc.warn}</div>}
                    </div>
                )}

                {/* ACTION BUTTONS — UNCHANGED */}
                {(!isPEB || pebScenario) && (
                    <div
                        className={`row-zone-tabs ${fm.id !== "FM-001" ? "new-module-zone-tabs" : ""}`}
                        style={
                            fm.name === "EBR Nozzle Clog/Misalign" || fm.name === "Developer Concentration" || fm.name === "Exhaust Fan Failure"
                                ? {
                                    width: "65%",
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "12px"
                                }
                                : {}
                        }
                    >
                        <button
                            className={`zone-header-btn ${activeTab === 'rtmspc' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'rtmspc' ? null : 'rtmspc')}
                        >
                            ⬡ Equipment RTM / Process SPC chart
                        </button>

                        <button
                            className={`zone-header-btn ${activeTab === 'troubleshooting' || activeTab === 'ocap' ? 'active' : ''
                                }`}
                            onClick={toggleTroubleshooting}
                        >
                            ⬡ Equipment troubleshooting, Process OCAP (Out of Control Action Plan)
                        </button>
                    </div>
                )}

                {/* PEB — no scenario selected: show prompt */}
                {isPEB && !pebScenario && (
                    <div className="peb-select-prompt">
                        <span className="peb-prompt-icon">⬡</span>
                        <span className="peb-prompt-text">Please select a scenario above to view RTM charts, SPC data, wafer map and troubleshooting tools</span>
                    </div>
                )}

                {/* DANGER ZONE BANNER — PEB only, UNCHANGED */}
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

                {/* =============================================
                    NEW MODULE CONTENT — only shown for new modules
                ============================================= */}
                {isNewModule && renderNewModule()}








                {/* EQUIPMENT TROUBLESHOOTING — UNCHANGED STRUCTURE  1 st */}

                {activeTab === 'troubleshooting' && isPEB && (
                    <div className="full-action-section">
                        <div className="peb-ocap-panel">

                            {/* ── LEFT COLUMN ── */}
                            <div className="peb-ocap-left-col">

                                {/* TOP PAIR: Containment + Verification side by side */}
                                <div className="peb-ocap-top-pair">

                                    {/* 1. Containment & Disposition */}
                                    <div className="peb-ocap-card peb-card-containment">
                                        <div className="peb-card-title">1.Containment &amp; Disposition</div>

                                        <div className="peb-card-body">
                                            <button
                                                className="peb-action-btn"
                                                onClick={() =>
                                                    handleOcapClick(
                                                        1,
                                                        'Perform Tool LOTO (Lock Out Tag Out); Scrap wafers',
                                                        2
                                                    )
                                                }
                                            >
                                                Perform Tool LOTO (Lock Out Tag Out); Scrap wafers
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. Verification */}
                                    <div className="peb-ocap-card peb-card-verification">
                                        <div className="peb-card-title">2.Verification</div>

                                        <div className="peb-card-body">
                                            <button
                                                className="peb-action-btn"
                                                onClick={() =>
                                                    handleOcapClick(
                                                        2,
                                                        'Re-measure wafer CD. Result: Same as 1st measurement; Troubleshoot tool',
                                                        3
                                                    )
                                                }
                                            >
                                                Re-measure wafer CD. Result: Same as 1st measurement;
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Root Cause Table */}
                                <div className="peb-ocap-root-cause">
                                    <div className="peb-rc-title">3.Root cause</div>

                                    <button
                                        className="peb-action-btn"
                                        style={{ marginBottom: '12px' }}
                                        onClick={() =>
                                            handleOcapClick(
                                                3,
                                                'Root cause analysis completed. Proceed to Actions.',
                                                4
                                            )
                                        }
                                    >
                                        Confirm Root Cause
                                    </button>

                                    <div className="peb-rc-table-wrap">
                                        <table className="peb-rc-table">
                                            <thead>
                                                <tr>
                                                    <th>ROOT CAUSE ANALYSIS</th>
                                                    <th>ZONE 4 TEMPERATURE</th>
                                                    <th>ZONE 4 DUTY CYCLE</th>
                                                    <th>HEATER OHMIC TEST</th>
                                                    <th>TC SENSOR OHMIC TEST</th>
                                                    <th>SSR OHMIC TEST</th>
                                                    <th>HEATER VISUAL INSPECTION</th>
                                                    <th>CD (nm)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="peb-rc-row-heater">
                                                    <td className="peb-rc-label">HEATER FAIL</td>
                                                    <td className="peb-rc-cell-yellow">REDUCES TO AMBIENT</td>
                                                    <td className="peb-rc-cell-yellow">PINNED AT 100%</td>
                                                    <td className="peb-rc-cell-red peb-rc-open">OPEN</td>
                                                    <td className="peb-rc-cell-green">OK</td>
                                                    <td className="peb-rc-cell-green">OK</td>
                                                    <td className="peb-rc-cell-red">BURN SPOT</td>
                                                    <td className="peb-rc-cell-yellow">DOWN SHIFT, OOC</td>
                                                </tr>
                                                <tr className="peb-rc-row-tc">
                                                    <td className="peb-rc-label">TC BROKEN</td>
                                                    <td className="peb-rc-cell-yellow">FLUCTUATES</td>
                                                    <td className="peb-rc-cell-yellow">FLUCTUATES</td>
                                                    <td className="peb-rc-cell-green">OK</td>
                                                    <td className="peb-rc-cell-red peb-rc-open">OPEN</td>
                                                    <td className="peb-rc-cell-green">OK</td>
                                                    <td className="peb-rc-cell-green">OK</td>
                                                    <td className="peb-rc-cell-yellow">MORE VARIABILITY, OOC</td>
                                                </tr>
                                                <tr className="peb-rc-row-ssr">
                                                    <td className="peb-rc-label">SSR FAIL</td>
                                                    <td className="peb-rc-cell-yellow">REDUCES TO AMBIENT</td>
                                                    <td className="peb-rc-cell-yellow">PINNED AT 100%</td>
                                                    <td className="peb-rc-cell-green">OK</td>
                                                    <td className="peb-rc-cell-green">OK</td>
                                                    <td className="peb-rc-cell-red peb-rc-open">OPEN</td>
                                                    <td className="peb-rc-cell-green">OK</td>
                                                    <td className="peb-rc-cell-yellow">DOWN SHIFT, OOC</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* ── RIGHT COLUMN ── */}
                            <div className="peb-ocap-right-col">

                                {/* 4. Actions */}
                                <div className="peb-ocap-card peb-card-actions">
                                    <div className="peb-card-title">4.Actions</div>

                                    <div className="peb-actions-layout">
                                        <div className="peb-action-buttons">

                                            <button
                                                className="peb-action-btn"
                                                onClick={() =>
                                                    handlePebRepairAction(
                                                        1,
                                                        'heater',
                                                        'VALIDATION SUCCESS: Replacing faulty heater'
                                                    )
                                                }
                                            >
                                                Replace faulty heater
                                            </button>

                                            <button
                                                className="peb-action-btn"
                                                onClick={() =>
                                                    handlePebRepairAction(
                                                        2,
                                                        'tc',
                                                        'VALIDATION SUCCESS: Replacing faulty Thermocouple'
                                                    )
                                                }
                                            >
                                                Replace faulty Thermocouple
                                            </button>

                                            <button
                                                className="peb-action-btn"
                                                onClick={() =>
                                                    handlePebRepairAction(
                                                        3,
                                                        'ssr',
                                                        'VALIDATION SUCCESS: Replacing faulty SSR'
                                                    )
                                                }
                                            >
                                                Replace faulty SSR
                                            </button>
                                        </div>

                                        <div className="peb-action-detail">
                                            <strong>Details of actions:</strong>
                                            <p>
                                                Replace relevant hardware element depending on
                                                the selected failure scenario.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Validation */}
                                <div className="peb-ocap-card peb-card-validation">
                                    <div className="peb-card-title">5.Validation</div>

                                    <div className="peb-validation-layout">
                                        <div className="peb-validation-steps">

                                            <button
                                                className="peb-action-btn"
                                                onClick={() => {
                                                    if (ocapStep !== 5) {
                                                        showFlowError();
                                                        return;
                                                    }

                                                    alert(
                                                        'Running 5-wafer Marathon test — all zones heating normally. Zone 4 temperature stable at 110.0°C ±0.1°C.'
                                                    );

                                                    setValidationClicks(prev => ({
                                                        ...prev,
                                                        marathon: true,
                                                    }));
                                                }}
                                            >
                                                Run 5 wafer Marathon test
                                            </button>

                                            <button
                                                className="peb-action-btn"
                                                onClick={() => {
                                                    if (ocapStep !== 5) {
                                                        showFlowError();
                                                        return;
                                                    }

                                                    alert(
                                                        'CD and CD uniformity measurement complete — both parameters returned to baseline. Tool status: GREEN (PROD).'
                                                    );

                                                    setValidationClicks(prev => {
                                                        const updated = {
                                                            ...prev,
                                                            cdBaseline: true,
                                                        };

                                                        if (updated.marathon && updated.cdBaseline) {
                                                            setOcapStep(6);
                                                        }

                                                        return updated;
                                                    });
                                                }}
                                            >
                                                CD and CD uniformity back to baseline
                                            </button>

                                        </div>

                                        <div className="peb-validation-chart">
                                            <img
                                                src="/cduniformity.png"
                                                alt="CD CD Uniformity"
                                                style={{
                                                    width: '200px',
                                                    height: '110px',
                                                    marginTop: '-5px',
                                                    objectFit: 'contain',
                                                    borderRadius: '4px',
                                                    display: 'block',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 6. Release & Monitor */}
                                <div className="peb-ocap-card peb-card-release">
                                    <div className="peb-card-title">6.Release &amp; Monitor</div>

                                    <div className="peb-card-body">
                                        <button
                                            className="peb-action-btn"
                                            onClick={() =>
                                                handleOcapClick(
                                                    6,
                                                    'Release tool for production; Record OCAP data base',
                                                    7
                                                )
                                            }
                                        >
                                            Release tool for production; Record OCAP data base
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}









                {/* EQUIPMENT TROUBLESHOOTING — FM-002 Resist Dispense Bubble 2nd */}

                {activeTab === 'troubleshooting' && fm.id === 'FM-002' && (
                    <div className="full-action-section">
                        <div className="rdb-ocap-panel">

                            {/* ── LEFT COLUMN ── */}
                            <div className="rdb-col-left">

                                {/* Containment & Disposition */}
                                <div className="rdb-card">
                                    <div className="rdb-card-title">1.Containment &amp; Disposition</div>
                                    <div className="rdb-card-body">
                                        <button
                                            className="rdb-action-btn"
                                            onClick={() =>
                                                handleRdbOcapClick(
                                                    1,
                                                    'Perform Tool LOTO (Lock Out Tag Out); Hold lot, Strip & rework wafers',
                                                    2
                                                )
                                            }
                                        >
                                            Perform Tool LOTO<br />
                                            (Lock Out Tag Out);<br />
                                            Hold lot, Strip &amp; rework wafers
                                        </button>
                                    </div>
                                </div>

                                {/* Root Cause */}
                                {/* Root Cause */}
                                <div className="rdb-card" style={{ flex: 1 }}>
                                    <div className="rdb-card-title">3.Root cause</div>



                                    <button
                                        className={`rdb-action-btn ${dpMode === 'high' ? 'highlight-high' : 'highlight-normal'}`}
                                        onClick={() =>
                                            handleRdbOcapClick(
                                                3,
                                                dpMode === 'high'
                                                    ? 'Root cause completed: HIGH ΔP detected — filter replacement / filter prime required'
                                                    : 'Root cause completed: NORMAL ΔP detected — air pocket due to empty resist bottle',
                                                4
                                            )
                                        }
                                    >
                                        1. Perform filter ΔP test to decide on filter replacement
                                    </button>

                                    <div className="rdb-dp-toggle">
                                        <button
                                            type="button"
                                            className={`rdb-dp-toggle-btn ${dpMode === 'high' ? 'active-high' : ''}`}
                                            onClick={() => setDpMode('high')}
                                        >
                                            High
                                        </button>

                                        <button
                                            type="button"
                                            className={`rdb-dp-toggle-btn ${dpMode === 'normal' ? 'active-normal' : ''}`}
                                            onClick={() => setDpMode('normal')}
                                        >
                                            Normal
                                        </button>
                                    </div>

                                    <div className="rdb-deltap-wrap">
                                        {dpMode === 'high' ? (
                                            // keep your existing HIGH ΔP SVG here
                                            <svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
                                                <rect width="180" height="100" fill="#0a0a0a" rx="6" />
                                                <path d="M 22 82 A 68 68 0 0 1 158 82" fill="none" stroke="#1a1a1a" strokeWidth="16" strokeLinecap="round" />
                                                <path d="M 22 82 A 68 68 0 0 1 158 82" fill="none" stroke="#ff1744" strokeWidth="16" strokeLinecap="round" strokeDasharray="215" strokeDashoffset="0" />
                                                <path d="M 22 82 A 68 68 0 0 1 90 14" fill="none" stroke="#00c853" strokeWidth="16" strokeLinecap="round" />
                                                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                                                    const angle = (-180 + (i / 8) * 180) * Math.PI / 180;
                                                    return (
                                                        <line key={i}
                                                            x1={90 + 58 * Math.cos(angle)} y1={82 + 58 * Math.sin(angle)}
                                                            x2={90 + 68 * Math.cos(angle)} y2={82 + 68 * Math.sin(angle)}
                                                            stroke="#333" strokeWidth="1.5"
                                                        />
                                                    );
                                                })}
                                                <line x1="90" y1="82" x2="152" y2="46" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                                                <circle cx="90" cy="82" r="6" fill="#333" />
                                                <circle cx="90" cy="82" r="3" fill="#ffffff" />
                                                <text x="90" y="58" textAnchor="middle" fontSize="13" fontWeight="900" fill="#ff1744" fontFamily="monospace">HIGH</text>
                                                <text x="90" y="72" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ff5252" fontFamily="monospace">ΔP</text>
                                                <text x="20" y="94" textAnchor="middle" fontSize="8" fill="#00c853" fontFamily="monospace">LOW</text>
                                                <text x="160" y="94" textAnchor="middle" fontSize="8" fill="#ff1744" fontFamily="monospace">HIGH</text>
                                                <rect width="178" height="98" x="1" y="1" fill="none" stroke="rgba(255,23,68,0.4)" strokeWidth="1.5" rx="5" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
                                                <rect width="180" height="100" fill="#0a0a0a" rx="6" />
                                                <path d="M 22 82 A 68 68 0 0 1 158 82" fill="none" stroke="#1a1a1a" strokeWidth="16" strokeLinecap="round" />
                                                <path d="M 22 82 A 68 68 0 0 1 90 14" fill="none" stroke="#00c853" strokeWidth="16" strokeLinecap="round" />
                                                <line x1="90" y1="82" x2="58" y2="48" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                                                <circle cx="90" cy="82" r="6" fill="#333" />
                                                <circle cx="90" cy="82" r="3" fill="#ffffff" />
                                                <text x="90" y="58" textAnchor="middle" fontSize="13" fontWeight="900" fill="#00c853" fontFamily="monospace">NORMAL</text>
                                                <text x="90" y="72" textAnchor="middle" fontSize="11" fontWeight="700" fill="#00e676" fontFamily="monospace">ΔP</text>
                                                <text x="20" y="94" textAnchor="middle" fontSize="8" fill="#00c853" fontFamily="monospace">LOW</text>
                                                <text x="160" y="94" textAnchor="middle" fontSize="8" fill="#ff1744" fontFamily="monospace">HIGH</text>
                                                <rect width="178" height="98" x="1" y="1" fill="none" stroke="rgba(0,200,83,0.4)" strokeWidth="1.5" rx="5" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── MIDDLE COLUMN ── */}
                            <div className="rdb-col-mid">

                                {/* Verification */}
                                <div className="rdb-card">
                                    <div className="rdb-card-title">2.Verification</div>
                                    <div className="rdb-card-body">
                                        <button
                                            className="rdb-action-btn"
                                            onClick={() =>
                                                handleRdbOcapClick(
                                                    2,
                                                    'Perform wafer visual inspection and re-measure wafer Thickness uniformity. Result: Same as 1st measurement; Troubleshoot tool',
                                                    3
                                                )
                                            }
                                        >
                                            Perform wafer visual inspection and re-measure wafer Thickness uniformity.
                                            Result: Same as 1<sup>st</sup> measurement; Troubleshoot tool
                                        </button>
                                    </div>
                                </div>

                                {/* Air pocket card */}
                                <div className="rdb-card rdb-air-card">
                                    <div className="rdb-card-body">
                                        <button
                                            className="rdb-action-btn"
                                            onClick={() =>
                                                alert('Air pocket detected due to empty resist bottle')
                                            }

                                        >
                                            <strong>2. Air pocket – Empty resist bottle</strong>
                                        </button>
                                    </div>
                                </div>

                                {/* Supporting image */}
                                <div className="rdb-mid-img-wrap">
                                    <img
                                        src="/resistbubblebottle.png"
                                        alt="Resist Bottle & Degasser Gauge"
                                        style={{
                                            width: '100%',
                                            display: 'block',
                                            borderRadius: '5px',
                                            border: '1px solid rgba(0,229,255,0.18)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* ── RIGHT COLUMN ── */}
                            <div className="rdb-col-right">

                                <div className="rdb-card" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div className="rdb-card-title">4.Actions</div>

                                    {dpMode === 'high' && (
                                        <button
                                            className="rdb-action-btn highlight-high"
                                            onClick={() =>
                                                handleRdbActionClick(
                                                    'filter',
                                                    'Filter Prime initiated — Evacuate filter housing, saturate membrane with fresh resist, pressurize to remove microbubbles (<0.1 μm). Filter ΔP returned to nominal.'
                                                )
                                            }
                                        >
                                            <span className="rdb-action-num">1.</span>
                                            Replace filter if high ΔP, Filter Prime – Evacuate, Saturate, Pressurize filter to remove microbubbles
                                        </button>
                                    )}

                                    <button
                                        className={`rdb-action-btn ${dpMode === 'normal' ? 'highlight-normal' : 'highlight-high'}`}
                                        style={{ marginTop: '8px' }}
                                        onClick={() =>
                                            handleRdbActionClick(
                                                'bottle',
                                                'Bottle changed to fresh vented lot — Level restored to 100%. System purge completed.'
                                            )
                                        }
                                    >
                                        <span className="rdb-action-num">{dpMode === 'high' ? '2.' : '1.'}</span>
                                        Change to fresh resist bottle; System purge – Dummy dispense 5x cycles to purge air pocket
                                    </button>

                                    <div style={{ flex: 1 }} />

                                    {/* Validation */}
                                    <div className="rdb-validation-section">
                                        <div className="rdb-validation-title">5.Validation</div>
                                        <div className="rdb-validation-row">
                                            <div className="rdb-validation-btns">

                                                <button
                                                    className="rdb-validation-btn"
                                                    onClick={() => {
                                                        if (rdbOcapStep !== 5) {
                                                            showRdbFlowError();
                                                            return;
                                                        }

                                                        alert('Running 3-wafer thickness check — dispense uniformity measuring across 49 points per wafer.');

                                                        setRdbValidationClicks(prev => ({
                                                            ...prev,
                                                            thicknessCheck: true,
                                                        }));
                                                    }}
                                                >
                                                    Run 3 wafer thickness check
                                                </button>

                                                <button
                                                    className="rdb-validation-btn"
                                                    onClick={() => {
                                                        if (rdbOcapStep !== 5) {
                                                            showRdbFlowError();
                                                            return;
                                                        }

                                                        alert('Wafer thickness uniformity: 0.8% (spec <1.0%) — returned to baseline. Tool status GREEN (PROD).');

                                                        setRdbValidationClicks(prev => {
                                                            const updated = {
                                                                ...prev,
                                                                uniformityBaseline: true,
                                                            };

                                                            if (updated.thicknessCheck && updated.uniformityBaseline) {
                                                                setRdbOcapStep(6);
                                                            }

                                                            return updated;
                                                        });
                                                    }}
                                                >
                                                    Wafer thickness uniformity back to baseline
                                                </button>

                                            </div>

                                            <div className="rdb-green-badge">
                                                <div className="rdb-badge-l1">THICKNESS UNIFORMITY</div>
                                                <div className="rdb-badge-l2">RETURNS TO &lt; 1%</div>
                                                <div className="rdb-badge-div" />
                                                <div className="rdb-badge-l3">VALIDATION SUCCESS</div>
                                                <div className="rdb-badge-l4">SYSTEM STATUS: GREEN (PROD)</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Release & Monitor */}
                                    <div className="rdb-release-section">
                                        <div className="rdb-release-title">6.Release &amp; Monitor</div>
                                        <div className="rdb-release-body">
                                            <button
                                                className="rdb-action-btn"
                                                onClick={() =>
                                                    handleRdbOcapClick(
                                                        6,
                                                        'Release tool for production; Record OCAP data base',
                                                        7
                                                    )
                                                }
                                            >
                                                Release tool for production; Record OCAP data base
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                )}

























                {activeTab === 'troubleshooting' && fm.id === 'FM-005' && (
                    <div className="full-action-section">
                        <div className="ebr-ocap-panel">

                            {/* ─── LEFT COLUMN ─── */}
                            <div className="ebr-col-left">

                                {/* 1. Containment & Disposition */}
                                <div className="ebr-card">
                                    <div className="ebr-card-title">1.Containment &amp; Disposition</div>
                                    <button
                                        className="ebr-clickable-btn"
                                        onClick={() =>
                                            handleEbrOcapClick(
                                                1,
                                                'Lock out / tag out EBR module. Hold lot. Strip & rework affected wafers.',
                                                2
                                            )
                                        }
                                    >
                                        Perform Tool LOTO (Lock Out Tag Out); Hold lot, Strip &amp; rework wafers
                                    </button>
                                </div>

                                {/* 2. Root Cause */}
                                {/* 2. Root Cause */}
                                <div className="ebr-card ebr-card-grow">
                                    <div className="ebr-card-title">3.Root cause</div>

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: "12px",
                                            marginBottom: "12px"
                                        }}
                                    >
                                        <label
                                            className="ebr-clickable-btn"
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px",
                                                textAlign: "center",
                                                minHeight: "70px"
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="ebrRootMode"
                                                checked={ebrRootMode === "clog"}
                                                onChange={() => setEbrRootMode("clog")}
                                            />
                                            EBR Nozzle Clog
                                        </label>

                                        <label
                                            className="ebr-clickable-btn"
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px",
                                                textAlign: "center",
                                                minHeight: "70px"
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="ebrRootMode"
                                                checked={ebrRootMode === "misalign"}
                                                onChange={() => setEbrRootMode("misalign")}
                                            />
                                            EBR Arm Misalignment
                                        </label>
                                    </div>

                                    {ebrRootMode === 'clog' ? (
                                        <>
                                            <button
                                                className="ebr-clickable-btn"
                                                onClick={() =>
                                                    handleEbrOcapClick(
                                                        3,
                                                        'Root cause completed: Solvent line pressure test confirms flow drop.',
                                                        4
                                                    )
                                                }
                                            >
                                                Solvent line pressure test shows Flow Drop
                                            </button>

                                            <div className="ebr-rootcause-grid">
                                                <Image src="/root couse.png" alt="Solvent pressure test" width={260} height={150} className="ebr-root-img" />
                                                <Image src="/clogdeffect3rdmodule.png" alt="Clog defective spray" width={260} height={150} className="ebr-root-img" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="ebr-clickable-btn"
                                                onClick={() =>
                                                    handleEbrOcapClick(
                                                        3,
                                                        'Root cause completed: Misalignment test confirms positional deviation.',
                                                        4
                                                    )
                                                }
                                            >
                                                Positional Deviation
                                            </button>

                                            <div className="ebr-rootcause-grid">
                                                <Image src="/misalignment2.png" alt="Misalignment test" width={260} height={150} className="ebr-root-img" />
                                                <Image src="/misalignmentsprey.png" alt="Offset straight stream" width={260} height={150} className="ebr-root-img" />
                                            </div>
                                        </>
                                    )}
                                </div>

                            </div>{/* /ebr-col-left */}

                            {/* ─── MIDDLE COLUMN ─── */}
                            <div className="ebr-col-mid">

                                {/* Verification */}
                                <div className="ebr-card">
                                    <div className="ebr-card-title">2.Verification</div>

                                    <button
                                        className="ebr-clickable-btn"
                                        onClick={() =>
                                            handleEbrOcapClick(
                                                2,
                                                'Perform wafer visual inspection and re-measure EBR width. Result: Same as 1st measurement. Troubleshoot tool.',
                                                3
                                            )
                                        }
                                    >
                                        Perform wafer visual inspection and re-measure wafer EBR width. Result: Same as 1st measurement; Troubleshoot tool.
                                    </button>

                                    <button
                                        className="ebr-clickable-btn"
                                        onClick={() =>
                                            handleEbrOcapClick(
                                                2,
                                                'Run nozzle XY positional test. Confirm deviation in X or Y axis.',
                                                3
                                            )
                                        }
                                    >
                                        Perform misalignment test — Positional deviation
                                    </button>
                                </div>
                                <div
                                    className="ebr-card"
                                    style={{
                                        marginTop: '12px',
                                        padding: '10px',
                                        border: '2px solid #444',
                                        borderRadius: '10px',
                                        background: '#fffdfd'
                                    }}
                                >
                                    <Image
                                        src="/Capture.PNG"
                                        alt="Verification Analysis"
                                        width={500}
                                        height={300}
                                        style={{
                                            width: '100%',
                                            height: 'auto',

                                            objectFit: 'contain',

                                        }}
                                    />
                                </div>
                            </div>





                            {/* /ebr-col-mid */}










                            {/* ─── RIGHT COLUMN ─── */}
                            <div className="ebr-col-right">
                                <div className="ebr-card" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

                                    {/* Actions + Details side-by-side (top of right column) */}
                                    <div className="ebr-actions-details-row">

                                        {/* Action buttons */}
                                        <div className="ebr-actions-col">
                                            <div className="ebr-card-title">4.Actions</div>

                                            {ebrRootMode === 'clog' && (
                                                <button
                                                    className="ebr-action-btn"
                                                    onClick={() =>
                                                        handleEbrOcapClick(
                                                            4,
                                                            'Replace the clogged EBR nozzle tip insert. Confirm flow rate returns to 15.0 ml/min.',
                                                            5
                                                        )
                                                    }
                                                >
                                                    <span className="ebr-action-num">1.</span> Replace EBR nozzle tip
                                                </button>
                                            )}

                                            {ebrRootMode === 'misalign' && (
                                                <button
                                                    className="ebr-action-btn"
                                                    onClick={() =>
                                                        handleEbrOcapClick(
                                                            4,
                                                            'Re-teach nozzle XY position to target 148.5 mm. Verify arm coordinates match recipe setpoint.',
                                                            5
                                                        )
                                                    }
                                                >
                                                    <span className="ebr-action-num">1.</span> Re-calibrate EBR nozzle arm to position the spray
                                                </button>
                                            )}
                                        </div>

                                        {/* Details of actions */}
                                        <div className="ebr-details-col">
                                            <div className="ebr-card-title" style={{ visibility: 'hidden' }}>Details</div>
                                            <div className="ebr-action-detail">
                                                <strong>Details of actions:</strong>
                                                <p>Replace relevant hardware element or perform re-calibration depending on the scenario observed.</p>
                                            </div>
                                        </div>

                                    </div>{/* /ebr-actions-details-row */}

                                    <div style={{ flex: 1 }} />

                                    {/* Validation */}
                                    <div className="ebr-section-divider">
                                        <div className="ebr-card-title" style={{ marginBottom: '8px' }}>5.Validation</div>
                                        <div className="ebr-valid-row">
                                            <div className="ebr-valid-btns">
                                                <button
                                                    className="ebr-action-btn"
                                                    onClick={() => {
                                                        if (ebrOcapStep !== 5) {
                                                            showEbrFlowError();
                                                            return;
                                                        }
                                                        alert('Run EBR cycle on dummy wafer. Confirm flow 15.0 ml/min, boundary at 148.5 mm ±0.5 mm.');
                                                        setEbrValidationClicks(prev => ({ ...prev, dummyWafer: true }));
                                                    }}
                                                >
                                                    Run EBR width dummy wafer
                                                </button>

                                                <button
                                                    className="ebr-action-btn"
                                                    onClick={() => {
                                                        if (ebrOcapStep !== 5) {
                                                            showEbrFlowError();
                                                            return;
                                                        }
                                                        alert('EBR removal boundary confirmed 148.5 mm. Flow = 15.0 ml/min. Edge defects <10/wafer. Tool: GREEN (PROD).');
                                                        setEbrValidationClicks(prev => {
                                                            const updated = { ...prev, baseline: true };
                                                            if (updated.dummyWafer && updated.baseline) {
                                                                setEbrOcapStep(6);
                                                            }
                                                            return updated;
                                                        });
                                                    }}
                                                >
                                                    EBR width back to baseline
                                                </button>
                                            </div>



                                            {/* EBR Cut-line image — inside Validation */}
                                            <div className="ebr-valid-img-wrap">
                                                <Image
                                                    src="/ebrcutline.png"
                                                    alt="EBR Cut-line Width 1.5mm"
                                                    width={300}
                                                    height={160}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px', display: 'block' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Release & Monitor */}
                                    <div className="ebr-section-divider">
                                        <div className="ebr-card-title" style={{ marginBottom: '6px' }}>6.Release &amp; Monitor</div>
                                        <button
                                            className="ebr-clickable-btn"
                                            onClick={() =>
                                                handleEbrOcapClick(
                                                    6,
                                                    'Release tool for production. Record OCAP entry in database.',
                                                    7
                                                )
                                            }
                                        >
                                            Release tool for production; Record OCAP data base
                                        </button>
                                    </div>

                                </div>
                            </div>{/* /ebr-col-right */}

                        </div>
                    </div>
                )}




























                {/* 4th module */}

                {activeTab === 'troubleshooting' && fm.id === 'FM-004' && (
                    <div className="full-action-section">
                        <div className="exf-ocap-panel">

                            {/* ── LEFT COLUMN ── */}
                            <div className="exf-col-left">

                                {/* Containment & Disposition */}
                                <div className="exf-card">
                                    <div className="exf-card-title">1.Containment &amp; Disposition</div>
                                    <button
                                        className="exf-text-btn"
                                        onClick={() =>
                                            handleExfOcapClick(
                                                1,
                                                'Tool LOTO applied. Hard Lock confirmed — robot WPR inhibited. Lot on HOLD. Affected wafers flagged for strip & rework evaluation.',
                                                2
                                            )
                                        }
                                    >
                                        Perform Tool LOTO (Lock Out Tag Out);<br />Hold lot, Strip &amp; rework wafers
                                    </button>
                                </div>

                                {/* Root Cause */}
                                {/* Root Cause */}
                                <div
                                    className="exf-card exf-card-grow exf-root-wide"
                                    style={{
                                        maxWidth: "720px",
                                        width: "100%",
                                        margin: "0 auto"
                                    }}
                                >
                                    <div className="exf-card-title">3.Root cause</div>

                                    {/* TOP TWO RADIO BOXES */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "240px 240px",
                                            justifyContent: "center",
                                            gap: "12px",
                                            marginBottom: "12px"
                                        }}
                                    >
                                        <label
                                            className="exf-text-btn"
                                            style={{
                                                minHeight: "62px",
                                                padding: "8px 10px",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "6px",
                                                textAlign: "center",
                                                lineHeight: "1.3",
                                                fontSize: "12px"
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="exfRootCause"
                                                checked={exfRootCause === "grates"}
                                                onChange={() => {
                                                    setExfRootCause("grates");
                                                    handleExfOcapClick(
                                                        3,
                                                        "Root cause selected: Dried Polymer / Photoresist build up in Exhaust Grates.",
                                                        4
                                                    );
                                                }}
                                            />
                                            <span>
                                                Dried Polymer / Photoresist<br />
                                                build up in Exhaust Grates
                                            </span>
                                        </label>

                                        <label
                                            className="exf-text-btn"
                                            style={{
                                                minHeight: "62px",
                                                padding: "8px 10px",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "6px",
                                                textAlign: "center",
                                                lineHeight: "1.3",
                                                fontSize: "12px"
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="exfRootCause"
                                                checked={exfRootCause === "motor"}
                                                onChange={() => {
                                                    setExfRootCause("motor");
                                                    handleExfOcapClick(
                                                        3,
                                                        "Root cause selected: Exhaust Fan Motor not working.",
                                                        4
                                                    );
                                                }}
                                            />
                                            <span>
                                                Exhaust Fan Motor<br />
                                                not working
                                            </span>
                                        </label>
                                    </div>

                                    {/* CENTER IMAGE */}
                                    {exfRootCause && (
                                        <div
                                            style={{
                                                width: "100%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                marginTop: "8px"
                                            }}
                                        >
                                            <div
                                                className="exf-rc-img-wrap"
                                                style={{
                                                    width: "340px",
                                                    height: "175px"
                                                }}
                                            >
                                                <Image
                                                    src={exfRootCause === "grates" ? "/gratesmodule1.png" : "/fanrpm4module.png"}
                                                    alt="Exhaust Root Cause"
                                                    width={340}
                                                    height={175}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "contain",
                                                        borderRadius: "6px",
                                                        display: "block"
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── MIDDLE COLUMN ── */}
                            <div className="exf-col-mid">

                                {/* Verification */}
                                <div className="exf-card">
                                    <div className="exf-card-title">2.Verification</div>
                                    <button
                                        className="exf-text-btn"
                                        onClick={() =>
                                            handleExfOcapClick(
                                                2,
                                                'Wafer thickness check complete. Airflow confirmed at 0.10 m/s. Thickness: 5250 Å (+5% shift). Troubleshoot tool.',
                                                3
                                            )
                                        }
                                    >
                                        Perform wafer thickness check and re-measure wafer Thickness uniformity. Result: Same as 1<sup>st</sup>
                                    </button>
                                </div>

                            </div>

                            {/* ── RIGHT COLUMN ── */}
                            <div className="exf-col-right">
                                <div className="exf-card exf-card-full">
                                    <div className="exf-card-title">4.Actions</div>

                                    <div className="exf-actions-row">
                                        {exfRootCause === "grates" && (
                                            <button
                                                className="exf-action-btn"
                                                onClick={() =>
                                                    handleExfOcapClick(
                                                        4,
                                                        "Cleaning exhaust grates — removing dried polymer/photoresist build up. Airflow restored.",
                                                        5
                                                    )
                                                }
                                            >
                                                Clean Exhaust Grates
                                            </button>
                                        )}

                                        {exfRootCause === "motor" && (
                                            <button
                                                className="exf-action-btn"
                                                onClick={() =>
                                                    handleExfOcapClick(
                                                        4,
                                                        "Replacing exhaust fan motor — Fan RPM returning to nominal. Airflow within spec.",
                                                        5
                                                    )
                                                }
                                            >
                                                Replace Exhaust Fan Motor
                                            </button>
                                        )}
                                    </div>

                                    <div className="exf-action-detail">
                                        <strong>5.Details of actions:</strong>
                                        <p>Clean parts or replace relevant hardware element depending on the scenario observed.</p>
                                    </div>

                                    {/* Validation */}
                                    <div className="exf-section-sep">
                                        <div className="exf-card-title" style={{ marginBottom: '8px' }}>5.Validation</div>

                                        <div className="exf-valid-row">
                                            <div className="exf-valid-btns">
                                                <button
                                                    className="exf-text-btn"
                                                    onClick={() => {
                                                        if (exfOcapStep !== 5) {
                                                            showExfFlowError();
                                                            return;
                                                        }

                                                        alert('Running 3-wafer thickness check — measuring uniformity across 49 points per wafer. Fan running at nominal RPM.');

                                                        setExfValidationClicks(prev => ({
                                                            ...prev,
                                                            thicknessCheck: true,
                                                        }));
                                                    }}
                                                >
                                                    Run 3 wafer thickness check and dry monitor defect map
                                                </button>

                                                <button
                                                    className="exf-text-btn"
                                                    onClick={() => {
                                                        if (exfOcapStep !== 5) {
                                                            showExfFlowError();
                                                            return;
                                                        }

                                                        alert('Wafer thickness uniformity: 0.6% (within spec). Dry monitor defect map: CLEAN. Tool status GREEN (PROD).');

                                                        setExfValidationClicks(prev => {
                                                            const updated = {
                                                                ...prev,
                                                                defectMap: true,
                                                            };

                                                            if (updated.thicknessCheck && updated.defectMap) {
                                                                setExfOcapStep(6);
                                                            }

                                                            return updated;
                                                        });
                                                    }}
                                                >
                                                    Wafer thickness uniformity back to baseline; Dry monitor defect map is clean
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Release & Monitor */}
                                    <div className="exf-section-sep">
                                        <div className="exf-card-title" style={{ marginBottom: '6px' }}>6.Release &amp; Monitor</div>
                                        <button
                                            className="exf-text-btn"
                                            onClick={() =>
                                                handleExfOcapClick(
                                                    6,
                                                    'Tool released for production. OCAP entry recorded in database. Hard Lock lifted — robot WPR re-enabled.',
                                                    7
                                                )
                                            }
                                        >
                                            Release tool for production; Record OCAP data base
                                        </button>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                )}















                {activeTab === 'troubleshooting' && fm.id === 'FM-003' && (
                    <div className="full-action-section">
                        <div className="dev-ocap-panel">

                            {/* LEFT COLUMN */}
                            <div className="dev-col-left">

                                <div className="dev-card">
                                    <div className="dev-card-title">1.Containment &amp; Disposition</div>
                                    <button
                                        className="dev-grey-btn"
                                        onClick={() =>
                                            handleDevOcapClick(
                                                1,
                                                'Tool LOTO applied. Lot on HOLD. Affected wafers flagged for strip & rework evaluation.',
                                                2
                                            )
                                        }
                                    >
                                        Perform Tool LOTO (Lock Out Tag Out); Hold lot, Strip &amp; rework wafers
                                    </button>
                                </div>

                                <div className="dev-card dev-card-grow">
                                    <div className="dev-card-title">3.Root cause</div>

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: "12px",
                                            marginBottom: "12px"
                                        }}
                                    >
                                        <label className="dev-grey-btn" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                            <input
                                                type="radio"
                                                name="devRootCause"
                                                checked={devRootCause === "diwater"}
                                                onChange={() => {
                                                    setDevRootCause("diwater");
                                                    handleDevOcapClick(
                                                        3,
                                                        "[CDS LOG — ERROR] DI Water Supply interruption — System Interlock triggered.",
                                                        4
                                                    );
                                                }}
                                            />
                                            DI Water Supply interruption
                                        </label>

                                        <label className="dev-grey-btn" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                            <input
                                                type="radio"
                                                name="devRootCause"
                                                checked={devRootCause === "chiller"}
                                                onChange={() => {
                                                    setDevRootCause("chiller");
                                                    handleDevOcapClick(
                                                        3,
                                                        "[HEAT EXCHANGER STATUS: CRITICAL] Chiller not working. Developer temperature out of spec.",
                                                        4
                                                    );
                                                }}
                                            />
                                            Heat Exchanger Chiller not working
                                        </label>
                                    </div>

                                    {devRootCause && (
                                        <div className="dev-rc-img-row" style={{ justifyContent: "center" }}>
                                            <div className="dev-img-btn" style={{ width: "420px", height: "220px" }}>
                                                <Image
                                                    src={devRootCause === "diwater" ? "/cdsunitlast.png" : "/chillplatelast.png"}
                                                    alt="Developer Root Cause"
                                                    width={420}
                                                    height={220}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "contain",
                                                        borderRadius: "6px",
                                                        display: "block"
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="dev-cds-note">CDS — Chemical dispense system</div>
                                </div>
                            </div>

                            {/* MIDDLE COLUMN */}
                            <div className="dev-col-mid">

                                <div className="dev-card">
                                    <div className="dev-card-title">2.Verification</div>
                                    <button
                                        className="dev-grey-btn"
                                        onClick={() =>
                                            handleDevOcapClick(
                                                2,
                                                'Developer chemical sampling initiated. Manual titration result: 2.48% TMAH Normality — HIGH SPEC confirmed.',
                                                3
                                            )
                                        }
                                    >
                                        Test developer chemical sampling
                                    </button>

                                    <div className="de">
                                        <Image
                                            src="/PERFORMimglastmodule.png"
                                            alt="Perform Manual Titration"
                                            width={420}
                                            height={220}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                borderRadius: '6px',
                                                display: 'block'
                                            }}
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="dev-col-right">

                                <div className="dev-card dev-card-full">
                                    <div className="dev-card-title">4.Actions</div>

                                    {devRootCause === "diwater" && (
                                        <>
                                            <button
                                                className="dev-action-btn"
                                                onClick={() =>
                                                    handleDevOcapClick(
                                                        4,
                                                        "Restoring DI water flow to chemical blending system. TMAH normality returning to 2.38% setpoint.",
                                                        5
                                                    )
                                                }
                                            >
                                                Restore DI Water flow
                                            </button>

                                            <button
                                                className="dev-action-btn"
                                                onClick={() =>
                                                    handleDevOcapClick(
                                                        4,
                                                        "Flushing developer line — recirculating at correct concentration. Normality verified at 2.38%.",
                                                        5
                                                    )
                                                }
                                            >
                                                Flush Developer Line
                                            </button>
                                        </>
                                    )}

                                    {devRootCause === "chiller" && (
                                        <>
                                            <button
                                                className="dev-action-btn"
                                                onClick={() =>
                                                    handleDevOcapClick(
                                                        4,
                                                        "Fixing heat exchanger — chiller unit replacement initiated. Developer temperature returning to 23.0°C ±0.2°C.",
                                                        5
                                                    )
                                                }
                                            >
                                                Fix Heat Exchanger
                                            </button>

                                            <button
                                                className="dev-action-btn"
                                                onClick={() =>
                                                    handleDevOcapClick(
                                                        5,
                                                        "Flushing developer line — recirculating at correct concentration. Normality verified at 2.38%.",
                                                        6
                                                    )
                                                }
                                            >
                                                Flush Developer Line
                                            </button>
                                        </>
                                    )}

                                    <div className="dev-action-detail">
                                        <strong>5. Details of actions:</strong>
                                        <p>Perform relevant actions #1 or #2 depending on the scenario observed and then flush developer line</p>
                                    </div>

                                    <div style={{ height: "10px" }} />

                                    {/* Validation */}
                                    <div className="dev-section-sep">
                                        <div className="dev-card-title" style={{ marginBottom: '8px' }}>5. Validation</div>
                                        <button
                                            className="dev-grey-btn"
                                            onClick={() =>
                                                handleDevOcapClick(
                                                    5,
                                                    'Verify wafer CD: CD-SEM remeasurement complete. ADI inspection for pitting defects — No abnormalities found. Tool status GREEN.',
                                                    6
                                                )
                                            }
                                        >
                                            Verify wafer CD and ADI inspection for pitting defects. No abnormalities.
                                        </button>
                                    </div>

                                    {/* Release & Monitor */}
                                    <div className="dev-section-sep">
                                        <div className="dev-release-row">
                                            <div className="dev-release-label">6.Release &amp; Monitor</div>
                                            <button
                                                className="dev-grey-btn dev-release-btn"
                                                onClick={() =>
                                                    handleDevOcapClick(
                                                        6,
                                                        'Tool released for production. OCAP entry recorded in database.',
                                                        7
                                                    )
                                                }
                                            >
                                                Release tool for production; Record OCAP data base
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                )}












                {/* PROCESS OCAP — UNCHANGED STRUCTURE */}
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
                                            {idx === 0 && (

                                                <button
                                                    className={`ocap-step-btn ${step.btnClass}`}
                                                    onClick={() => alert(step.alertMsg)}
                                                >
                                                    {step.btnLabel}
                                                </button>

                                            )}
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





                {/* PEB CHARTS — only shown for PEB module, COMPLETELY UNCHANGED */}
                {isPEB && pebScenario && (activeTab === null || activeTab === 'rtmspc') && (
                    <>
                        <div className="charts-wafer-layout">
                            <div className="charts-grid-2x2">
                                {(isPEB && pebSc) && (
                                    <div className="chart-block">
                                        <div className="chart-block-label">
                                            <span>⬡ {isPEB && pebSc ? ` TEMP — RTM (°C) Real Time Monitoring ` : `RTM — ${fm.rtmLabel}`}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '20px', marginBottom: '10px', fontSize: '12px', flexWrap: 'wrap' }}>
                                            {[
                                                { id: 1, color: '#3a3232' },
                                                { id: 2, color: '#4ecdc4' },
                                                { id: 3, color: '#ffe66d' },
                                                { id: 4, color: '#95e77e' },
                                                { id: 5, color: '#a78bfa' }
                                            ].map((zone) => {
                                                const activeZone = pebScenario === 1 ? 4 : pebScenario === 2 ? 4 : pebScenario === 3 ? 4 : null;
                                                const isActive = zone.id === activeZone;
                                                return (
                                                    <div key={zone.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <div style={{ width: '20px', height: '3px', background: isActive ? '#ff0000' : zone.color, boxShadow: isActive ? '0 0 8px #ff0000' : 'none', transition: '0.3s ease' }}></div>
                                                        <span style={{ color: isActive ? '#ff0000' : '#000000', fontWeight: isActive ? '700' : '500' }}>Zone {zone.id}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '11px', color: '#666' }}>
                                            <span>UCL: 110.1°C</span>
                                            <span>LCL: 109.9°C</span>
                                        </div>
                                        <canvas ref={rtmCanvasRef} style={{ width: '100%', display: 'block' }} height="150" />
                                    </div>
                                )}

                                {(isPEB && pebSc) && (
                                    <div className="chart-block">
                                        <div className="chart-block-label">
                                            <span>⬡ {isPEB && pebSc ? ` HEATER DUTY CYCLE (%) (RTM) Real Time Monitoring Chart` : 'PROCESS LIFECYCLE — ALARM SUMMARY'}</span>
                                        </div>
                                        {isPEB && pebSc && (
                                            <>
                                                <div style={{ display: 'flex', gap: '20px', marginBottom: '10px', fontSize: '12px', flexWrap: 'wrap' }}>
                                                    {[
                                                        { id: 1, color: '#3c3434' },
                                                        { id: 2, color: '#4ecdc4' },
                                                        { id: 3, color: '#ffe66d' },
                                                        { id: 4, color: '#95e77e' },
                                                        { id: 5, color: '#a78bfa' }
                                                    ].map((zone) => {
                                                        const activeZone = pebScenario === 1 ? 4 : pebScenario === 2 ? 4 : pebScenario === 3 ? 4 : null;
                                                        const isActive = zone.id === activeZone;
                                                        return (
                                                            <div key={zone.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                <div style={{ width: '20px', height: '3px', background: isActive ? '#ff0000' : zone.color, boxShadow: isActive ? '0 0 8px #ff0000' : 'none', transition: '0.3s ease' }}></div>
                                                                <span style={{ color: isActive ? '#ff0000' : '#000000', fontWeight: isActive ? '700' : '500' }}>Zone {zone.id}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '11px', color: '#666' }}>
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
                                )}

                                <div className="chart-block">
                                    <div className="chart-block-label">
                                        <span>⬡ OFFLINE CD-SEM, SPC Chart</span>
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

                                <div className="chart-block">
                                    <div className="chart-block-label">
                                        <span>⬡ CD UNIFORMITY, SPC Chart</span>
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
                                        src={pebScenario === 2 ? "/waffermapscenario2.png" : "/wafercd.png"}
                                        alt="Wafer CD Map"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', borderRadius: '6px' }}
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
                                        <div className="wafer-info-row"><span>Center CD</span><strong>22nm</strong></div>
                                        <div className="wafer-info-row"><span>Failure Zone</span><strong>{pebScenario === 2 ? 'Zone 4' : 'Zone 4'}</strong></div>
                                        <div className="wafer-info-row"><span>Thermal Pattern</span><strong>{pebScenario === 2 ? 'Erratic Thermal Noise' : 'Cold Ring Drift'}</strong></div>
                                        <div className="wafer-info-row"><span>Process Impact</span><strong>{pebScenario === 2 ? 'Random CD Variation / Scrap' : 'CD Shift / Yield Loss'}</strong></div>
                                        <div className="wafer-info-row"><span>Diagnosis</span><strong>{pebScenario === 2 ? 'Broken Thermocouple Sensor' : 'Heater / SSR Failure'}</strong></div>
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