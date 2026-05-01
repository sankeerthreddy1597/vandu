import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { colors } from "@/constants/theme"
import { useApi, type Recipe } from "@/lib/api"
import { IngredientList } from "@/components/IngredientList"
import { StepList } from "@/components/StepList"
import { StatusBanner } from "@/components/StatusBanner"

const SOURCE_EMOJI: Record<string, string> = {
  INSTAGRAM: "📸",
  URL: "🔗",
  IMAGE: "📷",
}

const SOURCE_LABEL: Record<string, string> = {
  INSTAGRAM: "INSTA",
  URL: "URL",
  IMAGE: "PHOTO",
}

const FOOD_EMOJIS = ["🍝", "🥗", "🍲", "🫐", "🍜", "🥘", "🍛", "🍱", "🥩", "🍕"]

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const api = useApi()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const data = await api.getRecipe(id)
        setRecipe(data)
      } catch (e) {
        console.error("Failed to load recipe:", e)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchRecipe()
  }, [id])

  async function handleDelete() {
    Alert.alert("Delete recipe", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true)
          try {
            await api.deleteRecipe(id)
            router.back()
          } catch {
            Alert.alert("Error", "Failed to delete recipe")
            setDeleting(false)
          }
        },
      },
    ])
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.terracotta} />
      </View>
    )
  }

  if (!recipe) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center" }} edges={["top"]}>
        <Text style={{ fontFamily: "Lora_400Regular_Italic", color: colors.muted }}>Recipe not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ fontFamily: "DMSans_500Medium", color: colors.terracotta }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const emoji = FOOD_EMOJIS[recipe.id.charCodeAt(0) % FOOD_EMOJIS.length]
  const isProcessing = recipe.status !== "DONE" && recipe.status !== "FAILED"

  return (
    <View style={styles.container}>
      {/* Hero */}
      <LinearGradient colors={[colors.darkBrown, "#1E110A"]} style={styles.hero}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.heroNav}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Text style={styles.iconBtnText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleDelete} disabled={deleting}>
              <Text style={styles.iconBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroEmoji}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>

          <View style={styles.heroBadge}>
            <View style={styles.sourcePill}>
              <Text style={styles.sourceEmoji}>{SOURCE_EMOJI[recipe.sourceType]}</Text>
              <Text style={styles.sourcePillText}>{SOURCE_LABEL[recipe.sourceType]}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{recipe.title}</Text>
          {recipe.description ? (
            <Text style={styles.heroDesc}>{recipe.description}</Text>
          ) : null}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats bar */}
        <View style={styles.statsBar}>
          {[
            [String(recipe.ingredients.length), "INGREDIENTS"],
            [String(recipe.steps.length), "STEPS"],
            [recipe.sourceType.charAt(0) + recipe.sourceType.slice(1).toLowerCase(), "SOURCE"],
          ].map(([val, label], i) => (
            <View key={label} style={[styles.statCell, i < 2 && styles.statDivider]}>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLbl}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Processing banner */}
        {isProcessing && (
          <View style={styles.section}>
            <StatusBanner
              recipeId={recipe.id}
              onDone={() => api.getRecipe(id).then(setRecipe)}
              onFailed={() => api.getRecipe(id).then(setRecipe)}
            />
          </View>
        )}

        {/* Ingredients */}
        {recipe.ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <IngredientList ingredients={recipe.ingredients} />
          </View>
        )}

        {/* Steps */}
        {recipe.steps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Steps</Text>
            <StepList steps={recipe.steps} />
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },

  // Hero
  hero: { paddingBottom: 24 },
  heroNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: { fontSize: 16, color: "white" },
  heroEmoji: { alignItems: "center", marginVertical: 8 },
  emoji: { fontSize: 64 },
  heroBadge: { paddingHorizontal: 20, marginBottom: 8 },
  sourcePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  sourceEmoji: { fontSize: 10 },
  sourcePillText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 26,
    color: "white",
    paddingHorizontal: 20,
    lineHeight: 34,
  },
  heroDesc: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 13,
    color: colors.sand,
    paddingHorizontal: 20,
    marginTop: 6,
    lineHeight: 20,
    opacity: 0.8,
  },

  // Stats
  scroll: { flex: 1 },
  statsBar: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: -1,
    borderRadius: 16,
    shadowColor: colors.ink,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statCell: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: "rgba(60,42,30,0.08)",
  },
  statVal: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
    color: colors.ink,
  },
  statLbl: {
    fontFamily: "DMSans_400Regular",
    fontSize: 8,
    color: colors.muted,
    letterSpacing: 0.8,
    marginTop: 2,
  },

  // Sections
  section: { padding: 20, paddingTop: 18 },
  sectionTitle: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 17,
    color: colors.ink,
    marginBottom: 12,
  },
})
