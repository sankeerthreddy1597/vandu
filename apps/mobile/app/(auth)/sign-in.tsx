import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { useSignIn } from "@clerk/expo"
import { useRouter, Link } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { colors } from "@/constants/theme"

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit() {
    const { error } = await signIn.password({ emailAddress: email.trim(), password })
    if (error) return

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/")
          router.replace(url as any)
        },
      })
    }
  }

  const isLoading = fetchStatus === "fetching"

  return (
    <LinearGradient colors={[colors.darkBrown, "#060E18"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.logo}>✦</Text>
            <Text style={styles.appName}>Vandu</Text>
            <Text style={styles.tagline}>Your personal recipe collection</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>
            <Text style={styles.cardSub}>Welcome back!</Text>

            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
            {errors?.fields?.identifier && (
              <Text style={styles.error}>{errors.fields.identifier.message}</Text>
            )}

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors?.fields?.password && (
              <Text style={styles.error}>{errors.fields.password.message}</Text>
            )}

            <TouchableOpacity
              style={[styles.btn, (!email.trim() || !password || isLoading) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!email.trim() || !password || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.btnText}>Sign in →</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Create one</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  hero: { alignItems: "center", marginBottom: 40 },
  logo: { fontSize: 32, color: colors.terracotta, marginBottom: 8 },
  appName: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 40,
    color: colors.parchmentText,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 14,
    color: "rgba(237,243,249,0.5)",
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.cream,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  cardTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    color: colors.ink,
    marginBottom: 4,
  },
  cardSub: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 13,
    color: colors.muted,
    marginBottom: 22,
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: colors.warmBrown,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    fontFamily: "Lora_400Regular",
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.parchment,
    borderWidth: 1.5,
    borderColor: colors.sandLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 16,
  },
  error: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#C0392B",
    marginBottom: 10,
    marginTop: -8,
  },
  btn: {
    backgroundColor: colors.terracotta,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.45 },
  btnText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: "white",
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontFamily: "Lora_400Regular",
    fontSize: 13,
    color: colors.muted,
  },
  link: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.terracotta,
  },
})
