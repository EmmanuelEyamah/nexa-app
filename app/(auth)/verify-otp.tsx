import { VerifyOtp } from "@/screens";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params.email as string) || "user@example.com";
  const flow = (params.flow as "signup" | "reset") || "signup";

  return (
    <VerifyOtp
      email={email}
      flow={flow}
      onVerify={() => {
        if (flow === "signup") {
          router.replace("/(auth)/email-verified");
        } else {
          router.replace("/(auth)/reset-password");
        }
      }}
      onBack={() => router.back()}
    />
  );
}
