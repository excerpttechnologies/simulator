"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthProvider, AuthGuard, useAuth } from "@/components/auth/AuthProvider"
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react"

const baseItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    // add pages later; example children shown as placeholders
    children: [
      { label: "Overview", href: "/dashboard" },
      { label: "Activity", href: "/dashboard/activity" },
    ],
  },
  { icon: BookOpen,        label: "Courses",          href: "/dashboard/courses" },
  { icon: BarChart3,       label: "Analytics",        href: "/dashboard/analytics" },
  {
    icon: FileText,
    label: "Simulations",
    href: "/dashboard/simulations",
    children: [
      { label: "All Simulations", href: "/dashboard/simulations" },
      { label: "My Attempts", href: "/dashboard/simulations/my-attempts" },
      { label: "Tax Practice Lab", href: "/dashboard/tax-lab" },
      { label: "TDS Simulations", href: "/dashboard/tds" },
      { label: "GST Simulations", href: "/dashboard/gst" },
    ],
  },
  { icon: Users,           label: "My Batch",         href: "/dashboard/batch" },
  {
    icon: Settings,
    label: "Settings",
    href: "/dashboard/settings",
    children: [
      { label: "Profile",      href: "/dashboard/settings" },
      { label: "Preferences",  href: "/dashboard/settings" },
    ],
  },
]

const studentItems = [
  { icon: LayoutDashboard, label: "Dashboard",        href: "/dashboard" },
  { icon: BookOpen,        label: "Courses",          href: "/dashboard/courses" },
  {
    icon: FileText,
    label: "Simulations",
    href: "/dashboard/simulations",
    children: [
      { label: "All Simulations", href: "/dashboard/simulations" },
      { label: "My Attempts", href: "/dashboard/simulations/my-attempts" },
      { label: "Tax Practice Lab", href: "/dashboard/tax-lab" },
      { label: "TDS Simulations", href: "/dashboard/tds" },
      { label: "GST Simulations", href: "/dashboard/gst" },
    ],
  },
  { icon: Users,           label: "My Batch",         href: "/dashboard/batch" },
  { icon: Settings,        label: "Settings",         href: "/dashboard/settings" },
]

const adminItems = [
  { icon: BookOpen,  label: "Manage Courses",     href: "/admin/courses" },
  { icon: FileText,  label: "Manage Simulations", href: "/admin/simulations" },
  { icon: ShieldCheck, label: "Manage Tax Lab",   href: "/admin/tax-simulations" },
]

function NavLink({
  item,
  pathname,
  onClick,
}: {
  item: { icon: any; label: string; href: string }
  pathname: string
  onClick?: () => void
}) {
  const hasChildren = Array.isArray((item as any).children) && (item as any).children.length > 0

  const isActive = (() => {
    if (item.href === "/dashboard") return pathname === "/dashboard"
    if (pathname.startsWith(item.href)) return true
    if (hasChildren) {
      return (item as any).children.some((c: any) => pathname.startsWith(c.href))
    }
    return false
  })()

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <span
          aria-hidden
          className={`inline-block w-1 h-6 rounded-r ${isActive ? "bg-primary" : "bg-transparent"}`}
        />
        <item.icon className="h-5 w-5 shrink-0" />
        {item.label}
      </Link>
    )
  }

  // dropdown link
  const [open, setOpen] = useState<boolean>(isActive)

  return (
    <div>
      <button
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={`inline-block w-1 h-6 rounded-r ${isActive ? "bg-primary" : "bg-transparent"}`}
          />
          <item.icon className="h-5 w-5 shrink-0" />
          <span className="text-sm">{item.label}</span>
        </div>
        <div className="flex items-center">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="mt-1 ml-8 space-y-1">
          {(item as any).children.map((child: any) => {
            const childActive = pathname.startsWith(child.href)
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClick}
                aria-current={childActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  childActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="inline-block w-1 h-4 rounded-r bg-transparent" aria-hidden />
                <span className="truncate">{child.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Shell({ children, isAdminRoute }: { children: React.ReactNode; isAdminRoute: boolean }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  const isAdmin = user?.role === "Admin"
  const isFaculty = user?.role === "Faculty"
  const navItems = isAdmin || isFaculty ? baseItems : studentItems

  const SidebarInner = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="p-6 border-b border-border shrink-0">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-base font-bold text-foreground leading-none block">Accountin</span>
            {isAdminRoute && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-primary mt-0.5">
                <ShieldCheck className="h-3 w-3" /> Admin Panel
              </span>
            )}
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onClick={onNavigate} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                Admin
              </p>
            </div>
            {adminItems.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} onClick={onNavigate} />
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">{user?.name || "Loading..."}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email || user?.role || ""}</div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex">
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card fixed inset-y-0 left-0">
          <SidebarInner />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col z-10">
              <div className="absolute top-4 right-4 z-20">
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarInner onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search simulations, courses..."
                    className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-60"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </span>
                )}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </Button>
                <div className="lg:hidden w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{user?.name?.charAt(0) || "?"}</span>
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}

export function AppLayout({
  children,
  isAdminRoute = false,
}: {
  children: React.ReactNode
  isAdminRoute?: boolean
}) {
  return (
    <AuthProvider>
      <Shell isAdminRoute={isAdminRoute}>{children}</Shell>
    </AuthProvider>
  )
}
