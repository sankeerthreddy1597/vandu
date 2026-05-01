import { useAuth } from "@clerk/clerk-expo"

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"

export type RecipeStatus = "PROCESSING" | "SCRAPING" | "EXTRACTING" | "DONE" | "FAILED"
export type SourceType = "INSTAGRAM" | "URL" | "IMAGE"

export interface RecipeListItem {
  id: string
  title: string
  description?: string
  sourceType: SourceType
  sourceUrl?: string
  imageUrl?: string
  status: RecipeStatus
  tags: string[]
  createdAt: string
  _count: { ingredients: number; steps: number }
}

export interface Ingredient {
  id: string
  name: string
  amount?: string
  unit?: string
  notes?: string
  order: number
}

export interface Step {
  id: string
  order: number
  instruction: string
  duration?: string
  tip?: string
}

export interface Recipe extends RecipeListItem {
  ingredients: Ingredient[]
  steps: Step[]
  error?: string
}

export function useApi() {
  const { getToken } = useAuth()

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken()
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error ?? `Request failed: ${res.status}`)
    }
    return res.json()
  }

  return {
    getRecipes: (cursor?: string) =>
      request<{ items: RecipeListItem[]; nextCursor?: string }>(
        `/api/recipes${cursor ? `?cursor=${cursor}` : ""}`
      ),
    getRecipe: (id: string) => request<Recipe>(`/api/recipe/${id}`),
    createRecipe: (
      data: { type: "instagram" | "url"; url: string } | { type: "image"; imageKey: string }
    ) =>
      request<{ recipeId: string }>("/api/recipe/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    deleteRecipe: (id: string) =>
      request<{ ok: boolean }>(`/api/recipe/${id}/delete`, { method: "POST" }),
    getPresignUrl: () =>
      request<{ uploadUrl: string; key: string }>("/api/upload/presign", { method: "POST" }),
  }
}
