import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface SendMoneyProps {
  onContinue: (
    amount: string,
    fromCurrency: string,
    toCurrency: string,
  ) => void;
  onBack: () => void;
}

const currencies = [
  { code: "USD", symbol: "$", flag: "🇺🇸", balance: 24850 },
  { code: "NGN", symbol: "₦", flag: "🇳🇬", balance: 12500000 },
  { code: "EUR", symbol: "€", flag: "🇪🇺", balance: 8320 },
  { code: "GBP", symbol: "£", flag: "🇬🇧", balance: 6140 },
];

const rates: Record<string, number> = {
  "USD-NGN": 1580.5,
  "USD-EUR": 0.919,
  "USD-GBP": 0.786,
  "EUR-NGN": 1720.3,
  "EUR-USD": 1.088,
  "GBP-NGN": 2010.8,
  "GBP-USD": 1.272,
  "NGN-USD": 0.000633,
};

const getRate = (from: string, to: string) => {
  if (from === to) return 1;
  return rates[`${from}-${to}`] || 1;
};

const formatNumber = (num: string) => {
  const parts = num.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];

export const SendMoney = ({ onContinue, onBack }: SendMoneyProps) => {
  const [amount, setAmount] = useState("");
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const convertAnim = useRef(new Animated.Value(1)).current;

  const [pickerTarget, setPickerTarget] = useState<"from" | "to" | null>(null);

  const from = currencies[fromIdx];
  const to = currencies[toIdx];
  const rate = getRate(from.code, to.code);
  const numericAmount = parseFloat(amount) || 0;
  const converted = numericAmount * rate;
  const fee = numericAmount > 0 ? 2.5 : 0;

  const handleKey = useCallback(
    (key: string) => {
      if (key === "del") {
        setAmount((prev) => prev.slice(0, -1));
      } else if (key === ".") {
        if (!amount.includes(".")) setAmount((prev) => prev + ".");
      } else {
        // Limit decimal places to 2
        const parts = amount.split(".");
        if (parts[1] && parts[1].length >= 2) return;
        // Limit total length
        if (amount.replace(".", "").length >= 10) return;
        setAmount((prev) => prev + key);
      }

      // Subtle conversion animation
      convertAnim.setValue(0.95);
      Animated.spring(convertAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    },
    [amount],
  );

  const swapCurrencies = () => {
    setFromIdx(toIdx);
    setToIdx(fromIdx);
    convertAnim.setValue(0.9);
    Animated.spring(convertAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const displayAmount = amount ? formatNumber(amount) : "0";
  const isValid = numericAmount > 0 && numericAmount <= from.balance;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.backBtn}
        >
          <Ionicons
            name="arrow-back"
            size={wp(22)}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <ThemedText variant="h6" weight="bold">
          Send Money
        </ThemedText>
        <View style={styles.backBtn} />
      </View>

      {/* Amount display area */}
      <View style={styles.amountSection}>
        {/* You send */}
        <View style={styles.amountRow}>
          <ThemedText variant="caption" color="tertiary" weight="medium">
            You send
          </ThemedText>
          <View style={styles.amountDisplay}>
            <ThemedText variant="h1" weight="black" style={styles.amountText}>
              {from.symbol}
              {displayAmount}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.currencyPill} activeOpacity={0.7} onPress={() => setPickerTarget("from")}>
            <ThemedText variant="body" style={styles.flag}>
              {from.flag}
            </ThemedText>
            <ThemedText variant="bodySmall" weight="bold">
              {from.code}
            </ThemedText>
            <Ionicons
              name="chevron-down"
              size={wp(14)}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>
          <ThemedText variant="caption" color="tertiary" weight="medium">
            Available: {from.symbol}
            {from.balance.toLocaleString()}
          </ThemedText>
        </View>

        {/* Swap + rate */}
        <View style={styles.swapRow}>
          <View style={styles.swapLine} />
          <TouchableOpacity
            style={styles.swapButton}
            onPress={swapCurrencies}
            activeOpacity={0.7}
          >
            <Ionicons
              name="swap-vertical"
              size={wp(18)}
              color={colors.primary.main}
            />
          </TouchableOpacity>
          <View style={styles.rateBadge}>
            <ThemedText variant="caption" color="secondary" weight="medium">
              1 {from.code} ={" "}
              {rate < 1
                ? rate.toFixed(6)
                : rate.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}{" "}
              {to.code}
            </ThemedText>
            {fee > 0 && (
              <ThemedText variant="caption" color="tertiary" weight="medium">
                {" "}
                · Fee: {from.symbol}
                {fee.toFixed(2)}
              </ThemedText>
            )}
          </View>
          <View style={styles.swapLine} />
        </View>

        {/* They receive */}
        <Animated.View
          style={[styles.receiveRow, { transform: [{ scale: convertAnim }] }]}
        >
          <ThemedText variant="caption" color="tertiary" weight="medium">
            They receive
          </ThemedText>
          <ThemedText
            variant="h4"
            weight="bold"
            color={numericAmount > 0 ? "success" : "tertiary"}
          >
            {to.symbol}
            {numericAmount > 0
              ? converted.toLocaleString("en-US", { maximumFractionDigits: 2 })
              : "0.00"}
          </ThemedText>
          <TouchableOpacity style={styles.currencyPill} activeOpacity={0.7} onPress={() => setPickerTarget("to")}>
            <ThemedText variant="body" style={styles.flag}>
              {to.flag}
            </ThemedText>
            <ThemedText variant="bodySmall" weight="bold">
              {to.code}
            </ThemedText>
            <Ionicons
              name="chevron-down"
              size={wp(14)}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYS.map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.key}
            onPress={() => handleKey(key)}
            activeOpacity={0.6}
          >
            {key === "del" ? (
              <Ionicons
                name="backspace-outline"
                size={wp(24)}
                color={colors.text.primary}
              />
            ) : (
              <ThemedText variant="h4" weight="medium" align="center">
                {key}
              </ThemedText>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={[styles.ctaButton, !isValid && styles.ctaDisabled]}
          onPress={() => isValid && onContinue(amount, from.code, to.code)}
          activeOpacity={0.8}
          disabled={!isValid}
        >
          <ThemedText variant="button" weight="bold" color="white">
            Continue
          </ThemedText>
          <Ionicons name="arrow-forward" size={wp(18)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Currency picker modal */}
      <Modal
        visible={pickerTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerTarget(null)}
      >
        <TouchableWithoutFeedback onPress={() => setPickerTarget(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <View style={styles.pickerHandle} />
                <ThemedText variant="h6" weight="bold" style={styles.pickerTitle}>
                  {pickerTarget === "from" ? "Send from" : "Send to"}
                </ThemedText>
                {currencies.map((c, i) => {
                  const isActive = pickerTarget === "from" ? i === fromIdx : i === toIdx;
                  const isDisabled = pickerTarget === "from" ? i === toIdx : i === fromIdx;
                  return (
                    <TouchableOpacity
                      key={c.code}
                      style={[
                        styles.pickerItem,
                        isActive && styles.pickerItemActive,
                        isDisabled && { opacity: 0.3 },
                      ]}
                      disabled={isDisabled}
                      onPress={() => {
                        if (pickerTarget === "from") setFromIdx(i);
                        else setToIdx(i);
                        setPickerTarget(null);
                      }}
                      activeOpacity={0.7}
                    >
                      <ThemedText variant="bodyLarge" style={{ fontSize: fs(22) }}>{c.flag}</ThemedText>
                      <View style={{ flex: 1 }}>
                        <ThemedText variant="body" weight={isActive ? "bold" : "medium"}>
                          {c.code}
                        </ThemedText>
                        <ThemedText variant="caption" color="tertiary" weight="medium">
                          Balance: {c.symbol}{c.balance.toLocaleString()}
                        </ThemedText>
                      </View>
                      {isActive && (
                        <Ionicons name="checkmark-circle" size={wp(20)} color={colors.primary.main} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: hp(62),
    paddingHorizontal: wp(24),
    paddingBottom: hp(8),
  },
  backBtn: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },

  // Amount
  amountSection: { paddingHorizontal: wp(24), paddingTop: hp(8) },
  amountRow: { alignItems: "center", gap: hp(6), marginBottom: hp(4) },
  amountDisplay: { flexDirection: "row", alignItems: "baseline" },
  amountText: { fontSize: fs(42), letterSpacing: -fs(1.5), lineHeight: fs(50) },
  currencyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(6),
    paddingVertical: hp(6),
    paddingHorizontal: wp(12),
    borderRadius: wp(10),
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  flag: { fontSize: fs(16) },

  // Swap
  swapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(10),
    marginVertical: hp(10),
  },
  swapLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  swapButton: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: colors.primary.main + "10",
    borderWidth: 1,
    borderColor: colors.primary.main + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  rateBadge: { flexDirection: "row", alignItems: "center" },

  // Receive
  receiveRow: {
    alignItems: "center",
    gap: hp(6),
    paddingVertical: hp(12),
    borderRadius: wp(18),
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    padding: wp(16),
  },

  // Keypad
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: wp(24),
    marginTop: hp(12),
  },
  key: {
    width: "33.33%",
    height: hp(56),
    justifyContent: "center",
    alignItems: "center",
  },

  // CTA
  ctaSection: {
    paddingHorizontal: wp(24),
    paddingBottom: hp(36),
    paddingTop: hp(8),
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(8),
    backgroundColor: colors.primary.main,
    height: hp(58),
    borderRadius: wp(100),
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: hp(8) },
    shadowOpacity: 0.3,
    shadowRadius: wp(16),
    elevation: 8,
  },
  ctaDisabled: { opacity: 0.4 },

  // Currency picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: wp(28),
    borderTopRightRadius: wp(28),
    paddingHorizontal: wp(24),
    paddingTop: hp(10),
    paddingBottom: hp(40),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  pickerHandle: {
    width: wp(40),
    height: hp(4),
    borderRadius: hp(2),
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginBottom: hp(20),
  },
  pickerTitle: {
    marginBottom: hp(16),
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(14),
    paddingVertical: hp(14),
    paddingHorizontal: wp(12),
    borderRadius: wp(14),
    marginBottom: hp(4),
  },
  pickerItemActive: {
    backgroundColor: colors.primary.main + "0A",
  },
});
