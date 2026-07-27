import { AppLayout } from "@/components/shared/AppLayout"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout isAdminRoute={false}>{children}</AppLayout>
}
