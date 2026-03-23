import { ThemedText } from "@/components/ThemedText";
import { CurrencyBalance } from "@/constants/data";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface BalanceCardProps {
  currencies: CurrencyBalance[];
}

const formatBalance = (balance: number, symbol: string) => {
  return `${symbol}${balance.toLocaleString("en-US", {
    minimumFractionDigits: balance >= 10000 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

// Mock income/spent per currency
const currencyStats: Record<string, { income: number; spent: number }> = {
  USD: { income: 4200, spent: 1850 },
  NGN: { income: 2800000, spent: 1200000 },
  EUR: { income: 3100, spent: 980 },
  GBP: { income: 2400, spent: 760 },
  KES: { income: 450000, spent: 180000 },
};

export const BalanceCard = ({ currencies }: BalanceCardProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const balanceOpacity = useRef(new Animated.Value(1)).current;
  const balanceTranslateY = useRef(new Animated.Value(0)).current;

  const active = currencies[activeIndex];
  const stats = currencyStats[active.code] || { income: 0, spent: 0 };

  const switchCurrency = (index: number) => {
    if (index === activeIndex) {
      setDropdownOpen(false);
      return;
    }
    setDropdownOpen(false);

    Animated.parallel([
      Animated.timing(balanceOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(balanceTranslateY, { toValue: -hp(6), duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setActiveIndex(index);
      balanceTranslateY.setValue(hp(6));
      Animated.parallel([
        Animated.timing(balanceOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(balanceTranslateY, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
      ]).start();
    });
  };

  return (
    <View style={styles.cardOuter}>
      {/* Gradient glow behind card */}
      <LinearGradient
        colors={[colors.primary.main + "18", colors.primary.dark + "08", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glowBorder}
      />

      <View style={styles.card}>
        {/* Top accent line */}
        <LinearGradient
          colors={[colors.primary.main + "40", colors.primary.light + "15", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentLine}
        />

        {/* Decorative orb */}
        <View style={styles.glowOrb} />
        <View style={styles.glowOrb2} />

        {/* Header: label + currency selector + eye */}
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <View style={styles.liveDot} />
            <ThemedText variant="caption" color="secondary" weight="medium">
              Total Balance
            </ThemedText>
          </View>
          <View style={styles.topRight}>
            <TouchableOpacity
              style={styles.currencyDropdown}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              activeOpacity={0.7}
            >
              <ThemedText variant="caption" style={styles.flagSmall}>{active.flag}</ThemedText>
              <ThemedText variant="caption" weight="bold">{active.code}</ThemedText>
              <Ionicons
                name={dropdownOpen ? "chevron-up" : "chevron-down"}
                size={wp(12)}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setBalanceHidden(!balanceHidden)}
              activeOpacity={0.7}
              style={styles.eyeButton}
            >
              <Ionicons
                name={balanceHidden ? "eye-off-outline" : "eye-outline"}
                size={wp(17)}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance display */}
        <Animated.View
          style={[
            styles.balanceWrap,
            { opacity: balanceOpacity, transform: [{ translateY: balanceTranslateY }] },
          ]}
        >
          <ThemedText variant="h1" weight="black" style={styles.balance}>
            {balanceHidden ? "••••••••" : formatBalance(active.balance, active.symbol)}
          </ThemedText>
        </Animated.View>

        {/* Stats row */}
        <Animated.View style={[styles.statsRow, { opacity: balanceOpacity }]}>
          <View style={styles.statItem}>
            <Ionicons name="trending-up" size={wp(14)} color={colors.status.success} />
            <ThemedText variant="caption" color="tertiary" weight="medium">Income</ThemedText>
            <ThemedText variant="caption" weight="bold" color="success">
              {balanceHidden ? "••••" : `+${active.symbol}${stats.income.toLocaleString()}`}
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="trending-down" size={wp(14)} color={colors.status.error} />
            <ThemedText variant="caption" color="tertiary" weight="medium">Spent</ThemedText>
            <ThemedText variant="caption" weight="bold">
              {balanceHidden ? "••••" : `-${active.symbol}${stats.spent.toLocaleString()}`}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Inline dropdown */}
        {dropdownOpen && (
          <View style={styles.dropdownList}>
            {currencies.map((c, i) => {
              const isActive = i === activeIndex;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
                  onPress={() => switchCurrency(i)}
                  activeOpacity={0.7}
                >
                  <ThemedText variant="body" style={styles.flagDropdown}>{c.flag}</ThemedText>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="bodySmall" weight={isActive ? "bold" : "medium"}>
                      {c.code} <ThemedText variant="caption" color="tertiary">· {c.name}</ThemedText>
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption" weight="bold" color={isActive ? "accent" : "secondary"}>
                    {formatBalance(c.balance, c.symbol)}
                  </ThemedText>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={wp(16)} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardOuter: {
    position: "relative",
  },
  glowBorder: {
    position: "absolute",
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: wp(25),
  },
  card: {
    borderRadius: wp(24),
    backgroundColor: colors.background.secondary,
    padding: wp(22),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  accentLine: {
    position: "absolute",
    top: 0,
    left: wp(20),
    right: wp(20),
    height: 2,
    borderRadius: 1,
  },
  glowOrb: {
    position: "absolute",
    width: wp(200),
    height: wp(200),
    borderRadius: wp(100),
    backgroundColor: colors.primary.main + "05",
    top: -wp(60),
    right: -wp(60),
  },
  glowOrb2: {
    position: "absolute",
    width: wp(120),
    height: wp(120),
    borderRadius: wp(60),
    backgroundColor: colors.primary.light + "03",
    bottom: -wp(30),
    left: -wp(30),
  },
  // Top row
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(18),
    marginTop: hp(4),
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(6),
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(6),
  },
  liveDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: colors.status.success,
  },
  currencyDropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(4),
    paddingVertical: hp(5),
    paddingHorizontal: wp(10),
    borderRadius: wp(8),
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  flagSmall: {
    fontSize: fs(13),
  },
  eyeButton: {
    padding: wp(4),
  },
  // Balance
  balanceWrap: {
    marginBottom: hp(20),
  },
  balance: {
    fontSize: fs(36),
    lineHeight: fs(44),
    letterSpacing: -fs(0.8),
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: hp(16),
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: wp(5),
  },
  statDivider: {
    width: 1,
    height: hp(18),
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: wp(10),
  },
  // Dropdown
  dropdownList: {
    marginTop: hp(16),
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: hp(12),
    gap: hp(2),
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(10),
    paddingVertical: hp(10),
    paddingHorizontal: wp(10),
    borderRadius: wp(12),
  },
  dropdownItemActive: {
    backgroundColor: colors.primary.main + "0A",
  },
  flagDropdown: {
    fontSize: fs(18),
  },
});
