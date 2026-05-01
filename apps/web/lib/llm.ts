import { generateObject } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { RecipeSchema } from "@vandu/types"
import type { SourceType } from "@vandu/db"

export async function extractRecipeWithLLM(content: string, type: SourceType) {
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: RecipeSchema,
    prompt: `Extract a structured recipe from the following content.
Source type: ${type}
Content: ${content}

Be precise with ingredient amounts and units.
Split steps into clear, single-action instructions.`,
  })
  return object
}

export async function extractFromImage(imageUrl: string) {
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: RecipeSchema,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", image: new URL(imageUrl) },
          { type: "text", text: "Extract the full recipe from this image." },
        ],
      },
    ],
  })
  return object
}
