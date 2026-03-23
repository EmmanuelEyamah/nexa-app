import { AppButton } from "@/components/AppButton";
import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

interface SuccessProps {
  amount: string;
  fromCurrency: string;
  toCurrency: string;
  recipientName: string;
  onDone: () => void;
  onSendAgain: () => void;
}

export const Success = ({
  amount,
  fromCurrency,
  toCurrency,
  recipientName,
  onDone,
  onSendAgain,
}: SuccessProps) => {
  const circleScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.5)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(hp(20))).current;

  const numAmount = parseFloat(amount) || 0;
  const rate = fromCurrency === "USD" && toCurrency === "NGN" ? 1580.5 : 1;
  const converted = numAmount * rate;
  const fromSymbol = fromCurrency === "USD" ? "$" : fromCurrency === "EUR" ? "€" : fromCurrency === "GBP" ? "£" : "₦";
  const toSymbol = toCurrency === "NGN" ? "₦" : toCurrency === "USD" ? "$" : toCurrency === "EUR" ? "€" : "£";

  useEffect(() => {
    // Circle scales in
    Animated.spring(circleScale, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // Check appears after circle
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(checkScale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
      ]).start();
    }, 300);

    // Content fades in
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(contentTranslateY, { toValue: 0, friction: 10, tension: 50, useNativeDriver: true }),
      ]).start();
    }, 600);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Checkmark animation */}
        <Animated.View style={[styles.circleWrap, { transform: [{ scale: circleScale }] }]}>
          <View style={styles.circle}>
            <Animated.View style={{ opacity: checkOpacity, transform: [{ scale: checkScale }] }}>
              <Ionicons name="checkmark" size={wp(44)} color="#FFFFFF" />
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textBlock,
            { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
          ]}
        >
          <ThemedText variant="h4" weight="black" align="center">
            Transfer Sent!
          </ThemedText>

          {/* Amount summary */}
          <View style={styles.amountSummary}>
            <ThemedText variant="h5" weight="bold" align="center">
              {fromSymbol}{numAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </ThemedText>
            <Ionicons name="arrow-forward" size={wp(16)} color={colors.text.tertiary} />
            <ThemedText variant="h5" weight="bold" color="success" align="center">
              {toSymbol}{converted.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </ThemedText>
          </View>

          <ThemedText variant="body" color="secondary" align="center">
            to {recipientName}
          </ThemedText>

          <View style={styles.deliveryBadge}>
            <Ionicons name="flash" size={wp(14)} color={colors.status.success} />
            <ThemedText variant="caption" weight="semiBold" color="success">
              Arrives within minutes
            </ThemedText>
          </View>

          <ThemedText variant="caption" color="tertiary" align="center">
            Ref: NEX-{Date.now().toString().slice(-8)}
          </ThemedText>
        </Animated.View>
      </View>

      {/* CTAs */}
      <Animated.View style={[styles.ctaSection, { opacity: contentOpacity }]}>
        {/* Share receipt */}
        <TouchableOpacity style={styles.shareReceiptBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={wp(18)} color={colors.primary.main} />
          <ThemedText variant="body" weight="semiBold" color="accent">
            Share Receipt
          </ThemedText>
        </TouchableOpacity>

        <AppButton
          title="Done"
          onPress={onDone}
          variant="primary"
          size="large"
          fullWidth
        />
        <TouchableOpacity style={styles.sendAgainBtn} onPress={onSendAgain} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={wp(16)} color={colors.primary.main} />
          <ThemedText variant="bodySmall" weight="semiBold" color="accent">
            Send Again
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { flex: 1, justifyContent: "center", alignItems: "center", gap: hp(28), paddingBottom: hp(20) },

  circleWrap: {},
  circle: {
    width: wp(90), height: wp(90), borderRadius: wp(45),
    backgroundColor: colors.status.success, justifyContent: "center", alignItems: "center",
    shadowColor: colors.status.success, shadowOffset: { width: 0, height: hp(12) }, shadowOpacity: 0.35, shadowRadius: wp(20), elevation: 12,
  },

  textBlock: { alignItems: "center", gap: hp(10), paddingHorizontal: wp(32) },
  amountSummary: { flexDirection: "row", alignItems: "center", gap: wp(10) },
  deliveryBadge: {
    flexDirection: "row", alignItems: "center", gap: wp(6),
    paddingHorizontal: wp(14), paddingVertical: hp(6),
    borderRadius: wp(20), backgroundColor: colors.status.success + "10",
    borderWidth: 1, borderColor: colors.status.success + "20",
    marginTop: hp(4),
  },

  ctaSection: { paddingHorizontal: wp(24), paddingBottom: hp(50), gap: hp(12), alignItems: "center" },
  shareReceiptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(8),
    width: "100%",
    height: hp(54),
    borderRadius: wp(100),
    borderWidth: 1,
    borderColor: colors.primary.main + "25",
    backgroundColor: colors.primary.main + "08",
    marginBottom: hp(4),
  },
  sendAgainBtn: { flexDirection: "row", alignItems: "center", gap: wp(6), padding: hp(8) },
});
