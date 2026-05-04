import { verifyWebhook } from "@clerk/nextjs/webhooks"
import { NextRequest } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  let evt
  try {
    evt = await verifyWebhook(req)
  } catch {
    return Response.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  const { type, data } = evt

  if (type === "user.created" || type === "user.updated") {
    const email = (data as any).email_addresses?.[0]?.email_address ?? ""
    await db.user.upsert({
      where: { id: data.id as string },
      update: { email },
      create: { id: data.id as string, email },
    })
  }

  if (type === "user.deleted" && data.id) {
    await db.user.deleteMany({ where: { id: data.id as string } })
  }

  return Response.json({ ok: true })
}
