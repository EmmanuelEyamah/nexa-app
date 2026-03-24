import { Fund } from "@/screens/transfer";
import { useRouter } from "expo-router";

export default function FundPage() {
  const router = useRouter();

  return <Fund onBack={() => router.back()} />;
}
