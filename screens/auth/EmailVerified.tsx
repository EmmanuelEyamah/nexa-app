import { AppButton } from "@/components/AppButton";
import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface EmailVerifiedProps {
  onGoHome: () => void;
  onVerifyIdentity: () => void;
}

export const EmailVerified = ({ onGoHome, onVerifyIdentity }: EmailVerifiedProps) => {
  const checkScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(hp(20))).current;

  useEffect(() => {
    Animated.spring(checkScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateY, {
          toValue: 0,
          friction: 10,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[styles.checkContainer, { transform: [{ scale: checkScale }] }]}
        >
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={wp(40)} color="#FFFFFF" />
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
            alignItems: "center",
          }}
        >
          <ThemedText variant="h3" weight="black" align="center" style={styles.title}>
            Account Created!
          </ThemedText>
          <ThemedText variant="body" color="secondary" align="center" style={styles.subtitle}>
            Your account has been successfully created. Complete your identity
            verification to unlock full transaction limits.
          </ThemedText>
        </Animated.View>
      </View>

      <View style={styles.bottom}>
        <AppButton
          title="Verify Identity"
          onPress={onVerifyIdentity}
          variant="primary"
          size="large"
          fullWidth
          rightIcon={<Ionicons name="shield-checkmark-outline" size={wp(18)} color="#FFFFFF" />}
        />

        <AppButton
          title="Go to Dashboard"
          onPress={onGoHome}
          variant="secondary"
          size="large"
          fullWidth
        />

        <ThemedText variant="caption" color="tertiary" align="center" style={styles.skipNote}>
          You can verify your identity later from Settings
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: wp(24),
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: hp(40),
  },
  checkContainer: {
    marginBottom: hp(32),
  },
  checkCircle: {
    width: wp(80),
    height: wp(80),
    borderRadius: wp(40),
    backgroundColor: colors.status.success,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.status.success,
    shadowOffset: { width: 0, height: hp(8) },
    shadowOpacity: 0.3,
    shadowRadius: wp(16),
    elevation: 10,
  },
  title: {
    marginBottom: hp(12),
  },
  subtitle: {
    maxWidth: wp(300),
    lineHeight: hp(22),
  },
  bottom: {
    paddingBottom: hp(50),
    gap: hp(12),
    alignItems: "center",
  },
  skipNote: {
    marginTop: hp(4),
  },
});
