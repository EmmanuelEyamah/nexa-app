import { ReviewTransfer } from "@/screens/transfer";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ReviewPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <ReviewTransfer
      amount={params.amount as string}
      fromCurrency={params.fromCurrency as string}
      toCurrency={params.toCurrency as string}
      recipient={{
        id: params.recipientId,
        name: params.recipientName,
        bank: params.recipientBank,
        initials: params.recipientInitials,
        color: params.recipientColor,
      }}
      onConfirm={() =>
        router.replace({
          pathname: "/(transfer)/processing",
          params: {
            amount: params.amount as string,
            fromCurrency: params.fromCurrency as string,
            toCurrency: params.toCurrency as string,
            recipientName: params.recipientName as string,
          },
        })
      }
      onBack={() => router.back()}
    />
  );
}
