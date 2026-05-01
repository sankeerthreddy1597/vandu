import { auth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const recipe = await db.recipe.findUnique({
    where: { id, userId },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
    },
  })

  if (!recipe) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(recipe)
}
