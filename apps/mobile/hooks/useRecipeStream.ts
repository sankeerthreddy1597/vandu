import { useState, useEffect, useRef } from "react"
import { useAuth } from "@clerk/expo"
import type { RecipeStatus } from "@/lib/api"

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"
const POLL_INTERVAL = 1500

export function useRecipeStream(recipeId: string, initialStatus: RecipeStatus) {
  const [status, setStatus] = useState<RecipeStatus>(initialStatus)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuth()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(true)

  useEffect(() => {
    if (initialStatus === "DONE" || initialStatus === "FAILED") return

    activeRef.current = true

    async function poll() {
      if (!activeRef.current) return
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/recipe/${recipeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        if (!activeRef.current) return
        if (data.status) setStatus(data.status)
        if (data.error) setError(data.error)
        if (data.status !== "DONE" && data.status !== "FAILED") {
          timerRef.current = setTimeout(poll, POLL_INTERVAL)
        }
      } catch {
        if (activeRef.current) {
          timerRef.current = setTimeout(poll, POLL_INTERVAL)
        }
      }
    }

    poll()

    return () => {
      activeRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [recipeId, initialStatus])

  return { status, error }
}
