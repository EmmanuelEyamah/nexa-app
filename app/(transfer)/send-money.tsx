import { SendMoney } from "@/screens/transfer";
import { useRouter } from "expo-router";

export default function SendMoneyPage() {
  const router = useRouter();

  return (
    <SendMoney
      onContinue={(amount, from, to) =>
        router.push({
          pathname: "/(transfer)/recipients",
          params: { amount, fromCurrency: from, toCurrency: to },
        })
      }
      onBack={() => router.back()}
    />
  );
}
