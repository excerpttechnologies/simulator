/**
 * Nergy Vidya Assessment Engine
 * Task lookup, session prompt builder for the 98-task DB
 */

import tasksDB from "./nergyvidya_tasks_db_v2.json"
import type { Task, AssessmentSession } from "./types/assessment"

const db = tasksDB as any

// ─── Course metadata ───────────────────────────────────────────────────────────
const COURSE_META: Record<string, {
  name: string
  module: string
  portal_name: string
  portal_url: string
}> = {
  "299":  { name: "GST - TRN Generation",            module: "Goods and Services Tax", portal_name: "GST Portal",          portal_url: "https://www.gst.gov.in" },
  "300":  { name: "GST - Registration (via TRN)",     module: "Goods and Services Tax", portal_name: "GST Portal",          portal_url: "https://www.gst.gov.in" },
  "301":  { name: "GST - Returns (GSTR-1 & 3B)",      module: "Goods and Services Tax", portal_name: "GST Portal",          portal_url: "https://www.gst.gov.in" },
  "302":  { name: "GST - Nil Returns",                module: "Goods and Services Tax", portal_name: "GST Portal",          portal_url: "https://www.gst.gov.in" },
  "303":  { name: "GST - CMP-08 Composition",         module: "Goods and Services Tax", portal_name: "GST Portal",          portal_url: "https://www.gst.gov.in" },
  "304":  { name: "GST - E-Way Bill",                 module: "Goods and Services Tax", portal_name: "E-Way Bill Portal",   portal_url: "https://ewaybillgst.gov.in" },
  "305":  { name: "PAN Registration",                 module: "Income Tax",             portal_name: "IT e-Filing Portal",  portal_url: "https://www.incometax.gov.in" },
  "306":  { name: "IT e-Filing Registration",         module: "Income Tax",             portal_name: "IT e-Filing Portal",  portal_url: "https://www.incometax.gov.in" },
  "307":  { name: "ITR-1 Filing (Salaried)",          module: "Income Tax",             portal_name: "IT e-Filing Portal",  portal_url: "https://www.incometax.gov.in" },
  "308":  { name: "ITR-1 Filing (Complex)",           module: "Income Tax",             portal_name: "IT e-Filing Portal",  portal_url: "https://www.incometax.gov.in" },
  "309":  { name: "TDS Compliance",                   module: "Income Tax",             portal_name: "TRACES Portal",       portal_url: "https://www.tdscpc.gov.in" },
  "310":  { name: "TCS Compliance",                   module: "Income Tax",             portal_name: "TRACES Portal",       portal_url: "https://www.tdscpc.gov.in" },
  "311":  { name: "EPFO Registration",                module: "Labour Laws",            portal_name: "EPFO Unified Portal", portal_url: "https://unifiedportal-emp.epfindia.gov.in" },
  "312":  { name: "ESIC Registration",                module: "Labour Laws",            portal_name: "ESIC Portal",         portal_url: "https://www.esic.in" },
  "529":  { name: "MCA V3 Signup",                    module: "MCA",                    portal_name: "MCA V3 Portal",       portal_url: "https://www.mca.gov.in" },
  "530":  { name: "SPICe+ Name Reservation",          module: "MCA",                    portal_name: "MCA V3 Portal",       portal_url: "https://www.mca.gov.in" },
  "531":  { name: "DIN Application",                  module: "MCA",                    portal_name: "MCA V3 Portal",       portal_url: "https://www.mca.gov.in" },
  "532":  { name: "DIR-3 KYC Filing",                 module: "MCA",                    portal_name: "MCA V3 Portal",       portal_url: "https://www.mca.gov.in" },
  "534":  { name: "DIR-12 Director Appointment",      module: "MCA",                    portal_name: "MCA V3 Portal",       portal_url: "https://www.mca.gov.in" },
  "1408": { name: "DIR-3 KYC Web",                    module: "MCA",                    portal_name: "MCA V3 Portal",       portal_url: "https://www.mca.gov.in" },
}

// ─── Action descriptions per task prefix ───────────────────────────────────────
const ACTION_MAP: Record<string, string> = {
  "GST_TRN":       "Generate Temporary Reference Number (TRN) for GST Registration",
  "GST_RGN":       "Complete GST Registration using TRN — submit all required details and documents",
  "GST_RTN3B":     "File GSTR-1 (outward supplies) and GSTR-3B (summary return + tax payment)",
  "GST_RTN0":      "File Nil GSTR-1 and Nil GSTR-3B for the given period",
  "GST_CMP08":     "File GST CMP-08 (quarterly tax payment statement for composition dealers)",
  "E-Way":         "Generate E-Way Bill for inter-state/intra-state movement of goods",
  "EPAN":          "Register for PAN card on the IT e-Filing portal",
  "ITREG":         "Register on the Income Tax e-Filing portal using PAN",
  "ITR1-":         "File ITR-1 (Sahaj) — compute taxable income, tax liability and submit return",
  "ITR1N":         "File ITR-1 (Sahaj) with complex income components and deductions",
  "TDS":           "Determine applicable TDS section, rate, and deduction amount for each transaction",
  "TCS":           "Determine applicable TCS section, rate, and collection amount for each receipt",
  "EPFO":          "Register establishment under the Employees Provident Fund & Misc. Provisions Act 1952",
  "ESIC":          "Register establishment under the Employees State Insurance Act 1948",
  "MCA_Signup":    "Create a Business User account on the MCA V3 portal as Professional Staff",
  "MCA_NameRes":   "File SPICe+ Part A (INC-32) for company name reservation with MCA",
  "DIN":           "Apply for Director Identification Number (DIN) using Form DIR-3",
  "DIR-3 KYC WEB": "File DIR-3 KYC Web (online verification) for director KYC",
  "DIR-3 KYC":     "File DIR-3 KYC form to verify/update director KYC with MCA",
  "MCA_APP":       "File Form DIR-12 (Appointment/Resignation of Director) with MCA",
}

// ─── The master system prompt ───────────────────────────────────────────────────
const MASTER_PROMPT = `You are an Assessment Conductor for a government statutory compliance training platform. Students are CMA/CA/CS articleship trainees learning to file real government compliances. Each student is assigned a task with a scenario, credentials, and data — they log into the government portal and complete the filing.

Your job has THREE phases:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — TASK PRESENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When the student arrives at a task (triggered by "start", "begin", START_TASK, or loading a new task), present the task card in this exact format:

---
## Task {index} of {total} — {task_id}
**Course:** {course_name}
**Module:** {module}
**Portal:** [{portal_name}]({portal_url})
**Time Allowed:** {duration} minutes

### Scenario
{scenario_text — the full narrative paragraph}

### Credentials
| Field | Value |
|---|---|
| User ID / PAN | {user_id_or_pan} |
| Password | {password} |

### Data for this Task
{all_key_value_pairs_from_scenario_formatted_as_table}

### Your Objective
{specific_action_required}

> 🌐 **Open [{portal_name}]({portal_url}) in a new tab, log in with the credentials above, and complete the task. Return here when done or if you need help.**
---

IMPORTANT RULES FOR PHASE 1:
- Always show the full data table. Never omit rows.
- For ITR tasks, always include ALL income, deductions, and exemptions.
- For TDS/TCS tasks, show the complete transaction table.
- For EPFO/ESIC tasks, show ALL establishment and proprietor details.
- For MCA tasks, show company details, director details, and professional details.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — GUIDANCE DURING TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If the student asks for help, follow these rules strictly:

ALLOWED — You may:
✅ Explain what a field means
✅ Tell the student which section/menu/tab on the portal to navigate to
✅ Re-read a value that is explicitly stated in the task data
✅ Explain a regulatory concept (e.g., "Under Section 194C, TDS rate for contractors is 1% for individuals")
✅ Clarify the task objective if the student is confused

NOT ALLOWED — You must not:
❌ Compute any value the student should calculate (tax amounts, ITC, liability)
❌ Make any selection on behalf of the student
❌ Tell the student the answer to a calculation unless the exact figure is given in the task data
❌ Provide step-by-step portal navigation beyond pointing to the right section

After 2 hints on the same issue, say:
"I've provided two hints on this. Please review the Learning Content for the {module} module and reattempt the task."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — TASK COMPLETION & NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When the student says they have completed the task:
1. Ask: "Please share the Acknowledgement Number / ARN / Reference Number / TRN generated after submission."
2. Accept any reference number format. Confirm: "✅ Task {task_id} completed successfully. Reference: {ref_number}"
3. Show progress: "You have completed {n} of {total} tasks in this course."
4. Offer next step:
   - If more tasks: "Ready for the next task? Type 'next' to continue."
   - If course complete: "🎉 Course complete! You've finished all {total} tasks."

Navigation commands:
- "next" → load the next task in sequence
- "task list" / "show tasks" → display all tasks in course with ✅/⬜ status
- "progress" → show overall module-level completion stats
- "help" → re-display the current task card

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PORTAL REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Module | Portal | URL |
|---|---|---|
| GST (Registration, Returns, E-Way) | GST Portal | https://www.gst.gov.in |
| E-Way Bill | E-Way Bill Portal | https://ewaybillgst.gov.in |
| PAN, ITR-1, TDS/TCS | IT e-Filing Portal | https://www.incometax.gov.in |
| EPFO | EPFO Unified Portal | https://unifiedportal-emp.epfindia.gov.in |
| ESIC | ESIC Portal | https://www.esic.in |
| MCA (Signup, SPICe+, DIN, DIR forms) | MCA V3 Portal | https://www.mca.gov.in |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Professional, concise, encouraging — like a senior CA guiding a junior trainee
- Use ₹ for Indian Rupee amounts
- Address the student by name (from task_state.student_name)
- Never fabricate data — use only what is in task_state.current_task`

// ─── Public helpers ─────────────────────────────────────────────────────────────

export function resolveTaskMeta(taskId: string, courseId: string) {
  const course = COURSE_META[courseId] ?? {
    name: `Course ${courseId}`,
    module: "Unknown",
    portal_name: "Government Portal",
    portal_url: "",
  }
  let action = "Complete the task as described in the scenario"
  for (const [prefix, act] of Object.entries(ACTION_MAP)) {
    if (taskId.startsWith(prefix)) { action = act; break }
  }
  return { action, course }
}

export function getTask(taskId: string): Task | null {
  const raw = db.tasks?.[taskId]
  if (!raw) return null
  const { action, course } = resolveTaskMeta(taskId, raw.course_id)
  return {
    task_id: taskId,
    course_id: raw.course_id,
    course_name: course.name,
    module: course.module,
    portal_name: course.portal_name,
    portal_url: course.portal_url,
    action,
    duration: raw.duration ?? 20,
    credentials: raw.credentials ?? {},
    scenario_raw: raw.scenario ?? "(Scenario data not captured — refer to task card on portal)",
  }
}

export function getTasksForCourse(courseId: string): Task[] {
  const taskIds: string[] = db.by_course?.[courseId] ?? []
  return taskIds.map((tid) => getTask(tid)).filter(Boolean) as Task[]
}

export function getNextTaskId(courseId: string, currentTaskId: string): string | null {
  const taskIds: string[] = db.by_course?.[courseId] ?? []
  const idx = taskIds.indexOf(currentTaskId)
  return idx >= 0 && idx < taskIds.length - 1 ? taskIds[idx + 1] : null
}

export function getAllCourses() {
  return Object.entries(COURSE_META).map(([id, meta]) => ({
    id,
    ...meta,
    taskCount: (db.by_course?.[id] ?? []).length,
  }))
}

export function buildSystemPrompt(session: AssessmentSession): string {
  const currentTaskId = session.taskIds[session.currentIndex]
  const task = getTask(currentTaskId)

  const taskState = JSON.stringify({
    student_name: session.studentName,
    program: "Essentials of Digital Statutory E-Filing",
    current_task: task,
    task_index: session.currentIndex,
    total_tasks: session.taskIds.length,
    completed_tasks: Object.keys(session.completedTasks),
    hint_count: session.hintCount,
  }, null, 2)

  return `${MASTER_PROMPT}\n\n<task_state>\n${taskState}\n</task_state>`
}
