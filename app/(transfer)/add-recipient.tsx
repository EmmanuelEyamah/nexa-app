import { AddRecipient } from "@/screens/transfer";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function AddRecipientPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <AddRecipient
      onSave={(recipient) => {
        // Go to review with the new recipient
        router.replace({
          pathname: "/(transfer)/review",
          params: {
            amount: params.amount as string,
            fromCurrency: params.fromCurrency as string,
            toCurrency: params.toCurrency as string,
            recipientId: recipient.id,
            recipientName: recipient.name,
            recipientBank: recipient.bank,
            recipientInitials: recipient.initials,
            recipientColor: recipient.color,
          },
        });
      }}
      onBack={() => router.back()}
    />
  );
}
