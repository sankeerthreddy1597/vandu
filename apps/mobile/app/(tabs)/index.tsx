import { useEffect, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useUser } from "@clerk/clerk-expo"
import { colors } from "@/constants/theme"
import { useRecipes } from "@/hooks/useRecipes"
import { RecipeCard } from "@/components/RecipeCard"

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useUser()
  const { recipes, loading, load } = useRecipes()

  useEffect(() => { load() }, [load])

  const firstName = user?.firstName ?? "Chef"
  const recent = recipes.slice(0, 4)

  const thisMonth = useMemo(() => {
    const now = new Date()
    return recipes.filter((r) => {
      const d = new Date(r.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
  }, [recipes])

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Dark header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}, {firstName} ✦</Text>
          <Text style={styles.headline}>
            What are you{"\n"}
            <Text style={styles.headlineItalic}>cooking today?</Text>
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              [String(recipes.length), "RECIPES"],
              [String(thisMonth), "THIS MONTH"],
              ["—", "FAVORITES"],
            ].map(([n, label], i) => (
              <View
                key={label}
                style={[styles.statItem, i < 2 && styles.statDivider]}
              >
                <Text style={styles.statNum}>{n}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Search (navigates to Recipes tab) */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push("/(tabs)/recipes")}
            activeOpacity={0.7}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search your recipes…</Text>
          </TouchableOpacity>
        </View>

        {/* Recent saves */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent saves</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/recipes")}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {loading && recipes.length === 0 ? (
            <ActivityIndicator color={colors.terracotta} style={{ marginTop: 24 }} />
          ) : recent.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No recipes yet.{"\n"}Add your first one! 👇</Text>
            </View>
          ) : (
            recent.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs)/add")}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },

  // Header
  header: {
    backgroundColor: colors.darkBrown,
    padding: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  greeting: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  headline: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: "white",
    lineHeight: 36,
    marginBottom: 20,
  },
  headlineItalic: {
    fontFamily: "PlayfairDisplay_400Regular_Italic",
    color: colors.sand,
  },

  // Stats
  statsRow: { flexDirection: "row", marginBottom: 18 },
  statItem: { flex: 1, paddingRight: 12 },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.12)",
    marginRight: 12,
  },
  statNum: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    color: "white",
  },
  statLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.8,
    marginTop: 1,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchIcon: { fontSize: 14, opacity: 0.45 },
  searchPlaceholder: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
  },

  // Recent saves
  section: { padding: 20, paddingBottom: 100 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 17,
    color: colors.ink,
  },
  seeAll: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: colors.terracotta,
  },
  empty: { alignItems: "center", paddingVertical: 32 },
  emptyText: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 22,
  },

  // FAB
  fab: {
    position: "absolute",
    right: 24,
    bottom: 80,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.terracotta,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.terracotta,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcon: {
    fontSize: 26,
    color: "white",
    lineHeight: 30,
  },
})
