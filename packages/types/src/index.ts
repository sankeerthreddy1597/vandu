import { z } from "zod";

export const RecipeSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  servings: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  tags: z.array(z.string()),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string().optional(),
      unit: z.string().optional(),
      notes: z.string().optional(),
      order: z.number(),
    })
  ),
  steps: z.array(
    z.object({
      order: z.number(),
      instruction: z.string(),
      duration: z.string().optional(),
      tip: z.string().optional(),
    })
  ),
});

export type RecipeData = z.infer<typeof RecipeSchema>;

export type SourceType = "INSTAGRAM" | "URL" | "IMAGE";
export type RecipeStatus = "PROCESSING" | "SCRAPING" | "EXTRACTING" | "DONE" | "FAILED";

export type CreateRecipeInput =
  | { type: "instagram" | "url"; url: string }
  | { type: "image"; imageKey: string };
