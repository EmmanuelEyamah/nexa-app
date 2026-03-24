import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface FundProps {
  onBack: () => void;
}

const wallets = [
  { code: "USD", symbol: "$", flag: "\u{1F1FA}\u{1F1F8}", name: "US Dollar", balance: 24850 },
  { code: "NGN", symbol: "\u20A6", flag: "\u{1F1F3}\u{1F1EC}", name: "Nigerian Naira", balance: 12500000 },
  { code: "EUR", symbol: "\u20AC", flag: "\u{1F1EA}\u{1F1FA}", name: "Euro", balance: 8320 },
  { code: "GBP", symbol: "\u00A3", flag: "\u{1F1EC}\u{1F1E7}", name: "British Pound", balance: 6140 },
  { code: "KES", symbol: "KSh", flag: "\u{1F1F0}\u{1F1EA}", name: "Kenyan Shilling", balance: 1250000 },
];

interface PaymentMethod {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  tag?: string;
  tagColor?: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: "bank", icon: "business-outline", title: "Bank Transfer", subtitle: "Direct deposit from your bank account", tag: "Free", tagColor: colors.status.success },
  { id: "card", icon: "card-outline", title: "Debit / Credit Card", subtitle: "Visa, Mastercard, Verve", tag: "1.5%", tagColor: colors.status.warning },
  { id: "mobile", icon: "phone-portrait-outline", title: "Mobile Money", subtitle: "M-Pesa, MTN MoMo, Airtel Money" },
  { id: "ussd", icon: "keypad-outline", title: "USSD", subtitle: "Dial code from your phone to fund" },
];

const mobileProviders = [
  { id: "mpesa", name: "M-Pesa", icon: "phone-portrait", color: "#4CAF50" },
  { id: "mtn", name: "MTN MoMo", icon: "phone-portrait", color: "#FFC107" },
  { id: "airtel", name: "Airtel Money", icon: "phone-portrait", color: "#FF5722" },
];

const ussdBanks = [
  { name: "GTBank", code: "*737*1*Amount#", color: "#E65100" },
  { name: "First Bank", code: "*894*Amount#", color: "#002D62" },
  { name: "Access Bank", code: "*901*Amount#", color: "#F26522" },
  { name: "UBA", code: "*919*1*Amount#", color: "#D32F2F" },
  { name: "Zenith Bank", code: "*966*Amount#", color: "#B71C1C" },
];

const quickAmounts = [50, 100, 250, 500, 1000, 5000];

const formatBalance = (balance: number) => {
  if (balance >= 1000000) return (balance / 1000000).toFixed(2) + "M";
  if (balance >= 1000) return balance.toLocaleString();
  return balance.toFixed(2);
};

type Step = "select" | "bank" | "card" | "mobile" | "ussd" | "amount" | "processing" | "success";

export const Fund = ({ onBack }: FundProps) => {
  const [selectedWallet, setSelectedWallet] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  const [step, setStep] = useState<Step>("select");

  // Card state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardFlipped, setCardFlipped] = useState(false);

  // Mobile money state
  const [mobileProvider, setMobileProvider] = useState<string | null>(null);
  const [mobilePhone, setMobilePhone] = useState("");

  // Bank transfer - timer for "waiting for payment"
  const [bankTimer, setBankTimer] = useState(1800); // 30 min
  const [bankCopied, setBankCopied] = useState<string | null>(null);

  // Animations
  const sectionAnims = useRef(
    Array.from({ length: 5 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(hp(20)),
    }))
  ).current;
  const processingRotation = useRef(new Animated.Value(0)).current;
  const processingDots = useRef([
    new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3),
  ]).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const cardFlipAnim = useRef(new Animated.Value(0)).current;
  const timerPulse = useRef(new Animated.Value(1)).current;

  const wallet = wallets[selectedWallet];
  const numericAmount = parseFloat(amount) || 0;
  const method = paymentMethods.find((m) => m.id === selectedMethod);

  // Entry animation
  const runEntryAnims = () => {
    sectionAnims.forEach((anim) => {
      anim.opacity.setValue(0);
      anim.translateY.setValue(hp(20));
    });
    const ease = Easing.bezier(0.22, 1, 0.36, 1);
    sectionAnims.forEach((anim, i) => {
      Animated.parallel([
        Animated.timing(anim.opacity, { toValue: 1, duration: 450, delay: i * 80, easing: ease, useNativeDriver: true }),
        Animated.spring(anim.translateY, { toValue: 0, friction: 12, tension: 50, delay: i * 80, useNativeDriver: true }),
      ]).start();
    });
  };

  useEffect(() => { runEntryAnims(); }, []);
  useEffect(() => { runEntryAnims(); }, [step]);

  const animStyle = (i: number) => ({
    opacity: sectionAnims[Math.min(i, 4)].opacity,
    transform: [{ translateY: sectionAnims[Math.min(i, 4)].translateY }],
  });

  // Bank timer countdown
  useEffect(() => {
    if (step !== "bank") return;
    const interval = setInterval(() => {
      setBankTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    // Timer pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(timerPulse, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(timerPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    return () => clearInterval(interval);
  }, [step]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    setBankCopied(label);
    Toast.show({ type: "success", text1: "Copied!", text2: `${label} copied to clipboard`, visibilityTime: 1500 });
    setTimeout(() => setBankCopied(null), 2000);
  };

  // Card formatting
  const formatCardNumber = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 16);
    return clean.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) return clean.slice(0, 2) + "/" + clean.slice(2);
    return clean;
  };

  const flipCard = (toBack: boolean) => {
    setCardFlipped(toBack);
    Animated.spring(cardFlipAnim, {
      toValue: toBack ? 1 : 0,
      friction: 8, tension: 60, useNativeDriver: true,
    }).start();
  };

  const cardRotateY = cardFlipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const cardBackRotateY = cardFlipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const handleMethodSelect = (id: string) => {
    setSelectedMethod(id);
    if (id === "bank") setStep("bank");
    else if (id === "card") setStep("card");
    else if (id === "mobile") setStep("mobile");
    else if (id === "ussd") setStep("ussd");
  };

  const goToAmount = () => setStep("amount");

  const handleFund = () => {
    setStep("processing");
    Animated.loop(
      Animated.timing(processingRotation, {
        toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true,
      })
    ).start();
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
      processingRotation.setValue(0);
      setStep("success");
      Animated.stagger(200, [
        Animated.spring(successScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 2500);
  };

  const handleDone = () => {
    successScale.setValue(0);
    successOpacity.setValue(0);
    setAmount("");
    setSelectedMethod(null);
    setCardNumber(""); setCardExpiry(""); setCardCvv(""); setCardName("");
    setMobileProvider(null); setMobilePhone("");
    setStep("select");
    onBack();
  };

  const processingSpin = processingRotation.interpolate({
    inputRange: [0, 1], outputRange: ["0deg", "360deg"],
  });

  const getCardType = () => {
    const first = cardNumber.replace(/\s/g, "").charAt(0);
    if (first === "4") return "VISA";
    if (first === "5") return "MASTERCARD";
    if (first === "3") return "AMEX";
    return "CARD";
  };

  // ─── Back handler for sub-steps ───
  const handleStepBack = () => {
    if (step === "amount") {
      if (selectedMethod === "bank") setStep("bank");
      else if (selectedMethod === "card") setStep("card");
      else if (selectedMethod === "mobile") setStep("mobile");
      else setStep("select");
    } else {
      setStep("select");
    }
  };

  // ─── Processing ───
  if (step === "processing") {
    return (
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <Animated.View style={[styles.processingRing, { transform: [{ rotate: processingSpin }] }]}>
            <View style={styles.processingRingInner}>
              <Ionicons name="wallet-outline" size={wp(24)} color={colors.primary.main} />
            </View>
          </Animated.View>
          <ThemedText variant="h5" weight="bold" align="center" style={{ marginTop: hp(20) }}>
            Processing payment...
          </ThemedText>
          <View style={styles.processingDotsRow}>
            {processingDots.map((dot, i) => (
              <Animated.View key={i} style={[styles.processingDot, { opacity: dot }]} />
            ))}
          </View>
          <ThemedText variant="caption" color="tertiary" align="center">
            {wallet.symbol}{numericAmount.toLocaleString()} via {method?.title}
          </ThemedText>
        </View>
      </View>
    );
  }

  // ─── Success ───
  if (step === "success") {
    return (
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <Animated.View style={[styles.successCircle, { transform: [{ scale: successScale }] }]}>
            <Ionicons name="checkmark" size={wp(36)} color="#FFFFFF" />
          </Animated.View>
          <Animated.View style={{ opacity: successOpacity, alignItems: "center", gap: hp(10), width: "100%", paddingHorizontal: wp(24) }}>
            <ThemedText variant="h4" weight="black" align="center">Wallet Funded</ThemedText>
            <ThemedText variant="body" color="secondary" align="center">
              {wallet.symbol}{numericAmount.toLocaleString()} has been added to your {wallet.code} wallet
            </ThemedText>
            <View style={styles.successCard}>
              {[
                { l: "Amount", v: `+${wallet.symbol}${numericAmount.toLocaleString()}`, c: "success" as const },
                { l: "Wallet", v: `${wallet.flag} ${wallet.code}` },
                { l: "Method", v: method?.title || "" },
                { l: "Fee", v: selectedMethod === "bank" ? "Free" : `${wallet.symbol}${(numericAmount * 0.015).toFixed(2)}`, c: selectedMethod === "bank" ? "success" as const : undefined },
                { l: "Reference", v: "NXA-" + Math.random().toString(36).substring(2, 10).toUpperCase() },
              ].map((row, i, arr) => (
                <React.Fragment key={row.l}>
                  <View style={styles.successRow}>
                    <ThemedText variant="bodySmall" color="secondary">{row.l}</ThemedText>
                    <ThemedText variant="bodySmall" weight="semiBold" color={row.c || "primary"}>{row.v}</ThemedText>
                  </View>
                  {i < arr.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
            <View style={styles.fullWidthActions}>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleDone} activeOpacity={0.8}>
                <ThemedText variant="button" weight="bold" color="white">Done</ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
    );
  }

  // ─── Amount Entry ───
  if (step === "amount") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleStepBack} activeOpacity={0.7} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
          </TouchableOpacity>
          <ThemedText variant="h6" weight="bold">Enter Amount</ThemedText>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.methodBadge}>
          <Ionicons name={method?.icon as any} size={wp(14)} color={colors.primary.main} />
          <ThemedText variant="caption" weight="semiBold" color="secondary">{method?.title}</ThemedText>
        </View>

        <TouchableOpacity style={styles.walletRowCompact} activeOpacity={0.7} onPress={() => setShowWalletPicker(true)}>
          <ThemedText style={{ fontSize: fs(20) }}>{wallet.flag}</ThemedText>
          <ThemedText variant="bodySmall" weight="bold">{wallet.code}</ThemedText>
          <Ionicons name="chevron-down" size={wp(14)} color={colors.text.tertiary} />
        </TouchableOpacity>

        <View style={styles.amountCenter}>
          <ThemedText variant="bodySmall" color="tertiary">{wallet.symbol}</ThemedText>
          <ThemedText variant="h1" weight="black" style={styles.bigAmount}>
            {amount ? amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0"}
          </ThemedText>
        </View>

        <View style={styles.quickAmounts}>
          {quickAmounts.map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.quickChip, amount === val.toString() && styles.quickChipActive]}
              activeOpacity={0.7}
              onPress={() => setAmount(val.toString())}
            >
              <ThemedText variant="caption" weight="semiBold" color={amount === val.toString() ? "white" : "secondary"}>
                {wallet.symbol}{val >= 1000 ? (val / 1000) + "K" : val}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.keypad}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((key) => (
            <TouchableOpacity key={key} style={styles.key} activeOpacity={0.5} onPress={() => {
              if (key === "del") setAmount((p) => p.slice(0, -1));
              else if (key === ".") { if (!amount.includes(".")) setAmount((p) => p + "."); }
              else { const pts = amount.split("."); if (pts[1]?.length >= 2) return; if (amount.replace(".", "").length >= 10) return; setAmount((p) => p + key); }
            }}>
              {key === "del" ? <Ionicons name="backspace-outline" size={wp(24)} color={colors.text.secondary} /> : <ThemedText variant="h4" weight="medium">{key}</ThemedText>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.primaryBtn, numericAmount <= 0 && { opacity: 0.35 }]}
            activeOpacity={0.8} disabled={numericAmount <= 0} onPress={handleFund}
          >
            <Ionicons name="wallet" size={wp(18)} color="#FFF" />
            <ThemedText variant="button" weight="bold" color="white">
              Fund {wallet.symbol}{numericAmount > 0 ? numericAmount.toLocaleString() : ""}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {renderWalletPicker()}
      </View>
    );
  }

  // ─── Bank Transfer ───
  if (step === "bank") {
    const bankDetails = [
      { label: "Bank Name", value: "Providus Bank", copyable: false },
      { label: "Account Number", value: "9901234567", copyable: true },
      { label: "Account Name", value: "Nexa / Nexa Enterprises", copyable: true },
      { label: "Amount", value: numericAmount > 0 ? `${wallet.symbol}${numericAmount.toLocaleString()}` : "Any amount", copyable: false },
    ];

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep("select")} activeOpacity={0.7} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
          </TouchableOpacity>
          <ThemedText variant="h6" weight="bold">Bank Transfer</ThemedText>
          <View style={styles.backBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
          {/* Timer */}
          <Animated.View style={[styles.timerCard, animStyle(0), { transform: [{ scale: timerPulse }, ...animStyle(0).transform] }]}>
            <View style={styles.timerDot} />
            <ThemedText variant="caption" weight="semiBold" color="secondary">
              Account expires in {formatTimer(bankTimer)}
            </ThemedText>
          </Animated.View>

          {/* Wallet */}
          <Animated.View style={animStyle(1)}>
            <TouchableOpacity style={styles.walletRowFull} activeOpacity={0.7} onPress={() => setShowWalletPicker(true)}>
              <ThemedText style={{ fontSize: fs(24) }}>{wallet.flag}</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText variant="overline" color="tertiary">FUNDING</ThemedText>
                <ThemedText variant="body" weight="bold">{wallet.code} Wallet</ThemedText>
              </View>
              <Ionicons name="chevron-down" size={wp(16)} color={colors.text.tertiary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Bank Details Card */}
          <Animated.View style={[styles.detailsCard, animStyle(2)]}>
            <ThemedText variant="bodySmall" weight="semiBold" style={{ marginBottom: hp(12) }}>
              Transfer to this account
            </ThemedText>
            {bankDetails.map((d, i) => (
              <React.Fragment key={d.label}>
                <View style={styles.detailRow}>
                  <ThemedText variant="caption" color="tertiary" weight="medium">{d.label}</ThemedText>
                  <View style={styles.detailValue}>
                    <ThemedText variant="body" weight="semiBold">{d.value}</ThemedText>
                    {d.copyable && (
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => copyToClipboard(d.value, d.label)}
                        style={[styles.copyBtn, bankCopied === d.label && styles.copyBtnCopied]}
                      >
                        <Ionicons
                          name={bankCopied === d.label ? "checkmark" : "copy-outline"}
                          size={wp(14)}
                          color={bankCopied === d.label ? colors.status.success : colors.primary.main}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {i < bankDetails.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </Animated.View>

          {/* Steps */}
          <Animated.View style={[styles.stepsCard, animStyle(3)]}>
            <ThemedText variant="bodySmall" weight="semiBold" style={{ marginBottom: hp(12) }}>How it works</ThemedText>
            {[
              { n: "1", text: "Copy the account details above" },
              { n: "2", text: "Open your bank app and make a transfer" },
              { n: "3", text: "Your wallet will be credited automatically" },
            ].map((s) => (
              <View key={s.n} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <ThemedText variant="caption" weight="black" color="accent">{s.n}</ThemedText>
                </View>
                <ThemedText variant="bodySmall" color="secondary" weight="medium">{s.text}</ThemedText>
              </View>
            ))}
          </Animated.View>

          <Animated.View style={animStyle(4)}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => {
              Toast.show({ type: "info", text1: "Waiting for payment", text2: "We'll notify you once we receive your transfer" });
              handleDone();
            }} activeOpacity={0.8}>
              <ThemedText variant="button" weight="bold" color="white">I've sent the money</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {renderWalletPicker()}
      </View>
    );
  }

  // ─── Card Payment ───
  if (step === "card") {
    const cardValid = cardNumber.replace(/\s/g, "").length >= 16 && cardExpiry.length >= 5 && cardCvv.length >= 3 && cardName.length >= 2;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep("select")} activeOpacity={0.7} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
          </TouchableOpacity>
          <ThemedText variant="h6" weight="bold">Card Payment</ThemedText>
          <View style={styles.backBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
          {/* Interactive Card Preview */}
          <Animated.View style={[styles.cardPreviewWrap, animStyle(0)]}>
            {/* Front */}
            <Animated.View style={[styles.cardPreview, { transform: [{ perspective: 1000 }, { rotateY: cardRotateY }], backfaceVisibility: "hidden" }]}>
              <View style={styles.cardPreviewTop}>
                <Ionicons name="wifi-outline" size={wp(20)} color="rgba(255,255,255,0.6)" style={{ transform: [{ rotate: "90deg" }] }} />
                <ThemedText variant="caption" weight="black" color="white" style={{ opacity: 0.8 }}>{getCardType()}</ThemedText>
              </View>
              <ThemedText variant="h5" weight="bold" color="white" style={styles.cardPreviewNumber}>
                {cardNumber || "\u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022"}
              </ThemedText>
              <View style={styles.cardPreviewBottom}>
                <View>
                  <ThemedText variant="overline" color="white" style={{ opacity: 0.5 }}>CARDHOLDER</ThemedText>
                  <ThemedText variant="bodySmall" weight="semiBold" color="white">{cardName || "YOUR NAME"}</ThemedText>
                </View>
                <View>
                  <ThemedText variant="overline" color="white" style={{ opacity: 0.5 }}>EXPIRES</ThemedText>
                  <ThemedText variant="bodySmall" weight="semiBold" color="white">{cardExpiry || "MM/YY"}</ThemedText>
                </View>
              </View>
            </Animated.View>

            {/* Back */}
            <Animated.View style={[styles.cardPreview, styles.cardPreviewBack, { transform: [{ perspective: 1000 }, { rotateY: cardBackRotateY }], backfaceVisibility: "hidden" }]}>
              <View style={styles.cardStripe} />
              <View style={styles.cardCvvRow}>
                <View style={styles.cardCvvBox}>
                  <ThemedText variant="body" weight="bold" color="inverse">{cardCvv || "\u2022\u2022\u2022"}</ThemedText>
                </View>
                <ThemedText variant="overline" color="white" style={{ opacity: 0.5 }}>CVV</ThemedText>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Card Form */}
          <Animated.View style={[styles.formSection, animStyle(1)]}>
            <View style={styles.inputGroup}>
              <ThemedText variant="caption" color="tertiary" weight="medium" style={styles.inputLabel}>Card Number</ThemedText>
              <View style={styles.inputRow}>
                <Ionicons name="card-outline" size={wp(18)} color={colors.text.tertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={colors.text.disabled}
                  value={cardNumber}
                  onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                  keyboardType="number-pad"
                  maxLength={19}
                  onFocus={() => flipCard(false)}
                />
              </View>
            </View>

            <View style={styles.inputGroupRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText variant="caption" color="tertiary" weight="medium" style={styles.inputLabel}>Expiry</ThemedText>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.text.disabled}
                    value={cardExpiry}
                    onChangeText={(t) => setCardExpiry(formatExpiry(t))}
                    keyboardType="number-pad"
                    maxLength={5}
                    onFocus={() => flipCard(false)}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText variant="caption" color="tertiary" weight="medium" style={styles.inputLabel}>CVV</ThemedText>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="\u2022\u2022\u2022"
                    placeholderTextColor={colors.text.disabled}
                    value={cardCvv}
                    onChangeText={(t) => setCardCvv(t.replace(/\D/g, "").slice(0, 4))}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                    onFocus={() => flipCard(true)}
                    onBlur={() => flipCard(false)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText variant="caption" color="tertiary" weight="medium" style={styles.inputLabel}>Cardholder Name</ThemedText>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={wp(18)} color={colors.text.tertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={colors.text.disabled}
                  value={cardName}
                  onChangeText={setCardName}
                  autoCapitalize="words"
                  onFocus={() => flipCard(false)}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.securityRow, animStyle(2)]}>
            <Ionicons name="lock-closed" size={wp(14)} color={colors.status.success} />
            <ThemedText variant="caption" color="tertiary" weight="medium">Secured with AES-256 encryption</ThemedText>
          </Animated.View>

          <Animated.View style={animStyle(3)}>
            <TouchableOpacity
              style={[styles.primaryBtn, !cardValid && { opacity: 0.35 }]}
              activeOpacity={0.8} disabled={!cardValid}
              onPress={goToAmount}
            >
              <ThemedText variant="button" weight="bold" color="white">Continue</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // ─── Mobile Money ───
  if (step === "mobile") {
    const mobileValid = mobileProvider && mobilePhone.length >= 10;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep("select")} activeOpacity={0.7} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
          </TouchableOpacity>
          <ThemedText variant="h6" weight="bold">Mobile Money</ThemedText>
          <View style={styles.backBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
          {/* Provider Selection */}
          <Animated.View style={animStyle(0)}>
            <ThemedText variant="bodySmall" weight="semiBold" style={{ marginBottom: hp(12), paddingHorizontal: wp(24) }}>
              Select provider
            </ThemedText>
          </Animated.View>

          <Animated.View style={[styles.providerGrid, animStyle(1)]}>
            {mobileProviders.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.providerCard, mobileProvider === p.id && styles.providerCardActive]}
                activeOpacity={0.7}
                onPress={() => setMobileProvider(p.id)}
              >
                <View style={[styles.providerIcon, { backgroundColor: p.color + "15", borderColor: p.color + "25" }]}>
                  <Ionicons name={p.icon as any} size={wp(22)} color={p.color} />
                </View>
                <ThemedText variant="bodySmall" weight={mobileProvider === p.id ? "bold" : "medium"}>
                  {p.name}
                </ThemedText>
                {mobileProvider === p.id && (
                  <View style={styles.providerCheck}>
                    <Ionicons name="checkmark-circle" size={wp(18)} color={colors.primary.main} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Phone Number */}
          <Animated.View style={[styles.formSection, animStyle(2)]}>
            <View style={styles.inputGroup}>
              <ThemedText variant="caption" color="tertiary" weight="medium" style={styles.inputLabel}>Phone Number</ThemedText>
              <View style={styles.inputRow}>
                <ThemedText variant="body" weight="semiBold" color="secondary">+254</ThemedText>
                <View style={styles.inputDivider} />
                <TextInput
                  style={styles.input}
                  placeholder="700 000 000"
                  placeholderTextColor={colors.text.disabled}
                  value={mobilePhone}
                  onChangeText={(t) => setMobilePhone(t.replace(/\D/g, "").slice(0, 12))}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.infoBox, animStyle(3)]}>
            <Ionicons name="information-circle-outline" size={wp(16)} color={colors.primary.main} />
            <ThemedText variant="caption" color="tertiary" weight="medium" style={{ flex: 1 }}>
              You'll receive a push notification on your phone to approve the payment
            </ThemedText>
          </Animated.View>

          <Animated.View style={animStyle(4)}>
            <TouchableOpacity
              style={[styles.primaryBtn, !mobileValid && { opacity: 0.35 }]}
              activeOpacity={0.8} disabled={!mobileValid}
              onPress={goToAmount}
            >
              <ThemedText variant="button" weight="bold" color="white">Continue</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // ─── USSD ───
  if (step === "ussd") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep("select")} activeOpacity={0.7} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
          </TouchableOpacity>
          <ThemedText variant="h6" weight="bold">USSD Funding</ThemedText>
          <View style={styles.backBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
          <Animated.View style={animStyle(0)}>
            <ThemedText variant="bodySmall" weight="semiBold" style={{ marginBottom: hp(4), paddingHorizontal: wp(24) }}>
              Dial from your phone
            </ThemedText>
            <ThemedText variant="caption" color="tertiary" weight="medium" style={{ marginBottom: hp(16), paddingHorizontal: wp(24) }}>
              Select your bank and dial the USSD code
            </ThemedText>
          </Animated.View>

          {ussdBanks.map((bank, i) => (
            <Animated.View key={bank.name} style={animStyle(Math.min(i + 1, 4))}>
              <View style={styles.ussdCard}>
                <View style={styles.ussdLeft}>
                  <View style={[styles.ussdBankDot, { backgroundColor: bank.color }]} />
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body" weight="semiBold">{bank.name}</ThemedText>
                    <ThemedText variant="bodySmall" weight="bold" color="accent" style={{ marginTop: hp(2) }}>
                      {bank.code}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.ussdCopyBtn}
                  activeOpacity={0.7}
                  onPress={() => copyToClipboard(bank.code, bank.name)}
                >
                  <Ionicons
                    name={bankCopied === bank.name ? "checkmark" : "copy-outline"}
                    size={wp(16)}
                    color={bankCopied === bank.name ? colors.status.success : colors.primary.main}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}

          <Animated.View style={[styles.infoBox, animStyle(4)]}>
            <Ionicons name="information-circle-outline" size={wp(16)} color={colors.primary.main} />
            <ThemedText variant="caption" color="tertiary" weight="medium" style={{ flex: 1 }}>
              Replace "Amount" with how much you want to fund. Your wallet will be credited once the transaction is confirmed.
            </ThemedText>
          </Animated.View>

          <Animated.View style={animStyle(4)}>
            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={handleDone}>
              <ThemedText variant="button" weight="bold" color="white">Done</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // ─── Select Payment Method (default) ───
  function renderWalletPicker() {
    return (
      <Modal visible={showWalletPicker} transparent animationType="fade" onRequestClose={() => setShowWalletPicker(false)}>
        <TouchableWithoutFeedback onPress={() => setShowWalletPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <View style={styles.pickerHandle} />
                <ThemedText variant="h6" weight="bold" style={{ marginBottom: hp(16) }}>Fund to</ThemedText>
                {wallets.map((w, i) => (
                  <TouchableOpacity
                    key={w.code}
                    style={[styles.pickerItem, i === selectedWallet && styles.pickerItemActive]}
                    activeOpacity={0.7}
                    onPress={() => { setSelectedWallet(i); setShowWalletPicker(false); }}
                  >
                    <ThemedText style={{ fontSize: fs(22) }}>{w.flag}</ThemedText>
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="body" weight={i === selectedWallet ? "bold" : "medium"}>{w.code}</ThemedText>
                      <ThemedText variant="caption" color="tertiary">{w.symbol}{formatBalance(w.balance)}</ThemedText>
                    </View>
                    {i === selectedWallet && <Ionicons name="checkmark-circle" size={wp(20)} color={colors.primary.main} />}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
        </TouchableOpacity>
        <ThemedText variant="h6" weight="bold">Fund Wallet</ThemedText>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
        <Animated.View style={animStyle(0)}>
          <TouchableOpacity style={styles.walletCardLg} activeOpacity={0.7} onPress={() => setShowWalletPicker(true)}>
            <View style={styles.walletCardLeft}>
              <ThemedText style={{ fontSize: fs(28) }}>{wallet.flag}</ThemedText>
              <View>
                <ThemedText variant="overline" color="tertiary" weight="medium">FUND TO</ThemedText>
                <ThemedText variant="h6" weight="bold">{wallet.code} Wallet</ThemedText>
                <ThemedText variant="caption" color="tertiary" weight="medium">
                  Balance: {wallet.symbol}{formatBalance(wallet.balance)}
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-down" size={wp(18)} color={colors.text.tertiary} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={animStyle(1)}>
          <ThemedText variant="h6" weight="bold" style={styles.sectionTitle}>Payment Method</ThemedText>
          <ThemedText variant="caption" color="tertiary" weight="medium" style={{ marginBottom: hp(14), paddingHorizontal: wp(24) }}>
            Choose how you want to add funds
          </ThemedText>
        </Animated.View>

        {paymentMethods.map((pm, i) => (
          <Animated.View key={pm.id} style={animStyle(Math.min(i + 2, 4))}>
            <TouchableOpacity style={styles.methodCard} activeOpacity={0.7} onPress={() => handleMethodSelect(pm.id)}>
              <View style={styles.methodIconWrap}>
                <Ionicons name={pm.icon as any} size={wp(22)} color={colors.primary.main} />
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <ThemedText variant="body" weight="semiBold">{pm.title}</ThemedText>
                  {pm.tag && (
                    <View style={[styles.methodTag, { backgroundColor: (pm.tagColor || colors.text.tertiary) + "15" }]}>
                      <ThemedText variant="overline" weight="black" style={{ color: pm.tagColor }}>{pm.tag}</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText variant="caption" color="tertiary" weight="medium">{pm.subtitle}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={wp(18)} color={colors.text.disabled} />
            </TouchableOpacity>
          </Animated.View>
        ))}

        <Animated.View style={[styles.infoBox, animStyle(4)]}>
          <Ionicons name="shield-checkmark" size={wp(16)} color={colors.primary.main} />
          <View style={{ flex: 1 }}>
            <ThemedText variant="caption" weight="semiBold">Secure & Encrypted</ThemedText>
            <ThemedText variant="caption" color="tertiary" weight="medium">
              All transactions are protected with bank-level AES-256 encryption
            </ThemedText>
          </View>
        </Animated.View>
      </ScrollView>

      {renderWalletPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: hp(62), paddingHorizontal: wp(24), paddingBottom: hp(8),
  },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), justifyContent: "center", alignItems: "center" },
  scrollPad: { paddingBottom: hp(40) },
  sectionTitle: { paddingHorizontal: wp(24), marginBottom: hp(4) },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.04)" },

  // Wallet cards
  walletCardLg: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: wp(24), marginBottom: hp(24),
    padding: wp(18), borderRadius: wp(20),
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  walletCardLeft: { flexDirection: "row", alignItems: "center", gap: wp(14) },
  walletRowFull: {
    flexDirection: "row", alignItems: "center", gap: wp(12),
    marginHorizontal: wp(24), marginBottom: hp(16),
    padding: wp(14), borderRadius: wp(16),
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  walletRowCompact: {
    flexDirection: "row", alignItems: "center", alignSelf: "center",
    gap: wp(6), paddingHorizontal: wp(12), paddingVertical: hp(5),
    borderRadius: wp(20), backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: hp(8),
  },

  // Method cards
  methodCard: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: wp(24), marginBottom: hp(10),
    padding: wp(16), borderRadius: wp(16),
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    gap: wp(14),
  },
  methodIconWrap: {
    width: wp(48), height: wp(48), borderRadius: wp(14),
    backgroundColor: colors.primary.main + "10", borderWidth: 1, borderColor: colors.primary.main + "15",
    justifyContent: "center", alignItems: "center",
  },
  methodInfo: { flex: 1, gap: hp(2) },
  methodTitleRow: { flexDirection: "row", alignItems: "center", gap: wp(8) },
  methodTag: { paddingHorizontal: wp(8), paddingVertical: hp(2), borderRadius: wp(6) },

  // Method badge
  methodBadge: {
    flexDirection: "row", alignItems: "center", alignSelf: "center",
    gap: wp(6), paddingHorizontal: wp(12), paddingVertical: hp(4),
    borderRadius: wp(20), backgroundColor: colors.primary.main + "10",
    borderWidth: 1, borderColor: colors.primary.main + "15", marginBottom: hp(12),
  },

  // Info box
  infoBox: {
    flexDirection: "row", alignItems: "flex-start", gap: wp(12),
    marginHorizontal: wp(24), marginTop: hp(16), marginBottom: hp(16),
    padding: wp(16), borderRadius: wp(14),
    backgroundColor: colors.primary.main + "08", borderWidth: 1, borderColor: colors.primary.main + "12",
  },

  // Bank Transfer
  timerCard: {
    flexDirection: "row", alignItems: "center", alignSelf: "center",
    gap: wp(8), paddingHorizontal: wp(14), paddingVertical: hp(6),
    borderRadius: wp(20), backgroundColor: colors.status.warning + "10",
    borderWidth: 1, borderColor: colors.status.warning + "20", marginBottom: hp(14),
  },
  timerDot: { width: wp(6), height: wp(6), borderRadius: wp(3), backgroundColor: colors.status.warning },
  detailsCard: {
    marginHorizontal: wp(24), marginBottom: hp(16),
    padding: wp(18), borderRadius: wp(18),
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  detailRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: hp(10),
  },
  detailValue: { flexDirection: "row", alignItems: "center", gap: wp(8) },
  copyBtn: {
    width: wp(30), height: wp(30), borderRadius: wp(8),
    backgroundColor: colors.primary.main + "12", justifyContent: "center", alignItems: "center",
  },
  copyBtnCopied: { backgroundColor: colors.status.success + "15" },
  stepsCard: {
    marginHorizontal: wp(24), marginBottom: hp(20),
    padding: wp(18), borderRadius: wp(18),
    backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
  },
  stepRow: { flexDirection: "row", alignItems: "center", gap: wp(12), marginBottom: hp(10) },
  stepNumber: {
    width: wp(26), height: wp(26), borderRadius: wp(13),
    backgroundColor: colors.primary.main + "12", justifyContent: "center", alignItems: "center",
  },

  // Card
  cardPreviewWrap: { alignItems: "center", marginHorizontal: wp(24), marginBottom: hp(20), height: hp(190) },
  cardPreview: {
    width: "100%", height: hp(190), borderRadius: wp(20),
    padding: wp(20), justifyContent: "space-between",
    backgroundColor: "#1A2332",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    position: "absolute", top: 0,
  },
  cardPreviewBack: { backgroundColor: "#1E293B" },
  cardPreviewTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardPreviewNumber: { letterSpacing: fs(2), fontSize: fs(18) },
  cardPreviewBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardStripe: { width: "100%", height: hp(40), backgroundColor: "rgba(0,0,0,0.4)", marginTop: hp(20) },
  cardCvvRow: {
    flexDirection: "row", alignItems: "center", gap: wp(10),
    paddingHorizontal: wp(20), marginTop: hp(20),
  },
  cardCvvBox: {
    width: wp(60), height: hp(32), borderRadius: wp(6),
    backgroundColor: "rgba(255,255,255,0.9)", justifyContent: "center", alignItems: "center",
  },

  // Form
  formSection: { paddingHorizontal: wp(24), gap: hp(14) },
  inputGroup: { gap: hp(4) },
  inputGroupRow: { flexDirection: "row", gap: wp(12) },
  inputLabel: { paddingLeft: wp(4) },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: wp(10),
    paddingHorizontal: wp(14), height: hp(50), borderRadius: wp(14),
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  input: {
    flex: 1, color: colors.text.primary, fontFamily: "Satoshi-Medium", fontSize: fs(15),
  },
  inputDivider: { width: 1, height: hp(24), backgroundColor: "rgba(255,255,255,0.08)" },
  securityRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: wp(6), marginVertical: hp(14),
  },

  // Mobile Money
  providerGrid: { flexDirection: "row", gap: wp(10), paddingHorizontal: wp(24), marginBottom: hp(20) },
  providerCard: {
    flex: 1, alignItems: "center", gap: hp(8),
    paddingVertical: hp(16), borderRadius: wp(16),
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  providerCardActive: { borderColor: colors.primary.main + "40", backgroundColor: colors.primary.main + "08" },
  providerIcon: {
    width: wp(48), height: wp(48), borderRadius: wp(14),
    justifyContent: "center", alignItems: "center", borderWidth: 1,
  },
  providerCheck: { position: "absolute", top: wp(8), right: wp(8) },

  // USSD
  ussdCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: wp(24), marginBottom: hp(8),
    padding: wp(16), borderRadius: wp(14),
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  ussdLeft: { flexDirection: "row", alignItems: "center", gap: wp(12), flex: 1 },
  ussdBankDot: { width: wp(10), height: wp(10), borderRadius: wp(5) },
  ussdCopyBtn: {
    width: wp(36), height: wp(36), borderRadius: wp(10),
    backgroundColor: colors.primary.main + "10", justifyContent: "center", alignItems: "center",
  },

  // Amount
  amountCenter: {
    flexDirection: "row", alignItems: "baseline", justifyContent: "center",
    gap: wp(4), paddingVertical: hp(8),
  },
  bigAmount: { fontSize: fs(44), letterSpacing: -fs(1.5), lineHeight: fs(52), color: colors.text.primary },
  quickAmounts: {
    flexDirection: "row", justifyContent: "center", flexWrap: "wrap",
    gap: wp(8), paddingHorizontal: wp(24), marginBottom: hp(8),
  },
  quickChip: {
    paddingHorizontal: wp(16), paddingVertical: hp(8),
    borderRadius: wp(10), backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  quickChipActive: { backgroundColor: colors.primary.main, borderColor: colors.primary.main },
  keypad: { flex: 1, flexDirection: "row", flexWrap: "wrap", paddingHorizontal: wp(24), justifyContent: "center" },
  key: { width: "33.33%", height: hp(48), justifyContent: "center", alignItems: "center" },
  ctaSection: { paddingHorizontal: wp(24), paddingBottom: hp(36), paddingTop: hp(8) },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: wp(8),
    backgroundColor: colors.primary.main, height: hp(56), borderRadius: wp(100),
    marginHorizontal: wp(24),
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: hp(8) }, shadowOpacity: 0.3, shadowRadius: wp(16), elevation: 8,
  },
  fullWidthActions: { width: "100%", marginTop: hp(20) },

  // Processing
  centeredContent: { flex: 1, justifyContent: "center", alignItems: "center", gap: hp(6) },
  processingRing: {
    width: wp(72), height: wp(72), borderRadius: wp(36),
    borderWidth: 3, borderColor: "transparent",
    borderTopColor: colors.primary.main, borderRightColor: colors.primary.main + "40",
    justifyContent: "center", alignItems: "center",
  },
  processingRingInner: {
    width: wp(52), height: wp(52), borderRadius: wp(26),
    backgroundColor: colors.primary.main + "12", justifyContent: "center", alignItems: "center",
  },
  processingDotsRow: { flexDirection: "row", gap: wp(8), marginVertical: hp(10) },
  processingDot: { width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: colors.primary.main },

  // Success
  successCircle: {
    width: wp(76), height: wp(76), borderRadius: wp(38),
    backgroundColor: colors.status.success, justifyContent: "center", alignItems: "center",
    shadowColor: colors.status.success,
    shadowOffset: { width: 0, height: hp(8) }, shadowOpacity: 0.3, shadowRadius: wp(16), elevation: 10,
    marginBottom: hp(10),
  },
  successCard: {
    width: "100%", marginTop: hp(8),
    padding: wp(18), borderRadius: wp(18),
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  successRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: hp(10),
  },

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
  pickerItem: {
    flexDirection: "row", alignItems: "center", gap: wp(14),
    paddingVertical: hp(14), paddingHorizontal: wp(12), borderRadius: wp(14), marginBottom: hp(4),
  },
  pickerItemActive: { backgroundColor: colors.primary.main + "0A" },
});
