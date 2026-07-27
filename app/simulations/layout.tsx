import { AppLayout } from "@/components/shared/AppLayout"

export default function SimulationsLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout isAdminRoute={false}>{children}</AppLayout>
}
