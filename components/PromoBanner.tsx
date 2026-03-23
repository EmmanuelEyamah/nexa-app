import { ThemedText } from "@/components/ThemedText";
import { PromoBanner as PromoBannerType } from "@/constants/data";
import { colors } from "@/utils/colors";
import { hp, SCREEN_WIDTH, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";

interface PromoBannerProps {
  banners: PromoBannerType[];
}

const CARD_WIDTH = SCREEN_WIDTH - wp(48);
const CARD_MARGIN = wp(8);

export const PromoBanner = ({ banners }: PromoBannerProps) => {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval>>();

  // Auto-scroll every 4s
  useEffect(() => {
    autoScrollTimer.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);

    return () => clearInterval(autoScrollTimer.current);
  }, [banners.length]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderBanner = ({
    item,
  }: {
    item: PromoBannerType;
  }) => (
    <View
      style={[
        styles.bannerCard,
        { borderColor: item.accentColor + "20" },
      ]}
    >
      <View style={styles.bannerContent}>
        <View style={[styles.bannerIconWrap, { backgroundColor: item.accentColor + "15" }]}>
          <Ionicons name={item.icon as any} size={wp(20)} color={item.accentColor} />
        </View>
        <ThemedText variant="h6" weight="bold" style={styles.bannerTitle}>
          {item.title}
        </ThemedText>
        <ThemedText variant="caption" color="secondary" weight="medium" style={styles.bannerSubtitle}>
          {item.subtitle}
        </ThemedText>
      </View>
      {/* Accent glow */}
      <View style={[styles.accentGlow, { backgroundColor: item.accentColor + "06" }]} />
    </View>
  );

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: wp(24) }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollBeginDrag={() => clearInterval(autoScrollTimer.current)}
        onScrollEndDrag={() => {
          autoScrollTimer.current = setInterval(() => {
            setActiveIndex((prev) => {
              const next = (prev + 1) % banners.length;
              flatListRef.current?.scrollToIndex({ index: next, animated: true });
              return next;
            });
          }, 4000);
        }}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {banners.map((_, i) => (
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
  );
};

const styles = StyleSheet.create({
  bannerCard: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    borderRadius: wp(18),
    borderWidth: 1,
    backgroundColor: colors.background.secondary,
    padding: wp(18),
    overflow: "hidden",
  },
  bannerContent: {
    zIndex: 1,
  },
  bannerIconWrap: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(10),
  },
  bannerTitle: {
    marginBottom: hp(4),
  },
  bannerSubtitle: {
    lineHeight: hp(18),
  },
  accentGlow: {
    position: "absolute",
    width: wp(150),
    height: wp(150),
    borderRadius: wp(75),
    right: -wp(40),
    bottom: -wp(40),
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: wp(6),
    marginTop: hp(12),
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
});
