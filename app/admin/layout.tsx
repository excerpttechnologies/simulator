import { AppLayout } from "@/components/shared/AppLayout"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout isAdminRoute={true}>{children}</AppLayout>
}
