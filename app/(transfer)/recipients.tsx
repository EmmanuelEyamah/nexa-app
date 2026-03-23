import { Recipients } from "@/screens/transfer";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function RecipientsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <Recipients
      onSelect={(recipient) =>
        router.push({
          pathname: "/(transfer)/review",
          params: {
            amount: params.amount as string,
            fromCurrency: params.fromCurrency as string,
            toCurrency: params.toCurrency as string,
            recipientId: recipient.id,
            recipientName: recipient.name,
            recipientBank: recipient.bank || "",
            recipientInitials: recipient.initials,
            recipientColor: recipient.color,
          },
        })
      }
      onAddNew={() =>
        router.push({
          pathname: "/(transfer)/add-recipient",
          params: {
            amount: params.amount as string,
            fromCurrency: params.fromCurrency as string,
            toCurrency: params.toCurrency as string,
          },
        })
      }
      onBack={() => router.back()}
    />
  );
}
