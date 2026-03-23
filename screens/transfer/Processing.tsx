import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

interface ProcessingProps {
  recipientName: string;
  onComplete: () => void;
}

const statusSteps = [
  "Verifying details...",
  "Processing transfer...",
  "Sending funds...",
  "Almost there...",
];

export const Processing = ({ recipientName, onComplete }: ProcessingProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const ringRotation = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const dotOpacity = useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  // Rotating ring
  useEffect(() => {
    Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  // Pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.08,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Dot blink
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Step through status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < statusSteps.length - 1) return prev + 1;
        return prev;
      });

      // Fade text
      Animated.sequence([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);

    // Complete after all steps
    const timeout = setTimeout(onComplete, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const spin = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated ring */}
        <View style={styles.ringWrap}>
          <Animated.View
            style={[styles.outerRing, { transform: [{ rotate: spin }] }]}
          >
            <View style={styles.ringSegment} />
          </Animated.View>
          <Animated.View
            style={[styles.innerCircle, { transform: [{ scale: pulseScale }] }]}
          >
            <Ionicons
              name="paper-plane"
              size={wp(28)}
              color={colors.primary.main}
            />
          </Animated.View>
        </View>

        {/* Status text */}
        <Animated.View
          style={{ opacity: textOpacity, alignItems: "center", gap: hp(8) }}
        >
          <ThemedText variant="h5" weight="bold" align="center">
            Sending to {recipientName}
          </ThemedText>
          <View style={styles.statusRow}>
            <Animated.View
              style={[styles.statusDot, { opacity: dotOpacity }]}
            />
            <ThemedText variant="body" color="secondary" weight="medium">
              {statusSteps[stepIndex]}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Progress dots */}
        <View style={styles.progressDots}>
          {statusSteps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    i <= stepIndex
                      ? colors.primary.main
                      : colors.text.tertiary + "30",
                },
              ]}
            />
          ))}
        </View>
      </View>

      <ThemedText
        variant="caption"
        color="tertiary"
        align="center"
        style={styles.footer}
      >
        Please do not close the app
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: hp(32),
    paddingBottom: hp(40),
  },

  ringWrap: {
    width: wp(120),
    height: wp(120),
    justifyContent: "center",
    alignItems: "center",
  },
  outerRing: {
    position: "absolute",
    width: wp(120),
    height: wp(120),
    borderRadius: wp(60),
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.06)",
    borderTopColor: colors.primary.main,
  },
  ringSegment: {},
  innerCircle: {
    width: wp(72),
    height: wp(72),
    borderRadius: wp(36),
    backgroundColor: colors.primary.main + "10",
    borderWidth: 1,
    borderColor: colors.primary.main + "20",
    justifyContent: "center",
    alignItems: "center",
  },

  statusRow: { flexDirection: "row", alignItems: "center", gap: wp(8) },
  statusDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: colors.primary.main,
  },

  progressDots: { flexDirection: "row", gap: wp(8) },
  progressDot: { width: wp(8), height: wp(8), borderRadius: wp(4) },

  footer: { paddingBottom: hp(50) },
});
