import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ReviewTransferProps {
  amount: string;
  fromCurrency: string;
  toCurrency: string;
  recipient: any;
  onConfirm: () => void;
  onBack: () => void;
}

export const ReviewTransfer = ({
  amount,
  fromCurrency,
  toCurrency,
  recipient,
  onConfirm,
  onBack,
}: ReviewTransferProps) => {
  const [loading, setLoading] = useState(false);
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(hp(16))).current;

  const numAmount = parseFloat(amount) || 0;
  const rate = fromCurrency === "USD" && toCurrency === "NGN" ? 1580.5 : 1;
  const fee = 2.5;
  const total = numAmount + fee;
  const converted = numAmount * rate;
  const fromSymbol = fromCurrency === "USD" ? "$" : fromCurrency === "EUR" ? "€" : fromCurrency === "GBP" ? "£" : "₦";
  const toSymbol = toCurrency === "NGN" ? "₦" : toCurrency === "USD" ? "$" : toCurrency === "EUR" ? "€" : "£";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(cardTranslateY, { toValue: 0, friction: 10, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const [securitySheetVisible, setSecuritySheetVisible] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const pinRefs = useRef<any[]>([]);

  const handleConfirmPress = () => {
    setPin(["", "", "", ""]);
    setPinError("");
    setSecuritySheetVisible(true);
  };

  const handlePinChange = (text: string, index: number) => {
    if (text.length > 1) return;
    if (text && !/^\d+$/.test(text)) return;
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);
    setPinError("");
    if (text && index < 3) pinRefs.current[index + 1]?.focus();
    // Auto-submit when all 4 digits entered
    if (text && index === 3) {
      setTimeout(() => handlePinSubmit(newPin), 200);
    }
  };

  const handlePinKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handlePinSubmit = (currentPin: string[]) => {
    const code = currentPin.join("");
    if (code.length !== 4) {
      setPinError("Enter your 4-digit PIN");
      return;
    }
    // Simulate PIN verification
    setSecuritySheetVisible(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm();
    }, 1500);
  };

  const handleBiometricAuth = () => {
    // Simulate biometric success
    setSecuritySheetVisible(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm();
    }, 1500);
  };

  const details = [
    { label: "Exchange Rate", value: `1 ${fromCurrency} = ${rate.toLocaleString()} ${toCurrency}` },
    { label: "Transfer Fee", value: `${fromSymbol}${fee.toFixed(2)}` },
    { label: "Total Cost", value: `${fromSymbol}${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, bold: true },
    { label: "Delivery", value: "Within minutes" },
    { label: "Reference", value: `NEX-${Date.now().toString().slice(-8)}` },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
        </TouchableOpacity>
        <ThemedText variant="h6" weight="bold">Review Transfer</ThemedText>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
          {/* Recipient */}
          <View style={styles.recipientBlock}>
            <View style={[styles.avatar, { backgroundColor: (recipient?.color || colors.primary.main) + "15" }]}>
              <ThemedText variant="body" weight="bold" style={{ color: recipient?.color || colors.primary.main }}>
                {recipient?.initials || "?"}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText variant="body" weight="semiBold">{recipient?.name || "Recipient"}</ThemedText>
              <ThemedText variant="caption" color="tertiary" weight="medium">
                {recipient?.bank || "Bank account"}
              </ThemedText>
            </View>
          </View>

          {/* Amount block */}
          <View style={styles.amountBlock}>
            <ThemedText variant="caption" color="tertiary" weight="medium">They receive</ThemedText>
            <ThemedText variant="h2" weight="black" color="success" style={styles.receiveAmount}>
              {toSymbol}{converted.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </ThemedText>
            <ThemedText variant="bodySmall" color="secondary" weight="medium">
              You send {fromSymbol}{numAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {fromCurrency}
            </ThemedText>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details */}
          {details.map((item) => (
            <View key={item.label} style={styles.detailRow}>
              <ThemedText variant="bodySmall" color="tertiary" weight="medium">{item.label}</ThemedText>
              <ThemedText variant="bodySmall" weight={item.bold ? "bold" : "semiBold"}>
                {item.value}
              </ThemedText>
            </View>
          ))}
        </Animated.View>

        {/* Trust note */}
        <View style={styles.trustNote}>
          <Ionicons name="shield-checkmark-outline" size={wp(16)} color={colors.text.tertiary} />
          <ThemedText variant="caption" color="tertiary" weight="medium" style={{ flex: 1 }}>
            Your transfer is protected by 256-bit encryption. Funds will be deducted from your {fromCurrency} wallet.
          </ThemedText>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={[styles.ctaButton, loading && { opacity: 0.6 }]}
          onPress={handleConfirmPress}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ThemedText variant="button" weight="bold" color="white">Confirming...</ThemedText>
          ) : (
            <>
              <Ionicons name="lock-closed" size={wp(16)} color="#FFFFFF" />
              <ThemedText variant="button" weight="bold" color="white">Confirm & Send</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Security confirmation sheet */}
      <Modal
        visible={securitySheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSecuritySheetVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSecuritySheetVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.securitySheet}>
                <View style={styles.sheetHandle} />

                {/* Lock icon */}
                <View style={styles.securityIconWrap}>
                  <Ionicons name="lock-closed" size={wp(28)} color={colors.primary.main} />
                </View>

                <ThemedText variant="h5" weight="bold" align="center" style={styles.securityTitle}>
                  Enter your PIN
                </ThemedText>
                <ThemedText variant="bodySmall" color="secondary" align="center" style={styles.securitySubtitle}>
                  Confirm sending {fromSymbol}{numAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} to {recipient?.name || "recipient"}
                </ThemedText>

                {/* PIN inputs */}
                <View style={styles.pinRow}>
                  {pin.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={(ref) => (pinRefs.current[i] = ref)}
                      style={[
                        styles.pinInput,
                        digit ? styles.pinInputFilled : null,
                        pinError ? styles.pinInputError : null,
                      ]}
                      value={digit ? "●" : ""}
                      onChangeText={(text) => handlePinChange(text, i)}
                      onKeyPress={(e) => handlePinKeyPress(e, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      secureTextEntry
                    />
                  ))}
                </View>

                {pinError ? (
                  <ThemedText variant="caption" color="error" align="center" style={{ marginBottom: hp(12) }}>
                    {pinError}
                  </ThemedText>
                ) : null}

                {/* Divider */}
                <View style={styles.orDivider}>
                  <View style={styles.orLine} />
                  <ThemedText variant="caption" color="tertiary" weight="medium" style={styles.orText}>
                    or use
                  </ThemedText>
                  <View style={styles.orLine} />
                </View>

                {/* Biometric option */}
                <TouchableOpacity
                  style={styles.biometricBtn}
                  onPress={handleBiometricAuth}
                  activeOpacity={0.7}
                >
                  <View style={styles.biometricIcon}>
                    <Ionicons name="finger-print" size={wp(24)} color={colors.primary.main} />
                  </View>
                  <ThemedText variant="bodySmall" weight="semiBold" color="accent">
                    Authenticate with biometrics
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.securityCancelBtn}
                  onPress={() => setSecuritySheetVisible(false)}
                  activeOpacity={0.7}
                >
                  <ThemedText variant="bodySmall" weight="medium" color="tertiary">
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
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
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: hp(62), paddingHorizontal: wp(24), paddingBottom: hp(12),
  },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: wp(24), paddingBottom: hp(20) },

  card: {
    borderRadius: wp(22), borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: colors.background.secondary, padding: wp(22), marginBottom: hp(16),
  },
  recipientBlock: {
    flexDirection: "row", alignItems: "center", gap: wp(14),
    paddingBottom: hp(18), borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)", marginBottom: hp(18),
  },
  avatar: {
    width: wp(48), height: wp(48), borderRadius: wp(16), justifyContent: "center", alignItems: "center",
  },
  amountBlock: { alignItems: "center", paddingVertical: hp(16), gap: hp(6) },
  receiveAmount: { letterSpacing: -fs(0.5) },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.04)", marginVertical: hp(16) },
  detailRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: hp(12),
  },

  trustNote: {
    flexDirection: "row", alignItems: "flex-start", gap: wp(10),
    padding: wp(16), borderRadius: wp(14),
    backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
  },

  ctaSection: { paddingHorizontal: wp(24), paddingBottom: hp(36), paddingTop: hp(8) },
  ctaButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: wp(8),
    backgroundColor: colors.primary.main, height: hp(58), borderRadius: wp(100),
    shadowColor: colors.primary.main, shadowOffset: { width: 0, height: hp(8) }, shadowOpacity: 0.3, shadowRadius: wp(16), elevation: 8,
  },

  // Security sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  securitySheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: wp(28),
    borderTopRightRadius: wp(28),
    paddingHorizontal: wp(24),
    paddingTop: hp(10),
    paddingBottom: hp(40),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  sheetHandle: {
    width: wp(40),
    height: hp(4),
    borderRadius: hp(2),
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: hp(20),
  },
  securityIconWrap: {
    width: wp(64),
    height: wp(64),
    borderRadius: wp(32),
    backgroundColor: colors.primary.main + "12",
    borderWidth: 1,
    borderColor: colors.primary.main + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(16),
  },
  securityTitle: {
    marginBottom: hp(8),
  },
  securitySubtitle: {
    marginBottom: hp(20),
    maxWidth: wp(300),
    lineHeight: hp(22),
  },
  pinRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: wp(14),
    marginBottom: hp(16),
  },
  pinInput: {
    width: wp(52),
    height: wp(56),
    borderRadius: wp(16),
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: colors.background.primary,
    textAlign: "center",
    fontSize: fs(24),
    fontFamily: "Satoshi-Bold",
    color: colors.text.primary,
  },
  pinInputFilled: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + "08",
  },
  pinInputError: {
    borderColor: colors.status.error,
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: hp(18),
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  orText: {
    marginHorizontal: wp(14),
  },
  biometricBtn: {
    alignItems: "center",
    gap: hp(10),
    marginBottom: hp(16),
    paddingVertical: hp(8),
  },
  biometricIcon: {
    width: wp(56),
    height: wp(56),
    borderRadius: wp(28),
    borderWidth: 1,
    borderColor: colors.primary.main + "25",
    backgroundColor: colors.primary.main + "08",
    justifyContent: "center",
    alignItems: "center",
  },
  securityCancelBtn: {
    paddingVertical: hp(8),
  },
});
