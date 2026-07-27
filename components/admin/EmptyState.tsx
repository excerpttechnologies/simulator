import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title = "No simulations available yet",
  description = "Admins can create and publish new simulations anytime.",
  actionLabel = "Refresh",
  onAction,
}: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-200/80 bg-white/70 p-12 text-center shadow-xl shadow-slate-200/20 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/70 dark:shadow-black/20">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 shadow-inner shadow-slate-200/80 dark:bg-neutral-900 dark:text-slate-200">
        <Sparkles className="h-10 w-10" />
      </div>
      <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-8 flex justify-center">
        <Button variant="outline" size="lg" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}
