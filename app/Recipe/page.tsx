
// // "use client"

// // import { useState, useEffect, useCallback } from "react"

// // // Types
// // interface RecipeStep {
// //   id: number
// //   step: string
// //   module: string
// //   parameters: string
// //   objective: string
// // }

// // // Recipe Steps Data (Standard ArF 193nm)
// // const RECIPE_STEPS: RecipeStep[] = [
// //   { id: 1, step: "Loading", module: "Load Port/EFEM", parameters: "FOUP Door Opener; N₂ Purge 5–10 LPM", objective: "Maintain ISO Class 1; prevent AMC" },
// //   { id: 2, step: "Dehydration", module: "D-Bake", parameters: "150°C; 60s; Proximity 0.1mm", objective: "Desorb H₂O; expose Si-OH groups" },
// //   { id: 3, step: "Adhesion", module: "HMDS Prime", parameters: "110°C; <1 Torr; 30s", objective: "Silylation; Contact Angle >70°" },
// //   { id: 4, step: "Cooling", module: "Chill Plate", parameters: "22.0°C ±0.1°C; 45s", objective: "Normalize enthalpy for resist viscosity" },
// //   { id: 5, step: "Dispense", module: "COT", parameters: "Dynamic Dispense; 500 RPM; 2.0cc", objective: "Minimize starvation; optimized suck-back" },
// //   { id: 6, step: "Spin Coat", module: "COT", parameters: "1500–3000 RPM; Accel 20k RPM/s", objective: "Define film thickness" },
// //   { id: 7, step: "EBR/WEE", module: "COT", parameters: "Solvent PGMEA; Backside/Edge Rinse", objective: "Remove edge bead; prevent comet defects" },
// //   { id: 8, step: "Soft Bake", module: "PAB", parameters: "100–120°C; 60–90s", objective: "Drive off ~90% casting solvent" },
// //   { id: 9, step: "Cooling", module: "Chill Plate", parameters: "22.0°C; 30s", objective: "Stabilize film before scanner transfer" },
// //   { id: 10, step: "Interface", module: "IFB", parameters: "Optimized WPH handling speed", objective: "Manage TTE window; prevent contamination" },
// //   { id: 11, step: "Exposure", module: "300mm Scanner", parameters: "193nm ArF; Dose 20–50 mJ/cm²", objective: "Generate PAGs in latent image" },
// //   { id: 12, step: "PEB", module: "PEB Hotplate", parameters: "110°C (Critical); 60s", objective: "Acid-catalyzed deprotection; smooth standing waves" },
// //   { id: 13, step: "Cooling", module: "Chill Plate", parameters: "22.0°C; 45s", objective: "Terminate deprotection; control CD" },
// //   { id: 14, step: "Develop", module: "DEV", parameters: "2.38% TMAH; Puddle 30–60s", objective: "Selective dissolution of exposed polymer" },
// //   { id: 15, step: "Rinse/Dry", module: "DEV/Spin Dry", parameters: "DIW Rinse; N₂ Purge; 4000 RPM", objective: "Remove salts; prevent water marks" },
// //   { id: 16, step: "Hard Bake", module: "HP", parameters: "130°C; 60s", objective: "Cross-link polymer; increase etch resistance" },
// //   { id: 17, step: "Unloading", module: "EFEM/FOUP 3", parameters: "Slot Verification; Lot End Signal", objective: "Finalize process log and SPC data" }
// // ]

// // // LED Component — unchanged
// // function LED({ color, pulse = false, size = "md" }: { color: "green" | "red" | "amber" | "cyan"; pulse?: boolean; size?: "sm" | "md" | "lg" }) {
// //   const sizeClasses = { sm: "w-2 h-2", md: "w-3 h-3", lg: "w-4 h-4" }
// //   const colorClasses = { green: "bg-green-500", red: "bg-red-500", amber: "bg-amber-500", cyan: "bg-cyan-500" }
// //   return (
// //     <div className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${pulse ? "animate-pulse" : ""}`} />
// //   )
// // }

// // // Main Recipe Sequencer Component
// // export function RecipeSequencer({ onComplete }: { onComplete?: () => void }) {
// //   const [selectedRecipe, setSelectedRecipe] = useState<"A" | "B" | "C" | null>(null)
// //   const [shuffledSteps, setShuffledSteps] = useState<RecipeStep[]>([])
// //   const [draggedStep, setDraggedStep] = useState<number | null>(null)
// //   const [completed, setCompleted] = useState(false)

// //   const recipes = [
// //     { id: "A" as const, name: "Standard ArF 193nm Positive Resist", steps: 17 },
// //     { id: "B" as const, name: "i-Line 365nm Resist (Abbreviated)", steps: 12 },
// //     { id: "C" as const, name: "NTD (Negative Tone Developer) Resist", steps: 15 }
// //   ]

// //   const shuffleSteps = useCallback(() => {
// //     const steps = [...RECIPE_STEPS]
// //     const swapCount = 3 + Math.floor(Math.random() * 3)
// //     for (let i = 0; i < swapCount; i++) {
// //       const idx1 = Math.floor(Math.random() * steps.length)
// //       let idx2 = Math.floor(Math.random() * steps.length)
// //       while (idx2 === idx1) { idx2 = Math.floor(Math.random() * steps.length) }
// //       ;[steps[idx1], steps[idx2]] = [steps[idx2], steps[idx1]]
// //     }
// //     setShuffledSteps(steps)
// //     setCompleted(false)
// //   }, [])

// //   useEffect(() => {
// //     if (selectedRecipe) shuffleSteps()
// //   }, [selectedRecipe, shuffleSteps])

// //   const getCorrectCount = () => shuffledSteps.filter((step, idx) => step.id === idx + 1).length

// //   useEffect(() => {
// //     if (shuffledSteps.length > 0 && getCorrectCount() === 17 && !completed) {
// //       setCompleted(true)
// //       onComplete?.()
// //     }
// //   }, [shuffledSteps, completed, onComplete])

// //   const handleDragStart = (idx: number) => setDraggedStep(idx)
// //   const handleDragOver = (e: React.DragEvent) => e.preventDefault()
// //   const handleDrop = (e: React.DragEvent, dropIdx: number) => {
// //     e.preventDefault()
// //     if (draggedStep === null) return
// //     const newSteps = [...shuffledSteps]
// //     const [dragged] = newSteps.splice(draggedStep, 1)
// //     newSteps.splice(dropIdx, 0, dragged)
// //     setShuffledSteps(newSteps)
// //     setDraggedStep(null)
// //   }

// //   // ── RECIPE SELECTOR ──────────────────────────────────────────────
// //   if (!selectedRecipe) {
// //     return (
// //       // ✅ CHANGED: added bg-slate-50 min-h-full p-6 to cover the full panel background
// //       <div className="flex flex-col gap-6 h-full bg-slate-50 min-h-full p-6 rounded-lg">
// //         <h2 className="font-display text-2xl font-semibold text-gray-800">Recipe Sequencer</h2>
// //         <p className="text-gray-800">Select a recipe to begin the sequencing challenge:</p>

// //         <div className="grid grid-cols-3 gap-4">
// //           {recipes.map(recipe => (
// //             <button
// //               key={recipe.id}
// //               onClick={() => setSelectedRecipe(recipe.id)}
// //               // ✅ CHANGED: bg-gray-800/50 → bg-white/90  |  border-gray-700 → border-blue-200
// //               className="bg-white/90 p-6 rounded-lg border-2 border-blue-200 hover:border-cyan-500 transition-all text-left"
// //             >
// //               <div className="flex items-center gap-2 mb-2">
// //                 <span className="text-cyan-400 font-bold text-lg">Recipe {recipe.id}</span>
// //                 <LED color="amber" size="sm" />
// //               </div>
// //               <p className="text-gray-600 text-sm mb-2">{recipe.name}</p>
// //               <span className="text-gray-400 text-xs">{recipe.steps} Steps</span>
// //             </button>
// //           ))}
// //         </div>
// //       </div>
// //     )
// //   }

// //   // ── SEQUENCER VIEW ───────────────────────────────────────────────
// //   const correctCount = getCorrectCount()

// //   return (
// //     <div className="flex flex-col gap-4 h-full bg-slate-50 min-h-full p-6 rounded-lg">
// //       <div className="flex items-center justify-between">
// //         <div>
// //           <h2 className="font-display text-2xl font-semibold text-gray-800">Recipe Sequencer</h2>
// //           <span className="text-gray-800 text-sm">Recipe {selectedRecipe}: Standard ArF 193nm Positive Resist</span>
// //         </div>
// //         <div className="flex items-center gap-4">
// //           {/* ✅ CHANGED: bg-gray-800 → bg-white/90  |  border-gray-700 → border-blue-200 */}
// //           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 rounded border border-blue-200">
// //             <span className="text-gray-800 text-sm">Correct:</span>
// //             <span className={`font-mono font-bold ${correctCount === 17 ? "text-green-400" : "text-amber-400"}`}>
// //               {correctCount} / 17
// //             </span>
// //           </div>
// //           <button
// //             onClick={shuffleSteps}
// //             className="px-4 py-2 bg-amber-500 text-gray-900 font-bold rounded hover:bg-amber-400 transition-colors"
// //           >
// //             RESET
// //           </button>
// //           <button
// //             onClick={() => setSelectedRecipe(null)}
// //             className="px-4 py-2 border border-gray-700 text-gray-800 rounded hover:border-cyan-500 hover:text-gray-200 transition-colors"
// //           >
// //             Change Recipe
// //           </button>
// //         </div>
// //       </div>

// //       {completed && (
// //         <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 flex items-center justify-center gap-3">
// //           <LED color="green" pulse />
// //           <span className="text-green-400 font-bold text-lg">SEQUENCE VALIDATED ✓</span>
// //           <LED color="green" pulse />
// //         </div>
// //       )}

// //       <div className="flex-1 overflow-auto">
// //         <div className="grid gap-2">
// //           {shuffledSteps.map((step, idx) => {
// //             const isCorrect = step.id === idx + 1
// //             return (
// //               <div
// //                 key={step.id}
// //                 draggable
// //                 onDragStart={() => handleDragStart(idx)}
// //                 onDragOver={handleDragOver}
// //                 onDrop={(e) => handleDrop(e, idx)}
// //                 // ✅ CHANGED: bg-gray-800/50 → bg-white/90
// //                 className={`bg-white/90 p-3 rounded border-2 cursor-move transition-all
// //                   ${isCorrect ? "border-green-500 bg-green-500/5" : "border-red-500 bg-red-500/5"}
// //                   ${draggedStep === idx ? "opacity-50" : ""}`}
// //               >
// //                 <div className="flex items-center gap-4">
// //                   <div className="flex items-center gap-2 min-w-[60px]">
// //                     <LED color={isCorrect ? "green" : "red"} size="sm" />
// //                     <span className="text-gray-500 font-mono text-sm">#{idx + 1}</span>
// //                   </div>
// //                   <div className="flex-1 grid grid-cols-4 gap-4">
// //                     <div>
// //                       <span className="text-gray-500 text-[10px] uppercase">Step</span>
// //                       <p className="text-gray-300 text-sm font-medium">{step.step}</p>
// //                     </div>
// //                     <div>
// //                       <span className="text-gray-500 text-[10px] uppercase">Module</span>
// //                       <p className="text-cyan-400 text-sm">{step.module}</p>
// //                     </div>
// //                     <div>
// //                       <span className="text-gray-500 text-[10px] uppercase">Parameters</span>
// //                       <p className="text-gray-400 text-xs">{step.parameters}</p>
// //                     </div>
// //                     <div>
// //                       <span className="text-gray-500 text-[10px] uppercase">Objective</span>
// //                       <p className="text-gray-400 text-xs">{step.objective}</p>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             )
// //           })}
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// // export default RecipeSequencer









//   "use client"

//   import { useState, useEffect, useCallback } from "react"

//   // ─────────────────────────────────────────────
//   // TYPES
//   // ─────────────────────────────────────────────
//   interface RecipeStep {
//     id: number
//     step: string
//     module: string
//     parameters: string
//     objective: string
//   }

//   // ─────────────────────────────────────────────
//   // RECIPE DATA
//   // ─────────────────────────────────────────────
//   const RECIPE_STEPS: RecipeStep[] = [
//     { id: 1,  step: "Loading",     module: "Load Port/EFEM",  parameters: "FOUP Door Opener; N₂ Purge 5–10 LPM",         objective: "Maintain ISO Class 1; prevent AMC"               },
//     { id: 2,  step: "Dehydration", module: "D-Bake",          parameters: "150°C; 60s; Proximity 0.1mm",                  objective: "Desorb H₂O; expose Si-OH groups"                },
//     { id: 3,  step: "Adhesion",    module: "HMDS Prime",      parameters: "110°C; <1 Torr; 30s",                          objective: "Silylation; Contact Angle >70°"                  },
//     { id: 4,  step: "Dispense",    module: "COT",             parameters: "Dynamic Dispense; 500 RPM; 2.0cc",             objective: "Minimize starvation; optimized suck-back"        },
//     { id: 5,  step: "Spin Coat",   module: "COT",             parameters: "1500–3000 RPM; Accel 20k RPM/s",               objective: "Define film thickness"                           },
//     { id: 6,  step: "EBR/WEE",    module: "COT",             parameters: "Solvent PGMEA; Backside/Edge Rinse",            objective: "Remove edge bead; prevent comet defects"         },
//     { id: 7,  step: "Soft Bake",   module: "PAB",             parameters: "100–120°C; 60–90s",                            objective: "Drive off ~90% casting solvent"                  },
//     { id: 8,  step: "Chill Plate", module: "Chill Plate",     parameters: "22.0°C; 30s",                                  objective: "Stabilize film before scanner transfer"          },
//     { id: 9,  step: "Interface",   module: "IFB",             parameters: "Optimized WPH handling speed",                 objective: "Manage TTE window; prevent contamination"        },
//     { id: 10, step: "Exposure",    module: "300mm Scanner",   parameters: "193nm ArF; Dose 20–50 mJ/cm²",                 objective: "Generate PAGs in latent image"                   },
//     { id: 11, step: "PEB",         module: "PEB Hotplate",    parameters: "110°C (Critical); 60s",                        objective: "Acid-catalyzed deprotection; smooth standing waves" },
//     { id: 12, step: "Cooling",     module: "Chill Plate",     parameters: "22.0°C; 30s",                                  objective: "Stabilize film before development"               },
//     { id: 13, step: "Develop",     module: "DEV",             parameters: "2.38% TMAH; Puddle 30–60s",                    objective: "Selective dissolution of exposed polymer"        },
//     { id: 14, step: "Hard Bake",   module: "HP",              parameters: "130°C; 60s",                                   objective: "Cross-link polymer; increase etch resistance"    },
//     { id: 15, step: "Unloading",   module: "EFEM/FOUP 3",    parameters: "Slot Verification; Lot End Signal",             objective: "Finalize process log and SPC data"               },
//   ]

//   // ─────────────────────────────────────────────
//   // LED
//   // ─────────────────────────────────────────────
//   function LED({ color, pulse = false }: { color: "green" | "red" | "amber" | "cyan"; pulse?: boolean }) {
//     const colorMap = { green: "#22c55e", red: "#ef4444", amber: "#f59e0b", cyan: "#06b6d4" }
//     return (
//       <span
//         style={{
//           display: "inline-block",
//           width: 8,
//           height: 8,
//           borderRadius: "50%",
//           backgroundColor: colorMap[color],
//           flexShrink: 0,
//           animation: pulse ? "pulse 1.5s ease-in-out infinite" : "none",
//           boxShadow: `0 0 5px ${colorMap[color]}88`,
//         }}
//       />
//     )
//   }

//   // ─────────────────────────────────────────────
//   // MAIN COMPONENT
//   // ─────────────────────────────────────────────
//   export function RecipeSequencer({ onComplete }: { onComplete?: () => void }) {
//     const [selectedRecipe, setSelectedRecipe] = useState<"A" | "B" | "C" | null>(null)
//     const [shuffledSteps, setShuffledSteps] = useState<RecipeStep[]>([])
//     const [draggedStep, setDraggedStep] = useState<number | null>(null)
//     const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
//     const [completed, setCompleted] = useState(false)

//     const recipes = [
//       { id: "A" as const, name: "Standard ArF 193nm Positive Resist", steps: 15 },
//       { id: "B" as const, name: "i-Line 365nm Resist (Abbreviated)",  steps: 12 },
//       { id: "C" as const, name: "NTD (Negative Tone Developer) Resist", steps: 15 },
//     ]

//     const shuffleSteps = useCallback(() => {
//       const steps = [...RECIPE_STEPS]
//       const swapCount = 4 + Math.floor(Math.random() * 3)
//       for (let i = 0; i < swapCount; i++) {
//         const idx1 = Math.floor(Math.random() * steps.length)
//         let idx2 = Math.floor(Math.random() * steps.length)
//         while (idx2 === idx1) idx2 = Math.floor(Math.random() * steps.length)
//         ;[steps[idx1], steps[idx2]] = [steps[idx2], steps[idx1]]
//       }
//       setShuffledSteps(steps)
//       setCompleted(false)
//     }, [])

//     useEffect(() => { if (selectedRecipe) shuffleSteps() }, [selectedRecipe, shuffleSteps])

//     const getCorrectCount = () => shuffledSteps.filter((s, i) => s.id === i + 1).length

//     useEffect(() => {
//       if (shuffledSteps.length > 0 && getCorrectCount() === 15 && !completed) {
//         setCompleted(true)
//         onComplete?.()
//       }
//     }, [shuffledSteps, completed, onComplete])

//     const handleDragStart = (idx: number) => setDraggedStep(idx)
//     const handleDragOver  = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx) }
//     const handleDragLeave = () => setDragOverIdx(null)
//     const handleDrop = (e: React.DragEvent, dropIdx: number) => {
//       e.preventDefault()
//       if (draggedStep === null) return
//       const newSteps = [...shuffledSteps]
//       const [dragged] = newSteps.splice(draggedStep, 1)
//       newSteps.splice(dropIdx, 0, dragged)
//       setShuffledSteps(newSteps)
//       setDraggedStep(null)
//       setDragOverIdx(null)
//     }

//     // ─────────────────────────────────────────────
//     // RECIPE SELECT
//     // ─────────────────────────────────────────────
//     if (!selectedRecipe) {
//       return (
//         <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8fbff,#eef5ff)", padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
//           <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
//           <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>Recipe Sequencer</h2>
//           <p style={{ color: "#64748b", marginBottom: 24 }}>Select a recipe to begin the sequencing challenge</p>
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
//             {recipes.map(r => (
//               <button key={r.id} onClick={() => setSelectedRecipe(r.id)}
//                 style={{ background: "#fff", border: "1.5px solid #bfdbfe", borderRadius: 16, padding: "18px 20px", textAlign: "left", cursor: "pointer", transition: "all .2s" }}
//                 onMouseEnter={e => (e.currentTarget.style.borderColor = "#06b6d4")}
//                 onMouseLeave={e => (e.currentTarget.style.borderColor = "#bfdbfe")}
//               >
//                 <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//                   <span style={{ color: "#06b6d4", fontWeight: 700, fontSize: 16 }}>Recipe {r.id}</span>
//                   <LED color="amber" />
//                 </div>
//                 <p style={{ color: "#374151", fontSize: 13, margin: "0 0 8px" }}>{r.name}</p>
//                 <span style={{ color: "#94a3b8", fontSize: 11 }}>{r.steps} Steps</span>
//               </button>
//             ))}
//           </div>
//         </div>
//       )
//     }

//     // ─────────────────────────────────────────────
//     // MAIN SEQUENCER
//     // ─────────────────────────────────────────────
//     const correctCount = getCorrectCount()

//     return (
//       <div style={{
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         background: "linear-gradient(135deg,#f8fbff,#eef5ff)",
//         padding: "10px 14px",
//         fontFamily: "system-ui, sans-serif",
//         boxSizing: "border-box",
//         overflow: "hidden",
//       }}>
//         <style>{`
//           @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
//           .step-row { transition: box-shadow .15s, transform .1s; }
//           .step-row:hover { box-shadow: 0 4px 18px rgba(59,130,246,.13) !important; transform: translateY(-1px); }
//           .step-row.drag-over { border-color: #3b82f6 !important; background: #eff6ff !important; }
//           .step-row.dragging { opacity: .45; transform: scale(.99); }
//         `}</style>

//         {/* ── HEADER ── */}
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexShrink: 0, flexWrap: "wrap", gap: 8 }}>
//           <div>
//             <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>Recipe Sequencer</h2>
//             <span style={{ fontSize: 11, color: "#64748b" }}>Recipe {selectedRecipe}: Standard ArF 193nm Positive Resist</span>
//           </div>
//           <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", background: "#fff", border: "1.5px solid #bfdbfe", borderRadius: 10 }}>
//               <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Correct</span>
//               <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 15, color: correctCount === 15 ? "#16a34a" : "#d97706" }}>
//                 {correctCount} / 15
//               </span>
//             </div>
//             <button onClick={shuffleSteps}
//               style={{ padding: "5px 16px", borderRadius: 10, background: "#f59e0b", border: "none", color: "#1c1917", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
//               RESET
//             </button>
//             <button onClick={() => setSelectedRecipe(null)}
//               style={{ padding: "5px 16px", borderRadius: 10, background: "#fff", border: "1.5px solid #cbd5e1", color: "#374151", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
//               Change Recipe
//             </button>
//           </div>
//         </div>

//         {/* ── COMPLETE BANNER ── */}
//         {completed && (
//           <div style={{ background: "linear-gradient(135deg,#dcfce7,#bbf7d0)", border: "1.5px solid #22c55e", borderRadius: 12, padding: "7px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6, flexShrink: 0 }}>
//             <LED color="green" pulse />
//             <span style={{ color: "#166534", fontWeight: 700, fontSize: 15 }}>SEQUENCE VALIDATED ✓</span>
//             <LED color="green" pulse />
//           </div>
//         )}

//         {/* ── COLUMN HEADERS ── */}
//         <div style={{
//           display: "grid",
//           gridTemplateColumns: "52px 1fr 1.1fr 1.5fr 1.8fr",
//           gap: "0 10px",
//           padding: "3px 10px",
//           flexShrink: 0,
//           marginBottom: 2,
//         }}>
//           {["", "Step", "Module", "Parameters", "Objective"].map((h, i) => (
//             <span key={i} style={{ fontSize: 13, fontWeight: 700, color: "#3b3434", textTransform: "uppercase", letterSpacing: ".06em" }}>{h}</span>
//           ))}
//         </div>

//         {/* ── STEP ROWS ── */}
//         <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, overflow: "hidden" }}>
//           {shuffledSteps.map((step, idx) => {
//             const isCorrect = step.id === idx + 1
//             return (
//               <div
//                 key={step.id}
//                 draggable
//                 onDragStart={() => handleDragStart(idx)}
//                 onDragOver={e => handleDragOver(e, idx)}
//                 onDragLeave={handleDragLeave}
//                 onDrop={e => handleDrop(e, idx)}
//                 className={`step-row${dragOverIdx === idx ? " drag-over" : ""}${draggedStep === idx ? " dragging" : ""}`}
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "52px 1fr 1.1fr 1.5fr 1.8fr",
//                   gap: "0 10px",
//                   alignItems: "center",
//                   background: isCorrect ? "#f0fdf4" : "#fef2f2",
//                   border: `1.5px solid ${isCorrect ? "#22c55e" : "#fca5a5"}`,
//                   borderRadius: 8,
//                   padding: "5px 10px",
//                   cursor: "grab",
//                   flex: 1,
//                   minHeight: 0,
//                 }}
//               >
//                 {/* # */}
//                 <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
//                   <LED color={isCorrect ? "green" : "red"} />
//                   <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#475569" }}>#{idx + 1}</span>
//                 </div>

//                 {/* Step */}
//                 <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                   {step.step}
//                 </span>

//                 {/* Module */}
//                 <span style={{ fontSize: 15, fontWeight: 600, color: "#0e7490", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                   {step.module}
//                 </span>

//                 {/* Parameters */}
//                 <span style={{ fontSize: 15, color: "#000000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                   {step.parameters}
//                 </span>

//                 {/* Objective */}
//                 <span style={{ fontSize: 15, color: "#000000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                   {step.objective}
//                 </span>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     )
//   }

//   export default RecipeSequencer



"use client"

import { useState, useEffect, useCallback } from "react"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface RecipeStep {
  id: number
  step: string
  module: string
  parameters: string
  objective: string
}

// ─────────────────────────────────────────────
// RECIPE DATA
// ─────────────────────────────────────────────
const RECIPE_STEPS: RecipeStep[] = [
  { id: 1,  step: "Loading",     module: "Load Port/EFEM",  parameters: "FOUP Door Opener; N₂ Purge 5–10 LPM",         objective: "Maintain ISO Class 1; prevent AMC"               },
  { id: 2,  step: "Dehydration", module: "D-Bake",          parameters: "150°C; 60s; Proximity 0.1mm",                  objective: "Desorb H₂O; expose Si-OH groups"                },
  { id: 3,  step: "Adhesion",    module: "HMDS Prime",      parameters: "110°C; <1 Torr; 30s",                          objective: "Silylation; Contact Angle >70°"                  },
  { id: 4,  step: "Dispense",    module: "COT",             parameters: "Dynamic Dispense; 500 RPM; 2.0cc",             objective: "Minimize starvation; optimized suck-back"        },
  { id: 5,  step: "Spin Coat",   module: "COT",             parameters: "1500–3000 RPM; Accel 20k RPM/s",               objective: "Define film thickness"                           },
  { id: 6,  step: "EBR/WEE",     module: "COT",             parameters: "Solvent PGMEA; Backside/Edge Rinse",           objective: "Remove edge bead; prevent comet defects"         },
  { id: 7,  step: "Soft Bake",   module: "PAB",             parameters: "100–120°C; 60–90s",                            objective: "Drive off ~90% casting solvent"                  },
  { id: 8,  step: "Chill Plate", module: "Chill Plate",     parameters: "22.0°C; 30s",                                  objective: "Stabilize film before scanner transfer"          },
  { id: 9,  step: "Interface",   module: "IFB",             parameters: "Optimized WPH handling speed",                 objective: "Manage TTE window; prevent contamination"        },
  { id: 10, step: "Exposure",    module: "300mm Scanner",   parameters: "193nm ArF; Dose 20–50 mJ/cm²",                 objective: "Generate PAGs in latent image"                   },
  { id: 11, step: "PEB",         module: "PEB Hotplate",    parameters: "110°C (Critical); 60s",                        objective: "Acid-catalyzed deprotection; smooth standing waves" },
  { id: 12, step: "Cooling",     module: "Chill Plate",     parameters: "22.0°C; 30s",                                  objective: "Stabilize film before development"               },
  { id: 13, step: "Develop",     module: "DEV",             parameters: "2.38% TMAH; Puddle 30–60s",                    objective: "Selective dissolution of exposed polymer"        },
  { id: 14, step: "Hard Bake",   module: "HP",              parameters: "130°C; 60s",                                   objective: "Cross-link polymer; increase etch resistance"    },
  { id: 15, step: "Unloading",   module: "EFEM/FOUP 3",     parameters: "Slot Verification; Lot End Signal",            objective: "Finalize process log and SPC data"               },
]

// ─────────────────────────────────────────────
// LED
// ─────────────────────────────────────────────
function LED({ color, pulse = false }: { color: "green" | "red" | "amber" | "cyan"; pulse?: boolean }) {
  const colorMap = { green: "#22c55e", red: "#ef4444", amber: "#f59e0b", cyan: "#06b6d4" }

  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: colorMap[color],
        flexShrink: 0,
        animation: pulse ? "pulse 1.5s ease-in-out infinite" : "none",
        boxShadow: `0 0 5px ${colorMap[color]}88`,
      }}
    />
  )
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export function RecipeSequencer({ onComplete }: { onComplete?: () => void }) {
  const [selectedRecipe, setSelectedRecipe] = useState<"A" | "B" | "C" | null>(null)
  const [shuffledSteps, setShuffledSteps] = useState<RecipeStep[]>([])
  const [draggedStep, setDraggedStep] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [completed, setCompleted] = useState(false)

  const recipes = [
    { id: "A" as const, name: "Standard ArF 193nm Positive Resist", steps: 15 },
    { id: "B" as const, name: "i-Line 365nm Resist (Abbreviated)",  steps: 12 },
    { id: "C" as const, name: "NTD (Negative Tone Developer) Resist", steps: 15 },
  ]

  const shuffleSteps = useCallback((fullShuffle = false) => {
    const steps = [...RECIPE_STEPS]

    // FIRST LOAD → only 2 steps wrong
    if (!fullShuffle) {
      const idx1 = Math.floor(Math.random() * steps.length)

      let idx2 = Math.floor(Math.random() * steps.length)
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * steps.length)
      }

      ;[steps[idx1], steps[idx2]] = [steps[idx2], steps[idx1]]
    }

    // RESET BUTTON → full shuffle
    else {
      const swapCount = 8 + Math.floor(Math.random() * 5)

      for (let i = 0; i < swapCount; i++) {
        const idx1 = Math.floor(Math.random() * steps.length)

        let idx2 = Math.floor(Math.random() * steps.length)
        while (idx2 === idx1) {
          idx2 = Math.floor(Math.random() * steps.length)
        }

        ;[steps[idx1], steps[idx2]] = [steps[idx2], steps[idx1]]
      }
    }

    setShuffledSteps(steps)
    setCompleted(false)
  }, [])

  useEffect(() => {
    if (selectedRecipe) shuffleSteps()
  }, [selectedRecipe, shuffleSteps])

  const getCorrectCount = () => shuffledSteps.filter((s, i) => s.id === i + 1).length

  useEffect(() => {
    if (shuffledSteps.length > 0 && getCorrectCount() === 15 && !completed) {
      setCompleted(true)
      onComplete?.()
    }
  }, [shuffledSteps, completed, onComplete])

  const handleDragStart = (idx: number) => setDraggedStep(idx)

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIdx(idx)
  }

  const handleDragLeave = () => setDragOverIdx(null)

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault()

    if (draggedStep === null) return

    const newSteps = [...shuffledSteps]
    const [dragged] = newSteps.splice(draggedStep, 1)

    newSteps.splice(dropIdx, 0, dragged)

    setShuffledSteps(newSteps)
    setDraggedStep(null)
    setDragOverIdx(null)
  }

  // ─────────────────────────────────────────────
  // RECIPE SELECT
  // ─────────────────────────────────────────────
  if (!selectedRecipe) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg,#f8fbff,#eef5ff)",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <style>{`
          @keyframes pulse {
            0%,100% { opacity:1 }
            50% { opacity:.4 }
          }
        `}</style>

        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#1e293b",
            margin: "0 0 8px",
          }}
        >
          Recipe Sequencer
        </h2>

        <p style={{ color: "#64748b", marginBottom: 24 }}>
          Select a recipe to begin the sequencing challenge
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: 16,
          }}
        >
          {recipes.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRecipe(r.id)}
              style={{
                background: "#fff",
                border: "1.5px solid #bfdbfe",
                borderRadius: 16,
                padding: "18px 20px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#06b6d4")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#bfdbfe")}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    color: "#06b6d4",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  Recipe {r.id}
                </span>

                <LED color="amber" />
              </div>

              <p
                style={{
                  color: "#374151",
                  fontSize: 13,
                  margin: "0 0 8px",
                }}
              >
                {r.name}
              </p>

              <span
                style={{
                  color: "#94a3b8",
                  fontSize: 11,
                }}
              >
                {r.steps} Steps
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // MAIN SEQUENCER
  // ─────────────────────────────────────────────
  const correctCount = getCorrectCount()

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg,#f8fbff,#eef5ff)",
        padding: "10px 14px",
        fontFamily: "system-ui, sans-serif",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1 }
          50% { opacity:.4 }
        }

        .step-row {
          transition: box-shadow .15s, transform .1s;
        }

        .step-row:hover {
          box-shadow: 0 4px 18px rgba(59,130,246,.13) !important;
          transform: translateY(-1px);
        }

        .step-row.drag-over {
          border-color: #3b82f6 !important;
          background: #eff6ff !important;
        }

        .step-row.dragging {
          opacity: .45;
          transform: scale(.99);
        }
      `}</style>

      {/* ── HEADER ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
          flexShrink: 0,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: "#1e293b",
              lineHeight: 1.2,
            }}
          >
            Recipe Sequencer
          </h2>

          <span
            style={{
              fontSize: 11,
              color: "#64748b",
            }}
          >
            Recipe {selectedRecipe}: Standard ArF 193nm Positive Resist
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              background: "#fff",
              border: "1.5px solid #bfdbfe",
              borderRadius: 10,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              Correct
            </span>

            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: 15,
                color: correctCount === 15 ? "#16a34a" : "#d97706",
              }}
            >
              {correctCount} / 15
            </span>
          </div>

          <button
            onClick={() => shuffleSteps(true)}
            style={{
              padding: "5px 16px",
              borderRadius: 10,
              background: "#f59e0b",
              border: "none",
              color: "#1c1917",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            RESET
          </button>

          <button
            onClick={() => setSelectedRecipe(null)}
            style={{
              padding: "5px 16px",
              borderRadius: 10,
              background: "#fff",
              border: "1.5px solid #cbd5e1",
              color: "#374151",
              fontWeight: 500,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Change Recipe
          </button>
        </div>
      </div>

      {/* ── COMPLETE BANNER ── */}
      {completed && (
        <div
          style={{
            background: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
            border: "1.5px solid #22c55e",
            borderRadius: 12,
            padding: "7px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 6,
            flexShrink: 0,
          }}
        >
          <LED color="green" pulse />

          <span
            style={{
              color: "#166534",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            SEQUENCE VALIDATED ✓
          </span>

          <LED color="green" pulse />
        </div>
      )}

      {/* ── COLUMN HEADERS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "52px 1fr 1.1fr 1.5fr 1.8fr",
          gap: "0 10px",
          padding: "3px 10px",
          flexShrink: 0,
          marginBottom: 2,
        }}
      >
        {["", "Step", "Module", "Parameters", "Objective"].map((h, i) => (
          <span
            key={i}
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#3b3434",
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* ── STEP ROWS ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          overflow: "hidden",
        }}
      >
        {shuffledSteps.map((step, idx) => {
          const isCorrect = step.id === idx + 1

          return (
            <div
              key={step.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, idx)}
              className={`step-row${dragOverIdx === idx ? " drag-over" : ""}${draggedStep === idx ? " dragging" : ""}`}
              style={{
                display: "grid",
                gridTemplateColumns: "52px 1fr 1.1fr 1.5fr 1.8fr",
                gap: "0 10px",
                alignItems: "center",
                background: isCorrect ? "#f0fdf4" : "#fef2f2",
                border: `1.5px solid ${isCorrect ? "#22c55e" : "#fca5a5"}`,
                borderRadius: 8,
                padding: "5px 10px",
                cursor: "grab",
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* # */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <LED color={isCorrect ? "green" : "red"} />

                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#475569",
                  }}
                >
                  #{idx + 1}
                </span>
              </div>

              {/* Step */}
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1e293b",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {step.step}
              </span>

              {/* Module */}
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#0e7490",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {step.module}
              </span>

              {/* Parameters */}
              <span
                style={{
                  fontSize: 15,
                  color: "#000000",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {step.parameters}
              </span>

              {/* Objective */}
              <span
                style={{
                  fontSize: 15,
                  color: "#000000",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {step.objective}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RecipeSequencer