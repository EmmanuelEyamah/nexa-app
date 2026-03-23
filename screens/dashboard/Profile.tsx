import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface MenuItem {
  icon: string;
  label: string;
  subtitle?: string;
  rightText?: string;
  rightColor?: string;
  badge?: string;
  badgeColor?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const kycLevel = "basic"; // "none" | "basic" | "verified" | "premium"

const kycConfig = {
  none: { label: "Not Verified", color: colors.status.error, progress: 0 },
  basic: { label: "Basic", color: colors.status.warning, progress: 0.33 },
  verified: { label: "Verified", color: colors.primary.main, progress: 0.66 },
  premium: { label: "Premium", color: colors.status.success, progress: 1 },
};

const menuSections: MenuSection[] = [
  {
    title: "ACCOUNT",
    items: [
      {
        icon: "person-outline",
        label: "Personal Information",
        subtitle: "Name, email, phone",
      },
      {
        icon: "business-outline",
        label: "Business Details",
        subtitle: "Company info, registration",
      },
      {
        icon: "document-text-outline",
        label: "Documents",
        subtitle: "ID, proof of address",
        badge: "2 pending",
        badgeColor: colors.status.warning,
      },
    ],
  },
  {
    title: "VERIFICATION",
    items: [
      {
        icon: "shield-checkmark-outline",
        label: "Identity Verification",
        subtitle: "KYC level: Basic",
        rightText: "Upgrade",
        rightColor: colors.primary.main,
      },
      {
        icon: "ribbon-outline",
        label: "Business Verification",
        subtitle: "Verify your business",
        rightText: "Start",
        rightColor: colors.status.warning,
      },
      {
        icon: "speedometer-outline",
        label: "Transaction Limits",
        subtitle: "$5,000/day · $25,000/month",
      },
    ],
  },
  {
    title: "SECURITY",
    items: [
      {
        icon: "lock-closed-outline",
        label: "Change Password",
        subtitle: "Last changed 30 days ago",
      },
      {
        icon: "finger-print-outline",
        label: "Biometric Login",
        subtitle: "Face ID / Fingerprint",
        rightText: "Enabled",
        rightColor: colors.status.success,
      },
      {
        icon: "phone-portrait-outline",
        label: "Two-Factor Authentication",
        subtitle: "SMS & Authenticator app",
        rightText: "On",
        rightColor: colors.status.success,
      },
      {
        icon: "key-outline",
        label: "Login Sessions",
        subtitle: "2 active devices",
      },
    ],
  },
  {
    title: "PREFERENCES",
    items: [
      {
        icon: "notifications-outline",
        label: "Notifications",
        subtitle: "Push, email, SMS",
      },
      {
        icon: "globe-outline",
        label: "Default Currency",
        subtitle: "USD - US Dollar",
      },
      {
        icon: "language-outline",
        label: "Language",
        subtitle: "English",
      },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      {
        icon: "chatbubble-ellipses-outline",
        label: "Help Center",
        subtitle: "FAQs and guides",
      },
      {
        icon: "headset-outline",
        label: "Contact Support",
        subtitle: "Chat, email, phone",
      },
      {
        icon: "document-outline",
        label: "Legal",
        subtitle: "Terms, privacy, licenses",
      },
    ],
  },
];

export const Profile = () => {
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(hp(12))).current;

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.spring(contentTranslateY, {
        toValue: 0,
        friction: 12,
        tension: 50,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const kyc = kycConfig[kycLevel];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <ThemedText variant="h4" weight="bold">
          Profile
        </ThemedText>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={wp(20)} color={colors.text.primary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile card */}
        <Animated.View
          style={[
            styles.profileCard,
            { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
          ]}
        >
          <View style={styles.profileRow}>
            <Image
              source={{ uri: "https://i.pravatar.cc/100?img=12" }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.profileInfo}>
              <ThemedText variant="h6" weight="bold">
                Nonso Peters
              </ThemedText>
              <ThemedText variant="caption" color="secondary" weight="medium">
                nonso@nexaenterprises.com
              </ThemedText>
              <View style={styles.memberBadge}>
                <Ionicons name="diamond-outline" size={wp(11)} color={colors.primary.main} />
                <ThemedText variant="overline" weight="bold" color="accent">
                  Business Account
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Ionicons name="create-outline" size={wp(18)} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* KYC Progress card */}
        <Animated.View
          style={[
            styles.kycCard,
            { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
          ]}
        >
          <View style={styles.kycHeader}>
            <View style={styles.kycLeft}>
              <View style={[styles.kycIconWrap, { backgroundColor: kyc.color + "15" }]}>
                <Ionicons name="shield-checkmark" size={wp(18)} color={kyc.color} />
              </View>
              <View>
                <ThemedText variant="bodySmall" weight="bold">
                  Verification Status
                </ThemedText>
                <ThemedText variant="caption" color="tertiary" weight="medium">
                  Level: {kyc.label}
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity style={[styles.kycButton, { backgroundColor: kyc.color + "15" }]} activeOpacity={0.7}>
              <ThemedText variant="caption" weight="bold" style={{ color: kyc.color }}>
                Upgrade
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.kycProgressTrack}>
            <View style={[styles.kycProgressFill, { width: `${kyc.progress * 100}%`, backgroundColor: kyc.color }]} />
            {/* Level markers */}
            {[0.33, 0.66, 1].map((marker, i) => (
              <View
                key={i}
                style={[
                  styles.kycMarker,
                  {
                    left: `${marker * 100}%`,
                    backgroundColor: kyc.progress >= marker ? kyc.color : colors.text.tertiary + "30",
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.kycLevels}>
            <ThemedText variant="overline" color="tertiary" weight="medium">Basic</ThemedText>
            <ThemedText variant="overline" color="tertiary" weight="medium">Verified</ThemedText>
            <ThemedText variant="overline" color="tertiary" weight="medium">Premium</ThemedText>
          </View>

          {/* What you unlock */}
          <View style={styles.kycUnlock}>
            <ThemedText variant="caption" color="tertiary" weight="medium">
              Upgrade to unlock:
            </ThemedText>
            <View style={styles.kycUnlockRow}>
              {[
                { icon: "trending-up-outline", label: "$50k/day limit" },
                { icon: "swap-horizontal-outline", label: "Instant transfers" },
                { icon: "globe-outline", label: "All currencies" },
              ].map((item) => (
                <View key={item.label} style={styles.kycUnlockItem}>
                  <Ionicons name={item.icon as any} size={wp(12)} color={colors.primary.main} />
                  <ThemedText variant="overline" color="secondary" weight="medium">
                    {item.label}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Menu sections */}
        {menuSections.map((section, sIdx) => (
          <Animated.View
            key={section.title}
            style={[
              styles.menuSection,
              { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
            ]}
          >
            <ThemedText variant="overline" color="tertiary" weight="semiBold" style={styles.sectionTitle}>
              {section.title}
            </ThemedText>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuRow, i < section.items.length - 1 && styles.menuRowBorder]}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIcon}>
                    <Ionicons name={item.icon as any} size={wp(18)} color={colors.text.secondary} />
                  </View>
                  <View style={styles.menuContent}>
                    <View style={styles.menuLabelRow}>
                      <ThemedText variant="bodySmall" weight="semiBold">
                        {item.label}
                      </ThemedText>
                      {item.badge && (
                        <View style={[styles.badge, { backgroundColor: (item.badgeColor || colors.primary.main) + "15" }]}>
                          <ThemedText variant="overline" weight="bold" style={{ color: item.badgeColor || colors.primary.main }}>
                            {item.badge}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    {item.subtitle && (
                      <ThemedText variant="caption" color="tertiary" weight="medium">
                        {item.subtitle}
                      </ThemedText>
                    )}
                  </View>
                  {item.rightText ? (
                    <ThemedText variant="caption" weight="bold" style={{ color: item.rightColor || colors.text.tertiary }}>
                      {item.rightText}
                    </ThemedText>
                  ) : (
                    <Ionicons name="chevron-forward" size={wp(16)} color={colors.text.tertiary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Sign out */}
        <Animated.View
          style={[
            styles.signOutSection,
            { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
          ]}
        >
          <TouchableOpacity style={styles.signOutButton} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={wp(18)} color={colors.status.error} />
            <ThemedText variant="body" weight="semiBold" color="error">
              Sign Out
            </ThemedText>
          </TouchableOpacity>

          <ThemedText variant="overline" color="tertiary" weight="medium" align="center" style={styles.version}>
            Nexa v1.0.0 · Build 1
          </ThemedText>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingBottom: hp(120),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: hp(62),
    paddingHorizontal: wp(24),
    paddingBottom: hp(14),
    backgroundColor: colors.background.primary,
    zIndex: 10,
  },
  headerButton: {
    width: wp(42),
    height: wp(42),
    borderRadius: wp(13),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  // Profile card
  profileCard: {
    marginHorizontal: wp(24),
    marginBottom: hp(16),
    backgroundColor: colors.background.secondary,
    borderRadius: wp(20),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: wp(18),
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(14),
  },
  avatar: {
    width: wp(56),
    height: wp(56),
    borderRadius: wp(18),
    borderWidth: 2,
    borderColor: colors.primary.main + "30",
  },
  profileInfo: {
    flex: 1,
    gap: hp(2),
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(4),
    alignSelf: "flex-start",
    marginTop: hp(4),
    paddingHorizontal: wp(8),
    paddingVertical: hp(3),
    borderRadius: wp(8),
    backgroundColor: colors.primary.main + "10",
  },

  // KYC
  kycCard: {
    marginHorizontal: wp(24),
    marginBottom: hp(24),
    backgroundColor: colors.background.secondary,
    borderRadius: wp(20),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: wp(18),
  },
  kycHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(16),
  },
  kycLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(12),
  },
  kycIconWrap: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  kycButton: {
    paddingHorizontal: wp(14),
    paddingVertical: hp(6),
    borderRadius: wp(10),
  },
  kycProgressTrack: {
    height: hp(6),
    borderRadius: hp(3),
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: hp(8),
    overflow: "visible",
    position: "relative",
  },
  kycProgressFill: {
    height: "100%",
    borderRadius: hp(3),
  },
  kycMarker: {
    position: "absolute",
    top: -hp(2),
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginLeft: -wp(5),
    borderWidth: 2,
    borderColor: colors.background.secondary,
  },
  kycLevels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    marginBottom: hp(14),
  },
  kycUnlock: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
    paddingTop: hp(12),
    gap: hp(8),
  },
  kycUnlockRow: {
    flexDirection: "row",
    gap: wp(12),
  },
  kycUnlockItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(4),
  },

  // Menu
  menuSection: {
    marginBottom: hp(20),
  },
  sectionTitle: {
    letterSpacing: fs(1),
    paddingHorizontal: wp(28),
    marginBottom: hp(10),
  },
  menuCard: {
    marginHorizontal: wp(24),
    backgroundColor: colors.background.secondary,
    borderRadius: wp(18),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: wp(4),
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(12),
    paddingVertical: hp(15),
    paddingHorizontal: wp(12),
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
    marginHorizontal: wp(12),
    paddingHorizontal: 0,
  },
  menuIcon: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(10),
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
    gap: hp(2),
  },
  menuLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(8),
  },
  badge: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    borderRadius: wp(6),
  },

  // Sign out
  signOutSection: {
    paddingHorizontal: wp(24),
    marginTop: hp(8),
    gap: hp(16),
    alignItems: "center",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(8),
    width: "100%",
    paddingVertical: hp(16),
    borderRadius: wp(16),
    borderWidth: 1,
    borderColor: colors.status.error + "20",
    backgroundColor: colors.status.error + "08",
  },
  version: {
    marginTop: hp(4),
  },
});
