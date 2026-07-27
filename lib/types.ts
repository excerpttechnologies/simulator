export type Role = "Admin" | "Faculty" | "Student"

export interface User {
  id: string
  sub?: string
  name: string
  email: string
  passwordHash: string
  role: Role
  assignedCourseIds: string[]
  enrolledCourseIds: string[]
  createdAt: string
  updatedAt?: string
}

export type ResourceType = "video" | "pdf" | "document" | "quiz" | "attachment"

export interface CourseResource {
  id: string
  title: string
  type: ResourceType
  url: string
  allowedRoles: Role[]
}

export interface CourseModule {
  id: string
  title: string
  description: string
  lessons: string[]
  resources: CourseResource[]
}

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  category: string
  instructor: string
  duration: string
  lessons: number
  rating: number
  students: number
  modules: CourseModule[]
  assignments: string[]
  enrolledCount: number
  // Dynamic fields added by the API
  progress?: number
  status?: "admin" | "faculty" | "enrolled" | "available" | "completed"
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export interface Enrollment {
  userId: string
  courseId: string
  assignedBy: string
  enrolledAt: string
}

export type SimulationStatus = "draft" | "published" | "archived"

export type SimulationCategory =
  | "Accounting"
  | "Tally Prime"
  | "GST"
  | "Banking"
  | "Payroll"
  | "Taxation"
  | "Auditing"
  | "ERP"
  | "Finance"
  | "Stock Market"
  | "Entrepreneurship"
  | "HR"
  | "Marketing"
  | "Sales"
  | "Excel"
  | "Business Analytics"
  | "Mock Interview"
  | "Communication Skills"
  | "AI Tutor"
  | "Labour Laws"
  | "MSME"

export type SimulationAssignmentTargetType = "student" | "batch" | "department" | "institution" | "course"

export interface SimulationAttachment {
  title: string
  url: string
  type: ResourceType
}

export interface SimulationSchedule {
  startDate?: string
  endDate?: string
}

export interface SimulationAssignmentRules {
  targetType: SimulationAssignmentTargetType
  targetIds: string[]
  startDate?: string
  endDate?: string
  mandatory: boolean
  attemptLimit: number
  completionRequirement: string
}

export interface Simulation {
  id: string
  title: string
  slug: string
  description: string
  category: SimulationCategory
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  tags: string[]
  thumbnailUrl: string
  videoUrl: string
  scenario?: string
  instructions: string
  assessmentRules?: string
  attachments?: SimulationAttachment[]
  passingScore: number
  attemptsAllowed: number
  certificateEligible: boolean
  assignmentRules?: SimulationAssignmentRules
  schedule?: SimulationSchedule
  engineType?: string
  questionSet?: Record<string, any>
  learningObjectives?: string[]
  courseId?: string
  trainingType?: string
  status: SimulationStatus
  published: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  views: number
  sortOrder: number
}

export type SimulationProgressStatus = "not-started" | "in-progress" | "completed" | "failed" | "abandoned"

export interface SimulationAttempt {
  id: string
  simulationId: string
  userId: string
  status: SimulationProgressStatus
  score: number
  startedAt: string
  completedAt?: string
  timeSpent: number
  currentStep: string
  progress: Record<string, unknown>
  responses: Record<string, unknown>
  certificateIssued: boolean
  createdAt: string
  updatedAt: string
}

export interface SimulationCertificate {
  id: string
  simulationId: string
  attemptId: string
  userId: string
  score: number
  issuedAt: string
  qrCodeUrl: string
  verificationCode: string
  createdAt: string
  updatedAt: string
}

export interface SimulationLeaderboardEntry {
  id: string
  simulationId: string
  userId: string
  score: number
  timeSpent: number
  rank: number
  createdAt: string
  updatedAt: string
}
