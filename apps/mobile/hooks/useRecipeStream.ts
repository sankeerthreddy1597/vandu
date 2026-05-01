import { useState, useEffect, useRef } from "react"
import { useAuth } from "@clerk/clerk-expo"
import type { RecipeStatus } from "@/lib/api"

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"

export function useRecipeStream(recipeId: string, initialStatus: RecipeStatus) {
  const [status, setStatus] = useState<RecipeStatus>(initialStatus)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuth()
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (initialStatus === "DONE" || initialStatus === "FAILED") return

    const controller = new AbortController()
    abortRef.current = controller

    async function startStream() {
      const token = await getToken()
      try {
        const res = await fetch(`${API_URL}/api/recipe/${recipeId}/stream`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })

        const reader = res.body?.getReader()
        if (!reader) return
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split("\n\n")
          buffer = parts.pop() ?? ""

          for (const part of parts) {
            if (part.startsWith("data: ")) {
              const data = JSON.parse(part.slice(6))
              if (data.status) setStatus(data.status)
              if (data.error) setError(data.error)
            }
          }
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== "AbortError") {
          console.error("Stream error:", e)
        }
      }
    }

    startStream()
    return () => controller.abort()
  }, [recipeId, initialStatus])

  return { status, error }
}
