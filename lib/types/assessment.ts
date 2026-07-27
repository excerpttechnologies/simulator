export interface TaskCredentials {
  user_id?: string
  password?: string
  pan?: string
  gstin?: string
  trn?: string
}

export interface Task {
  task_id: string
  course_id: string
  course_name: string
  module: string
  portal_name: string
  portal_url: string
  action: string
  duration: number
  credentials: TaskCredentials
  scenario_raw: string
}

export interface AssessmentSession {
  studentId: string
  studentName: string
  courseId: string
  taskIds: string[]
  currentIndex: number
  completedTasks: Record<string, { refNumber: string; completedAt: Date }>
  hintCount: Record<string, number> // "taskId:fieldName" → count
  messages: Array<{ role: "user" | "assistant"; content: string }>
  startedAt: Date
}
