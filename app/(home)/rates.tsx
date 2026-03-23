import { AllRates } from "@/screens/home";
import { useRouter } from "expo-router";

export default function RatesPage() {
  const router = useRouter();

  return (
    <AllRates
      onBack={() => router.back()}
      onRatePress={(rateId) =>
        router.push({ pathname: "/(home)/rate-detail", params: { id: rateId } })
      }
    />
  );
}
