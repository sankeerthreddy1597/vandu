import { View, Text, StyleSheet } from "react-native"
import { colors } from "@/constants/theme"
import type { Step } from "@/lib/api"

interface Props {
  steps: Step[]
}

export function StepList({ steps }: Props) {
  return (
    <View style={styles.container}>
      {steps.map((step) => (
        <View key={step.id} style={styles.row}>
          <View style={styles.num}>
            <Text style={styles.numText}>{step.order}</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.instruction}>{step.instruction}</Text>
            {step.duration && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>⏱ {step.duration}</Text>
              </View>
            )}
            {step.tip && <Text style={styles.tip}>💡 {step.tip}</Text>}
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  row: { flexDirection: "row", gap: 12 },
  num: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.terracotta,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  numText: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 12, color: "white" },
  content: { flex: 1, gap: 6 },
  instruction: {
    fontFamily: "Lora_400Regular",
    fontSize: 13,
    color: colors.ink,
    lineHeight: 21,
  },
  durationBadge: {
    backgroundColor: colors.sandLight,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  durationText: { fontFamily: "DMSans_400Regular", fontSize: 10, color: colors.warmBrown },
  tip: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 11.5,
    color: colors.muted,
    lineHeight: 17,
  },
})
