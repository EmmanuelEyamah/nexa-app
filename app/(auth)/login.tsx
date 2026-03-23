import { Login } from "@/screens";
import { useRouter } from "expo-router";

export default function LoginPage() {
  const router = useRouter();

  return (
    <Login
      onLogin={() => router.replace("/(dashboard)/home")}
      onForgotPassword={() => router.push("/(auth)/forgot-password")}
      onSignUp={() => router.replace("/(auth)/signup")}
      onGoogleLogin={() => router.replace("/(dashboard)/home")}
    />
  );
}
