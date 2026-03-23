import { AppButton } from "@/components/AppButton";
import { ThemedText } from "@/components/ThemedText";
import { OnboardingSlide, slides } from "@/constants/data";
import { colors } from "@/utils/colors";
import { fs, hp, SCREEN_HEIGHT, SCREEN_WIDTH, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface OnboardingProps {
  onComplete: () => void;
  onLogin: () => void;
}

// ─── Auto-playing transfer simulation (Slide 1) ───
const AMOUNT_CHARS = "$5,000.00".split("");

const TransferSimulation = ({ accentColor }: { accentColor: string }) => {
  const [phase, setPhase] = useState<"idle" | "typing" | "sending" | "done">("idle");
  const [typedCount, setTypedCount] = useState(0);
  const beamProgress = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const receiveOpacity = useRef(new Animated.Value(0)).current;
  const rateOpacity = useRef(new Animated.Value(0)).current;
  const receiveScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    let typeInterval: ReturnType<typeof setInterval>;
    let timeouts: ReturnType<typeof setTimeout>[] = [];

    const runCycle = () => {
      // Reset
      beamProgress.setValue(0);
      checkScale.setValue(0);
      receiveOpacity.setValue(0);
      rateOpacity.setValue(0);
      receiveScale.setValue(0.95);
      setTypedCount(0);
      setPhase("idle");

      // Step 1: Type amount character by character
      timeouts.push(setTimeout(() => {
        setPhase("typing");
        let count = 0;
        typeInterval = setInterval(() => {
          count++;
          setTypedCount(count);
          if (count >= AMOUNT_CHARS.length) {
            clearInterval(typeInterval);
          }
        }, 80);
      }, 300));

      // Step 2: Show rate after typing
      timeouts.push(setTimeout(() => {
        Animated.timing(rateOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 1200));

      // Step 3: Send beam
      timeouts.push(setTimeout(() => {
        setPhase("sending");
        Animated.timing(beamProgress, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }).start();
      }, 1800));

      // Step 4: Reveal receive
      timeouts.push(setTimeout(() => {
        setPhase("done");
        Animated.parallel([
          Animated.timing(receiveOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(receiveScale, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.spring(checkScale, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2900));
    };

    runCycle();
    const loopInterval = setInterval(runCycle, 5500);
    return () => {
      clearInterval(loopInterval);
      clearInterval(typeInterval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const displayAmount = AMOUNT_CHARS.slice(0, typedCount).join("");
  const showCursor = phase === "typing" && typedCount < AMOUNT_CHARS.length;

  return (
    <View style={simStyles.container}>
      {/* Send card */}
      <View style={simStyles.row}>
        <View
          style={[simStyles.rowIcon, { backgroundColor: accentColor + "18" }]}
        >
          <Ionicons name="arrow-up-outline" size={wp(16)} color={accentColor} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText variant="caption" color="tertiary" weight="medium">
            You send
          </ThemedText>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: hp(2) }}>
            <ThemedText variant="h6" weight="bold">
              {displayAmount || " "}
            </ThemedText>
            {showCursor && (
              <View style={simStyles.cursor} />
            )}
          </View>
        </View>
        <View style={simStyles.flag}>
          <ThemedText variant="caption" weight="medium">USD</ThemedText>
        </View>
      </View>

      {/* Transfer path */}
      <View style={simStyles.pathContainer}>
        <View style={[simStyles.pathLine, { backgroundColor: accentColor + "15" }]} />
        <Animated.View
          style={[
            simStyles.beam,
            {
              backgroundColor: phase === "sending" ? accentColor : "transparent",
              shadowColor: phase === "sending" ? accentColor : "transparent",
              top: beamProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, hp(32)],
              }),
            },
          ]}
        />
        <Animated.View style={[simStyles.rateBadge, { opacity: rateOpacity }]}>
          <Ionicons name="swap-vertical-outline" size={wp(12)} color={accentColor} />
          <ThemedText variant="caption" color="secondary" weight="medium">
            1 USD = 1,580 NGN
          </ThemedText>
        </Animated.View>
      </View>

      {/* Receive card - reveals after send */}
      <Animated.View
        style={[
          simStyles.row,
          phase === "done" && simStyles.rowSuccess,
          { opacity: phase === "done" ? receiveOpacity : 0.25, transform: [{ scale: receiveScale }] },
        ]}
      >
        <View
          style={[simStyles.rowIcon, { backgroundColor: colors.status.success + "18" }]}
        >
          {phase === "done" ? (
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Ionicons name="checkmark-circle" size={wp(18)} color={colors.status.success} />
            </Animated.View>
          ) : (
            <Ionicons name="arrow-down-outline" size={wp(16)} color={colors.text.tertiary} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText variant="caption" color={phase === "done" ? "secondary" : "disabled"} weight="medium">
            They receive
          </ThemedText>
          <ThemedText
            variant="h6"
            weight="bold"
            color={phase === "done" ? "success" : "disabled"}
            style={{ marginTop: hp(2) }}
          >
            {phase === "done" ? "N7,900,000" : "---"}
          </ThemedText>
        </View>
        <View style={simStyles.flag}>
          <ThemedText variant="caption" weight="medium" color={phase === "done" ? "primary" : "disabled"}>
            NGN
          </ThemedText>
        </View>
      </Animated.View>
    </View>
  );
};

// ─── Auto-playing security grid (Slide 2) ───
const SecurityGrid = ({ accentColor }: { accentColor: string }) => {
  const items = [
    { icon: "finger-print-outline", label: "Biometric Auth" },
    { icon: "lock-closed-outline", label: "AES-256 Encryption" },
    { icon: "shield-checkmark-outline", label: "KYC Verified" },
    { icon: "checkmark-circle-outline", label: "Fully Compliant" },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const pulseAnims = useRef(items.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const cycle = () => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % items.length;
        Animated.sequence([
          Animated.timing(pulseAnims[next], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnims[next], {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
        return next;
      });
    };

    const interval = setInterval(cycle, 1500);
    Animated.sequence([
      Animated.timing(pulseAnims[0], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnims[0], {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearInterval(interval);
  }, []);

  const renderItem = (i: number) => {
    const item = items[i];
    const isActive = i === activeIndex;
    const scale = pulseAnims[i].interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.05],
    });

    return (
      <Animated.View
        key={item.label}
        style={[
          gridStyles.item,
          isActive && {
            borderColor: accentColor + "30",
            backgroundColor: accentColor + "08",
          },
          { transform: [{ scale }] },
        ]}
      >
        <View
          style={[
            gridStyles.iconWrap,
            {
              backgroundColor: isActive
                ? accentColor + "20"
                : accentColor + "08",
            },
          ]}
        >
          <Ionicons
            name={item.icon as any}
            size={wp(20)}
            color={isActive ? accentColor : accentColor + "60"}
          />
        </View>
        <ThemedText
          variant="caption"
          color={isActive ? "primary" : "tertiary"}
          weight={isActive ? "bold" : "medium"}
          style={{ marginTop: hp(6) }}
        >
          {item.label}
        </ThemedText>
        {isActive && (
          <Animated.View style={[gridStyles.activeCheck, { transform: [{ scale }] }]}>
            <Ionicons name="checkmark-circle" size={wp(16)} color={accentColor} />
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={gridStyles.container}>
      <View style={gridStyles.row}>
        {renderItem(0)}
        {renderItem(1)}
      </View>
      <View style={gridStyles.row}>
        {renderItem(2)}
        {renderItem(3)}
      </View>
    </View>
  );
};

// ─── Auto-playing timeline (Slide 3) ───
const SpeedTimeline = ({ accentColor }: { accentColor: string }) => {
  const steps = [
    { icon: "time-outline", label: "Initiated", time: "9:41 AM" },
    { icon: "flash-outline", label: "Processing", time: "< 30s" },
    { icon: "checkmark-done-outline", label: "Delivered", time: "9:41 AM" },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const lineProgress = useRef(new Animated.Value(0)).current;
  const stepScales = useRef(steps.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const runCycle = () => {
      lineProgress.setValue(0);
      stepScales.forEach((s) => s.setValue(1));
      setActiveStep(0);

      // Pulse step 0
      Animated.sequence([
        Animated.timing(stepScales[0], { toValue: 1.1, duration: 200, useNativeDriver: true }),
        Animated.timing(stepScales[0], { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        setActiveStep(1);
        Animated.parallel([
          Animated.timing(lineProgress, { toValue: 0.5, duration: 500, useNativeDriver: false }),
          Animated.sequence([
            Animated.timing(stepScales[1], { toValue: 1.15, duration: 200, useNativeDriver: true }),
            Animated.timing(stepScales[1], { toValue: 1, duration: 300, useNativeDriver: true }),
          ]),
        ]).start();
      }, 1200);

      setTimeout(() => {
        setActiveStep(2);
        Animated.parallel([
          Animated.timing(lineProgress, { toValue: 1, duration: 500, useNativeDriver: false }),
          Animated.sequence([
            Animated.timing(stepScales[2], { toValue: 1.15, duration: 200, useNativeDriver: true }),
            Animated.timing(stepScales[2], { toValue: 1, duration: 300, useNativeDriver: true }),
          ]),
        ]).start();
      }, 2400);
    };

    runCycle();
    const interval = setInterval(runCycle, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={timelineStyles.container}>
      {/* Horizontal track */}
      <View style={timelineStyles.track}>
        <View style={timelineStyles.trackBg} />
        <Animated.View
          style={[
            timelineStyles.trackFill,
            {
              backgroundColor: accentColor,
              width: lineProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      {/* Step nodes */}
      <View style={timelineStyles.nodesRow}>
        {steps.map((step, i) => {
          const isActive = i <= activeStep;
          return (
            <Animated.View
              key={step.label}
              style={[timelineStyles.stepItem, { transform: [{ scale: stepScales[i] }] }]}
            >
              <View
                style={[
                  timelineStyles.node,
                  {
                    backgroundColor: isActive ? accentColor : accentColor + "15",
                    borderColor: isActive ? accentColor : accentColor + "25",
                  },
                ]}
              >
                {i < activeStep ? (
                  <Ionicons name="checkmark" size={wp(14)} color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name={step.icon as any}
                    size={wp(14)}
                    color={isActive ? "#FFFFFF" : accentColor + "50"}
                  />
                )}
              </View>
              <ThemedText
                variant="caption"
                color={isActive ? "primary" : "tertiary"}
                weight={i === activeStep ? "bold" : "medium"}
                style={{ marginTop: hp(6) }}
              >
                {step.label}
              </ThemedText>
              <ThemedText
                variant="overline"
                color={isActive ? "secondary" : "disabled"}
                weight="medium"
              >
                {step.time}
              </ThemedText>
            </Animated.View>
          );
        })}
      </View>

      {/* Speed stat */}
      <View style={timelineStyles.statRow}>
        <View style={[timelineStyles.statIcon, { backgroundColor: accentColor + "12" }]}>
          <Ionicons name="flash" size={wp(14)} color={accentColor} />
        </View>
        <ThemedText variant="caption" color="secondary" weight="medium">
          Average settlement:{" "}
        </ThemedText>
        <ThemedText variant="caption" color="primary" weight="bold">
          under 30 seconds
        </ThemedText>
      </View>
    </View>
  );
};

// ─── Main Onboarding ───
export const Onboarding = ({ onComplete, onLogin }: OnboardingProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideRef = useRef<any>(null);
  const mountOpacity = useRef(new Animated.Value(0)).current;

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const loginOpacity = useRef(new Animated.Value(0)).current;
  const loginTranslateY = useRef(new Animated.Value(20)).current;
  const buttonMargin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(mountOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Floating circles
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(float1, { toValue: 1, duration: 3000, useNativeDriver: true }),
          Animated.timing(float1, { toValue: 0, duration: 3000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(float2, { toValue: 1, duration: 4000, useNativeDriver: true }),
          Animated.timing(float2, { toValue: 0, duration: 4000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(float3, { toValue: 1, duration: 3500, useNativeDriver: true }),
          Animated.timing(float3, { toValue: 0, duration: 3500, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  // Login link on last slide
  useEffect(() => {
    if (currentIndex === slides.length - 1) {
      Animated.parallel([
        Animated.timing(loginOpacity, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
        Animated.spring(loginTranslateY, { toValue: 0, friction: 8, tension: 40, delay: 200, useNativeDriver: true }),
        Animated.spring(buttonMargin, { toValue: 1, friction: 9, tension: 50, delay: 100, useNativeDriver: false }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(loginOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(loginTranslateY, { toValue: 20, duration: 200, useNativeDriver: true }),
        Animated.timing(buttonMargin, { toValue: 0, duration: 300, useNativeDriver: false }),
      ]).start();
    }
  }, [currentIndex]);

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
      slideRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const renderCardContent = (item: OnboardingSlide) => {
    switch (item.id) {
      case 1:
        return <TransferSimulation accentColor={item.accentColor} />;
      case 2:
        return <SecurityGrid accentColor={item.accentColor} />;
      case 3:
        return <SpeedTimeline accentColor={item.accentColor} />;
      default:
        return null;
    }
  };

  const renderSlide = ({
    item,
    index,
  }: {
    item: OnboardingSlide;
    index: number;
  }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const contentOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: "clamp",
    });

    const float1Y = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
    const float2Y = float2.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
    const float3Y = float3.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });

    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={[colors.background.primary, colors.background.tertiary]}
          style={styles.gradientBackground}
        >
          {/* Floating circles */}
          <Animated.View
            style={[styles.floatingCircle1, { backgroundColor: item.accentColor + "12", transform: [{ translateY: float1Y }] }]}
          />
          <Animated.View
            style={[styles.floatingCircle2, { backgroundColor: item.accentColor + "0A", transform: [{ translateY: float2Y }] }]}
          />
          <Animated.View
            style={[styles.floatingCircle3, { backgroundColor: colors.primary.main + "08", transform: [{ translateY: float3Y }] }]}
          />

          <View style={styles.contentWrapper}>
            {/* Logo */}
            <View style={styles.header}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Interactive card */}
            <Animated.View style={[styles.cardContainer, { opacity: contentOpacity }]}>
              <View style={styles.glassCard}>
                {/* Icon badge */}
                <View style={[styles.iconBadge, { backgroundColor: item.accentColor }]}>
                  <Ionicons name={item.iconName as any} size={wp(24)} color="#FFFFFF" />
                </View>

                {/* Card header label */}
                <View style={styles.cardHeader}>
                  <View style={[styles.cardHeaderDot, { backgroundColor: item.accentColor }]} />
                  <ThemedText variant="overline" color="tertiary" weight="semiBold" style={styles.cardHeaderText}>
                    {index === 0 ? "LIVE PREVIEW" : index === 1 ? "SECURITY FEATURES" : "TRANSFER SPEED"}
                  </ThemedText>
                </View>

                {/* Interactive content */}
                {renderCardContent(item)}

                {/* Decorative dots */}
                <View style={[styles.decorativeDot1, { backgroundColor: item.accentColor }]} />
                <View style={[styles.decorativeDot2, { backgroundColor: item.accentColor + "50" }]} />
              </View>
            </Animated.View>

            {/* Text */}
            <View style={styles.textContent}>
              <ThemedText variant="h2" weight="black" style={styles.title}>
                {item.title}
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={styles.description}>
                {item.description}
              </ThemedText>

              {/* Trust indicators */}
              <View style={styles.trustRow}>
                {(index === 0
                  ? [{ icon: "globe-outline", text: "40+ countries" }, { icon: "flash-outline", text: "Instant" }, { icon: "shield-outline", text: "Protected" }]
                  : index === 1
                  ? [{ icon: "lock-closed-outline", text: "Encrypted" }, { icon: "eye-off-outline", text: "Private" }, { icon: "ribbon-outline", text: "Licensed" }]
                  : [{ icon: "timer-outline", text: "< 30 seconds" }, { icon: "trending-up-outline", text: "99.9% uptime" }, { icon: "people-outline", text: "5k+ users" }]
                ).map((badge) => (
                  <View key={badge.text} style={styles.trustBadge}>
                    <Ionicons name={badge.icon as any} size={wp(12)} color={item.accentColor} />
                    <ThemedText variant="caption" color="secondary" weight="medium">
                      {badge.text}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />

      <Animated.View style={{ flex: 1, opacity: mountOpacity }}>
        {/* Skip */}
        <TouchableOpacity style={styles.skipButton} onPress={onComplete} activeOpacity={0.7}>
          <View style={styles.skipButtonInner}>
            <ThemedText variant="bodySmall" weight="medium">Skip</ThemedText>
          </View>
        </TouchableOpacity>

        {/* Slides */}
        <Animated.FlatList
          ref={slideRef}
          data={slides}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(index);
          }}
          scrollEventThrottle={16}
        />

        {/* Bottom */}
        <View style={styles.bottomSection}>
          <View style={styles.pagination}>
            {slides.map((slide, index) => {
              const inputRange = [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ];
              const dotWidth = scrollX.interpolate({ inputRange, outputRange: [wp(8), wp(36), wp(8)], extrapolate: "clamp" });
              const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: "clamp" });
              return (
                <Animated.View
                  key={index}
                  style={[styles.dot, { width: dotWidth, opacity: dotOpacity, backgroundColor: slide.accentColor }]}
                />
              );
            })}
          </View>

          <Animated.View
            style={{
              marginBottom: buttonMargin.interpolate({ inputRange: [0, 1], outputRange: [0, hp(8)] }),
            }}
          >
            <AppButton
              title={currentIndex === slides.length - 1 ? "Get Started" : "Continue"}
              onPress={currentIndex === slides.length - 1 ? onComplete : goToNext}
              variant="primary"
              size="large"
              fullWidth
              rightIcon={<Ionicons name="arrow-forward" size={wp(20)} color="#FFFFFF" />}
            />
          </Animated.View>

          {currentIndex === slides.length - 1 && (
            <Animated.View
              style={[styles.loginButton, { opacity: loginOpacity, transform: [{ translateY: loginTranslateY }] }]}
            >
              <TouchableOpacity onPress={onLogin} activeOpacity={0.7}>
                <ThemedText variant="body" weight="medium">
                  Already have an account?{" "}
                  <ThemedText variant="body" weight="bold" color="accent">
                    Sign In
                  </ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

// ─── Simulation styles ───
const simStyles = StyleSheet.create({
  container: { gap: hp(4) },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(12),
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: wp(16),
    padding: wp(14),
  },
  rowSuccess: {
    borderColor: colors.status.success + "20",
    backgroundColor: colors.status.success + "06",
  },
  cursor: {
    width: wp(2),
    height: hp(18),
    backgroundColor: colors.primary.main,
    marginLeft: wp(1),
    borderRadius: 1,
  },
  rowIcon: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  flag: {
    paddingHorizontal: wp(10),
    paddingVertical: hp(4),
    borderRadius: wp(8),
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  pathContainer: {
    height: hp(44),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  pathLine: {
    position: "absolute",
    width: wp(2),
    height: "100%",
    borderRadius: 1,
  },
  beam: {
    position: "absolute",
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  rateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(6),
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: wp(20),
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    marginLeft: wp(20),
  },
});

// ─── Security grid styles ───
// Card inner width = SCREEN_WIDTH - cardContainer padding (wp(24)*2) - glassCard padding (wp(20)*2)
const gridGap = wp(8);

const gridStyles = StyleSheet.create({
  container: {
    gap: gridGap,
  },
  row: {
    flexDirection: "row",
    gap: gridGap,
  },
  item: {
    flex: 1,
    alignItems: "center",
    paddingVertical: hp(12),
    paddingHorizontal: wp(8),
    borderRadius: wp(14),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  iconWrap: {
    width: wp(38),
    height: wp(38),
    borderRadius: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  activeDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    marginTop: hp(6),
  },
  activeCheck: {
    marginTop: hp(6),
  },
});

// ─── Timeline styles ───
const timelineStyles = StyleSheet.create({
  container: { gap: hp(16) },
  track: {
    height: hp(3),
    borderRadius: hp(2),
    overflow: "hidden",
    marginHorizontal: wp(20),
  },
  trackBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: hp(2),
  },
  trackFill: {
    height: "100%",
    borderRadius: hp(2),
  },
  nodesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    gap: hp(2),
  },
  node: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(8),
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: wp(14),
    paddingVertical: hp(10),
    paddingHorizontal: wp(14),
  },
  statIcon: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(8),
    justifyContent: "center",
    alignItems: "center",
  },
});

// ─── Main styles ───
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  gradientBackground: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingBottom: hp(260),
  },
  header: {
    paddingTop: hp(70),
    paddingHorizontal: wp(24),
    alignItems: "center",
    marginBottom: hp(24),
  },
  logo: {
    width: wp(160),
    height: hp(45),
  },
  floatingCircle1: {
    position: "absolute",
    width: wp(220),
    height: wp(220),
    borderRadius: wp(110),
    top: hp(80),
    right: -wp(60),
  },
  floatingCircle2: {
    position: "absolute",
    width: wp(160),
    height: wp(160),
    borderRadius: wp(80),
    top: hp(320),
    left: -wp(50),
  },
  floatingCircle3: {
    position: "absolute",
    width: wp(120),
    height: wp(120),
    borderRadius: wp(60),
    bottom: hp(260),
    right: wp(10),
  },
  cardContainer: {
    paddingHorizontal: wp(24),
    marginBottom: hp(28),
  },
  glassCard: {
    borderRadius: wp(32),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: wp(20),
    paddingTop: wp(32),
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp(12) },
    shadowOpacity: 0.15,
    shadowRadius: wp(24),
    elevation: 12,
  },
  iconBadge: {
    position: "absolute",
    top: -wp(22),
    right: wp(22),
    width: wp(58),
    height: wp(58),
    borderRadius: wp(20),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp(8) },
    shadowOpacity: 0.3,
    shadowRadius: wp(14),
    elevation: 12,
    zIndex: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
  },
  decorativeDot1: {
    position: "absolute",
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    bottom: wp(16),
    left: wp(16),
    opacity: 0.5,
  },
  decorativeDot2: {
    position: "absolute",
    width: wp(7),
    height: wp(7),
    borderRadius: wp(4),
    top: wp(48),
    left: wp(14),
    opacity: 0.3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(6),
    marginBottom: hp(14),
  },
  cardHeaderDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
  },
  cardHeaderText: {
    letterSpacing: fs(1),
  },
  textContent: {
    paddingHorizontal: wp(32),
    alignItems: "center",
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: wp(8),
    marginTop: hp(16),
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(5),
    paddingVertical: hp(6),
    paddingHorizontal: wp(10),
    borderRadius: wp(20),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  title: {
    textAlign: "center",
    marginBottom: hp(12),
  },
  description: {
    textAlign: "center",
    lineHeight: fs(22),
    paddingHorizontal: wp(8),
  },
  skipButton: {
    position: "absolute",
    top: hp(64),
    right: wp(24),
    zIndex: 100,
  },
  skipButtonInner: {
    paddingHorizontal: wp(20),
    paddingVertical: hp(10),
    borderRadius: wp(20),
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(24),
    paddingTop: hp(28),
    paddingBottom: hp(44),
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    borderTopLeftRadius: wp(32),
    borderTopRightRadius: wp(32),
    backgroundColor: colors.background.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -hp(8) },
    shadowOpacity: 0.15,
    shadowRadius: wp(16),
    elevation: 20,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(28),
    height: hp(8),
  },
  dot: {
    height: hp(6),
    borderRadius: wp(3),
    marginHorizontal: wp(4),
  },
  loginButton: {
    marginTop: hp(16),
    alignItems: "center",
    width: "100%",
  },
});
