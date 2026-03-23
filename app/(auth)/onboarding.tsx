import { Onboarding } from "@/screens";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(auth)/signup");
  };

  const handleLogin = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(auth)/login");
  };

  return <Onboarding onComplete={handleComplete} onLogin={handleLogin} />;
}
