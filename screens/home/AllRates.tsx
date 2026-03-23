import { ThemedText } from "@/components/ThemedText";
import { LiveRate, liveRates } from "@/constants/data";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// Extended rates — more pairs for the full view
const allRates: LiveRate[] = [
  ...liveRates,
  { id: "7", from: "GBP", to: "USD", fromFlag: "🇬🇧", toFlag: "🇺🇸", rate: 1.272, change: 0.18, direction: "up" },
  { id: "8", from: "USD", to: "ZAR", fromFlag: "🇺🇸", toFlag: "🇿🇦", rate: 18.45, change: 0.95, direction: "down" },
  { id: "9", from: "EUR", to: "KES", fromFlag: "🇪🇺", toFlag: "🇰🇪", rate: 140.8, change: 0.41, direction: "up" },
  { id: "10", from: "USD", to: "TZS", fromFlag: "🇺🇸", toFlag: "🇹🇿", rate: 2715, change: 0.28, direction: "up" },
  { id: "11", from: "GBP", to: "NGN", fromFlag: "🇬🇧", toFlag: "🇳🇬", rate: 2010.8, change: 0.55, direction: "up" },
  { id: "12", from: "USD", to: "EGP", fromFlag: "🇺🇸", toFlag: "🇪🇬", rate: 50.85, change: 1.2, direction: "down" },
];

interface AllRatesProps {
  onBack: () => void;
  onRatePress: (rateId: string) => void;
}

const RateRow = ({
  rate,
  index,
  onPress,
}: {
  rate: LiveRate;
  index: number;
  onPress: () => void;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(wp(20))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        friction: 12,
        tension: 60,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const changeColor =
    rate.direction === "up" ? colors.status.success : colors.status.error;

  // Mini sparkline simulation (just dots at different heights)
  const sparkHeights = useRef(
    Array.from({ length: 8 }, () => Math.random() * hp(16) + hp(4))
  ).current;

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <TouchableOpacity
        style={styles.rateRow}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Left: flags + pair */}
        <View style={styles.ratePair}>
          <ThemedText variant="bodyLarge" style={styles.flags}>
            {rate.fromFlag}{rate.toFlag}
          </ThemedText>
          <View>
            <ThemedText variant="body" weight="semiBold">
              {rate.from}/{rate.to}
            </ThemedText>
            <ThemedText variant="caption" color="tertiary" weight="medium">
              {rate.direction === "up" ? "Rising" : "Falling"}
            </ThemedText>
          </View>
        </View>

        {/* Center: mini sparkline */}
        <View style={styles.sparkline}>
          {sparkHeights.map((h, i) => (
            <View
              key={i}
              style={[
                styles.sparkBar,
                {
                  height: h,
                  backgroundColor:
                    i >= 5 ? changeColor + "60" : changeColor + "25",
                },
              ]}
            />
          ))}
        </View>

        {/* Right: rate + change */}
        <View style={styles.rateValues}>
          <ThemedText variant="body" weight="bold">
            {rate.rate.toLocaleString("en-US", {
              minimumFractionDigits: rate.rate < 100 ? 3 : 1,
              maximumFractionDigits: rate.rate < 100 ? 3 : 1,
            })}
          </ThemedText>
          <View style={[styles.changeBadge, { backgroundColor: changeColor + "12" }]}>
            <Ionicons
              name={rate.direction === "up" ? "caret-up" : "caret-down"}
              size={wp(10)}
              color={changeColor}
            />
            <ThemedText variant="overline" weight="bold" style={{ color: changeColor }}>
              {rate.change}%
            </ThemedText>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={wp(16)} color={colors.text.tertiary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const AllRates = ({ onBack, onRatePress }: AllRatesProps) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backButton}>
          <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <ThemedText variant="h6" weight="bold">
              Live Rates
            </ThemedText>
          </View>
          <ThemedText variant="caption" color="tertiary" weight="medium">
            Updated every 30 seconds
          </ThemedText>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allRates.map((rate, i) => (
          <RateRow
            key={rate.id}
            rate={rate}
            index={i}
            onPress={() => onRatePress(rate.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: hp(62),
    paddingHorizontal: wp(24),
    paddingBottom: hp(16),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  backButton: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
    gap: hp(2),
  },
  liveIndicator: {
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
  scrollContent: {
    paddingHorizontal: wp(24),
    paddingTop: hp(12),
    paddingBottom: hp(40),
  },
  // Rate row
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(12),
    paddingVertical: hp(16),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  ratePair: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(10),
    flex: 1,
  },
  flags: {
    fontSize: fs(20),
  },
  sparkline: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: wp(2),
    height: hp(24),
    width: wp(50),
  },
  sparkBar: {
    width: wp(4),
    borderRadius: wp(2),
  },
  rateValues: {
    alignItems: "flex-end",
    gap: hp(3),
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    paddingHorizontal: wp(6),
    paddingVertical: hp(2),
    borderRadius: wp(6),
  },
});
