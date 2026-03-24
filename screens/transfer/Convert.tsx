import { AppButton } from "@/components/AppButton";
import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { fs, hp, SCREEN_WIDTH, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ConvertProps {
  onBack: () => void;
}

const wallets = [
  { code: "USD", symbol: "$", flag: "\u{1F1FA}\u{1F1F8}", name: "US Dollar", balance: 24850 },
  { code: "NGN", symbol: "\u20A6", flag: "\u{1F1F3}\u{1F1EC}", name: "Nigerian Naira", balance: 12500000 },
  { code: "EUR", symbol: "\u20AC", flag: "\u{1F1EA}\u{1F1FA}", name: "Euro", balance: 8320 },
  { code: "GBP", symbol: "\u00A3", flag: "\u{1F1EC}\u{1F1E7}", name: "British Pound", balance: 6140 },
  { code: "KES", symbol: "KSh", flag: "\u{1F1F0}\u{1F1EA}", name: "Kenyan Shilling", balance: 1250000 },
];

const rates: Record<string, number> = {
  "USD-NGN": 1580.5, "USD-EUR": 0.919, "USD-GBP": 0.786, "USD-KES": 129.4,
  "NGN-USD": 0.000633, "NGN-EUR": 0.00058, "NGN-GBP": 0.000497, "NGN-KES": 0.0819,
  "EUR-USD": 1.088, "EUR-NGN": 1720.3, "EUR-GBP": 0.856, "EUR-KES": 140.8,
  "GBP-USD": 1.272, "GBP-NGN": 2010.8, "GBP-EUR": 1.168, "GBP-KES": 164.5,
  "KES-USD": 0.00773, "KES-NGN": 12.21, "KES-EUR": 0.0071, "KES-GBP": 0.00608,
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

const formatRate = (r: number) => {
  if (r >= 100) return r.toFixed(2);
  if (r >= 1) return r.toFixed(4);
  return r.toFixed(6);
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];
const SLIDER_WIDTH = SCREEN_WIDTH - wp(48);
const THUMB_SIZE = wp(56);
const SLIDE_THRESHOLD = SLIDER_WIDTH - THUMB_SIZE - wp(8);

export const Convert = ({ onBack }: ConvertProps) => {
  const [amount, setAmount] = useState("");
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(2);
  const [pickerTarget, setPickerTarget] = useState<"from" | "to" | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animations
  const convertAnim = useRef(new Animated.Value(1)).current;
  const swapRotation = useRef(new Animated.Value(0)).current;
  const swapCount = useRef(0);
  const fromCardScale = useRef(new Animated.Value(0.95)).current;
  const fromCardOpacity = useRef(new Animated.Value(0)).current;
  const toCardScale = useRef(new Animated.Value(0.95)).current;
  const toCardOpacity = useRef(new Animated.Value(0)).current;
  const keypadOpacity = useRef(new Animated.Value(0)).current;
  const keypadSlide = useRef(new Animated.Value(hp(30))).current;

  // Slider
  const slideX = useRef(new Animated.Value(0)).current;
  const slideProgress = useRef(0);
  const sliderGlow = useRef(new Animated.Value(0.4)).current;

  // Confirm overlay
  const confirmSlide = useRef(new Animated.Value(hp(600))).current;
  const confirmOpacity = useRef(new Animated.Value(0)).current;

  // Processing
  const processingDots = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;
  const processingRotation = useRef(new Animated.Value(0)).current;

  // Success
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successCheckDraw = useRef(new Animated.Value(0)).current;

  const from = wallets[fromIdx];
  const to = wallets[toIdx];
  const rate = getRate(from.code, to.code);
  const numericAmount = parseFloat(amount) || 0;
  const converted = numericAmount * rate;
  const isValid = numericAmount > 0 && numericAmount <= from.balance;
  const isValidRef = useRef(isValid);
  isValidRef.current = isValid;
  const exceeds = numericAmount > from.balance;
  const displayAmount = amount ? formatNumber(amount) : "0";

  // Entry animations
  useEffect(() => {
    const ease = Easing.bezier(0.22, 1, 0.36, 1);
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fromCardOpacity, { toValue: 1, duration: 500, easing: ease, useNativeDriver: true }),
        Animated.spring(fromCardScale, { toValue: 1, friction: 10, tension: 60, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(toCardOpacity, { toValue: 1, duration: 500, easing: ease, useNativeDriver: true }),
        Animated.spring(toCardScale, { toValue: 1, friction: 10, tension: 60, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(keypadOpacity, { toValue: 1, duration: 400, easing: ease, useNativeDriver: true }),
        Animated.spring(keypadSlide, { toValue: 0, friction: 12, tension: 50, useNativeDriver: true }),
      ]),
    ]).start();

    // Slider shimmer
    Animated.loop(
      Animated.sequence([
        Animated.timing(sliderGlow, { toValue: 0.8, duration: 1200, useNativeDriver: true }),
        Animated.timing(sliderGlow, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Swipe to convert pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isValidRef.current,
      onMoveShouldSetPanResponder: () => isValidRef.current,
      onPanResponderMove: (_, gesture) => {
        const x = Math.max(0, Math.min(gesture.dx, SLIDE_THRESHOLD));
        slideX.setValue(x);
        slideProgress.current = x / SLIDE_THRESHOLD;
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx >= SLIDE_THRESHOLD * 0.85) {
          Animated.spring(slideX, {
            toValue: SLIDE_THRESHOLD,
            friction: 8,
            tension: 80,
            useNativeDriver: false,
          }).start(() => {
            openConfirm();
          });
        } else {
          Animated.spring(slideX, {
            toValue: 0,
            friction: 8,
            tension: 60,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const openConfirm = () => {
    setShowConfirm(true);
    Animated.parallel([
      Animated.timing(confirmOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(confirmSlide, { toValue: 0, friction: 10, tension: 50, useNativeDriver: true }),
    ]).start();
  };

  const closeConfirm = () => {
    Animated.parallel([
      Animated.timing(confirmOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(confirmSlide, { toValue: hp(600), duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setShowConfirm(false);
      slideX.setValue(0);
    });
  };

  const startProcessing = () => {
    setShowProcessing(true);

    // Spinning animation
    Animated.loop(
      Animated.timing(processingRotation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Dot pulse
    const animateDots = () => {
      Animated.stagger(200, processingDots.map((dot) =>
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      )).start();
    };
    animateDots();
    const dotInterval = setInterval(animateDots, 900);

    setTimeout(() => {
      clearInterval(dotInterval);
      setShowProcessing(false);
      processingRotation.setValue(0);
      showSuccessScreen();
    }, 2500);
  };

  const showSuccessScreen = () => {
    setShowSuccess(true);
    Animated.stagger(200, [
      Animated.spring(successScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(successCheckDraw, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  const handleDone = () => {
    setShowSuccess(false);
    setShowConfirm(false);
    successScale.setValue(0);
    successOpacity.setValue(0);
    successCheckDraw.setValue(0);
    slideX.setValue(0);
    setAmount("");
    onBack();
  };

  const handleKey = useCallback(
    (key: string) => {
      if (key === "del") {
        setAmount((prev) => prev.slice(0, -1));
      } else if (key === ".") {
        if (!amount.includes(".")) setAmount((prev) => prev + ".");
      } else {
        const parts = amount.split(".");
        if (parts[1] && parts[1].length >= 2) return;
        if (amount.replace(".", "").length >= 10) return;
        setAmount((prev) => prev + key);
      }
      convertAnim.setValue(0.97);
      Animated.spring(convertAnim, { toValue: 1, friction: 8, tension: 120, useNativeDriver: true }).start();
    },
    [amount]
  );

  const swapCurrencies = () => {
    swapCount.current += 1;
    Animated.timing(swapRotation, {
      toValue: swapCount.current,
      duration: 400,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();
    Animated.parallel([
      Animated.sequence([
        Animated.timing(fromCardScale, { toValue: 0.92, duration: 150, useNativeDriver: true }),
        Animated.spring(fromCardScale, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(toCardScale, { toValue: 0.92, duration: 150, useNativeDriver: true }),
        Animated.spring(toCardScale, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }),
      ]),
    ]).start();
    setFromIdx(toIdx);
    setToIdx(fromIdx);
  };

  const spin = swapRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const processingSpin = processingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const sliderFillWidth = slideX.interpolate({
    inputRange: [0, SLIDE_THRESHOLD],
    outputRange: [0, SLIDE_THRESHOLD],
    extrapolate: "clamp",
  });

  const sliderTextOpacity = slideX.interpolate({
    inputRange: [0, SLIDE_THRESHOLD * 0.3],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // ─── Confirm Overlay ───
  if (showConfirm) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.overlayFull, { opacity: confirmOpacity }]}>
          <Animated.View style={[styles.confirmSheet, { transform: [{ translateY: confirmSlide }] }]}>
            {showProcessing ? (
              // Processing state
              <View style={styles.processingContent}>
                <Animated.View style={[styles.processingRing, { transform: [{ rotate: processingSpin }] }]}>
                  <View style={styles.processingRingInner} />
                </Animated.View>
                <ThemedText variant="h5" weight="bold" align="center" style={{ marginTop: hp(20) }}>
                  Converting...
                </ThemedText>
                <View style={styles.processingDotsRow}>
                  {processingDots.map((dot, i) => (
                    <Animated.View key={i} style={[styles.processingDot, { opacity: dot }]} />
                  ))}
                </View>
                <ThemedText variant="caption" color="tertiary" align="center">
                  {from.symbol}{numericAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {from.code} {"\u2192"} {to.symbol}{converted.toLocaleString("en-US", { maximumFractionDigits: 2 })} {to.code}
                </ThemedText>
              </View>
            ) : showSuccess ? (
              // Success state
              <View style={styles.successContent}>
                <Animated.View style={[styles.successCircle, { transform: [{ scale: successScale }] }]}>
                  <Ionicons name="checkmark" size={wp(36)} color="#FFFFFF" />
                </Animated.View>
                <Animated.View style={{ opacity: successOpacity, alignItems: "center", gap: hp(8), width: "100%" }}>
                  <ThemedText variant="h4" weight="black" align="center">
                    Conversion Complete
                  </ThemedText>
                  <View style={styles.successCard}>
                    <View style={styles.successAmountRow}>
                      <ThemedText style={styles.successFlag}>{from.flag}</ThemedText>
                      <ThemedText variant="h6" weight="bold">
                        {from.symbol}{numericAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </ThemedText>
                    </View>
                    <View style={styles.successArrow}>
                      <Ionicons name="arrow-forward" size={wp(16)} color={colors.text.tertiary} />
                    </View>
                    <View style={styles.successAmountRow}>
                      <ThemedText style={styles.successFlag}>{to.flag}</ThemedText>
                      <ThemedText variant="h6" weight="bold" color="success">
                        {to.symbol}{converted.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.successMeta}>
                    <View style={styles.successMetaItem}>
                      <ThemedText variant="caption" color="tertiary">Rate</ThemedText>
                      <ThemedText variant="bodySmall" weight="semiBold">1 {from.code} = {formatRate(rate)} {to.code}</ThemedText>
                    </View>
                    <View style={styles.successMetaDivider} />
                    <View style={styles.successMetaItem}>
                      <ThemedText variant="caption" color="tertiary">Fee</ThemedText>
                      <ThemedText variant="bodySmall" weight="semiBold" color="success">Free</ThemedText>
                    </View>
                  </View>
                  <View style={styles.successActions}>
                    <AppButton title="Done" onPress={handleDone} variant="primary" size="large" fullWidth />
                  </View>
                </Animated.View>
              </View>
            ) : (
              // Confirm review state
              <>
                <View style={styles.confirmHandle} />
                <ThemedText variant="h5" weight="bold" align="center">
                  Confirm Conversion
                </ThemedText>
                <ThemedText variant="caption" color="tertiary" align="center" style={{ marginTop: hp(4) }}>
                  Review the details below
                </ThemedText>

                <View style={styles.confirmCard}>
                  <View style={styles.confirmRow}>
                    <ThemedText variant="bodySmall" color="secondary">You convert</ThemedText>
                    <View style={styles.confirmValue}>
                      <ThemedText style={{ fontSize: fs(18) }}>{from.flag}</ThemedText>
                      <ThemedText variant="h6" weight="bold">
                        {from.symbol}{numericAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {from.code}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.confirmDivider} />
                  <View style={styles.confirmRow}>
                    <ThemedText variant="bodySmall" color="secondary">You receive</ThemedText>
                    <View style={styles.confirmValue}>
                      <ThemedText style={{ fontSize: fs(18) }}>{to.flag}</ThemedText>
                      <ThemedText variant="h6" weight="bold" color="success">
                        {to.symbol}{converted.toLocaleString("en-US", { maximumFractionDigits: 2 })} {to.code}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.confirmDivider} />
                  <View style={styles.confirmRow}>
                    <ThemedText variant="bodySmall" color="secondary">Exchange rate</ThemedText>
                    <ThemedText variant="bodySmall" weight="semiBold">
                      1 {from.code} = {formatRate(rate)} {to.code}
                    </ThemedText>
                  </View>
                  <View style={styles.confirmDivider} />
                  <View style={styles.confirmRow}>
                    <ThemedText variant="bodySmall" color="secondary">Fee</ThemedText>
                    <ThemedText variant="bodySmall" weight="semiBold" color="success">Free</ThemedText>
                  </View>
                </View>

                <View style={styles.confirmActions}>
                  <AppButton
                    title="Confirm Conversion"
                    onPress={() => startProcessing()}
                    variant="primary"
                    size="large"
                    fullWidth
                  />
                  <TouchableOpacity onPress={closeConfirm} activeOpacity={0.7} style={styles.cancelBtn}>
                    <ThemedText variant="body" weight="semiBold" color="secondary">Cancel</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
        </TouchableOpacity>
        <ThemedText variant="h6" weight="bold">Convert</ThemedText>
        <View style={styles.backBtn} />
      </View>

      {/* Fixed Rate Pill */}
      <View style={styles.ratePill}>
        <Ionicons name="swap-horizontal" size={wp(14)} color={colors.primary.main} />
        <ThemedText variant="caption" weight="semiBold" color="secondary">
          1 {from.code} = {formatRate(rate)} {to.code}
        </ThemedText>
      </View>

      {/* From Card */}
      <View style={styles.cardsSection}>
        <Animated.View style={[styles.currencyCard, { opacity: fromCardOpacity, transform: [{ scale: fromCardScale }] }]}>
          <View style={styles.cardRow}>
            <TouchableOpacity style={styles.currencyPill} onPress={() => setPickerTarget("from")} activeOpacity={0.7}>
              <ThemedText style={styles.pillFlag}>{from.flag}</ThemedText>
              <View>
                <ThemedText variant="overline" color="tertiary" weight="medium">FROM</ThemedText>
                <ThemedText variant="body" weight="bold">{from.code}</ThemedText>
              </View>
              <Ionicons name="chevron-down" size={wp(14)} color={colors.text.tertiary} />
            </TouchableOpacity>
            <View style={styles.balanceWrap}>
              <ThemedText variant="caption" color="tertiary" weight="medium">
                {from.symbol}{from.balance.toLocaleString()}
              </ThemedText>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setAmount(from.balance.toString())}
                style={styles.maxBtn}
              >
                <ThemedText variant="overline" weight="black" color="accent">MAX</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.amountDisplay}>
            <ThemedText variant="bodySmall" color="tertiary" weight="medium" style={styles.symbolPrefix}>
              {from.symbol}
            </ThemedText>
            <Animated.View style={{ transform: [{ scale: convertAnim }] }}>
              <ThemedText
                variant="h1"
                weight="black"
                style={[styles.amountText, exceeds && { color: colors.status.error }]}
              >
                {displayAmount}
              </ThemedText>
            </Animated.View>
          </View>
          {exceeds && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={wp(13)} color={colors.status.error} />
              <ThemedText variant="caption" color="error" weight="medium">Insufficient balance</ThemedText>
            </View>
          )}
        </Animated.View>

        {/* Swap */}
        <View style={styles.swapRow}>
          <View style={styles.swapLine} />
          <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="swap-vertical" size={wp(20)} color={colors.primary.main} />
            </Animated.View>
          </TouchableOpacity>
          <View style={styles.swapLine} />
        </View>

        {/* To Card */}
        <Animated.View style={[styles.currencyCard, styles.toCard, { opacity: toCardOpacity, transform: [{ scale: toCardScale }] }]}>
          <View style={styles.cardRow}>
            <TouchableOpacity style={styles.currencyPill} onPress={() => setPickerTarget("to")} activeOpacity={0.7}>
              <ThemedText style={styles.pillFlag}>{to.flag}</ThemedText>
              <View>
                <ThemedText variant="overline" color="tertiary" weight="medium">TO</ThemedText>
                <ThemedText variant="body" weight="bold">{to.code}</ThemedText>
              </View>
              <Ionicons name="chevron-down" size={wp(14)} color={colors.text.tertiary} />
            </TouchableOpacity>
            <ThemedText variant="caption" color="tertiary" weight="medium">
              {to.symbol}{to.balance.toLocaleString()}
            </ThemedText>
          </View>
          <View style={styles.amountDisplay}>
            <ThemedText variant="bodySmall" color="tertiary" weight="medium" style={styles.symbolPrefix}>
              {to.symbol}
            </ThemedText>
            <ThemedText
              variant="h3"
              weight="bold"
              color={numericAmount > 0 ? "success" : "tertiary"}
            >
              {numericAmount > 0 ? formatNumber(converted.toFixed(converted >= 100 ? 0 : 2)) : "0.00"}
            </ThemedText>
          </View>
        </Animated.View>
      </View>

      {/* Summary Strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryChip}>
          <Ionicons name="flash" size={wp(12)} color={colors.status.success} />
          <ThemedText variant="overline" weight="bold" color="success">INSTANT</ThemedText>
        </View>
        <View style={styles.summaryDot} />
        <View style={styles.summaryChip}>
          <Ionicons name="pricetag" size={wp(12)} color={colors.primary.light} />
          <ThemedText variant="overline" weight="bold" color="accent">ZERO FEE</ThemedText>
        </View>
        <View style={styles.summaryChip}>
          <Ionicons name="shield-checkmark" size={wp(12)} color={colors.text.tertiary} />
          <ThemedText variant="overline" weight="bold" color="tertiary">SECURED</ThemedText>
        </View>
      </View>

      {/* Keypad */}
      <Animated.View style={[styles.keypad, { opacity: keypadOpacity, transform: [{ translateY: keypadSlide }] }]}>
        <View style={styles.keypadGrid}>
          {KEYS.map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => handleKey(key)} activeOpacity={0.5}>
              {key === "del" ? (
                <Ionicons name="backspace-outline" size={wp(24)} color={colors.text.secondary} />
              ) : (
                <ThemedText variant="h4" weight="medium" align="center">{key}</ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Swipe to Convert Slider */}
      <View style={styles.sliderSection}>
        <View style={[styles.sliderTrack, !isValid && { opacity: 0.35 }]}>
          {/* Fill */}
          <Animated.View
            style={[
              styles.sliderFill,
              { width: Animated.add(sliderFillWidth, THUMB_SIZE) },
            ]}
          />
          {/* Label */}
          <Animated.View style={[styles.sliderLabel, { opacity: sliderTextOpacity }]}>
            <ThemedText variant="bodySmall" weight="semiBold" color="secondary">
              Swipe to convert
            </ThemedText>
            <Ionicons name="chevron-forward" size={wp(16)} color={colors.text.tertiary} />
            <Ionicons name="chevron-forward" size={wp(16)} color={colors.text.disabled} style={{ marginLeft: -wp(10) }} />
          </Animated.View>
          {/* Thumb */}
          <Animated.View
            style={[styles.sliderThumb, { left: Animated.add(slideX, wp(4)) }]}
            {...panResponder.panHandlers}
          >
            <Animated.View style={{ opacity: sliderGlow }}>
              <Ionicons name="swap-horizontal" size={wp(22)} color="#FFFFFF" />
            </Animated.View>
          </Animated.View>
        </View>
      </View>

      {/* Currency picker */}
      <Modal visible={pickerTarget !== null} transparent animationType="fade" onRequestClose={() => setPickerTarget(null)}>
        <TouchableWithoutFeedback onPress={() => setPickerTarget(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <View style={styles.pickerHandle} />
                <ThemedText variant="h6" weight="bold" style={styles.pickerTitle}>
                  {pickerTarget === "from" ? "Convert from" : "Convert to"}
                </ThemedText>
                {wallets.map((w, i) => {
                  const isActive = pickerTarget === "from" ? i === fromIdx : i === toIdx;
                  const isDisabled = pickerTarget === "from" ? i === toIdx : i === fromIdx;
                  return (
                    <TouchableOpacity
                      key={w.code}
                      style={[styles.pickerItem, isActive && styles.pickerItemActive, isDisabled && { opacity: 0.3 }]}
                      disabled={isDisabled}
                      onPress={() => {
                        if (pickerTarget === "from") setFromIdx(i);
                        else setToIdx(i);
                        setPickerTarget(null);
                      }}
                      activeOpacity={0.7}
                    >
                      <ThemedText variant="bodyLarge" style={{ fontSize: fs(22) }}>{w.flag}</ThemedText>
                      <View style={{ flex: 1 }}>
                        <ThemedText variant="body" weight={isActive ? "bold" : "medium"}>{w.code}</ThemedText>
                        <ThemedText variant="caption" color="tertiary" weight="medium">
                          {w.symbol}{w.balance.toLocaleString()}
                        </ThemedText>
                      </View>
                      {isActive && <Ionicons name="checkmark-circle" size={wp(20)} color={colors.primary.main} />}
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
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: hp(62), paddingHorizontal: wp(24), paddingBottom: hp(4),
  },
  backBtn: {
    width: wp(40), height: wp(40), borderRadius: wp(12),
    justifyContent: "center", alignItems: "center",
  },

  // Rate pill
  ratePill: {
    flexDirection: "row", alignItems: "center", alignSelf: "center",
    gap: wp(8), paddingHorizontal: wp(14), paddingVertical: hp(5),
    borderRadius: wp(20), backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    marginBottom: hp(10),
  },

  // Cards
  cardsSection: { paddingHorizontal: wp(24) },
  currencyCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: wp(20), borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    padding: wp(18),
  },
  toCard: {
    backgroundColor: "rgba(34,197,94,0.03)",
    borderColor: "rgba(34,197,94,0.08)",
  },
  cardRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: hp(10),
  },
  currencyPill: {
    flexDirection: "row", alignItems: "center", gap: wp(8),
    paddingVertical: hp(4), paddingHorizontal: wp(10),
    borderRadius: wp(12), backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  pillFlag: { fontSize: fs(20) },
  balanceWrap: { flexDirection: "row", alignItems: "center", gap: wp(8) },
  maxBtn: {
    paddingHorizontal: wp(8), paddingVertical: hp(2),
    borderRadius: wp(6), backgroundColor: colors.primary.main + "15",
    borderWidth: 1, borderColor: colors.primary.main + "25",
  },
  amountDisplay: { flexDirection: "row", alignItems: "baseline", gap: wp(4) },
  symbolPrefix: { marginTop: hp(4) },
  amountText: {
    fontSize: fs(36), letterSpacing: -fs(1.2), lineHeight: fs(44),
    color: colors.text.primary,
  },
  errorRow: { flexDirection: "row", alignItems: "center", gap: wp(5), marginTop: hp(6) },

  // Swap
  swapRow: {
    flexDirection: "row", alignItems: "center", gap: wp(12),
    marginVertical: hp(-10), zIndex: 10,
  },
  swapLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.04)" },
  swapButton: {
    width: wp(44), height: wp(44), borderRadius: wp(22),
    backgroundColor: colors.primary.main + "10",
    borderWidth: 2, borderColor: colors.primary.main + "25",
    justifyContent: "center", alignItems: "center",
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5,
  },

  // Summary
  summaryStrip: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: wp(12), marginTop: hp(14), marginBottom: hp(4),
  },
  summaryChip: { flexDirection: "row", alignItems: "center", gap: wp(4) },
  summaryDot: {
    width: wp(3), height: wp(3), borderRadius: wp(2),
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  // Keypad
  keypad: { flex: 1, paddingHorizontal: wp(24), justifyContent: "center" },
  keypadGrid: { flexDirection: "row", flexWrap: "wrap" },
  key: { width: "33.33%", height: hp(48), justifyContent: "center", alignItems: "center" },

  // Slider
  sliderSection: { paddingHorizontal: wp(24), paddingBottom: hp(36), paddingTop: hp(10) },
  sliderTrack: {
    height: THUMB_SIZE + wp(8),
    borderRadius: wp(100),
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    overflow: "hidden",
  },
  sliderFill: {
    position: "absolute", left: 0, top: 0, bottom: 0,
    backgroundColor: colors.primary.main + "18",
    borderRadius: wp(100),
  },
  sliderLabel: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    position: "absolute", left: THUMB_SIZE, right: 0,
    gap: wp(2),
  },
  sliderThumb: {
    position: "absolute",
    top: wp(4),
    width: THUMB_SIZE, height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.primary.main,
    justifyContent: "center", alignItems: "center",
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: hp(4) }, shadowOpacity: 0.4, shadowRadius: wp(12), elevation: 8,
  },

  // Overlay
  overlayFull: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.primary,
    justifyContent: "flex-end",
  },
  confirmSheet: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: hp(80),
    paddingHorizontal: wp(24),
  },
  confirmHandle: {
    width: wp(40), height: hp(4), borderRadius: hp(2),
    backgroundColor: "rgba(255,255,255,0.12)", alignSelf: "center", marginBottom: hp(24),
  },
  confirmCard: {
    marginTop: hp(24),
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: wp(20), borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    padding: wp(20),
  },
  confirmRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: hp(12),
  },
  confirmValue: { flexDirection: "row", alignItems: "center", gap: wp(8) },
  confirmDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.04)" },
  confirmActions: { marginTop: hp(32), gap: hp(14) },
  cancelBtn: { alignItems: "center", paddingVertical: hp(12) },

  // Processing
  processingContent: { flex: 1, justifyContent: "center", alignItems: "center", gap: hp(6) },
  processingRing: {
    width: wp(72), height: wp(72), borderRadius: wp(36),
    borderWidth: 3, borderColor: "transparent",
    borderTopColor: colors.primary.main, borderRightColor: colors.primary.main + "40",
    justifyContent: "center", alignItems: "center",
  },
  processingRingInner: {
    width: wp(52), height: wp(52), borderRadius: wp(26),
    backgroundColor: colors.primary.main + "12",
    justifyContent: "center", alignItems: "center",
  },
  processingDotsRow: {
    flexDirection: "row", gap: wp(8), marginVertical: hp(10),
  },
  processingDot: {
    width: wp(8), height: wp(8), borderRadius: wp(4),
    backgroundColor: colors.primary.main,
  },

  // Success
  successContent: { flex: 1, justifyContent: "center", alignItems: "center", gap: hp(16), paddingBottom: hp(20) },
  successCircle: {
    width: wp(76), height: wp(76), borderRadius: wp(38),
    backgroundColor: colors.status.success, justifyContent: "center", alignItems: "center",
    shadowColor: colors.status.success,
    shadowOffset: { width: 0, height: hp(8) }, shadowOpacity: 0.3, shadowRadius: wp(16), elevation: 10,
  },
  successCard: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: hp(16), paddingHorizontal: wp(20),
    borderRadius: wp(18), backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    width: "100%", justifyContent: "center", gap: wp(14),
  },
  successAmountRow: { flexDirection: "row", alignItems: "center", gap: wp(8) },
  successArrow: {
    width: wp(28), height: wp(28), borderRadius: wp(14),
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center", alignItems: "center",
  },
  successFlag: { fontSize: fs(20) },
  successMeta: {
    flexDirection: "row", width: "100%",
    paddingVertical: hp(12), paddingHorizontal: wp(16),
    borderRadius: wp(14), backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
  },
  successMetaItem: { flex: 1, alignItems: "center", gap: hp(2) },
  successMetaDivider: { width: 1, height: "100%", backgroundColor: "rgba(255,255,255,0.06)" },
  successActions: { width: "100%", marginTop: hp(12) },

  // Picker
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  pickerSheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: wp(28), borderTopRightRadius: wp(28),
    paddingHorizontal: wp(24), paddingTop: hp(10), paddingBottom: hp(40),
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  pickerHandle: {
    width: wp(40), height: hp(4), borderRadius: hp(2),
    backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center", marginBottom: hp(20),
  },
  pickerTitle: { marginBottom: hp(16) },
  pickerItem: {
    flexDirection: "row", alignItems: "center", gap: wp(14),
    paddingVertical: hp(14), paddingHorizontal: wp(12), borderRadius: wp(14), marginBottom: hp(4),
  },
  pickerItemActive: { backgroundColor: colors.primary.main + "0A" },
});
