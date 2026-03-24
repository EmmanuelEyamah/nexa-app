import { Receive } from "@/screens/transfer";
import { useRouter } from "expo-router";

export default function ReceivePage() {
  const router = useRouter();

  return <Receive onBack={() => router.back()} />;
}
