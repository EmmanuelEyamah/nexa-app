import { Processing } from "@/screens/transfer";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ProcessingPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <Processing
      recipientName={params.recipientName as string}
      onComplete={() =>
        router.replace({
          pathname: "/(transfer)/success",
          params: {
            amount: params.amount as string,
            fromCurrency: params.fromCurrency as string,
            toCurrency: params.toCurrency as string,
            recipientName: params.recipientName as string,
          },
        })
      }
    />
  );
}
