import { ArrowUpRight, CheckCircle2, Eye, Sparkles } from "lucide-react"

interface StatItem {
  label: string
  value: number
  hint: string
  accent: "primary" | "accent" | "muted" | "success"
}

interface StatsCardsProps {
  stats: StatItem[]
}

const accentMap = {
  primary: "text-primary",
  accent: "text-accent",
  muted: "text-slate-500 dark:text-slate-400",
  success: "text-emerald-500",
}

const iconMap = {
  primary: ArrowUpRight,
  accent: CheckCircle2,
  muted: Sparkles,
  success: Eye,
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = iconMap[item.accent]
        return (
          <div key={item.label} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 ${accentMap[item.accent]} dark:bg-white/5`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{item.hint}</p>
          </div>
        )
      })}
    </div>
  )
}
