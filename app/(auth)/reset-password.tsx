import { ResetPassword } from "@/screens";
import { useRouter } from "expo-router";

export default function ResetPasswordPage() {
  const router = useRouter();

  return (
    <ResetPassword
      onReset={() => router.replace("/(auth)/login")}
    />
  );
}
