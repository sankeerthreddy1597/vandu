import { auth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { getOrCreateUser } from "@/lib/auth"
import { inngest } from "@/inngest/client"
import { CreateRecipeSchema } from "@vandu/validators"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = CreateRecipeSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await getOrCreateUser(userId)

  const input = parsed.data
  const sourceType = input.type === "instagram" ? "INSTAGRAM" : input.type === "url" ? "URL" : "IMAGE"

  const recipe = await db.recipe.create({
    data: {
      userId,
      title: "Processing…",
      sourceType,
      sourceUrl: "url" in input ? input.url : undefined,
      imageUrl: "imageKey" in input ? input.imageKey : undefined,
      status: "PROCESSING",
      tags: [],
    },
  })

  await inngest.send({
    name: "recipe/process",
    data: {
      recipeId: recipe.id,
      type: sourceType,
      url: "url" in input ? input.url : undefined,
      imageKey: "imageKey" in input ? input.imageKey : undefined,
      userId,
    },
  })

  return Response.json({ recipeId: recipe.id })
}
