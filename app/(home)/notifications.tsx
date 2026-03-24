import { Notifications } from "@/screens/home";
import { useRouter } from "expo-router";

export default function NotificationsPage() {
  const router = useRouter();

  return <Notifications onBack={() => router.back()} />;
}
