import { ThemedText } from "@/components/ThemedText";
import { CurrencyBalance, currencyBalances } from "@/constants/data";
import { colors } from "@/utils/colors";
import { fs, hp, SCREEN_WIDTH, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";

const CARD_WIDTH = SCREEN_WIDTH - wp(64);
const CARD_SPACING = wp(12);

const formatBalance = (balance: number, symbol: string) =>
  `${symbol}${balance.toLocaleString("en-US", {
    minimumFractionDigits: balance >= 10000 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

// Gradient combos per currency
const cardGradients: Record<string, readonly [string, string, string]> = {
  USD: ["#1E40AF", "#2563EB", "#3B82F6"] as const,
  NGN: ["#065F46", "#047857", "#10B981"] as const,
  EUR: ["#4338CA", "#4F46E5", "#6366F1"] as const,
  GBP: ["#9D174D", "#BE185D", "#EC4899"] as const,
  KES: ["#92400E", "#B45309", "#F59E0B"] as const,
};

interface WalletAction {
  icon: string;
  label: string;
  onPress?: () => void;
}

const walletActions: WalletAction[] = [
  { icon: "add-outline", label: "Fund" },
  { icon: "arrow-up-outline", label: "Send" },
  { icon: "arrow-down-outline", label: "Receive" },
  { icon: "swap-horizontal-outline", label: "Convert" },
];

// Single wallet card
const WalletCard = ({
  wallet,
  index,
  scrollX,
}: {
  wallet: CurrencyBalance;
  index: number;
  scrollX: Animated.Value;
}) => {
  const inputRange = [
    (index - 1) * (CARD_WIDTH + CARD_SPACING),
    index * (CARD_WIDTH + CARD_SPACING),
    (index + 1) * (CARD_WIDTH + CARD_SPACING),
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.92, 1, 0.92],
    extrapolate: "clamp",
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.6, 1, 0.6],
    extrapolate: "clamp",
  });

  const gradient = cardGradients[wallet.code] || cardGradients.USD;

  return (
    <Animated.View
      style={[cardStyles.outer, { transform: [{ scale }], opacity }]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={cardStyles.card}
      >
        {/* Decorative circles */}
        <View style={cardStyles.circle1} />
        <View style={cardStyles.circle2} />

        {/* Top: currency info */}
        <View style={cardStyles.topRow}>
          <View style={cardStyles.currencyBadge}>
            <ThemedText variant="bodyLarge" style={cardStyles.flag}>
              {wallet.flag}
            </ThemedText>
            <View>
              <ThemedText variant="bodySmall" weight="bold" color="white">
                {wallet.code}
              </ThemedText>
              <ThemedText
                variant="overline"
                color="white"
                style={{ opacity: 0.7 }}
              >
                {wallet.name}
              </ThemedText>
            </View>
          </View>
          <View style={cardStyles.activeBadge}>
            <View style={cardStyles.activeDot} />
            <ThemedText
              variant="overline"
              weight="bold"
              color="white"
              style={{ opacity: 0.9 }}
            >
              Active
            </ThemedText>
          </View>
        </View>

        {/* Balance */}
        <View style={cardStyles.balanceSection}>
          <ThemedText
            variant="caption"
            color="white"
            weight="medium"
            style={{ opacity: 0.7 }}
          >
            Available Balance
          </ThemedText>
          <ThemedText
            variant="h2"
            weight="black"
            color="white"
            style={cardStyles.balance}
          >
            {formatBalance(wallet.balance, wallet.symbol)}
          </ThemedText>
        </View>

        {/* Bottom row: account info */}
        <View style={cardStyles.bottomRow}>
          <View style={cardStyles.accountInfo}>
            <Ionicons
              name="wallet-outline"
              size={wp(14)}
              color="rgba(255,255,255,0.5)"
            />
            <ThemedText
              variant="caption"
              color="white"
              weight="medium"
              style={{ opacity: 0.6 }}
            >
              Acct ••••{" "}
              {wallet.code === "USD"
                ? "4821"
                : wallet.code === "NGN"
                  ? "7360"
                  : wallet.code === "EUR"
                    ? "5194"
                    : wallet.code === "GBP"
                      ? "8832"
                      : "2047"}
            </ThemedText>
          </View>
          <ThemedText
            variant="caption"
            color="white"
            weight="medium"
            style={{ opacity: 0.5 }}
          >
            Nexa Financial
          </ThemedText>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export const Wallets = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(hp(16))).current;

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(contentTranslateY, {
        toValue: 0,
        friction: 12,
        tension: 50,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;

  const activeWallet = currencyBalances[activeIndex];

  // Total portfolio value (mock — sum all as USD equivalent)
  const totalPortfolio = currencyBalances.reduce((sum, w) => {
    if (w.code === "USD") return sum + w.balance;
    if (w.code === "EUR") return sum + w.balance * 1.088;
    if (w.code === "GBP") return sum + w.balance * 1.272;
    if (w.code === "NGN") return sum + w.balance / 1580;
    if (w.code === "KES") return sum + w.balance / 129;
    return sum;
  }, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View>
          <ThemedText variant="h4" weight="bold">
            Wallets
          </ThemedText>
          <ThemedText variant="caption" color="tertiary" weight="medium">
            {currencyBalances.length} currencies
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
          <Ionicons name="add" size={wp(20)} color={colors.primary.main} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Portfolio summary */}
        <Animated.View
          style={[
            styles.portfolioRow,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          <View style={styles.portfolioCard}>
            <ThemedText variant="caption" color="tertiary" weight="medium">
              Total Portfolio
            </ThemedText>
            <ThemedText variant="h5" weight="bold">
              ${Math.round(totalPortfolio).toLocaleString()}
            </ThemedText>
            <ThemedText variant="overline" color="tertiary" weight="medium">
              USD equivalent
            </ThemedText>
          </View>
        </Animated.View>

        {/* Card carousel */}
        <View style={styles.carouselSection}>
          <Animated.FlatList
            ref={flatListRef}
            data={currencyBalances}
            renderItem={({ item, index }) => (
              <WalletCard wallet={item} index={index} scrollX={scrollX} />
            )}
            keyExtractor={(item) => item.code}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal:
                (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_SPACING / 2,
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />

          {/* Pagination */}
          <View style={styles.pagination}>
            {currencyBalances.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Wallet actions */}
        <Animated.View
          style={[
            styles.actionsRow,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          {walletActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionItem}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <Ionicons
                  name={action.icon as any}
                  size={wp(20)}
                  color={colors.primary.main}
                />
              </View>
              <ThemedText variant="caption" weight="medium" color="secondary">
                {action.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Wallet details card */}
        <Animated.View
          style={[
            styles.detailsSection,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          <ThemedText variant="h6" weight="bold" style={styles.detailsTitle}>
            {activeWallet.flag} {activeWallet.code} Wallet
          </ThemedText>

          <View style={styles.detailsCard}>
            {[
              {
                label: "Account Number",
                value: `•••• •••• ${activeWallet.code === "USD" ? "4821" : activeWallet.code === "NGN" ? "7360" : activeWallet.code === "EUR" ? "5194" : activeWallet.code === "GBP" ? "8832" : "2047"}`,
                icon: "card-outline",
              },
              {
                label: "Bank",
                value: "Nexa Financial Ltd",
                icon: "business-outline",
              },
              {
                label: "SWIFT/BIC",
                value: "NEXAGB2L",
                icon: "globe-outline",
              },
              {
                label: "Status",
                value: "Active",
                icon: "shield-checkmark-outline",
                valueColor: colors.status.success,
              },
            ].map((item, i, arr) => (
              <View
                key={item.label}
                style={[
                  styles.detailRow,
                  i < arr.length - 1 && styles.detailRowBorder,
                ]}
              >
                <View style={styles.detailLeft}>
                  <Ionicons
                    name={item.icon as any}
                    size={wp(16)}
                    color={colors.text.tertiary}
                  />
                  <ThemedText
                    variant="bodySmall"
                    color="tertiary"
                    weight="medium"
                  >
                    {item.label}
                  </ThemedText>
                </View>
                <ThemedText
                  variant="bodySmall"
                  weight="semiBold"
                  style={
                    item.valueColor ? { color: item.valueColor } : undefined
                  }
                >
                  {item.value}
                </ThemedText>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Recent activity for this wallet */}
        <Animated.View
          style={[
            styles.recentSection,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          <View style={styles.recentHeader}>
            <ThemedText variant="h6" weight="bold">
              Recent {activeWallet.code} Activity
            </ThemedText>
          </View>
          <View style={styles.recentCard}>
            {[
              {
                name: "Transfer to Adebayo",
                time: "Today, 2:34 PM",
                amount: `-${activeWallet.symbol}500`,
                type: "send",
              },
              {
                name: "Received from Sarah",
                time: "Today, 11:20 AM",
                amount: `+${activeWallet.symbol}1,200`,
                type: "receive",
              },
              {
                name: "Currency conversion",
                time: "Yesterday, 9:00 AM",
                amount: `+${activeWallet.symbol}3,000`,
                type: "receive",
              },
            ].map((txn, i, arr) => (
              <TouchableOpacity
                key={txn.name}
                style={[
                  styles.recentRow,
                  i < arr.length - 1 && styles.recentRowBorder,
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.recentIcon,
                    {
                      backgroundColor:
                        txn.type === "send"
                          ? colors.primary.main + "10"
                          : colors.status.success + "10",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      txn.type === "send"
                        ? "arrow-up-outline"
                        : "arrow-down-outline"
                    }
                    size={wp(16)}
                    color={
                      txn.type === "send"
                        ? colors.primary.main
                        : colors.status.success
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="bodySmall" weight="semiBold">
                    {txn.name}
                  </ThemedText>
                  <ThemedText
                    variant="caption"
                    color="tertiary"
                    weight="medium"
                  >
                    {txn.time}
                  </ThemedText>
                </View>
                <ThemedText
                  variant="bodySmall"
                  weight="bold"
                  color={txn.type === "receive" ? "success" : "primary"}
                >
                  {txn.amount}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Trust footer */}
        <View style={styles.trustFooter}>
          <Ionicons
            name="shield-checkmark"
            size={wp(14)}
            color={colors.text.tertiary}
          />
          <ThemedText variant="caption" color="tertiary" weight="medium">
            Funds held in segregated accounts · FDIC equivalent protection
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Card styles ───
const cardStyles = StyleSheet.create({
  outer: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_SPACING / 2,
  },
  card: {
    borderRadius: wp(22),
    padding: wp(22),
    height: hp(200),
    justifyContent: "space-between",
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    width: wp(180),
    height: wp(180),
    borderRadius: wp(90),
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -wp(50),
    right: -wp(40),
  },
  circle2: {
    position: "absolute",
    width: wp(100),
    height: wp(100),
    borderRadius: wp(50),
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -wp(20),
    left: -wp(20),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(8),
  },
  flag: {
    fontSize: fs(24),
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(4),
    paddingHorizontal: wp(10),
    paddingVertical: hp(4),
    borderRadius: wp(10),
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  activeDot: {
    width: wp(5),
    height: wp(5),
    borderRadius: wp(3),
    backgroundColor: "#22C55E",
  },
  balanceSection: {
    gap: hp(4),
  },
  balance: {
    letterSpacing: -fs(0.5),
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(6),
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(6),
  },
});

// ─── Main styles ───
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingBottom: hp(120),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: hp(62),
    paddingHorizontal: wp(24),
    paddingBottom: hp(14),
    backgroundColor: colors.background.primary,
    zIndex: 10,
  },
  addButton: {
    width: wp(42),
    height: wp(42),
    borderRadius: wp(13),
    borderWidth: 1,
    borderColor: colors.primary.main + "25",
    backgroundColor: colors.primary.main + "08",
    justifyContent: "center",
    alignItems: "center",
  },
  // Portfolio
  portfolioRow: {
    paddingHorizontal: wp(24),
    marginBottom: hp(20),
  },
  portfolioCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: wp(16),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: wp(18),
    gap: hp(4),
  },
  // Carousel
  carouselSection: {
    marginBottom: hp(24),
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: wp(6),
    marginTop: hp(16),
  },
  dot: {
    height: wp(6),
    borderRadius: wp(3),
  },
  dotActive: {
    width: wp(20),
    backgroundColor: colors.primary.main,
  },
  dotInactive: {
    width: wp(6),
    backgroundColor: colors.text.tertiary + "40",
  },
  // Actions
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(24),
    marginBottom: hp(28),
  },
  actionItem: {
    alignItems: "center",
    gap: hp(8),
    flex: 1,
  },
  actionIcon: {
    width: wp(50),
    height: wp(50),
    borderRadius: wp(16),
    borderWidth: 1,
    borderColor: colors.primary.main + "15",
    backgroundColor: colors.primary.main + "08",
    justifyContent: "center",
    alignItems: "center",
  },
  // Details
  detailsSection: {
    paddingHorizontal: wp(24),
    marginBottom: hp(24),
  },
  detailsTitle: {
    marginBottom: hp(12),
  },
  detailsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: wp(18),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: wp(16),
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(15),
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(10),
  },
  // Recent
  recentSection: {
    paddingHorizontal: wp(24),
    marginBottom: hp(24),
  },
  recentHeader: {
    marginBottom: hp(12),
  },
  recentCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: wp(18),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: wp(14),
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(12),
    paddingVertical: hp(14),
  },
  recentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  recentIcon: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  // Trust
  trustFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(6),
    paddingVertical: hp(16),
    marginHorizontal: wp(24),
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
  },
});
