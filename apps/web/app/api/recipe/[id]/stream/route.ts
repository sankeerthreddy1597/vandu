import { auth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return new Response("Unauthorized", { status: 401 })

  const { id } = await params
  const recipe = await db.recipe.findUnique({
    where: { id, userId },
    select: { id: true, status: true },
  })

  if (!recipe) return new Response("Not found", { status: 404 })

  const encode = (data: object) => `data: ${JSON.stringify(data)}\n\n`

  const stream = new ReadableStream({
    async start(controller) {
      // Send current status immediately
      controller.enqueue(new TextEncoder().encode(encode({ status: recipe.status })))

      if (recipe.status === "DONE" || recipe.status === "FAILED") {
        controller.close()
        return
      }

      // Poll DB every second for status changes
      const interval = setInterval(async () => {
        try {
          const current = await db.recipe.findUnique({
            where: { id },
            select: { status: true, error: true },
          })
          if (!current) {
            clearInterval(interval)
            controller.close()
            return
          }
          controller.enqueue(
            new TextEncoder().encode(encode({ status: current.status, error: current.error }))
          )
          if (current.status === "DONE" || current.status === "FAILED") {
            clearInterval(interval)
            controller.close()
          }
        } catch {
          clearInterval(interval)
          controller.close()
        }
      }, 1000)

      req.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
