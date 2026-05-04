# Expo Quickstart

**Example Repository**

- [Native Components Quickstart](https://github.com/clerk/clerk-expo-quickstart/tree/main/NativeComponentQuickstart)
- [JS + Native Sign-in Quickstart](https://github.com/clerk/clerk-expo-quickstart/tree/main/JSWithNativeSignInQuickstart)
- [JS Only Quickstart](https://github.com/clerk/clerk-expo-quickstart/tree/main/JSOnlyQuickstart)

**Before you start**

- [Set up a Clerk application](https://clerk.com/docs/getting-started/quickstart/setup-clerk.md)

There are three approaches for adding authentication to your Expo app.

| Approach                | Auth UI                             | OAuth               | Requires dev build    | Best for                                        |
| ----------------------- | ----------------------------------- | ------------------- | --------------------- | ----------------------------------------------- |
| **Native components**   | Pre-built native components         | Native (no browser) | Yes                   | Fastest integration                             |
| **JS + Native sign-in** | Custom flows + native OAuth buttons | Native (no browser) | Yes                   | Custom UI with native Sign in with Google/Apple |
| **JavaScript**          | Custom flows                        | Browser-based       | No (works in Expo Go) | Full control over UI                            |

Use the following tabs to choose your preferred approach:

**Native components**

> Expo native components are currently in beta. If you run into any issues, please reach out to our [support team](https://clerk.com/support).

This approach uses Clerk's [`pre-built native components`](https://clerk.com/docs/reference/expo/native-components/overview.md) that render using SwiftUI on iOS and Jetpack Compose on Android. This requires the least code and a [development build](https://docs.expo.dev/develop/development-builds/introduction/).

1. ## Enable Native API

   In the Clerk Dashboard, navigate to the [**Native applications**](https://dashboard.clerk.com/~/native-applications) page and ensure that the Native API is enabled. This is required to integrate Clerk in your native application.
2. ## Create a new Expo app

   If you don't already have an Expo app, run the following commands to [create a new one](https://docs.expo.dev/tutorial/create-your-first-app/).

   ```npm
   npx create-expo-app@latest clerk-expo
   cd clerk-expo
   ```
3. ## Remove default template files

   The default Expo template includes files that will conflict with the routes you'll create in this guide. Remove the conflicting files:

   ```bash
   rm -rf "app/(tabs)" app/modal.tsx app/+not-found.tsx
   ```

   The default template also includes `react-native-reanimated`, which can cause [known Android build issues](https://docs.expo.dev/versions/latest/sdk/reanimated/#known-issues). Since it's not needed for this guide, remove it to avoid build errors:

   ```bash
   npm uninstall react-native-reanimated react-native-worklets --legacy-peer-deps
   ```

   Then, remove the reanimated import from `app/_layout.tsx`:

   ```diff {{ filename: 'app/_layout.tsx' }}
   - import 'react-native-reanimated';
   ```

   > You can skip this step if you used `npx create-expo-app@latest --template blank` to create your app. However, the blank template doesn't include [Expo Router](https://docs.expo.dev/router/introduction/) or pre-styled UI components. You'll need to install `expo-router` and its dependencies to follow along with this guide.
4. ## Install dependencies

   Install the required packages. Use `npx expo install` to ensure SDK-compatible versions.

   - The [`Clerk Expo SDK`](https://clerk.com/docs/reference/expo/overview.md) gives you access to prebuilt components, hooks, and helpers to make user authentication easier.
   - Clerk stores the active user's session token in memory by default. In Expo apps, the recommended way to store sensitive data, such as tokens, is by using `expo-secure-store` which encrypts the data before storing it.
   - `expo-auth-session` handles authentication redirects and OAuth flows in Expo apps.
   - `expo-web-browser` opens the system browser during authentication and returns the user to the app once the flow is complete.
   - `expo-dev-client` allows you to build and run your app in development mode.

   ```bash
   npx expo install @clerk/expo expo-secure-store expo-auth-session expo-web-browser expo-dev-client
   ```
5. ## Set your Clerk API keys

   Add your Clerk Publishable Key to your `.env` file.

   1. In the Clerk Dashboard, navigate to the [**API keys**](https://dashboard.clerk.com/~/api-keys) page.
   2. In the **Quick Copy** section, copy your Clerk Publishable Key.
   3. Paste your key into your `.env` file.

   The final result should resemble the following:

   ```env {{ filename: '.env' }}
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY={{pub_key}}
   ```
6. ## Verify `app.json` plugins

   Run `npx expo install` to automatically add the required config plugins to your `app.json` file. Then verify that `@clerk/expo` and `expo-secure-store` appear in the `plugins` array:

   ```json {{ filename: 'app.json' }}
   {
     "expo": {
       "plugins": ["expo-secure-store", "@clerk/expo"]
     }
   }
   ```
7. ## Add `<ClerkProvider>` to your root layout

   The [`<ClerkProvider>`](https://clerk.com/docs/expo/reference/components/clerk-provider.md) component provides session and user context to Clerk's hooks and components. It's recommended to wrap your entire app at the entry point with `<ClerkProvider>` to make authentication globally accessible. See the [`reference docs`](https://clerk.com/docs/expo/reference/components/clerk-provider.md) for other configuration options.

   Add the component to your root layout and pass your Publishable Key and `tokenCache` from `@clerk/expo/token-cache` as props, as shown in the following example:

   ```tsx {{ filename: 'app/_layout.tsx' }}
   import { ClerkProvider } from '@clerk/expo'
   import { tokenCache } from '@clerk/expo/token-cache'
   import { Slot } from 'expo-router'

   const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

   if (!publishableKey) {
     throw new Error('Add your Clerk Publishable Key to the .env file')
   }

   export default function RootLayout() {
     return (
       <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
         <Slot />
       </ClerkProvider>
     )
   }
   ```
8. ## Add authentication and home screen

   With [`native components`](https://clerk.com/docs/reference/expo/native-components/overview.md), you can build a complete app in a single file. The [`<AuthView />`](https://clerk.com/docs/reference/expo/native-components/auth-view.md) component handles all sign-in and sign-up flows, [`<UserButton />`](https://clerk.com/docs/reference/expo/native-components/user-button.md) provides a profile avatar that opens the native profile modal, and the [`useUserProfileModal()`](https://clerk.com/docs/reference/expo/native-components/user-profile-view.md) hook lets you open the profile modal from any button.

   Create an `index.tsx` file in your `app` folder with the following code. If the user is signed in, it displays their email, a profile button, and a sign-out button. If they're not signed in, it displays the `<AuthView />` component which handles both sign-in and sign-up.

   > When using native components, pass `{ treatPendingAsSignedOut: false }` to `useAuth()` to keep auth state in sync with the native SDK and avoid issues with pending session tasks.

   ```tsx {{ filename: 'app/index.tsx', collapsible: true }}
   import { useAuth, useUser, useClerk, useUserProfileModal } from '@clerk/expo'
   import { AuthView, UserButton } from '@clerk/expo/native'
   import { Text, View, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native'

   export default function MainScreen() {
     const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false })
     const { user } = useUser()
     const { signOut } = useClerk()
     const { presentUserProfile } = useUserProfileModal()

     if (!isLoaded) {
       return (
         <View style={styles.centered}>
           <ActivityIndicator size="large" />
         </View>
       )
     }

     if (!isSignedIn) {
       return <AuthView mode="signInOrUp" />
     }

     return (
       <View style={styles.container}>
         <View style={styles.header}>
           <Text style={styles.title}>Welcome</Text>
           <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden' }}>
             <UserButton />
           </View>
         </View>
         <View style={styles.profileCard}>
           {user?.imageUrl && <Image source={{ uri: user.imageUrl }} style={styles.avatar} />}
           <View>
             <Text>Hello {user?.id}</Text>
           </View>
         </View>
         <TouchableOpacity style={styles.linkButton} onPress={presentUserProfile}>
           <Text style={styles.linkButtonText}>Manage Profile</Text>
         </TouchableOpacity>
         <TouchableOpacity
           style={[styles.linkButton, { backgroundColor: '#666' }]}
           onPress={() => signOut()}
         >
           <Text style={styles.linkButtonText}>Sign Out</Text>
         </TouchableOpacity>
       </View>
     )
   }

   const styles = StyleSheet.create({
     centered: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
       backgroundColor: '#fff',
       padding: 40,
     },
     container: {
       flex: 1,
       backgroundColor: '#fff',
       padding: 20,
       paddingTop: 60,
       gap: 16,
     },
     header: {
       flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'space-between',
     },
     title: {
       fontSize: 28,
       fontWeight: 'bold',
     },
     profileCard: {
       flexDirection: 'row',
       alignItems: 'center',
       padding: 16,
       backgroundColor: '#f5f5f5',
       borderRadius: 12,
       gap: 12,
     },
     avatar: {
       width: 48,
       height: 48,
       borderRadius: 24,
     },
     name: {
       fontSize: 18,
       fontWeight: '600',
     },
     email: {
       fontSize: 14,
       color: '#666',
     },
     linkButton: {
       backgroundColor: '#007AFF',
       padding: 16,
       borderRadius: 12,
       alignItems: 'center',
     },
     linkButtonText: {
       color: '#fff',
       fontSize: 16,
       fontWeight: '600',
     },
   })
   ```
9. ## Build and run

   This approach requires a [development build](https://docs.expo.dev/develop/development-builds/introduction/) because it uses native modules. It **cannot** run in Expo Go.

   ```bash {{ filename: 'terminal' }}
   # Using Expo CLI
   npx expo run:ios
   npx expo run:android

   # Using EAS Build
   eas build --platform ios
   eas build --platform android

   # Or using local prebuild
   npx expo prebuild && npx expo run:ios --device
   npx expo prebuild && npx expo run:android --device
   ```

   Then use the terminal shortcuts to run the app on your preferred platform:

   - Press `i` to open the iOS simulator.
   - Press `a` to open the Android emulator.
   - Scan the QR code with Expo Go to run the app on a physical device.
10. ## Create your first user

    Once the app opens on your device or simulator:

    - Navigate to the Sign up screen.
    - Enter your details and complete the authentication flow.
    - After signing up, your first user will be created and you'll be signed in.
11. ## Configure social connections (optional)

    `<AuthView />` automatically shows sign-in buttons for any social connections enabled in your [Clerk Dashboard](https://dashboard.clerk.com/~/user-authentication/sso-connections). However, native OAuth requires additional credential setup — without it, the buttons will appear but fail with an error when tapped.
12. ### Sign in with Google

    Follow the steps in the [`Sign in with Google`](https://clerk.com/docs/expo/guides/configure/auth-strategies/sign-in-with-google.md) guide to complete the following:

    1. [Enable Google as a social connection](https://dashboard.clerk.com/~/user-authentication/sso-connections) with **Use custom credentials** toggled on.
    2. Create OAuth 2.0 credentials in the [Google Cloud Console](https://console.cloud.google.com/) — you'll need an **iOS Client ID**, **Android Client ID**, and **Web Client ID**.
    3. Set the **Web Client ID** and **Client Secret** in the [Clerk Dashboard](https://dashboard.clerk.com/~/user-authentication/sso-connections).
    4. Add your iOS application to the [**Native Applications**](https://dashboard.clerk.com/~/native-applications) page in the Clerk Dashboard (Team ID + Bundle ID).
    5. Add your Android application to the [**Native Applications**](https://dashboard.clerk.com/~/native-applications) page in the Clerk Dashboard (package name).
    6. Add the Google Client IDs as environment variables in your `.env` file. Follow the `.env.example` in the [`Sign in with Google`](https://clerk.com/docs/expo/guides/configure/auth-strategies/sign-in-with-google.md#configure-environment-variables) guide.
    7. Configure the `@clerk/expo` plugin with the iOS URL scheme in your `app.json`.

    > You do **not** need to install `expo-crypto` or use the `useSignInWithGoogle()` hook — `<AuthView />` handles the sign-in flow automatically.
13. ### Sign in with Apple

    Follow the steps in the [`Sign in with Apple`](https://clerk.com/docs/expo/guides/configure/auth-strategies/sign-in-with-apple.md) guide to complete the following:

    1. Add your iOS application to the [**Native Applications**](https://dashboard.clerk.com/~/native-applications) page in the Clerk Dashboard (Team ID + Bundle ID).
    2. [Enable Apple as a social connection](https://dashboard.clerk.com/~/user-authentication/sso-connections) in the Clerk Dashboard.

    > You do **not** need to install `expo-apple-authentication`, `expo-crypto`, or use the `useSignInWithApple()` hook — `<AuthView />` handles the sign-in flow automatically.

**JavaScript (Native sign-in optional)**

This approach uses custom flows built with React Native components and **works in Expo Go — no dev build required.**

1. ## Enable Native API

   In the Clerk Dashboard, navigate to the [**Native applications**](https://dashboard.clerk.com/~/native-applications) page and ensure that the Native API is enabled. This is required to integrate Clerk in your native application.
2. ## Create a new Expo app

   If you don't already have an Expo app, run the following commands to [create a new one](https://docs.expo.dev/tutorial/create-your-first-app/).

   ```npm
   npx create-expo-app@latest clerk-expo
   cd clerk-expo
   ```
3. ## Remove default template files

   The default Expo template includes files that will conflict with the routes you'll create in this guide. Remove the conflicting files:

   ```bash
   rm -rf "app/(tabs)" app/modal.tsx app/+not-found.tsx
   ```

   The default template also includes `react-native-reanimated`, which can cause [known Android build issues](https://docs.expo.dev/versions/latest/sdk/reanimated/#known-issues). Since it's not needed for this guide, remove it to avoid build errors:

   ```bash
   npm uninstall react-native-reanimated react-native-worklets --legacy-peer-deps
   ```

   Then, remove the reanimated import from `app/_layout.tsx`:

   ```diff {{ filename: 'app/_layout.tsx' }}
   - import 'react-native-reanimated';
   ```

   > You can skip this step if you used `npx create-expo-app@latest --template blank` to create your app. However, the blank template doesn't include [Expo Router](https://docs.expo.dev/router/introduction/) or pre-styled UI components. You'll need to install `expo-router` and its dependencies to follow along with this guide.
4. ## Install dependencies

   Install the required packages. Use `npx expo install` to ensure SDK-compatible versions.

   - The [`Clerk Expo SDK`](https://clerk.com/docs/reference/expo/overview.md) gives you access to prebuilt components, hooks, and helpers to make user authentication easier.
   - Clerk stores the active user's session token in memory by default. In Expo apps, the recommended way to store sensitive data, such as tokens, is by using `expo-secure-store` which encrypts the data before storing it.

   ```bash
   npx expo install @clerk/expo expo-secure-store
   ```
5. ## Set your Clerk API keys

   Add your Clerk Publishable Key to your `.env` file.

   1. In the Clerk Dashboard, navigate to the [**API keys**](https://dashboard.clerk.com/~/api-keys) page.
   2. In the **Quick Copy** section, copy your Clerk Publishable Key.
   3. Paste your key into your `.env` file.

   The final result should resemble the following:

   ```env {{ filename: '.env' }}
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY={{pub_key}}
   ```
6. ## Add `<ClerkProvider>` to your root layout

   The [`<ClerkProvider>`](https://clerk.com/docs/expo/reference/components/clerk-provider.md) component provides session and user context to Clerk's hooks and components. It's recommended to wrap your entire app at the entry point with `<ClerkProvider>` to make authentication globally accessible. See the [`reference docs`](https://clerk.com/docs/expo/reference/components/clerk-provider.md) for other configuration options.

   Add the component to your root layout and pass your Publishable Key and `tokenCache` from `@clerk/expo/token-cache` as props, as shown in the following example:

   ```tsx {{ filename: 'app/_layout.tsx' }}
   import { ClerkProvider } from '@clerk/expo'
   import { tokenCache } from '@clerk/expo/token-cache'
   import { Slot } from 'expo-router'

   const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

   if (!publishableKey) {
     throw new Error('Add your Clerk Publishable Key to the .env file')
   }

   export default function RootLayout() {
     return (
       <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
         <Slot />
       </ClerkProvider>
     )
   }
   ```
7. ## Add sign-up and sign-in pages

   Clerk currently only supports [`control components`](https://clerk.com/docs/expo/reference/components/overview.md#control-components) for Expo native. [`UI components`](https://clerk.com/docs/expo/reference/components/overview.md) are only available for Expo web. Instead, you must build custom flows using Clerk's API. The following sections demonstrate how to build [custom email/password sign-up and sign-in flows](https://clerk.com/docs/guides/development/custom-flows/authentication/email-password.md). If you want to use different authentication methods, such as passwordless or OAuth, see the dedicated custom flow guides.
8. ### Layout page

   First, protect your sign-up and sign-in pages.

   1. Create an `(auth)` [route group](https://docs.expo.dev/router/advanced/shared-routes/). This will group your sign-up and sign-in pages.
   2. In the `(auth)` group, create a `_layout.tsx` file with the following code. The [`useAuth()`](https://clerk.com/docs/expo/reference/hooks/use-auth.md) hook is used to access the user's authentication state. If the user is already signed in, they will be redirected to the home page.

   ```tsx {{ filename: 'app/(auth)/_layout.tsx' }}
   import { useAuth } from '@clerk/expo'
   import { Redirect, Stack } from 'expo-router'

   export default function AuthRoutesLayout() {
     const { isSignedIn, isLoaded } = useAuth()

     if (!isLoaded) {
       return null
     }

     if (isSignedIn) {
       return <Redirect href={'/'} />
     }

     return <Stack />
   }
   ```
9. ### Sign-up page

   In the `(auth)` group, create a `sign-up.tsx` file with the following code. The [`useSignUp()`](https://clerk.com/docs/expo/reference/hooks/use-sign-up.md) hook is used to create a sign-up flow. The user can sign up using their email and password and will receive an email verification code to confirm their email.

   ```tsx {{ filename: 'app/(auth)/sign-up.tsx', collapsible: true }}
   import { ThemedText } from '@/components/themed-text'
   import { ThemedView } from '@/components/themed-view'
   import { useAuth, useSignUp } from '@clerk/expo'
   import { type Href, Link, useRouter } from 'expo-router'
   import React from 'react'
   import { Pressable, StyleSheet, TextInput, View } from 'react-native'

   export default function Page() {
     const { signUp, errors, fetchStatus } = useSignUp()
     const { isSignedIn } = useAuth()
     const router = useRouter()

     const [emailAddress, setEmailAddress] = React.useState('')
     const [password, setPassword] = React.useState('')
     const [code, setCode] = React.useState('')

     const handleSubmit = async () => {
       const { error } = await signUp.password({
         emailAddress,
         password,
       })
       if (error) {
         console.error(JSON.stringify(error, null, 2))
         return
       }

       if (!error) await signUp.verifications.sendEmailCode()
     }

     const handleVerify = async () => {
       await signUp.verifications.verifyEmailCode({
         code,
       })
       if (signUp.status === 'complete') {
         await signUp.finalize({
           // Redirect the user to the home page after signing up
           navigate: ({ session, decorateUrl }) => {
             // Handle session tasks
             // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
             if (session?.currentTask) {
               console.log(session?.currentTask)
               return
             }

             // If no session tasks, navigate the signed-in user to the home page
             const url = decorateUrl('/')
             if (url.startsWith('http')) {
               window.location.href = url
             } else {
               router.push(url as Href)
             }
           },
         })
       } else {
         // Check why the sign-up is not complete
         console.error('Sign-up attempt not complete:', signUp)
       }
     }

     if (signUp.status === 'complete' || isSignedIn) {
       return null
     }

     if (
       signUp.status === 'missing_requirements' &&
       signUp.unverifiedFields.includes('email_address') &&
       signUp.missingFields.length === 0
     ) {
       return (
         <ThemedView style={styles.container}>
           <ThemedText type="title" style={styles.title}>
             Verify your account
           </ThemedText>
           <TextInput
             style={styles.input}
             value={code}
             placeholder="Enter your verification code"
             placeholderTextColor="#666666"
             onChangeText={(code) => setCode(code)}
             keyboardType="numeric"
           />
           {errors.fields.code && (
             <ThemedText style={styles.error}>{errors.fields.code.message}</ThemedText>
           )}
           <Pressable
             style={({ pressed }) => [
               styles.button,
               fetchStatus === 'fetching' && styles.buttonDisabled,
               pressed && styles.buttonPressed,
             ]}
             onPress={handleVerify}
             disabled={fetchStatus === 'fetching'}
           >
             <ThemedText style={styles.buttonText}>Verify</ThemedText>
           </Pressable>
           <Pressable
             style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
             onPress={() => signUp.verifications.sendEmailCode()}
           >
             <ThemedText style={styles.secondaryButtonText}>I need a new code</ThemedText>
           </Pressable>
         </ThemedView>
       )
     }

     return (
       <ThemedView style={styles.container}>
         <ThemedText type="title" style={styles.title}>
           Sign up
         </ThemedText>

         <ThemedText style={styles.label}>Email address</ThemedText>
         <TextInput
           style={styles.input}
           autoCapitalize="none"
           value={emailAddress}
           placeholder="Enter email"
           placeholderTextColor="#666666"
           onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
           keyboardType="email-address"
         />
         {errors.fields.emailAddress && (
           <ThemedText style={styles.error}>{errors.fields.emailAddress.message}</ThemedText>
         )}
         <ThemedText style={styles.label}>Password</ThemedText>
         <TextInput
           style={styles.input}
           value={password}
           placeholder="Enter password"
           placeholderTextColor="#666666"
           secureTextEntry={true}
           onChangeText={(password) => setPassword(password)}
         />
         {errors.fields.password && (
           <ThemedText style={styles.error}>{errors.fields.password.message}</ThemedText>
         )}
         <Pressable
           style={({ pressed }) => [
             styles.button,
             (!emailAddress || !password || fetchStatus === 'fetching') && styles.buttonDisabled,
             pressed && styles.buttonPressed,
           ]}
           onPress={handleSubmit}
           disabled={!emailAddress || !password || fetchStatus === 'fetching'}
         >
           <ThemedText style={styles.buttonText}>Sign up</ThemedText>
         </Pressable>
         {/* For your debugging purposes. You can just console.log errors, but we put them in the UI for convenience */}
         {errors && <ThemedText style={styles.debug}>{JSON.stringify(errors, null, 2)}</ThemedText>}

         <View style={styles.linkContainer}>
           <ThemedText>Already have an account? </ThemedText>
           <Link href="/sign-in">
             <ThemedText type="link">Sign in</ThemedText>
           </Link>
         </View>

         {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
         <View nativeID="clerk-captcha" />
       </ThemedView>
     )
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       padding: 20,
       gap: 12,
     },
     title: {
       marginBottom: 8,
     },
     label: {
       fontWeight: '600',
       fontSize: 14,
     },
     input: {
       borderWidth: 1,
       borderColor: '#ccc',
       borderRadius: 8,
       padding: 12,
       fontSize: 16,
       backgroundColor: '#fff',
     },
     button: {
       backgroundColor: '#0a7ea4',
       paddingVertical: 12,
       paddingHorizontal: 24,
       borderRadius: 8,
       alignItems: 'center',
       marginTop: 8,
     },
     buttonPressed: {
       opacity: 0.7,
     },
     buttonDisabled: {
       opacity: 0.5,
     },
     buttonText: {
       color: '#fff',
       fontWeight: '600',
     },
     secondaryButton: {
       paddingVertical: 12,
       paddingHorizontal: 24,
       borderRadius: 8,
       alignItems: 'center',
       marginTop: 8,
     },
     secondaryButtonText: {
       color: '#0a7ea4',
       fontWeight: '600',
     },
     linkContainer: {
       flexDirection: 'row',
       gap: 4,
       marginTop: 12,
       alignItems: 'center',
     },
     error: {
       color: '#d32f2f',
       fontSize: 12,
       marginTop: -8,
     },
     debug: {
       fontSize: 10,
       opacity: 0.5,
       marginTop: 8,
     },
   })
   ```
10. ### Sign-in page

    In the `(auth)` group, create a `sign-in.tsx` file with the following code. The [`useSignIn()`](https://clerk.com/docs/expo/reference/hooks/use-sign-in.md) hook is used to create a sign-in flow. The user can sign in using email address and password, or navigate to the sign-up page.

    ```tsx {{ filename: 'app/(auth)/sign-in.tsx', collapsible: true }}
    import { ThemedText } from '@/components/themed-text'
    import { ThemedView } from '@/components/themed-view'
    import { useSignIn } from '@clerk/expo'
    import { type Href, Link, useRouter } from 'expo-router'
    import React from 'react'
    import { Pressable, StyleSheet, TextInput, View } from 'react-native'

    export default function Page() {
      const { signIn, errors, fetchStatus } = useSignIn()
      const router = useRouter()

      const [emailAddress, setEmailAddress] = React.useState('')
      const [password, setPassword] = React.useState('')
      const [code, setCode] = React.useState('')

      const handleSubmit = async () => {
        const { error } = await signIn.password({
          emailAddress,
          password,
        })
        if (error) {
          console.error(JSON.stringify(error, null, 2))
          return
        }

        if (signIn.status === 'complete') {
          await signIn.finalize({
            navigate: ({ session, decorateUrl }) => {
              // Handle session tasks
              // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              if (session?.currentTask) {
                console.log(session?.currentTask)
                return
              }

              // If no session tasks, navigate the signed-in user to the home page
              const url = decorateUrl('/')
              if (url.startsWith('http')) {
                window.location.href = url
              } else {
                router.push(url as Href)
              }
            },
          })
        } else if (signIn.status === 'needs_second_factor') {
          // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
        } else if (signIn.status === 'needs_client_trust') {
          // For other second factor strategies,
          // see https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust
          const emailCodeFactor = signIn.supportedSecondFactors.find(
            (factor) => factor.strategy === 'email_code',
          )

          if (emailCodeFactor) {
            await signIn.mfa.sendEmailCode()
          }
        } else {
          // Check why the sign-in is not complete
          console.error('Sign-in attempt not complete:', signIn)
        }
      }

      const handleVerify = async () => {
        await signIn.mfa.verifyEmailCode({ code })

        if (signIn.status === 'complete') {
          await signIn.finalize({
            navigate: ({ session, decorateUrl }) => {
              // Handle session tasks
              // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              if (session?.currentTask) {
                console.log(session?.currentTask)
                return
              }

              // If no session tasks, navigate the signed-in user to the home page
              const url = decorateUrl('/')
              if (url.startsWith('http')) {
                window.location.href = url
              } else {
                router.push(url as Href)
              }
            },
          })
        } else {
          // Check why the sign-in is not complete
          console.error('Sign-in attempt not complete:', signIn)
        }
      }

      if (signIn.status === 'needs_client_trust') {
        return (
          <ThemedView style={styles.container}>
            <ThemedText type="title" style={[styles.title, { fontSize: 24, fontWeight: 'bold' }]}>
              Verify your account
            </ThemedText>
            <TextInput
              style={styles.input}
              value={code}
              placeholder="Enter your verification code"
              placeholderTextColor="#666666"
              onChangeText={(code) => setCode(code)}
              keyboardType="numeric"
            />
            {errors.fields.code && (
              <ThemedText style={styles.error}>{errors.fields.code.message}</ThemedText>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                fetchStatus === 'fetching' && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleVerify}
              disabled={fetchStatus === 'fetching'}
            >
              <ThemedText style={styles.buttonText}>Verify</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={() => signIn.mfa.sendEmailCode()}
            >
              <ThemedText style={styles.secondaryButtonText}>I need a new code</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={() => signIn.reset()}
            >
              <ThemedText style={styles.secondaryButtonText}>Start over</ThemedText>
            </Pressable>
          </ThemedView>
        )
      }

      return (
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Sign in
          </ThemedText>

          <ThemedText style={styles.label}>Email address</ThemedText>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor="#666666"
            onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
            keyboardType="email-address"
          />
          {errors.fields.identifier && (
            <ThemedText style={styles.error}>{errors.fields.identifier.message}</ThemedText>
          )}
          <ThemedText style={styles.label}>Password</ThemedText>
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#666666"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
          {errors.fields.password && (
            <ThemedText style={styles.error}>{errors.fields.password.message}</ThemedText>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              (!emailAddress || !password || fetchStatus === 'fetching') && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            disabled={!emailAddress || !password || fetchStatus === 'fetching'}
          >
            <ThemedText style={styles.buttonText}>Continue</ThemedText>
          </Pressable>
          {/* For your debugging purposes. You can just console.log errors, but we put them in the UI for convenience */}
          {errors && <ThemedText style={styles.debug}>{JSON.stringify(errors, null, 2)}</ThemedText>}

          <View style={styles.linkContainer}>
            <ThemedText>Don't have an account? </ThemedText>
            <Link href="/sign-up">
              <ThemedText type="link">Sign up</ThemedText>
            </Link>
          </View>
        </ThemedView>
      )
    }

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 20,
        gap: 12,
      },
      title: {
        marginBottom: 8,
      },
      label: {
        fontWeight: '600',
        fontSize: 14,
      },
      input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
      },
      button: {
        backgroundColor: '#0a7ea4',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
      },
      buttonPressed: {
        opacity: 0.7,
      },
      buttonDisabled: {
        opacity: 0.5,
      },
      buttonText: {
        color: '#fff',
        fontWeight: '600',
      },
      secondaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
      },
      secondaryButtonText: {
        color: '#0a7ea4',
        fontWeight: '600',
      },
      linkContainer: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 12,
        alignItems: 'center',
      },
      error: {
        color: '#d32f2f',
        fontSize: 12,
        marginTop: -8,
      },
      debug: {
        fontSize: 10,
        opacity: 0.5,
        marginTop: 8,
      },
    })
    ```

    For more information about building these custom flows, including guided comments in the code examples, see the [Build a custom email/password authentication flow](https://clerk.com/docs/guides/development/custom-flows/authentication/email-password.md) guide.
11. ## Add a home screen

    You can control which content signed-in and signed-out users can see with Clerk's [`prebuilt control components`](https://clerk.com/docs/expo/reference/components/overview.md#control-components). For this guide, you'll use:

    - [`<Show when="signed-in">`](https://clerk.com/docs/expo/reference/components/control/show.md): Children of this component can only be seen while **signed in**.
    - [`<Show when="signed-out">`](https://clerk.com/docs/expo/reference/components/control/show.md): Children of this component can only be seen while **signed out**.

    1. Create a `(home)` route group.
    2. In the `(home)` group, create a `_layout.tsx` file with the following code.

    ```tsx {{ filename: 'app/(home)/_layout.tsx' }}
    import { useAuth } from '@clerk/expo'
    import { Redirect, Stack } from 'expo-router'

    export default function Layout() {
      const { isSignedIn, isLoaded } = useAuth()

      if (!isLoaded) {
        return null
      }

      if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />
      }

      return <Stack />
    }
    ```

    Then, in the same folder, create an `index.tsx` file. If the user is signed in, it displays their email and a sign-out button. If they're not signed in, it displays sign-in and sign-up links.

    ```tsx {{ filename: 'app/(home)/index.tsx', collapsible: true }}
    import { Show, useUser } from '@clerk/expo'
    import { useClerk } from '@clerk/expo'
    import { Link } from 'expo-router'
    import { Text, View, Pressable, StyleSheet } from 'react-native'

    export default function Page() {
      const { user } = useUser()
      const { signOut } = useClerk()

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Welcome!</Text>
          <Show when="signed-out">
            <Link href="/(auth)/sign-in">
              <Text>Sign in</Text>
            </Link>
            <Link href="/(auth)/sign-up">
              <Text>Sign up</Text>
            </Link>
          </Show>
          <Show when="signed-in">
            <Text>Hello {user?.id}</Text>
            <Pressable style={styles.button} onPress={() => signOut()}>
              <Text style={styles.buttonText}>Sign out</Text>
            </Pressable>
          </Show>
        </View>
      )
    }

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        gap: 16,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
      },
      button: {
        backgroundColor: '#0a7ea4',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
      },
      buttonText: {
        color: '#fff',
        fontWeight: '600',
      },
    })
    ```
12. ## Run your project

    Run your project with the following command:

    ```bash
    npx expo start
    ```

    Then use the terminal shortcuts to run the app on your preferred platform:

    - Press `i` to open the iOS simulator.
    - Press `a` to open the Android emulator.
    - Scan the QR code with Expo Go to run the app on a physical device.
13. ## Create your first user

    Once the app opens on your device or simulator:

    - Navigate to the Sign up screen.
    - Enter your details and complete the authentication flow.
    - After signing up, your first user will be created and you'll be signed in.
14. ## Native sign-in with Google and Apple (optional)

    If you want to add native Sign in with Google and Sign in with Apple buttons that authenticate without opening a browser, you'll need to install `expo-crypto`:

    ```bash
    npx expo install expo-crypto
    ```

    Then, refer to the [`Sign in with Google`](https://clerk.com/docs/expo/guides/configure/auth-strategies/sign-in-with-google.md) and [`Sign in with Apple`](https://clerk.com/docs/expo/guides/configure/auth-strategies/sign-in-with-apple.md) guides for full setup instructions, including any additional dependencies specific to each provider. **This approach requires a [development build](https://docs.expo.dev/develop/development-builds/introduction/) because it uses native modules. It cannot run in Expo Go.**

## Enable OTA updates

Though not required, it is recommended to implement over-the-air (OTA) updates in your Expo app. This enables you to easily roll out Clerk's feature updates and security patches as they're released without having to resubmit your app to mobile marketplaces.

See the [`expo-updates`](https://docs.expo.dev/versions/latest/sdk/updates) library to learn how to get started.

## Next steps

Learn more about Clerk prebuilt components, custom flows for your native apps, and how to deploy an Expo app to production using the following guides.

- [Prebuilt native components (beta)](https://clerk.com/docs/reference/expo/native-components/overview.md): Learn how to quickly add authentication to your app using Clerk's pre-built native UI for iOS and Android.
- [Custom flows](https://clerk.com/docs/guides/development/custom-flows/overview.md): Use custom flows in place of prebuilt components.
- [Protect content and read user data](https://clerk.com/docs/expo/guides/users/reading.md): Learn how to use Clerk's hooks and helpers to protect content and read user data in your Expo app.
- [Deploy an Expo app to production](https://clerk.com/docs/guides/development/deployment/expo.md): Learn how to deploy your Expo app to production.
