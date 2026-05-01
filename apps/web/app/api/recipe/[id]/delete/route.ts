import { auth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const recipe = await db.recipe.findUnique({
    where: { id, userId },
    select: { id: true },
  })

  if (!recipe) return Response.json({ error: "Not found" }, { status: 404 })

  await db.recipe.delete({ where: { id } })
  return Response.json({ ok: true })
}
