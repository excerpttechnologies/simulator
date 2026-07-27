/**
 * POST /api/assessment/chat
 * Handles ongoing conversation within an assessment session.
 * Detects reference numbers, advances tasks on "next" command.
 */

import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getTask, getTasksForCourse, buildSystemPrompt } from "@/lib/assessmentEngine"
import {
  createSession,
  getSession,
  completeTask,
  advanceTask,
  pushMessage,
} from "@/lib/sessionStore"
import { getUserFromRequest } from "@/lib/auth-server"

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// Patterns that look like reference / ARN / TRN numbers
const REF_PATTERN =
  /(?:ARN|TRN|ACK|REF|SRN)[:\s-]*([A-Z0-9\-/]{6,})/i

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { courseId, message } = body

    if (!courseId || typeof message !== "string") {
      return NextResponse.json({ error: "courseId and message are required" }, { status: 400 })
    }

    const studentId = user.sub ?? user.id
    const studentName = user.name ?? "Student"

    // Get or recreate session
    let session = getSession(studentId, courseId)
    if (!session) {
      const tasks = getTasksForCourse(courseId)
      if (!tasks.length) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 })
      }
      session = createSession(studentId, studentName, courseId, tasks.map((t) => t.task_id))
    }

    const prevIndex = session.currentIndex
    const currentTaskId = session.taskIds[session.currentIndex]

    // ── Detect reference number in message ────────────────────────────────────
    const refMatch = message.match(REF_PATTERN)
    if (refMatch) {
      completeTask(studentId, courseId, currentTaskId, refMatch[1])
      // Re-fetch after mutation
      session = getSession(studentId, courseId)!
    }

    // ── "next" command — advance without ref number ───────────────────────────
    const isNext = /^\s*(next|next task)\s*$/i.test(message)
    if (isNext && !refMatch) {
      advanceTask(studentId, courseId)
      session = getSession(studentId, courseId)!
    }

    pushMessage(studentId, courseId, "user", message)
    session = getSession(studentId, courseId)!

    const systemPrompt = buildSystemPrompt(session)

    const resp = await claude.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      system: systemPrompt,
      messages: session.messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const reply = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")

    pushMessage(studentId, courseId, "assistant", reply)
    session = getSession(studentId, courseId)!

    const currentTask = getTask(session.taskIds[session.currentIndex])

    return NextResponse.json({
      reply,
      session: {
        currentTaskId: session.taskIds[session.currentIndex],
        currentIndex: session.currentIndex,
        totalTasks: session.taskIds.length,
        completedCount: Object.keys(session.completedTasks).length,
        completedTaskIds: Object.keys(session.completedTasks),
        currentTask,
        taskChanged: session.currentIndex !== prevIndex,
        portalUrl: currentTask?.portal_url,
        portalName: currentTask?.portal_name,
      },
    })
  } catch (err: any) {
    console.error("[assessment/chat]", err)
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 })
  }
}
