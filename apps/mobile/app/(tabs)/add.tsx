import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import { colors } from "@/constants/theme"
import { useApi } from "@/lib/api"
import { uploadToR2 } from "@/lib/upload"
import { StatusBanner } from "@/components/StatusBanner"

export default function AddScreen() {
  const router = useRouter()
  const api = useApi()
  const [url, setUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  async function handleUrl() {
    if (!url.trim()) return Alert.alert("Enter a URL first")
    setSubmitting(true)
    try {
      const isInstagram = url.includes("instagram.com")
      const { recipeId } = await api.createRecipe({
        type: isInstagram ? "instagram" : "url",
        url: url.trim(),
      })
      setUrl("")
      setProcessingId(recipeId)
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to create recipe")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return Alert.alert("Permission needed to pick photos")

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    })
    if (result.canceled) return

    setSubmitting(true)
    try {
      const { uploadUrl, key } = await api.getPresignUrl()
      await uploadToR2(uploadUrl, result.assets[0].uri)
      const { recipeId } = await api.createRecipe({ type: "image", imageKey: key })
      setProcessingId(recipeId)
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to upload image")
    } finally {
      setSubmitting(false)
    }
  }

  function handleDone(recipeId: string) {
    setProcessingId(null)
    router.push(`/recipe/${recipeId}`)
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Save a Recipe</Text>
          <Text style={styles.subtitle}>Three ways to add to your collection</Text>
        </View>

        <View style={styles.body}>
          {/* Instagram card */}
          <LinearGradient colors={[colors.darkBrown, "#2C1F14"]} style={styles.instaCard}>
            <View style={styles.instaIconWrap}>
              <Text style={{ fontSize: 22 }}>📸</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.instaTitle}>Share from Instagram</Text>
              <Text style={styles.instaDesc}>
                Open a reel, tap share, and send it here — we handle the rest automatically.
              </Text>
            </View>
            <Text style={{ color: "rgba(237,243,249,0.4)", fontSize: 16 }}>→</Text>
          </LinearGradient>

          {/* URL input */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Paste a recipe URL</Text>
            <View style={styles.urlField}>
              <Text style={{ fontSize: 14 }}>🔗</Text>
              <TextInput
                style={styles.urlInput}
                placeholder="https://www.seriouseats.com/…"
                placeholderTextColor="rgba(107,76,53,0.4)"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <TouchableOpacity
              style={[styles.generateBtn, submitting && { opacity: 0.6 }]}
              onPress={handleUrl}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.generateBtnText}>Generate Recipe →</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Image upload */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Upload a photo</Text>
            <TouchableOpacity style={styles.uploadArea} onPress={handleImage} disabled={submitting}>
              <Text style={{ fontSize: 28, color: colors.sand }}>📷</Text>
              <Text style={styles.uploadText}>
                Photo of a recipe card, handwritten notes, or a cookbook page
              </Text>
              <View style={styles.chooseBtn}>
                <Text style={styles.chooseBtnText}>Choose Photo</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Processing banner */}
          {processingId && (
            <StatusBanner
              recipeId={processingId}
              onDone={() => handleDone(processingId)}
              onFailed={() => setProcessingId(null)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(60,42,30,0.08)",
  },
  title: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 24, color: colors.ink },
  subtitle: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  body: { padding: 20, gap: 14 },
  instaCard: {
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  instaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  instaTitle: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 15,
    color: colors.parchmentText,
    marginBottom: 4,
  },
  instaDesc: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 11.5,
    color: "rgba(237,243,249,0.6)",
    lineHeight: 17,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    shadowColor: colors.ink,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  urlField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.parchment,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.sandLight,
  },
  urlInput: {
    flex: 1,
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 12,
    color: colors.warmBrown,
  },
  generateBtn: {
    backgroundColor: colors.terracotta,
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 18,
    alignSelf: "flex-end",
  },
  generateBtnText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: "white",
    letterSpacing: 0.5,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: colors.sandLight,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  uploadText: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
  chooseBtn: {
    backgroundColor: "rgba(196,98,58,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
    marginTop: 4,
  },
  chooseBtnText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: colors.terracotta,
  },
})
