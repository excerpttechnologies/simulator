import Link from "next/link"

export default function AccessDeniedPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-xl rounded-3xl border border-border bg-card p-10 shadow-xl">
        <h1 className="text-4xl font-bold text-foreground mb-4">Access denied</h1>
        <p className="text-sm text-muted-foreground mb-6">
          You do not have permission to view this page. If you believe this is a mistake, sign in with the correct account or contact your administrator.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/dashboard" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Return to dashboard
          </Link>
          <Link href="/login" className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">
            Sign in again
          </Link>
        </div>
      </div>
    </main>
  )
}
