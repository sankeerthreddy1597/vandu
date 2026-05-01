import { serve } from "inngest/next"
import { inngest } from "@/inngest/client"
import { processRecipe } from "@/inngest/functions/processRecipe"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processRecipe],
})
