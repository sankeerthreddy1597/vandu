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
import { useSignUp } from "@clerk/expo"
import { useRouter, Link } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { colors } from "@/constants/theme"

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [pendingVerification, setPendingVerification] = useState(false)

  const isLoading = fetchStatus === "fetching"

  async function handleSignUp() {
    const { error } = await signUp.password({ emailAddress: email.trim(), password })
    if (error) return
    await signUp.verifications.sendEmailCode()
    setPendingVerification(true)
  }

  async function handleVerify() {
    await signUp.verifications.verifyEmailCode({ code })
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/")
          router.replace(url as any)
        },
      })
    }
  }

  return (
    <LinearGradient colors={[colors.darkBrown, "#060E18"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.logo}>✦</Text>
            <Text style={styles.appName}>Vandu</Text>
            <Text style={styles.tagline}>Your personal recipe collection</Text>
          </View>

          <View style={styles.card}>
            {!pendingVerification ? (
              <>
                <Text style={styles.cardTitle}>Create account</Text>
                <Text style={styles.cardSub}>Start your recipe collection</Text>

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
                {errors?.fields?.emailAddress && (
                  <Text style={styles.error}>{errors.fields.emailAddress.message}</Text>
                )}

                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
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
                  onPress={handleSignUp}
                  disabled={!email.trim() || !password || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.btnText}>Create account →</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <Link href="/(auth)/sign-in" asChild>
                    <TouchableOpacity>
                      <Text style={styles.link}>Sign in</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
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
                {errors?.fields?.code && (
                  <Text style={styles.error}>{errors.fields.code.message}</Text>
                )}

                <TouchableOpacity
                  style={[styles.btn, (code.length < 6 || isLoading) && styles.btnDisabled]}
                  onPress={handleVerify}
                  disabled={code.length < 6 || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.btnText}>Verify →</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => signUp.verifications.sendEmailCode()}
                  style={styles.resendBtn}
                >
                  <Text style={styles.resendText}>Resend code</Text>
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
  resendBtn: { alignItems: "center", marginTop: 18 },
  resendText: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 13,
    color: colors.muted,
  },
})
