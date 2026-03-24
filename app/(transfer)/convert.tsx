import { Convert } from "@/screens/transfer";
import { useRouter } from "expo-router";

export default function ConvertPage() {
  const router = useRouter();

  return <Convert onBack={() => router.back()} />;
}
