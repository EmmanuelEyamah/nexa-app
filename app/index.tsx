import { SplashScreenOverlay } from "@/components/SplashScreenOverlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");

      if (hasSeenOnboarding !== "true") {
        router.replace("/(auth)/onboarding");
        return;
      }

      // Check if authenticated
      const raw = await AsyncStorage.getItem("nexa-auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.token) {
          router.replace("/(dashboard)/home");
          return;
        }
      }

      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error:", error);
      router.replace("/(auth)/onboarding");
    }
  };

  return <SplashScreenOverlay />;
};

export default Index;
