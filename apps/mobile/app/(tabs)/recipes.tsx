import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { colors } from "@/constants/theme"
import { useRecipes } from "@/hooks/useRecipes"
import { RecipeCard } from "@/components/RecipeCard"
import type { RecipeListItem } from "@/lib/api"

type Filter = "All" | "Instagram" | "URL" | "Image"

const SOURCE_LABEL: Record<string, string> = {
  INSTAGRAM: "Instagram",
  URL: "URL",
  IMAGE: "Image",
}

export default function RecipesScreen() {
  const router = useRouter()
  const { recipes, loading, refreshing, load, refresh, loadMore } = useRecipes()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("All")

  useEffect(() => { load() }, [load])

  const filtered = recipes.filter((r) => {
    const matchSearch =
      search === "" || r.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === "All" || SOURCE_LABEL[r.sourceType] === filter
    return matchSearch && matchFilter
  })

  const processing = filtered.filter((r) => r.status !== "DONE" && r.status !== "FAILED")
  const done = filtered.filter((r) => r.status === "DONE" || r.status === "FAILED")

  type ListItem =
    | { type: "section"; label: string }
    | { type: "recipe"; recipe: RecipeListItem }

  const listData: ListItem[] = [
    ...(processing.length > 0 ? [{ type: "section" as const, label: "In progress" }] : []),
    ...processing.map((r) => ({ type: "recipe" as const, recipe: r })),
    ...(done.length > 0 ? [{ type: "section" as const, label: "This month" }] : []),
    ...done.map((r) => ({ type: "recipe" as const, recipe: r })),
  ]

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            My <Text style={styles.titleItalic}>Recipes</Text>
          </Text>
          <Text style={styles.count}>{recipes.length} saved</Text>
        </View>

        <View style={styles.searchBar}>
          <Text style={{ fontSize: 14, color: colors.muted }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes…"
            placeholderTextColor="rgba(155,136,120,0.6)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {(["All", "Instagram", "URL", "Image"] as Filter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f ? styles.chipActive : styles.chipInactive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.chipText,
                  filter === f ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && recipes.length === 0 ? (
        <ActivityIndicator color={colors.terracotta} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {search ? `No recipes matching "${search}"` : "No recipes yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) =>
            item.type === "section" ? item.label : item.recipe.id
          }
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={refresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => {
            if (item.type === "section") {
              return <Text style={styles.sectionLabel}>{item.label}</Text>
            }
            return (
              <RecipeCard
                recipe={item.recipe}
                onPress={() => router.push(`/recipe/${item.recipe.id}`)}
              />
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(60,42,30,0.07)",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  title: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 26, color: colors.ink },
  titleItalic: { fontFamily: "PlayfairDisplay_400Regular_Italic", color: colors.warmBrown },
  count: { fontFamily: "Lora_400Regular_Italic", fontSize: 12, color: colors.muted, paddingBottom: 3 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: colors.sandLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 13,
    color: colors.ink,
  },
  filterRow: { flexDirection: "row" },
  chip: { paddingHorizontal: 13, paddingVertical: 5, borderRadius: 100, marginRight: 6 },
  chipActive: { backgroundColor: colors.terracotta },
  chipInactive: { backgroundColor: "white", borderWidth: 1, borderColor: colors.sandLight },
  chipText: { fontFamily: "DMSans_500Medium", fontSize: 11 },
  chipTextActive: { color: "white" },
  chipTextInactive: { color: colors.muted },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },
  sectionLabel: {
    fontFamily: "PlayfairDisplay_400Regular_Italic",
    fontSize: 13,
    color: colors.muted,
    paddingVertical: 10,
    marginTop: 4,
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
  },
})
