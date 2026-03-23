import { Signup } from "@/screens";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "expo-router";

export default function SignupPage() {
  const router = useRouter();

  return (
    <Signup
      onSignup={(email) => {
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { email, flow: "signup" },
        });
      }}
      onLogin={() => router.replace("/(auth)/login")}
      onGoogleSignup={() => router.replace("/(auth)/welcome-back")}
    />
  );
}
