import { useState, useCallback, useRef } from "react"
import type { RecipeListItem } from "@/lib/api"
import { useApi } from "@/lib/api"

export function useRecipes() {
  const api = useApi()
  const [recipes, setRecipes] = useState<RecipeListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Use refs to avoid stale closure issues in memoized callbacks
  const stateRef = useRef({
    cursor: undefined as string | undefined,
    hasMore: true,
    loading: false,
  })

  const load = useCallback(async () => {
    if (stateRef.current.loading) return
    stateRef.current = { cursor: undefined, hasMore: true, loading: true }
    setLoading(true)
    try {
      const { items, nextCursor } = await api.getRecipes()
      setRecipes(items)
      stateRef.current.cursor = nextCursor
      stateRef.current.hasMore = !!nextCursor
    } catch (e) {
      console.error("useRecipes load:", e)
    } finally {
      stateRef.current.loading = false
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(async () => {
    stateRef.current = { cursor: undefined, hasMore: true, loading: false }
    setRefreshing(true)
    try {
      const { items, nextCursor } = await api.getRecipes()
      setRecipes(items)
      stateRef.current.cursor = nextCursor
      stateRef.current.hasMore = !!nextCursor
    } finally {
      setRefreshing(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(async () => {
    if (!stateRef.current.hasMore || stateRef.current.loading) return
    stateRef.current.loading = true
    try {
      const { items, nextCursor } = await api.getRecipes(stateRef.current.cursor)
      setRecipes((prev) => [...prev, ...items])
      stateRef.current.cursor = nextCursor
      stateRef.current.hasMore = !!nextCursor
    } finally {
      stateRef.current.loading = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { recipes, loading, refreshing, load, refresh, loadMore }
}
