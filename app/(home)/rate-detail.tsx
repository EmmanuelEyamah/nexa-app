import { RateDetail } from "@/screens/home";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function RateDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <RateDetail
      rateId={(id as string) || "1"}
      onBack={() => router.back()}
      onConvert={() => router.push("/(transfer)/convert")}
      onSwap={() => router.push("/(transfer)/convert")}
    />
  );
}
