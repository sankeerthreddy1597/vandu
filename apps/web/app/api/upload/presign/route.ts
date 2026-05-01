import { auth } from "@clerk/nextjs/server"
import { getPresignedUploadUrl } from "@/lib/r2"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const key = `recipes/${userId}/${randomUUID()}`
  const uploadUrl = await getPresignedUploadUrl(key)

  return Response.json({ uploadUrl, key })
}
