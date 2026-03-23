import { BalanceCard } from "@/components/BalanceCard";
import { Image } from "expo-image";
import { LiveRateTicker } from "@/components/LiveRateTicker";
import { PromoBanner } from "@/components/PromoBanner";
import { ThemedText } from "@/components/ThemedText";
import { TransactionCard } from "@/components/TransactionCard";
import {
  currencyBalances,
  liveRates,
  promoBanners,
  quickActions,
  recentTransactions,
} from "@/constants/data";
import { colors } from "@/utils/colors";
import { hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const Home = () => {
  const router = useRouter();
  const sectionAnims = useRef(
    Array.from({ length: 6 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(hp(16)),
    }))
  ).current;

  useEffect(() => {
    sectionAnims.forEach((anim, i) => {
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 400,
          delay: i * 80,
          useNativeDriver: true,
        }),
        Animated.spring(anim.translateY, {
          toValue: 0,
          friction: 12,
          tension: 50,
          delay: i * 80,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const animStyle = (i: number) => ({
    opacity: sectionAnims[i].opacity,
    transform: [{ translateY: sectionAnims[i].translateY }],
  });

  return (
    <View style={styles.container}>
      {/* ─── Fixed Header ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText variant="h5" weight="bold">
            {getGreeting()}
          </ThemedText>
          <View style={styles.businessRow}>
            <View style={styles.verifiedDot} />
            <ThemedText variant="caption" color="secondary" weight="medium">
              Nexa Enterprises
            </ThemedText>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={wp(20)} color={colors.text.primary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <Image
            source={{ uri: "https://i.pravatar.cc/100?img=12" }}
            style={styles.avatar}
            contentFit="cover"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── Balance Card ─── */}
        <Animated.View style={[styles.sectionPadded, animStyle(0)]}>
          <BalanceCard currencies={currencyBalances} />
        </Animated.View>

        {/* ─── Quick Actions ─── */}
        <Animated.View style={[styles.quickActionsWrap, animStyle(1)]}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickAction}
              activeOpacity={0.7}
              onPress={() => {
                if (action.id === "send") router.push("/(transfer)/send-money");
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + "10", borderColor: action.color + "15" }]}>
                <Ionicons name={action.icon as any} size={wp(22)} color={action.color} />
              </View>
              <ThemedText variant="caption" weight="medium" color="secondary">
                {action.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ─── Promo Banner ─── */}
        <Animated.View style={[styles.sectionFull, animStyle(2)]}>
          <PromoBanner banners={promoBanners} />
        </Animated.View>

        {/* ─── Live Rates ─── */}
        <Animated.View style={[styles.sectionFull, animStyle(3)]}>
          <LiveRateTicker
            rates={liveRates}
            onSeeAll={() => router.push("/(home)/rates")}
            onRatePress={(rateId) => router.push({ pathname: "/(home)/rate-detail", params: { id: rateId } })}
          />
        </Animated.View>

        {/* ─── Recent Transactions ─── */}
        <Animated.View style={[styles.sectionPadded, animStyle(4)]}>
          <View style={styles.sectionHeader}>
            <View>
              <ThemedText variant="h6" weight="bold">
                Recent Activity
              </ThemedText>
              <ThemedText variant="caption" color="tertiary" weight="medium" style={styles.sectionSubtitle}>
                Your latest transactions
              </ThemedText>
            </View>
            <TouchableOpacity activeOpacity={0.7} style={styles.seeAllButton}>
              <ThemedText variant="caption" weight="semiBold" color="accent">
                See all
              </ThemedText>
              <Ionicons name="chevron-forward" size={wp(14)} color={colors.primary.main} />
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsList}>
            {recentTransactions.map((txn) => (
              <TransactionCard key={txn.id} transaction={txn} />
            ))}
          </View>
        </Animated.View>

        {/* ─── Trust strip ─── */}
        <Animated.View style={[styles.trustStrip, animStyle(5)]}>
          <Ionicons name="shield-checkmark" size={wp(14)} color={colors.text.tertiary} />
          <ThemedText variant="caption" color="tertiary" weight="medium">
            256-bit encrypted · Licensed · Regulated
          </ThemedText>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingTop: hp(8),
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
  headerLeft: {
    gap: hp(3),
  },
  businessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(5),
  },
  verifiedDot: {
    width: wp(5),
    height: wp(5),
    borderRadius: wp(3),
    backgroundColor: colors.status.success,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(10),
  },
  iconButton: {
    width: wp(42),
    height: wp(42),
    borderRadius: wp(13),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  notifDot: {
    position: "absolute",
    top: wp(9),
    right: wp(9),
    width: wp(7),
    height: wp(7),
    borderRadius: wp(4),
    backgroundColor: colors.status.error,
    borderWidth: 1.5,
    borderColor: colors.background.secondary,
  },
  avatar: {
    width: wp(42),
    height: wp(42),
    borderRadius: wp(13),
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.primary.main + "40",
  },
  sectionPadded: {
    paddingHorizontal: wp(24),
    marginBottom: hp(28),
  },
  sectionFull: {
    marginBottom: hp(28),
  },
  quickActionsWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(24),
    marginBottom: hp(28),
  },
  quickAction: {
    alignItems: "center",
    gap: hp(8),
    flex: 1,
  },
  quickActionIcon: {
    width: wp(54),
    height: wp(54),
    borderRadius: wp(18),
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: hp(16),
  },
  sectionSubtitle: {
    marginTop: hp(2),
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    paddingVertical: hp(4),
  },
  transactionsList: {
    borderRadius: wp(20),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: colors.background.secondary,
    paddingHorizontal: wp(14),
  },
  trustStrip: {
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
