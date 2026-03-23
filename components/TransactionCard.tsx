import { ThemedText } from "@/components/ThemedText";
import { RecentTransaction } from "@/constants/data";
import { colors } from "@/utils/colors";
import { hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface TransactionCardProps {
  transaction: RecentTransaction;
  onPress?: () => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  completed: { bg: colors.status.success + "12", text: colors.status.success },
  processing: { bg: colors.primary.main + "12", text: colors.primary.main },
  pending: { bg: colors.status.warning + "12", text: colors.status.warning },
  failed: { bg: colors.status.error + "12", text: colors.status.error },
};

const formatAmount = (amount: number, symbol: string) => {
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: amount >= 10000 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export const TransactionCard = ({
  transaction,
  onPress,
}: TransactionCardProps) => {
  const isSend = transaction.type === "send";
  const statusStyle = statusColors[transaction.status];
  const initials = transaction.recipientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: isSend
              ? colors.primary.main + "12"
              : colors.status.success + "12",
          },
        ]}
      >
        <ThemedText
          variant="caption"
          weight="bold"
          color={isSend ? "accent" : "success"}
        >
          {initials}
        </ThemedText>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <ThemedText variant="bodySmall" weight="semiBold" numberOfLines={1}>
          {transaction.recipientName}
        </ThemedText>
        <ThemedText variant="caption" color="tertiary" weight="medium">
          {transaction.date}
        </ThemedText>
      </View>

      {/* Right side */}
      <View style={styles.rightCol}>
        <ThemedText
          variant="bodySmall"
          weight="bold"
          color={isSend ? "primary" : "success"}
        >
          {isSend ? "- " : "+ "}
          {formatAmount(transaction.amount, transaction.symbol)}
        </ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <ThemedText
            variant="overline"
            weight="bold"
            style={{ color: statusStyle.text }}
          >
            {transaction.status.charAt(0).toUpperCase() +
              transaction.status.slice(1)}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(12),
    paddingVertical: hp(14),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  avatar: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(14),
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    gap: hp(2),
  },
  rightCol: {
    alignItems: "flex-end",
    gap: hp(4),
  },
  statusBadge: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    borderRadius: wp(8),
  },
});
