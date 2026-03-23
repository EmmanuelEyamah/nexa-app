/* eslint-disable react/display-name */
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Satoshi-Light": require("../assets/fonts/Satoshi-Light.otf"),
    "Satoshi-Regular": require("../assets/fonts/Satoshi-Regular.otf"),
    "Satoshi-Medium": require("../assets/fonts/Satoshi-Medium.otf"),
    "Satoshi-Bold": require("../assets/fonts/Satoshi-Bold.otf"),
    "Satoshi-Black": require("../assets/fonts/Satoshi-Black.otf"),
    Satoshi: require("../assets/fonts/Satoshi-Regular.otf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0B0F14" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(dashboard)"
          options={{ headerShown: false, animation: "fade" }}
        />
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="(transfer)" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </>
  );
};

export default function () {
  return <RootLayout />;
}
