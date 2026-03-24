import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ReceiveProps {
  onBack: () => void;
}

const wallets = [
  { code: "USD", symbol: "$", flag: "🇺🇸", name: "US Dollar", acctLast4: "4821", bank: "Nexa Financial Ltd", swift: "NEXAUS2L", routing: "021000021" },
  { code: "NGN", symbol: "₦", flag: "🇳🇬", name: "Nigerian Naira", acctLast4: "7360", bank: "Nexa Financial Ltd", swift: "NEXANG2L", routing: "058152052" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", name: "Euro", acctLast4: "5194", bank: "Nexa Financial Ltd", swift: "NEXAEU2L", routing: "IBAN" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", name: "British Pound", acctLast4: "8832", bank: "Nexa Financial Ltd", swift: "NEXAGB2L", routing: "Sort: 20-00-00" },
  { code: "KES", symbol: "KSh", flag: "🇰🇪", name: "Kenyan Shilling", acctLast4: "2047", bank: "Nexa Financial Ltd", swift: "NEXAKE2L", routing: "M-Pesa" },
];

type Tab = "details" | "qr";

export const Receive = ({ onBack }: ReceiveProps) => {
  const [activeWalletIdx, setActiveWalletIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(hp(12))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(contentTranslateY, { toValue: 0, friction: 12, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const wallet = wallets[activeWalletIdx];

  const handleCopy = (field: string) => {
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const accountDetails = [
    { label: "Account Name", value: "Nexa Enterprises Ltd", key: "name" },
    { label: "Account Number", value: `•••• •••• ${wallet.acctLast4}`, key: "acct" },
    { label: "Bank", value: wallet.bank, key: "bank" },
    { label: "SWIFT/BIC", value: wallet.swift, key: "swift" },
    { label: wallet.code === "GBP" ? "Sort Code" : wallet.code === "KES" ? "Network" : "Routing", value: wallet.routing, key: "routing" },
    { label: "Currency", value: `${wallet.flag} ${wallet.code} — ${wallet.name}`, key: "currency" },
  ];

  const qrValue = `nexa://pay?account=${wallet.acctLast4}&currency=${wallet.code}&bank=${encodeURIComponent(wallet.bank)}&swift=${wallet.swift}`;

  const QRSection = () => (
    <View style={styles.qrContainer}>
      <View style={styles.qrOuter}>
        <QRCode
          value={qrValue}
          size={wp(180)}
          color="#0B0F14"
          backgroundColor="#FFFFFF"
          ecl="M"
        />
      </View>
      <ThemedText variant="bodySmall" weight="semiBold" align="center" style={styles.qrWalletLabel}>
        {wallet.flag} {wallet.code} Account
      </ThemedText>
      <ThemedText variant="caption" color="tertiary" weight="medium" align="center" style={styles.qrHint}>
        Scan to send {wallet.code} to this account
      </ThemedText>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
        </TouchableOpacity>
        <ThemedText variant="h6" weight="bold">Receive Money</ThemedText>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Currency selector */}
        <Animated.View style={[styles.section, { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }]}>
          <TouchableOpacity
            style={styles.walletSelector}
            onPress={() => setWalletPickerOpen(true)}
            activeOpacity={0.7}
          >
            <ThemedText variant="bodyLarge" style={styles.selectorFlag}>{wallet.flag}</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText variant="body" weight="bold">{wallet.code} Account</ThemedText>
              <ThemedText variant="caption" color="tertiary" weight="medium">{wallet.name}</ThemedText>
            </View>
            <Ionicons name="chevron-down" size={wp(18)} color={colors.text.tertiary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Tab switcher */}
        <Animated.View style={[styles.tabRow, { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }]}>
          {([
            { key: "details" as Tab, label: "Account Details", icon: "card-outline" },
            { key: "qr" as Tab, label: "QR Code", icon: "qr-code-outline" },
          ]).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={wp(16)}
                  color={isActive ? colors.primary.main : colors.text.tertiary}
                />
                <ThemedText
                  variant="bodySmall"
                  weight={isActive ? "bold" : "medium"}
                  color={isActive ? "accent" : "tertiary"}
                >
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Content based on tab */}
        <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }}>
          {activeTab === "details" ? (
            <View style={styles.detailsCard}>
              {accountDetails.map((item, i) => (
                <View
                  key={item.key}
                  style={[styles.detailRow, i < accountDetails.length - 1 && styles.detailRowBorder]}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="caption" color="tertiary" weight="medium">{item.label}</ThemedText>
                    <ThemedText variant="body" weight="semiBold" style={styles.detailValue}>{item.value}</ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCopy(item.key)}
                    activeOpacity={0.7}
                    style={styles.copyBtn}
                  >
                    <Ionicons
                      name={copiedField === item.key ? "checkmark-circle" : "copy-outline"}
                      size={wp(18)}
                      color={copiedField === item.key ? colors.status.success : colors.text.tertiary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <QRSection />
          )}
        </Animated.View>

        {/* Share button */}
        <Animated.View style={[styles.shareSection, { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }]}>
          <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={wp(18)} color={colors.primary.main} />
            <ThemedText variant="body" weight="semiBold" color="accent">
              Share {activeTab === "qr" ? "QR Code" : "Account Details"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.copyAllBtn} activeOpacity={0.7} onPress={() => handleCopy("all")}>
            <Ionicons
              name={copiedField === "all" ? "checkmark-circle" : "clipboard-outline"}
              size={wp(16)}
              color={copiedField === "all" ? colors.status.success : colors.text.secondary}
            />
            <ThemedText variant="bodySmall" weight="medium" color={copiedField === "all" ? "success" : "secondary"}>
              {copiedField === "all" ? "Copied!" : "Copy all details"}
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>

        {/* Info note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={wp(16)} color={colors.text.tertiary} />
          <ThemedText variant="caption" color="tertiary" weight="medium" style={{ flex: 1 }}>
            Share these details with the sender. Incoming transfers in {wallet.code} typically arrive within minutes.
          </ThemedText>
        </View>
      </ScrollView>

      {/* Wallet picker */}
      <Modal
        visible={walletPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setWalletPickerOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setWalletPickerOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <View style={styles.pickerHandle} />
                <ThemedText variant="h6" weight="bold" style={styles.pickerTitle}>
                  Receive into
                </ThemedText>
                {wallets.map((w, i) => {
                  const isActive = i === activeWalletIdx;
                  return (
                    <TouchableOpacity
                      key={w.code}
                      style={[styles.pickerItem, isActive && styles.pickerItemActive]}
                      onPress={() => {
                        setActiveWalletIdx(i);
                        setWalletPickerOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <ThemedText variant="bodyLarge" style={{ fontSize: fs(22) }}>{w.flag}</ThemedText>
                      <View style={{ flex: 1 }}>
                        <ThemedText variant="body" weight={isActive ? "bold" : "medium"}>{w.code}</ThemedText>
                        <ThemedText variant="caption" color="tertiary" weight="medium">{w.name}</ThemedText>
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
    paddingTop: hp(62), paddingHorizontal: wp(24), paddingBottom: hp(12),
  },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: hp(40) },
  section: { paddingHorizontal: wp(24), marginBottom: hp(16) },

  // Wallet selector
  walletSelector: {
    flexDirection: "row", alignItems: "center", gap: wp(14),
    paddingVertical: hp(14), paddingHorizontal: wp(18),
    borderRadius: wp(18), borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)", backgroundColor: colors.background.secondary,
  },
  selectorFlag: { fontSize: fs(24) },

  // Tabs
  tabRow: {
    flexDirection: "row", gap: wp(10),
    paddingHorizontal: wp(24), marginBottom: hp(20),
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: wp(8),
    paddingVertical: hp(12), borderRadius: wp(14), borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)", backgroundColor: colors.background.secondary,
  },
  tabActive: {
    borderColor: colors.primary.main + "30", backgroundColor: colors.primary.main + "08",
  },

  // Details
  detailsCard: {
    marginHorizontal: wp(24), borderRadius: wp(20), borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)", backgroundColor: colors.background.secondary,
    paddingHorizontal: wp(18), marginBottom: hp(20),
  },
  detailRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: hp(16),
  },
  detailRowBorder: {
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)",
  },
  detailValue: { marginTop: hp(3) },
  copyBtn: {
    width: wp(36), height: wp(36), borderRadius: wp(10),
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center", alignItems: "center", marginLeft: wp(10),
  },

  // QR
  qrContainer: {
    marginHorizontal: wp(24), alignItems: "center",
    paddingVertical: hp(28), paddingHorizontal: wp(20),
    borderRadius: wp(20), borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)", backgroundColor: colors.background.secondary,
    marginBottom: hp(20),
  },
  qrOuter: {
    padding: wp(18), borderRadius: wp(18),
    backgroundColor: "#FFFFFF",
    marginBottom: hp(14),
  },
  qrWalletLabel: { marginBottom: hp(4) },
  qrHint: { marginTop: hp(2) },

  // Share
  shareSection: {
    paddingHorizontal: wp(24), gap: hp(12), alignItems: "center", marginBottom: hp(20),
  },
  shareBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: wp(8),
    width: "100%", height: hp(54), borderRadius: wp(100),
    borderWidth: 1, borderColor: colors.primary.main + "25", backgroundColor: colors.primary.main + "08",
  },
  copyAllBtn: {
    flexDirection: "row", alignItems: "center", gap: wp(6), paddingVertical: hp(6),
  },

  // Info
  infoNote: {
    flexDirection: "row", alignItems: "flex-start", gap: wp(10),
    marginHorizontal: wp(24), padding: wp(16), borderRadius: wp(14),
    backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
  },

  // Modal
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
  pickerTitle: { marginBottom: hp(14) },
  pickerItem: {
    flexDirection: "row", alignItems: "center", gap: wp(14),
    paddingVertical: hp(14), paddingHorizontal: wp(12), borderRadius: wp(14), marginBottom: hp(2),
  },
  pickerItemActive: { backgroundColor: colors.primary.main + "0A" },
});
