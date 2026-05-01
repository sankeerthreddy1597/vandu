import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useUser, useAuth } from "@clerk/clerk-expo"
import { colors } from "@/constants/theme"

export default function ProfileScreen() {
  const { user } = useUser()
  const { signOut } = useAuth()

  async function handleSignOut() {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ])
  }

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Chef"
  const email = user?.emailAddresses[0]?.emailAddress ?? ""
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.body}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
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
  body: { flex: 1, padding: 24, alignItems: "center" },
  avatarWrap: { alignItems: "center", marginTop: 32, marginBottom: 40 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.darkBrown,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: colors.sand,
  },
  name: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 20,
    color: colors.ink,
    marginBottom: 4,
  },
  email: {
    fontFamily: "Lora_400Regular_Italic",
    fontSize: 13,
    color: colors.muted,
  },
  signOutBtn: {
    borderWidth: 1.5,
    borderColor: colors.sandLight,
    borderRadius: 100,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  signOutText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.warmBrown,
  },
})
