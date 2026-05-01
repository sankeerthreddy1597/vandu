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
import { useSignIn } from "@clerk/clerk-expo"
import { LinearGradient } from "expo-linear-gradient"
import { colors } from "@/constants/theme"

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"email" | "code">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function sendCode() {
    if (!isLoaded || !email.trim()) return
    setLoading(true)
    setError("")
    try {
      await signIn.create({ identifier: email.trim(), strategy: "email_code" })
      setStep("code")
    } catch (e: unknown) {
      const err = e as { errors?: { message: string }[] }
      setError(err.errors?.[0]?.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode() {
    if (!isLoaded) return
    setLoading(true)
    setError("")
    try {
      const result = await signIn.attemptFirstFactor({ strategy: "email_code", code })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
      }
    } catch (e: unknown) {
      const err = e as { errors?: { message: string }[] }
      setError(err.errors?.[0]?.message ?? "Invalid code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient colors={[colors.darkBrown, "#1A0F08"]} style={styles.container}>
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
            {step === "email" ? (
              <>
                <Text style={styles.cardTitle}>Sign in</Text>
                <Text style={styles.cardSub}>We'll send a code to your email</Text>

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
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TouchableOpacity
                  style={[styles.btn, (!email.trim() || loading) && styles.btnDisabled]}
                  onPress={sendCode}
                  disabled={!email.trim() || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.btnText}>Send code →</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Check your email</Text>
                <Text style={styles.cardSub}>Code sent to {email}</Text>

                <Text style={styles.label}>6-digit code</Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="000000"
                  placeholderTextColor={colors.muted}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TouchableOpacity
                  style={[styles.btn, (code.length < 6 || loading) && styles.btnDisabled]}
                  onPress={verifyCode}
                  disabled={code.length < 6 || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.btnText}>Verify →</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setStep("email"); setCode(""); setError("") }} style={styles.backBtn}>
                  <Text style={styles.backText}>← Use a different email</Text>
                </TouchableOpacity>
              </>
            )}
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
    color: "rgba(245,239,224,0.5)",
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
  codeInput: {
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 8,
    fontFamily: "PlayfairDisplay_400Regular",
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
  backBtn: { alignItems: "center", marginTop: 18 },
  backText: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 13,
    color: colors.muted,
  },
})
