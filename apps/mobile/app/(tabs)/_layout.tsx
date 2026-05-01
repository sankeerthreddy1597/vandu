import { Tabs } from "expo-router"
import { View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "@/constants/theme"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.terracotta,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.cream,
          borderTopColor: "rgba(60,42,30,0.1)",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontFamily: "DMSans_400Regular",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: focused ? colors.terracotta : colors.sandLight,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 2,
              }}
            >
              <Ionicons name="add" size={22} color={focused ? "white" : colors.muted} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
