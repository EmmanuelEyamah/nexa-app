import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface WelcomeBackProps {
  userName: string;
  onUnlock: () => void;
  onBiometric: () => void;
  onSwitchAccount: () => void;
  onForgotPassword: () => void;
}

export const WelcomeBack = ({
  userName,
  onUnlock,
  onBiometric,
  onSwitchAccount,
  onForgotPassword,
}: WelcomeBackProps) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const avatarScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(hp(15))).current;

  useEffect(() => {
    Animated.spring(avatarScale, {
      toValue: 1,
      friction: 6,
      tension: 60,
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
    }, 200);
  }, []);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleUnlock = () => {
    if (!password) {
      setError("Enter your password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onUnlock();
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSpacer} />

        {/* Avatar */}
        <Animated.View style={[styles.avatarWrap, { transform: [{ scale: avatarScale }] }]}>
          <View style={styles.avatar}>
            <ThemedText variant="h2" weight="bold" color="white">
              {initials}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Greeting */}
        <Animated.View
          style={[
            styles.greetingWrap,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          <ThemedText variant="h3" weight="black" align="center">
            Welcome back,{"\n"}{userName.split(" ")[0]}
          </ThemedText>
          <ThemedText
            variant="body"
            color="secondary"
            align="center"
            style={styles.subtitle}
          >
            Enter your password or use biometrics to continue
          </ThemedText>
        </Animated.View>

        {/* Password */}
        <Animated.View style={{ opacity: contentOpacity }}>
          <AppTextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError("");
            }}
            error={error}
            isPassword
            leftIcon="lock-closed-outline"
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={onForgotPassword}
            activeOpacity={0.7}
          >
            <ThemedText variant="bodySmall" weight="semiBold" color="accent">
              Forgot Password?
            </ThemedText>
          </TouchableOpacity>

          <AppButton
            title="Unlock"
            onPress={handleUnlock}
            loading={loading}
            variant="primary"
            size="large"
            fullWidth
            style={styles.unlockButton}
          />

          {/* Biometric */}
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={onBiometric}
            activeOpacity={0.7}
          >
            <View style={styles.biometricIcon}>
              <Ionicons
                name="finger-print-outline"
                size={wp(28)}
                color={colors.primary.main}
              />
            </View>
            <ThemedText variant="bodySmall" weight="medium" color="secondary">
              Use Face ID / Fingerprint
            </ThemedText>
          </TouchableOpacity>

          {/* Switch account */}
          <TouchableOpacity
            style={styles.switchAccount}
            onPress={onSwitchAccount}
            activeOpacity={0.7}
          >
            <ThemedText variant="bodySmall" color="secondary">
              Not {userName.split(" ")[0]}?{" "}
              <ThemedText variant="bodySmall" weight="bold" color="accent">
                Use a different account
              </ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: wp(24),
    paddingBottom: hp(40),
  },
  topSpacer: {
    height: hp(100),
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: hp(24),
  },
  avatar: {
    width: wp(86),
    height: wp(86),
    borderRadius: wp(43),
    backgroundColor: colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: hp(8) },
    shadowOpacity: 0.3,
    shadowRadius: wp(16),
    elevation: 10,
  },
  greetingWrap: {
    alignItems: "center",
    marginBottom: hp(32),
  },
  subtitle: {
    marginTop: hp(8),
    maxWidth: wp(280),
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: hp(4),
    marginBottom: hp(24),
  },
  unlockButton: {
    marginBottom: hp(24),
  },
  biometricButton: {
    alignItems: "center",
    gap: hp(10),
    marginBottom: hp(32),
  },
  biometricIcon: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    borderWidth: 1,
    borderColor: colors.primary.main + "25",
    backgroundColor: colors.primary.main + "08",
    justifyContent: "center",
    alignItems: "center",
  },
  switchAccount: {
    alignItems: "center",
  },
});
