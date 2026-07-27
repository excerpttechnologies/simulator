import { NextResponse } from "next/server"
import { getPublishedSimulations } from "@/lib/simulation"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get("query")?.toLowerCase() ?? ""
    const category = url.searchParams.get("category")
    const difficulty = url.searchParams.get("difficulty")

    let simulations = await getPublishedSimulations()

    if (query) {
      simulations = simulations.filter((s) =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }
    if (category) simulations = simulations.filter((s) => s.category === category)
    if (difficulty) simulations = simulations.filter((s) => s.difficulty === difficulty)

    return NextResponse.json({ simulations })
  } catch (err: any) {
    console.error("[/api/simulations/public]", err?.message ?? err)
    return NextResponse.json({ simulations: [], error: "Failed to load simulations." }, { status: 500 })
  }
}
