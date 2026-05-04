import { ClerkProvider, useAuth } from "@clerk/expo"
import * as SecureStore from "expo-secure-store"
import { Slot, useRouter, useSegments } from "expo-router"
import { useEffect } from "react"
import { useFonts } from "expo-font"
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_600SemiBold_Italic,
} from "@expo-google-fonts/playfair-display"
import { Lora_400Regular, Lora_500Medium, Lora_400Regular_Italic } from "@expo-google-fonts/lora"
import { DMSans_400Regular, DMSans_500Medium } from "@expo-google-fonts/dm-sans"
import { View, ActivityIndicator } from "react-native"
import { colors } from "@/constants/theme"

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key)
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value)
  },
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    const inTabsGroup = segments[0] === "(tabs)"
    const inAuthGroup = segments[0] === "(auth)"
    if (isSignedIn && !inTabsGroup) {
      router.replace("/(tabs)/")
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/sign-in")
    }
  }, [isSignedIn, segments, isLoaded])

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.darkBrown, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.sand} />
      </View>
    )
  }

  return <Slot />
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_600SemiBold_Italic,
    Lora_400Regular,
    Lora_500Medium,
    Lora_400Regular_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
  })

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.darkBrown, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.sand} />
      </View>
    )
  }

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <InitialLayout />
    </ClerkProvider>
  )
}
