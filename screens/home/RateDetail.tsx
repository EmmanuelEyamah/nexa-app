import { AppButton } from "@/components/AppButton";
import { ThemedText } from "@/components/ThemedText";
import { LiveRate, liveRates } from "@/constants/data";
import { colors } from "@/utils/colors";
import { fs, hp, SCREEN_WIDTH, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface RateDetailProps {
  rateId: string;
  onBack: () => void;
}

type TimeRange = "1H" | "1D" | "1W" | "1M" | "1Y";

// Generate mock chart points
const generateChartData = (
  base: number,
  points: number,
  volatility: number,
) => {
  const data: number[] = [];
  let current = base;
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.48) * volatility;
    current = current + change;
    data.push(current);
  }
  return data;
};

// Single animated bar — extracted to avoid hooks-in-map
const ChartBar = ({
  barWidth,
  barHeight,
  color,
  isLast,
  delay,
}: {
  barWidth: number;
  barHeight: number;
  color: string;
  isLast: boolean;
  delay: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    scaleY.setValue(0);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleY, {
        toValue: 1,
        friction: 12,
        tension: 60,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [barHeight, delay]);

  return (
    <Animated.View
      style={[
        chartStyles.bar,
        {
          width: barWidth,
          height: barHeight,
          backgroundColor: isLast ? color : color + "40",
          opacity,
          transform: [{ scaleY }],
        },
      ]}
    />
  );
};

// Chart wrapper with tooltip rendered outside the clipped chart
const ChartWithScrub = ({
  data,
  color,
  rate,
}: {
  data: number[];
  color: string;
  rate: LiveRate;
}) => {
  const chartHeight = hp(200);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rangeVal = max - min || 1;
  const chartWidth = SCREEN_WIDTH - wp(48);

  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const scrubOpacity = useRef(new Animated.Value(0)).current;

  const getIndex = (x: number) =>
    Math.min(
      Math.max(Math.floor((x / chartWidth) * data.length), 0),
      data.length - 1,
    );

  const handleTouchStart = (evt: any) => {
    setScrubIndex(getIndex(evt.nativeEvent.locationX));
    Animated.timing(scrubOpacity, {
      toValue: 1,
      duration: 80,
      useNativeDriver: false,
    }).start();
  };
  const handleTouchMove = (evt: any) => {
    setScrubIndex(getIndex(evt.nativeEvent.locationX));
  };
  const handleTouchEnd = () => {
    Animated.timing(scrubOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setScrubIndex(null);
    });
  };

  const scrubValue = scrubIndex !== null ? data[scrubIndex] : null;
  const scrubX =
    scrubIndex !== null ? (scrubIndex / data.length) * chartWidth : 0;
  const barWidth = chartWidth / data.length - 1;

  // Clamp tooltip so it doesn't go off-screen
  const tooltipWidth = wp(80);
  const tooltipLeft = Math.min(
    Math.max(scrubX - tooltipWidth / 2, 0),
    chartWidth - tooltipWidth,
  );

  return (
    <View style={styles.chartSection}>
      {/* Tooltip — rendered above chart, outside overflow:hidden */}
      <Animated.View
        style={[chartStyles.tooltipRow, { opacity: scrubOpacity }]}
      >
        {scrubValue !== null && (
          <View
            style={[
              chartStyles.scrubTooltip,
              { backgroundColor: color, left: tooltipLeft },
            ]}
          >
            <ThemedText variant="caption" weight="bold" color="white">
              {scrubValue.toLocaleString("en-US", {
                minimumFractionDigits: rate.rate < 100 ? 4 : 2,
                maximumFractionDigits: rate.rate < 100 ? 4 : 2,
              })}
            </ThemedText>
          </View>
        )}
      </Animated.View>

      {/* Chart area */}
      <View
        style={[chartStyles.container, { height: chartHeight }]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
        onResponderTerminate={handleTouchEnd}
      >
        {/* Grid lines */}
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[chartStyles.gridLine, { top: (chartHeight / 3) * i }]}
          />
        ))}

        {/* Bars */}
        <View style={chartStyles.barsWrap}>
          {data.map((value, i) => {
            const barHeight =
              ((value - min) / rangeVal) * (chartHeight - hp(20)) + hp(8);
            const isLast = i >= data.length - 3;
            const isHighlighted = scrubIndex === i;
            return (
              <ChartBar
                key={`${i}-${data.length}`}
                barWidth={barWidth}
                barHeight={barHeight}
                color={isHighlighted ? "#FFFFFF" : color}
                isLast={isHighlighted || isLast}
                delay={i * 12}
              />
            );
          })}
        </View>

        {/* Current price dashed line */}
        <View
          style={[
            chartStyles.priceLine,
            {
              bottom:
                ((data[data.length - 1] - min) / rangeVal) *
                  (chartHeight - hp(20)) +
                hp(8),
              borderColor: color + "40",
            },
          ]}
        >
          <View
            style={[chartStyles.priceLineDot, { backgroundColor: color }]}
          />
        </View>

        {/* Scrub vertical line + dot */}
        {scrubIndex !== null && (
          <Animated.View
            style={[
              chartStyles.scrubLine,
              { left: scrubX, opacity: scrubOpacity },
            ]}
          >
            <View
              style={[chartStyles.scrubLineInner, { backgroundColor: color }]}
            />
            <View
              style={[
                chartStyles.scrubDot,
                {
                  backgroundColor: color,
                  bottom:
                    ((data[scrubIndex] - min) / rangeVal) *
                      (chartHeight - hp(20)) +
                    hp(8) -
                    wp(5),
                },
              ]}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
};

export const RateDetail = ({ rateId, onBack }: RateDetailProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("1D");
  const rate = liveRates.find((r) => r.id === rateId) || liveRates[0];
  const changeColor =
    rate.direction === "up" ? colors.status.success : colors.status.error;

  // Generate chart data based on time range
  const pointsMap: Record<TimeRange, number> = {
    "1H": 30,
    "1D": 48,
    "1W": 42,
    "1M": 30,
    "1Y": 52,
  };
  const volatilityMap: Record<TimeRange, number> = {
    "1H": rate.rate * 0.001,
    "1D": rate.rate * 0.003,
    "1W": rate.rate * 0.008,
    "1M": rate.rate * 0.02,
    "1Y": rate.rate * 0.05,
  };

  const [chartData, setChartData] = useState(() =>
    generateChartData(rate.rate, pointsMap["1D"], volatilityMap["1D"]),
  );

  // Animated values for stats
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsTranslateY = useRef(new Animated.Value(hp(10))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(statsOpacity, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(statsTranslateY, {
        toValue: 0,
        friction: 10,
        tension: 50,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const switchRange = (range: TimeRange) => {
    setTimeRange(range);
    setChartData(
      generateChartData(rate.rate, pointsMap[range], volatilityMap[range]),
    );
  };

  const high = Math.max(...chartData);
  const low = Math.min(...chartData);
  const open = chartData[0];
  const close = chartData[chartData.length - 1];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={wp(22)}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ThemedText variant="bodyLarge" style={styles.flags}>
            {rate.fromFlag} {rate.toFlag}
          </ThemedText>
          <ThemedText variant="h6" weight="bold">
            {rate.from}/{rate.to}
          </ThemedText>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current rate */}
        <View style={styles.rateSection}>
          <ThemedText variant="h2" weight="black" style={styles.currentRate}>
            {rate.rate.toLocaleString("en-US", {
              minimumFractionDigits: rate.rate < 100 ? 4 : 2,
              maximumFractionDigits: rate.rate < 100 ? 4 : 2,
            })}
          </ThemedText>
          <View
            style={[
              styles.changeBadge,
              { backgroundColor: changeColor + "12" },
            ]}
          >
            <Ionicons
              name={rate.direction === "up" ? "trending-up" : "trending-down"}
              size={wp(14)}
              color={changeColor}
            />
            <ThemedText
              variant="bodySmall"
              weight="bold"
              style={{ color: changeColor }}
            >
              {rate.direction === "up" ? "+" : "-"}
              {rate.change}%
            </ThemedText>
            <ThemedText variant="caption" color="tertiary" weight="medium">
              today
            </ThemedText>
          </View>
        </View>

        {/* Chart with scrub tooltip above */}
        <ChartWithScrub data={chartData} color={changeColor} rate={rate} />

        {/* Time range tabs */}
        <View style={styles.timeRangeTabs}>
          {(["1H", "1D", "1W", "1M", "1Y"] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeTab,
                timeRange === range && styles.timeTabActive,
              ]}
              onPress={() => switchRange(range)}
              activeOpacity={0.7}
            >
              <ThemedText
                variant="caption"
                weight={timeRange === range ? "bold" : "medium"}
                color={timeRange === range ? "accent" : "tertiary"}
              >
                {range}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats grid */}
        <Animated.View
          style={[
            styles.statsGrid,
            {
              opacity: statsOpacity,
              transform: [{ translateY: statsTranslateY }],
            },
          ]}
        >
          {[
            { label: "Open", value: open.toFixed(rate.rate < 100 ? 4 : 2) },
            { label: "Close", value: close.toFixed(rate.rate < 100 ? 4 : 2) },
            { label: "High", value: high.toFixed(rate.rate < 100 ? 4 : 2) },
            { label: "Low", value: low.toFixed(rate.rate < 100 ? 4 : 2) },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <ThemedText variant="caption" color="tertiary" weight="medium">
                {stat.label}
              </ThemedText>
              <ThemedText variant="bodySmall" weight="bold">
                {stat.value}
              </ThemedText>
            </View>
          ))}
        </Animated.View>

        {/* Rate info */}
        <Animated.View
          style={[
            styles.rateInfo,
            {
              opacity: statsOpacity,
              transform: [{ translateY: statsTranslateY }],
            },
          ]}
        >
          <View style={styles.rateInfoRow}>
            <Ionicons
              name="time-outline"
              size={wp(16)}
              color={colors.text.tertiary}
            />
            <ThemedText variant="caption" color="tertiary" weight="medium">
              Last updated 30 seconds ago
            </ThemedText>
          </View>
          <View style={styles.rateInfoRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={wp(16)}
              color={colors.text.tertiary}
            />
            <ThemedText variant="caption" color="tertiary" weight="medium">
              Mid-market rate · No markup
            </ThemedText>
          </View>
        </Animated.View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <AppButton
            title={`Convert ${rate.from} → ${rate.to}`}
            onPress={() => {}}
            variant="primary"
            size="large"
            fullWidth
          />
          <AppButton
            title="Swap currencies"
            onPress={() => {}}
            variant="secondary"
            size="large"
            fullWidth
            leftIcon={
              <Ionicons
                name="swap-horizontal-outline"
                size={wp(18)}
                color={colors.text.primary}
              />
            }
          />
          <TouchableOpacity style={styles.alertButton} activeOpacity={0.7}>
            <Ionicons
              name="notifications-outline"
              size={wp(16)}
              color={colors.primary.main}
            />
            <ThemedText variant="bodySmall" weight="semiBold" color="accent">
              Set rate alert for {rate.from}/{rate.to}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const chartStyles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  tooltipRow: {
    height: hp(28),
    marginBottom: hp(4),
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  barsWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
    height: "100%",
  },
  bar: {
    borderTopLeftRadius: wp(2),
    borderTopRightRadius: wp(2),
  },
  priceLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: "dashed",
  },
  priceLineDot: {
    position: "absolute",
    right: 0,
    top: -wp(4),
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
  },
  scrubTooltip: {
    position: "absolute",
    top: 0,
    paddingHorizontal: wp(10),
    paddingVertical: hp(5),
    borderRadius: wp(8),
    width: wp(80),
    alignItems: "center",
  },
  scrubLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: wp(1),
    alignItems: "center",
  },
  scrubLineInner: {
    width: 1,
    height: "100%",
    opacity: 0.5,
  },
  scrubDot: {
    position: "absolute",
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginLeft: -wp(4.5),
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingBottom: hp(40),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: hp(62),
    paddingHorizontal: wp(24),
    paddingBottom: hp(12),
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
  flags: {
    fontSize: fs(24),
  },
  // Rate
  rateSection: {
    alignItems: "center",
    paddingVertical: hp(12),
    gap: hp(8),
  },
  currentRate: {
    letterSpacing: -fs(1),
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(6),
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    borderRadius: wp(12),
  },
  // Chart
  chartSection: {
    paddingHorizontal: wp(24),
    paddingVertical: hp(16),
  },
  // Time range
  timeRangeTabs: {
    flexDirection: "row",
    justifyContent: "center",
    gap: wp(4),
    paddingHorizontal: wp(24),
    marginBottom: hp(24),
  },
  timeTab: {
    paddingVertical: hp(8),
    paddingHorizontal: wp(18),
    borderRadius: wp(10),
    backgroundColor: "transparent",
  },
  timeTabActive: {
    backgroundColor: colors.primary.main + "12",
    borderWidth: 1,
    borderColor: colors.primary.main + "20",
  },
  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(10),
    paddingHorizontal: wp(24),
    marginBottom: hp(24),
  },
  statCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - wp(48) - wp(10)) / 2 - 1,
    backgroundColor: colors.background.secondary,
    borderRadius: wp(14),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: wp(14),
    gap: hp(4),
  },
  // Info
  rateInfo: {
    paddingHorizontal: wp(24),
    gap: hp(10),
  },
  rateInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(8),
  },
  // CTAs
  ctaSection: {
    paddingHorizontal: wp(24),
    paddingTop: hp(28),
    gap: hp(12),
    alignItems: "center",
  },
  alertButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(6),
    paddingVertical: hp(8),
  },
});
