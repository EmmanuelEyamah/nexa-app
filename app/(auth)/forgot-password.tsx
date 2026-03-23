import { ForgotPassword } from "@/screens";
import { useRouter } from "expo-router";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <ForgotPassword
      onSubmit={(email) => {
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { email, flow: "reset" },
        });
      }}
      onBack={() => router.back()}
    />
  );
}
