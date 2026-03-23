import { ThemedText } from "@/components/ThemedText";
import { LiveRate } from "@/constants/data";
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

interface LiveRateTickerProps {
  rates: LiveRate[];
  onSeeAll?: () => void;
  onRatePress?: (rateId: string) => void;
}

const RateCard = ({
  rate,
  onPress,
}: {
  rate: LiveRate;
  onPress?: () => void;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const changeColor =
    rate.direction === "up" ? colors.status.success : colors.status.error;

  return (
    <TouchableOpacity
      style={styles.rateCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rateHeader}>
        <ThemedText variant="bodySmall" style={styles.flags}>
          {rate.fromFlag}{rate.toFlag}
        </ThemedText>
        <ThemedText variant="caption" color="tertiary" weight="medium">
          {rate.from}/{rate.to}
        </ThemedText>
      </View>
      <ThemedText variant="h6" weight="bold" style={styles.rateValue}>
        {rate.rate.toLocaleString("en-US", {
          minimumFractionDigits: rate.rate < 100 ? 3 : 1,
          maximumFractionDigits: rate.rate < 100 ? 3 : 1,
        })}
      </ThemedText>
      <Animated.View
        style={[
          styles.changeBadge,
          {
            backgroundColor: changeColor + "12",
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Ionicons
          name={rate.direction === "up" ? "trending-up" : "trending-down"}
          size={wp(12)}
          color={changeColor}
        />
        <ThemedText
          variant="overline"
          weight="bold"
          style={{ color: changeColor }}
        >
          {rate.change}%
        </ThemedText>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const LiveRateTicker = ({
  rates,
  onSeeAll,
  onRatePress,
}: LiveRateTickerProps) => {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <ThemedText variant="caption" color="secondary" weight="semiBold">
            LIVE RATES
          </ThemedText>
        </View>
        {onSeeAll && (
          <TouchableOpacity
            onPress={onSeeAll}
            activeOpacity={0.7}
            style={styles.seeAllButton}
          >
            <ThemedText variant="caption" weight="semiBold" color="accent">
              See all
            </ThemedText>
            <Ionicons name="chevron-forward" size={wp(14)} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {rates.map((rate) => (
          <RateCard
            key={rate.id}
            rate={rate}
            onPress={() => onRatePress?.(rate.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: wp(24),
    marginBottom: hp(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  scrollContent: {
    paddingHorizontal: wp(24),
    gap: wp(10),
  },
  rateCard: {
    width: wp(130),
    borderRadius: wp(16),
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.secondary,
    padding: wp(14),
    gap: hp(6),
  },
  rateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(6),
  },
  flags: {
    fontSize: fs(16),
  },
  rateValue: {
    letterSpacing: -fs(0.3),
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: wp(3),
    paddingHorizontal: wp(8),
    paddingVertical: hp(3),
    borderRadius: wp(10),
  },
});
