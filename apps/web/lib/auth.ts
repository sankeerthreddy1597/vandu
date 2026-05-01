import { clerkClient } from "@clerk/nextjs/server"
import { db } from "./db"

export async function getOrCreateUser(userId: string) {
  let user = await db.user.findUnique({ where: { id: userId } })
  if (!user) {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    user = await db.user.create({
      data: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      },
    })
  }
  return user
}
