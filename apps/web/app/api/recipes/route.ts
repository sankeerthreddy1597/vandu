import { auth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined

  const recipes = await db.recipe.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      description: true,
      sourceType: true,
      sourceUrl: true,
      imageUrl: true,
      status: true,
      tags: true,
      createdAt: true,
      _count: {
        select: { ingredients: true, steps: true },
      },
    },
  })

  const hasMore = recipes.length > PAGE_SIZE
  const items = hasMore ? recipes.slice(0, -1) : recipes
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

  return Response.json({ items, nextCursor })
}
