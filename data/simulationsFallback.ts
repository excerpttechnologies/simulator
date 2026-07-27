export type SimulationOverview = {
  id: string
  slug: string
  title: string
  description: string
  category: string
  difficulty: string
  estimatedTime: string
  tags: string[]
  status: "completed" | "not-started"
  score: number | null
  completedAt: string | null
}

export const FALLBACK_SIMULATIONS: SimulationOverview[] = [
  {
    id: "sim-1",
    slug: "journal-entry-basics",
    title: "Journal Entry Simulator",
    description:
      "Apply the Golden Rules of Accounting to record correct journal entries for common business transactions.",
    category: "Accounting",
    difficulty: "Beginner",
    estimatedTime: "30 mins",
    tags: ["Journal", "Double Entry", "Basics"],
    status: "not-started",
    score: null,
    completedAt: null,
  },
  {
    id: "sim-2",
    slug: "trial-balance-preparation",
    title: "Trial Balance Simulator",
    description: "Place ledger balances on the correct Dr/Cr sides and verify totals match.",
    category: "Accounting",
    difficulty: "Intermediate",
    estimatedTime: "25 mins",
    tags: ["Trial Balance", "Ledger"],
    status: "not-started",
    score: null,
    completedAt: null,
  },
  {
    id: "sim-3",
    slug: "tds-calculator-practice",
    title: "TDS Calculation Practice",
    description: "Calculate TDS sections and amounts for typical payments.",
    category: "Tax",
    difficulty: "Beginner",
    estimatedTime: "20 mins",
    tags: ["TDS", "Tax"],
    status: "not-started",
    score: null,
    completedAt: null,
  },
]

export const FALLBACK_STATS = {
  completedCount: 0,
  attemptCount: 0,
  averageScore: 0,
}

export default FALLBACK_SIMULATIONS
