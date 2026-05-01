import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { colors } from "@/constants/theme"
import { useRecipeStream } from "@/hooks/useRecipeStream"

const STATUS_LABELS: Record<string, string> = {
  PROCESSING: "Starting up…",
  SCRAPING: "Fetching recipe content…",
  EXTRACTING: "Extracting ingredients & steps with AI…",
  DONE: "Done!",
  FAILED: "Something went wrong",
}

const STATUS_STEP: Record<string, number> = {
  PROCESSING: 0,
  SCRAPING: 1,
  EXTRACTING: 2,
  DONE: 3,
  FAILED: 3,
}

interface Props {
  recipeId: string
  onDone: () => void
  onFailed: () => void
  compact?: boolean
}

export function StatusBanner({ recipeId, onDone, onFailed, compact }: Props) {
  const { status } = useRecipeStream(recipeId, "PROCESSING")
  const spinAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    )
    loop.start()
    return () => loop.stop()
  }, [])

  useEffect(() => {
    if (status === "DONE") onDone()
    else if (status === "FAILED") onFailed()
  }, [status])

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] })
  const step = STATUS_STEP[status] ?? 0

  if (compact) {
    return (
      <View style={styles.compactBanner}>
        <Animated.View style={[styles.spinnerSmall, { transform: [{ rotate: spin }] }]} />
        <Text style={styles.compactText}>{STATUS_LABELS[status]}</Text>
      </View>
    )
  }

  return (
    <LinearGradient colors={[colors.darkBrown, "#2C1F14"]} style={styles.banner}>
      <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
      <View style={styles.textWrap}>
        <Text style={styles.bannerTitle}>Generating your recipe…</Text>
        <Text style={styles.bannerStep}>{STATUS_LABELS[status]}</Text>
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < step ? styles.dotDone : i === step ? styles.dotActive : null,
              ]}
            />
          ))}
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  spinner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    borderTopColor: colors.terracotta,
    flexShrink: 0,
  },
  textWrap: { flex: 1 },
  bannerTitle: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 13,
    color: colors.parchmentText,
    marginBottom: 2,
  },
  bannerStep: { fontFamily: "Lora_400Regular_Italic", fontSize: 10, color: colors.muted },
  dotsRow: { flexDirection: "row", gap: 4, marginTop: 10 },
  dot: { height: 3, flex: 1, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)" },
  dotDone: { backgroundColor: colors.sage },
  dotActive: { backgroundColor: colors.terracotta },
  compactBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(196,98,58,0.1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  spinnerSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "rgba(196,98,58,0.3)",
    borderTopColor: colors.terracotta,
  },
  compactText: { fontFamily: "Lora_400Regular_Italic", fontSize: 12, color: colors.terracotta },
})
