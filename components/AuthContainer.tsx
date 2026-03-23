import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface AuthContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showTopLink?: boolean;
  topLinkText?: string;
  onTopLink?: () => void;
}

export const AuthContainer = ({
  children,
  title,
  subtitle,
  showBack = false,
  onBack,
  showTopLink = false,
  topLinkText = "",
  onTopLink,
}: AuthContainerProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Gradient header */}
      <LinearGradient
        colors={[colors.primary.dark, colors.primary.main, colors.primary.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Decorative circles */}
        <View style={styles.floatingCircle1} />
        <View style={styles.floatingCircle2} />
        <View style={styles.floatingCircle3} />

        {/* Top bar */}
        <View style={styles.topBar}>
          {showBack ? (
            <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backButton}>
              <Ionicons name="arrow-back" size={wp(22)} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}

          {showTopLink ? (
            <TouchableOpacity onPress={onTopLink} activeOpacity={0.7} style={styles.topLink}>
              <ThemedText variant="bodySmall" weight="semiBold" color="white">
                {topLinkText}
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.logoBackground}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Decorative curve layers */}
      <View style={styles.decorativeLayer1} />
      <View style={styles.decorativeLayer2} />

      {/* Form card — only this scrolls */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.formContainer}
      >
        <Animated.View style={[styles.formCard, { opacity: fadeAnim }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formCardInner}>
              {/* Title + subtitle */}
              <ThemedText variant="h3" weight="black" style={styles.title}>
                {title}
              </ThemedText>
              {subtitle && (
                <ThemedText variant="body" color="secondary" style={styles.subtitle}>
                  {subtitle}
                </ThemedText>
              )}

              {/* Form content */}
              {children}
            </View>
          </ScrollView>

          {/* Trust footer */}
          <View style={styles.trustFooter}>
            <Ionicons name="shield-checkmark" size={wp(14)} color={colors.text.tertiary} />
            <ThemedText variant="caption" color="tertiary" weight="medium">
              256-bit encrypted  |  Regulated  |  Secure
            </ThemedText>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    height: hp(220),
    paddingTop: hp(55),
    paddingHorizontal: wp(24),
    position: "relative",
    overflow: "hidden",
  },
  floatingCircle1: {
    position: "absolute",
    width: wp(140),
    height: wp(140),
    borderRadius: wp(70),
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    top: -wp(30),
    right: -wp(40),
  },
  floatingCircle2: {
    position: "absolute",
    width: wp(90),
    height: wp(90),
    borderRadius: wp(45),
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: hp(20),
    left: -wp(20),
  },
  floatingCircle3: {
    position: "absolute",
    width: wp(50),
    height: wp(50),
    borderRadius: wp(25),
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    top: hp(80),
    left: wp(60),
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  topLink: {
    paddingHorizontal: wp(18),
    paddingVertical: hp(8),
    backgroundColor: "rgba(255, 255, 255, 0.20)",
    borderRadius: wp(20),
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: wp(18),
    paddingHorizontal: wp(16),
    paddingVertical: hp(6),
    marginBottom: hp(50),
  },
  logo: {
    width: wp(130),
    height: hp(42),
  },
  decorativeLayer1: {
    position: "absolute",
    top: hp(170),
    left: 0,
    right: 0,
    height: hp(100),
    backgroundColor: colors.background.primary,
    opacity: 0.7,
    borderTopLeftRadius: wp(250),
    borderTopRightRadius: wp(250),
  },
  decorativeLayer2: {
    position: "absolute",
    top: hp(185),
    left: 0,
    right: 0,
    height: hp(60),
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: wp(80),
    borderTopRightRadius: wp(80),
  },
  formContainer: {
    flex: 1,
    marginTop: -wp(30),
    zIndex: 10,
  },
  formCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: wp(36),
    borderTopRightRadius: wp(36),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(20),
  },
  formCardInner: {
    paddingHorizontal: wp(24),
    paddingTop: hp(28),
  },
  title: {
    marginBottom: hp(6),
  },
  subtitle: {
    marginBottom: hp(28),
    lineHeight: hp(22),
  },
  trustFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(6),
    paddingVertical: hp(14),
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
