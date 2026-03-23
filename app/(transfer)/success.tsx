import { Success } from "@/screens/transfer";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SuccessPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <Success
      amount={params.amount as string}
      fromCurrency={params.fromCurrency as string}
      toCurrency={params.toCurrency as string}
      recipientName={params.recipientName as string}
      onDone={() => router.replace("/(dashboard)/home")}
      onSendAgain={() => router.replace("/(transfer)/send-money")}
    />
  );
}
