import { EmailVerified } from "@/screens";
import { useRouter } from "expo-router";

export default function EmailVerifiedPage() {
  const router = useRouter();

  return (
    <EmailVerified
      onGoHome={() => router.replace("/(dashboard)/home")}
      onVerifyIdentity={() => router.replace("/(dashboard)/home")}
    />
  );
}
