import { WelcomeBack } from "@/screens";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "expo-router";

export default function WelcomeBackPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  return (
    <WelcomeBack
      userName={user?.full_name || "John Doe"}
      onUnlock={() => router.replace("/(dashboard)/home")}
      onBiometric={() => router.replace("/(dashboard)/home")}
      onSwitchAccount={() => router.replace("/(auth)/login")}
      onForgotPassword={() => router.push("/(auth)/forgot-password")}
    />
  );
}
