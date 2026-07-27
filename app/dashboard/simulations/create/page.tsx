import { redirect } from "next/navigation"

/**
 * /dashboard/simulations/create is an admin action.
 * Redirect to the correct admin route.
 */
export default function CreateSimulationRedirect() {
  redirect("/admin/simulations/create")
}
