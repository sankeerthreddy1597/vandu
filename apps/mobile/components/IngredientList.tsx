import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { colors } from "@/constants/theme"
import type { Ingredient } from "@/lib/api"

interface Props {
  ingredients: Ingredient[]
}

export function IngredientList({ ingredients }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <View>
      {ingredients.map((ing) => {
        const isChecked = checked.has(ing.id)
        return (
          <TouchableOpacity
            key={ing.id}
            style={styles.row}
            onPress={() => toggle(ing.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.check, isChecked && styles.checkDone]}>
              {isChecked && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={[styles.name, isChecked && styles.nameChecked]}>
              {ing.name}
              {ing.notes ? <Text style={styles.notes}> ({ing.notes})</Text> : null}
            </Text>
            {(ing.amount || ing.unit) && (
              <Text style={styles.amount}>
                {[ing.amount, ing.unit].filter(Boolean).join(" ")}
              </Text>
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(60,42,30,0.06)",
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.sand,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkDone: { backgroundColor: colors.sage, borderColor: colors.sage },
  checkMark: { color: "white", fontSize: 10, fontWeight: "bold" },
  name: { flex: 1, fontFamily: "Lora_400Regular", fontSize: 12.5, color: colors.ink },
  nameChecked: { opacity: 0.4, textDecorationLine: "line-through" },
  notes: { fontFamily: "Lora_400Regular_Italic", color: colors.muted },
  amount: { fontFamily: "DMSans_400Regular", fontSize: 11, color: colors.muted },
})
