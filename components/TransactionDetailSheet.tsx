import { ThemedText } from "@/components/ThemedText";
import { RecentTransaction } from "@/constants/data";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface TransactionDetailSheetProps {
  transaction: RecentTransaction | null;
  visible: boolean;
  onClose: () => void;
}

const statusConfig: Record<
  string,
  { color: string; bg: string; icon: string; label: string }
> = {
  completed: {
    color: colors.status.success,
    bg: colors.status.success + "12",
    icon: "checkmark-circle",
    label: "Completed",
  },
  processing: {
    color: colors.primary.main,
    bg: colors.primary.main + "12",
    icon: "sync-circle",
    label: "Processing",
  },
  pending: {
    color: colors.status.warning,
    bg: colors.status.warning + "12",
    icon: "time",
    label: "Pending",
  },
  failed: {
    color: colors.status.error,
    bg: colors.status.error + "12",
    icon: "close-circle",
    label: "Failed",
  },
};

const formatAmount = (amount: number, symbol: string) =>
  `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: amount >= 10000 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

export const TransactionDetailSheet = ({
  transaction,
  visible,
  onClose,
}: TransactionDetailSheetProps) => {
  const slideAnim = useRef(new Animated.Value(hp(500))).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 10,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: hp(500),
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!transaction) return null;

  const isSend = transaction.type === "send";
  const status = statusConfig[transaction.status];
  const initials = transaction.recipientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const details = [
    { label: "Reference", value: `NEX-${transaction.id.padStart(8, "0")}` },
    { label: "Type", value: isSend ? "Outgoing Transfer" : "Incoming Transfer" },
    { label: "Currency", value: transaction.currency },
    { label: "Fee", value: isSend ? `${transaction.symbol}2.50` : "Free" },
    { label: "Exchange Rate", value: "1 USD = 1,580.50 NGN" },
    { label: "Date", value: transaction.date },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
            >
              {/* Handle bar */}
              <View style={styles.handleBar} />

              {/* Status badge */}
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Ionicons name={status.icon as any} size={wp(16)} color={status.color} />
                <ThemedText variant="bodySmall" weight="bold" style={{ color: status.color }}>
                  {status.label}
                </ThemedText>
              </View>

              {/* Amount */}
              <ThemedText variant="h2" weight="black" align="center" style={styles.amount}>
                {isSend ? "- " : "+ "}
                {formatAmount(transaction.amount, transaction.symbol)}
              </ThemedText>

              {/* Recipient */}
              <View style={styles.recipientRow}>
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
                    variant="bodySmall"
                    weight="bold"
                    color={isSend ? "accent" : "success"}
                  >
                    {initials}
                  </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" weight="semiBold">
                    {transaction.recipientName}
                  </ThemedText>
                  <ThemedText variant="caption" color="tertiary" weight="medium">
                    {isSend ? "Recipient" : "Sender"}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={wp(18)} color={colors.text.tertiary} />
              </View>

              {/* Details */}
              <View style={styles.detailsCard}>
                {details.map((item, i) => (
                  <View
                    key={item.label}
                    style={[
                      styles.detailRow,
                      i < details.length - 1 && styles.detailRowBorder,
                    ]}
                  >
                    <ThemedText variant="bodySmall" color="tertiary" weight="medium">
                      {item.label}
                    </ThemedText>
                    <ThemedText variant="bodySmall" weight="semiBold">
                      {item.value}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                  <Ionicons name="share-outline" size={wp(18)} color={colors.primary.main} />
                  <ThemedText variant="caption" weight="semiBold" color="accent">
                    Share
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                  <Ionicons name="receipt-outline" size={wp(18)} color={colors.primary.main} />
                  <ThemedText variant="caption" weight="semiBold" color="accent">
                    Receipt
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                  <Ionicons name="help-circle-outline" size={wp(18)} color={colors.primary.main} />
                  <ThemedText variant="caption" weight="semiBold" color="accent">
                    Support
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: wp(28),
    borderTopRightRadius: wp(28),
    paddingHorizontal: wp(24),
    paddingTop: hp(10),
    paddingBottom: hp(40),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  handleBar: {
    width: wp(40),
    height: hp(4),
    borderRadius: hp(2),
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginBottom: hp(20),
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: wp(6),
    paddingHorizontal: wp(14),
    paddingVertical: hp(6),
    borderRadius: wp(20),
    marginBottom: hp(12),
  },
  amount: {
    marginBottom: hp(20),
    letterSpacing: -fs(0.5),
  },
  recipientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(12),
    paddingVertical: hp(14),
    paddingHorizontal: wp(14),
    backgroundColor: colors.background.primary,
    borderRadius: wp(16),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: hp(16),
  },
  avatar: {
    width: wp(42),
    height: wp(42),
    borderRadius: wp(14),
    justifyContent: "center",
    alignItems: "center",
  },
  detailsCard: {
    backgroundColor: colors.background.primary,
    borderRadius: wp(16),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: wp(16),
    marginBottom: hp(20),
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(14),
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: wp(24),
  },
  actionButton: {
    alignItems: "center",
    gap: hp(6),
    paddingVertical: hp(8),
    paddingHorizontal: wp(16),
  },
});
