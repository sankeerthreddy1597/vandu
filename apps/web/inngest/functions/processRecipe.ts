import { inngest } from "../client"
import { db } from "@/lib/db"
import { scrapeUrl } from "@/lib/scraper"
import { extractRecipeWithLLM, extractFromImage } from "@/lib/llm"
import { getR2PublicUrl } from "@/lib/r2"
import type { RecipeStatus, SourceType } from "@vandu/db"

async function updateRecipeStatus(recipeId: string, status: RecipeStatus, error?: string) {
  await db.recipe.update({
    where: { id: recipeId },
    data: { status, ...(error ? { error } : {}) },
  })
}

export const processRecipe = inngest.createFunction(
  { id: "process-recipe", retries: 3 },
  { event: "recipe/process" },

  async ({ event, step }) => {
    const { recipeId, type, url, imageKey } = event.data as {
      recipeId: string
      type: SourceType
      url?: string
      imageKey?: string
    }

    if (!recipeId) throw new Error("recipeId is missing from event data")

    const rawContent = await step.run("scrape-or-extract", async () => {
      await updateRecipeStatus(recipeId, "SCRAPING")
      if (type === "INSTAGRAM" || type === "URL") {
        return await scrapeUrl(url!)
      }
      if (type === "IMAGE") {
        const imageUrl = getR2PublicUrl(imageKey!)
        return `Image URL: ${imageUrl}`
      }
      throw new Error(`Unknown source type: ${type}`)
    })

    await step.run("mark-extracting", () => updateRecipeStatus(recipeId, "EXTRACTING"))

    const structured = await step.run("llm-extract", async () => {
      if (type === "IMAGE" && imageKey) {
        const imageUrl = getR2PublicUrl(imageKey)
        return await extractFromImage(imageUrl)
      }
      return await extractRecipeWithLLM(rawContent, type)
    })

    await step.run("save-recipe", async () => {
      await db.recipe.update({
        where: { id: recipeId },
        data: {
          title: structured.title,
          description: structured.description,
          tags: structured.tags,
          ingredients: {
            create: structured.ingredients.map((ing) => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              notes: ing.notes,
              order: ing.order,
            })),
          },
          steps: {
            create: structured.steps.map((s) => ({
              order: s.order,
              instruction: s.instruction,
              duration: s.duration,
              tip: s.tip,
            })),
          },
        },
      })
    })

    await step.run("mark-done", () => updateRecipeStatus(recipeId, "DONE"))
  }
)
