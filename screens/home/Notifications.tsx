import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface NotificationsProps {
  onBack: () => void;
}

type NotifType = "transfer" | "received" | "rate" | "security" | "promo" | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const notifIcon: Record<NotifType, { name: string; color: string; bg: string }> = {
  transfer: { name: "arrow-up-circle", color: colors.primary.main, bg: colors.primary.main + "12" },
  received: { name: "arrow-down-circle", color: colors.status.success, bg: colors.status.success + "12" },
  rate: { name: "trending-up", color: colors.status.warning, bg: colors.status.warning + "12" },
  security: { name: "shield-checkmark", color: colors.status.error, bg: colors.status.error + "12" },
  promo: { name: "gift", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  system: { name: "information-circle", color: colors.text.tertiary, bg: "rgba(255,255,255,0.06)" },
};

const mockNotifications: Notification[] = [
  {
    id: "1", type: "received", title: "Payment Received",
    message: "You received $1,200.00 from Sarah Mitchell",
    time: "2 min ago", read: false,
  },
  {
    id: "2", type: "transfer", title: "Transfer Complete",
    message: "Your transfer of $2,500.00 to Adebayo Ogunlesi was successful",
    time: "35 min ago", read: false,
  },
  {
    id: "3", type: "rate", title: "Rate Alert",
    message: "USD/NGN has crossed your target rate of 1,580. Current rate: 1,582.50",
    time: "1h ago", read: false,
  },
  {
    id: "4", type: "security", title: "New Login Detected",
    message: "A new login was detected from iPhone 15 Pro in Lagos, Nigeria",
    time: "3h ago", read: true,
  },
  {
    id: "5", type: "promo", title: "Zero Fee Weekend",
    message: "Send money to any country this weekend with zero transfer fees. Limited time!",
    time: "5h ago", read: true,
  },
  {
    id: "6", type: "transfer", title: "Transfer Processing",
    message: "Your transfer of \u20A6850,000 to Kwame Asante is being processed",
    time: "Yesterday", read: true,
  },
  {
    id: "7", type: "received", title: "Payment Received",
    message: "You received \u00A33,200.00 from Elena Rossi",
    time: "Yesterday", read: true,
  },
  {
    id: "8", type: "system", title: "KYC Reminder",
    message: "Complete your identity verification to unlock higher transfer limits",
    time: "2 days ago", read: true,
  },
  {
    id: "9", type: "security", title: "Password Changed",
    message: "Your account password was successfully changed",
    time: "3 days ago", read: true,
  },
  {
    id: "10", type: "promo", title: "Refer & Earn",
    message: "Invite a friend to Nexa and both earn $25 in transfer credits",
    time: "1 week ago", read: true,
  },
];

export const Notifications = ({ onBack }: NotificationsProps) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const headerAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(
    mockNotifications.map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(wp(-20)),
    }))
  ).current;

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1, duration: 400,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();

    itemAnims.forEach((anim, i) => {
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1, duration: 350, delay: 100 + i * 50,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.spring(anim.translateX, {
          toValue: 0, friction: 12, tension: 50, delay: 100 + i * 50,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ThemedText variant="h6" weight="bold">Notifications</ThemedText>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <ThemedText variant="overline" weight="black" color="white">
                {unreadCount}
              </ThemedText>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7} style={styles.markAllBtn}>
            <ThemedText variant="caption" weight="semiBold" color="accent">Mark all read</ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
      </Animated.View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(["all", "unread"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            activeOpacity={0.7}
            onPress={() => setFilter(f)}
          >
            <ThemedText
              variant="bodySmall"
              weight={filter === f ? "bold" : "medium"}
              color={filter === f ? "white" : "secondary"}
            >
              {f === "all" ? "All" : `Unread (${unreadCount})`}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={wp(36)} color={colors.text.disabled} />
            </View>
            <ThemedText variant="h6" weight="bold" color="secondary" align="center">
              All caught up!
            </ThemedText>
            <ThemedText variant="bodySmall" color="tertiary" align="center">
              No unread notifications
            </ThemedText>
          </View>
        ) : (
          filtered.map((notif, i) => {
            const icon = notifIcon[notif.type];
            const anim = itemAnims[Math.min(i, itemAnims.length - 1)];
            return (
              <Animated.View
                key={notif.id}
                style={{
                  opacity: anim.opacity,
                  transform: [{ translateX: anim.translateX }],
                }}
              >
                <TouchableOpacity
                  style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
                  activeOpacity={0.7}
                  onPress={() => markAsRead(notif.id)}
                >
                  {/* Unread dot */}
                  {!notif.read && <View style={styles.unreadDot} />}

                  {/* Icon */}
                  <View style={[styles.notifIcon, { backgroundColor: icon.bg }]}>
                    <Ionicons name={icon.name as any} size={wp(20)} color={icon.color} />
                  </View>

                  {/* Content */}
                  <View style={styles.notifContent}>
                    <View style={styles.notifTitleRow}>
                      <ThemedText
                        variant="bodySmall"
                        weight={notif.read ? "medium" : "bold"}
                        numberOfLines={1}
                        style={{ flex: 1 }}
                      >
                        {notif.title}
                      </ThemedText>
                      <ThemedText variant="overline" color="tertiary" weight="medium">
                        {notif.time}
                      </ThemedText>
                    </View>
                    <ThemedText
                      variant="caption"
                      color={notif.read ? "tertiary" : "secondary"}
                      weight="medium"
                      numberOfLines={2}
                    >
                      {notif.message}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: hp(62), paddingHorizontal: wp(24), paddingBottom: hp(8),
  },
  backBtn: {
    width: wp(40), height: wp(40), borderRadius: wp(12),
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: wp(8) },
  unreadBadge: {
    minWidth: wp(20), height: wp(20), borderRadius: wp(10),
    backgroundColor: colors.status.error,
    justifyContent: "center", alignItems: "center",
    paddingHorizontal: wp(6),
  },
  markAllBtn: { paddingVertical: hp(4), paddingHorizontal: wp(8) },

  // Filters
  filterRow: {
    flexDirection: "row", gap: wp(8),
    paddingHorizontal: wp(24), marginTop: hp(8), marginBottom: hp(12),
  },
  filterTab: {
    paddingHorizontal: wp(16), paddingVertical: hp(7),
    borderRadius: wp(20), backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  filterTabActive: {
    backgroundColor: colors.primary.main, borderColor: colors.primary.main,
  },

  scrollContent: { paddingHorizontal: wp(24), paddingBottom: hp(40) },

  // Notification card
  notifCard: {
    flexDirection: "row", alignItems: "flex-start", gap: wp(12),
    padding: wp(14), borderRadius: wp(16), marginBottom: hp(8),
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
  },
  notifCardUnread: {
    backgroundColor: colors.primary.main + "06",
    borderColor: colors.primary.main + "12",
  },
  unreadDot: {
    position: "absolute", top: wp(14), left: wp(8),
    width: wp(6), height: wp(6), borderRadius: wp(3),
    backgroundColor: colors.primary.main,
  },
  notifIcon: {
    width: wp(40), height: wp(40), borderRadius: wp(12),
    justifyContent: "center", alignItems: "center",
    marginTop: hp(2),
  },
  notifContent: { flex: 1, gap: hp(3) },
  notifTitleRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    gap: wp(8),
  },

  // Empty
  emptyState: {
    alignItems: "center", justifyContent: "center",
    paddingTop: hp(80), gap: hp(10),
  },
  emptyIcon: {
    width: wp(80), height: wp(80), borderRadius: wp(40),
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center", alignItems: "center",
    marginBottom: hp(8),
  },
});
