import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { colors } from "@/constants/theme"
import type { RecipeListItem } from "@/lib/api"

const CARD_COLORS = ["#E8D5B0", "#C8DDB8", "#E8B8A0", "#B8C8E0", "#E0D0B8"]
const EMOJIS: Record<string, string> = {
  INSTAGRAM: "🍝",
  URL: "🥗",
  IMAGE: "🍲",
}

interface Props {
  recipe: RecipeListItem
  onPress: () => void
}

export function RecipeCard({ recipe, onPress }: Props) {
  const isProcessing = recipe.status !== "DONE" && recipe.status !== "FAILED"
  const bgColor = CARD_COLORS[recipe.id.charCodeAt(0) % CARD_COLORS.length]

  return (
    <TouchableOpacity
      style={[styles.card, isProcessing && styles.cardProcessing]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.imgWrap, { backgroundColor: bgColor }]}>
        <Text style={styles.emoji}>{EMOJIS[recipe.sourceType] ?? "🍽️"}</Text>
      </View>
      <View style={styles.body}>
        {isProcessing ? (
          <View style={styles.processingPill}>
            <View style={styles.spinner} />
            <Text style={styles.processingText}>Processing…</Text>
          </View>
        ) : (
          <View style={styles.sourceRow}>
            <View style={styles.sourceDot} />
            <Text style={styles.source}>
              {recipe.sourceType.charAt(0) + recipe.sourceType.slice(1).toLowerCase()}
            </Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        {recipe._count && (
          <View style={styles.meta}>
            <Text style={styles.metaItem}>✦ {recipe._count.ingredients} ing</Text>
            <Text style={styles.metaItem}>· {recipe._count.steps} steps</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
    flexDirection: "row",
    shadowColor: colors.ink,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardProcessing: {
    borderWidth: 1.5,
    borderColor: colors.sandLight,
    borderStyle: "dashed",
    backgroundColor: colors.parchment,
    shadowOpacity: 0,
  },
  imgWrap: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 32 },
  body: { flex: 1, padding: 12, justifyContent: "center", gap: 3 },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sourceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.terracotta,
  },
  source: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: colors.terracotta,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 14,
    color: colors.ink,
    lineHeight: 18,
  },
  meta: { flexDirection: "row", gap: 6, marginTop: 2 },
  metaItem: { fontFamily: "DMSans_400Regular", fontSize: 10, color: colors.muted },
  processingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(196,98,58,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    alignSelf: "flex-start",
    marginBottom: 2,
  },
  spinner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: colors.terracotta,
    borderTopColor: "transparent",
  },
  processingText: { fontFamily: "DMSans_400Regular", fontSize: 9, color: colors.terracotta },
})
