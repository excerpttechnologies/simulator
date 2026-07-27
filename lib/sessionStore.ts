/**
 * In-memory session store for Assessment sessions.
 * Swap the Map with Redis / MongoDB in production for persistence.
 */

import type { AssessmentSession } from "./types/assessment"

// Module-level singleton store (survives hot reloads in Next.js dev via globalThis)
const globalStore = globalThis as any
if (!globalStore.__assessmentSessions) {
  globalStore.__assessmentSessions = new Map<string, AssessmentSession>()
}
const store: Map<string, AssessmentSession> = globalStore.__assessmentSessions

const key = (studentId: string, courseId: string) => `${studentId}:${courseId}`

export function createSession(
  studentId: string,
  studentName: string,
  courseId: string,
  taskIds: string[]
): AssessmentSession {
  const session: AssessmentSession = {
    studentId,
    studentName,
    courseId,
    taskIds,
    currentIndex: 0,
    completedTasks: {},
    hintCount: {},
    messages: [],
    startedAt: new Date(),
  }
  store.set(key(studentId, courseId), session)
  return session
}

export function getSession(
  studentId: string,
  courseId: string
): AssessmentSession | null {
  return store.get(key(studentId, courseId)) ?? null
}

export function completeTask(
  studentId: string,
  courseId: string,
  taskId: string,
  refNumber: string
): void {
  const s = getSession(studentId, courseId)
  if (!s) return
  s.completedTasks[taskId] = { refNumber, completedAt: new Date() }
  // Advance to next task if there is one
  if (s.currentIndex < s.taskIds.length - 1) s.currentIndex++
}

export function advanceTask(studentId: string, courseId: string): void {
  const s = getSession(studentId, courseId)
  if (!s) return
  if (s.currentIndex < s.taskIds.length - 1) s.currentIndex++
}

export function pushMessage(
  studentId: string,
  courseId: string,
  role: "user" | "assistant",
  content: string
): void {
  const s = getSession(studentId, courseId)
  if (!s) return
  s.messages.push({ role, content })
  // Keep last 30 messages to stay within token limits
  if (s.messages.length > 30) s.messages = s.messages.slice(-30)
}

export function incrementHint(
  studentId: string,
  courseId: string,
  taskId: string,
  field: string
): number {
  const s = getSession(studentId, courseId)
  if (!s) return 0
  const k = `${taskId}:${field}`
  s.hintCount[k] = (s.hintCount[k] ?? 0) + 1
  return s.hintCount[k]
}

export function deleteSession(studentId: string, courseId: string): void {
  store.delete(key(studentId, courseId))
}
