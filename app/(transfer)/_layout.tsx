import { Stack } from "expo-router";

export default function TransferLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0B0F14" },
        animation: "slide_from_right",
      }}
    />
  );
}
