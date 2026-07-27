/**
 * POST /api/assessment/start
 * Called when student clicks "Start Simulation" on a task card.
 * Creates a fresh session and returns the first task card from Claude.
 */

import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getTasksForCourse, buildSystemPrompt } from "@/lib/assessmentEngine"
import { createSession, pushMessage } from "@/lib/sessionStore"
import { getUserFromRequest } from "@/lib/auth-server"

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { courseId, taskIndex = 0 } = body

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 })
    }

    const studentId = user.sub ?? user.id
    const studentName = user.name ?? "Student"

    const tasks = getTasksForCourse(courseId)
    if (!tasks.length) {
      return NextResponse.json({ error: "Course not found or has no tasks" }, { status: 404 })
    }

    // Always create a fresh session on Start
    const session = createSession(studentId, studentName, courseId, tasks.map((t) => t.task_id))

    const triggerMessage = `START_TASK:${tasks[taskIndex].task_id}`
    pushMessage(studentId, courseId, "user", triggerMessage)

    const systemPrompt = buildSystemPrompt(session)

    const resp = await claude.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: triggerMessage }],
    })

    const reply = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")

    pushMessage(studentId, courseId, "assistant", reply)

    const currentTask = tasks[taskIndex]

    return NextResponse.json({
      reply,
      session: {
        currentTaskId: currentTask.task_id,
        currentIndex: taskIndex,
        totalTasks: tasks.length,
        completedCount: 0,
        completedTaskIds: [],
        currentTask,
        portalUrl: currentTask.portal_url,
        portalName: currentTask.portal_name,
      },
    })
  } catch (err: any) {
    console.error("[assessment/start]", err)
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 })
  }
}
