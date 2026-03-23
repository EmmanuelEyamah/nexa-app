import { ThemedText } from "@/components/ThemedText";
import { TransactionCard } from "@/components/TransactionCard";
import { TransactionDetailSheet } from "@/components/TransactionDetailSheet";
import {
  allTransactions,
  RecentTransaction,
  TransactionGroup,
} from "@/constants/data";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type FilterTab = "all" | "sent" | "received" | "pending";
type DateFilter = "all" | "today" | "yesterday" | "7days" | "14days" | "30days";

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "received", label: "Received" },
  { key: "pending", label: "Pending" },
];

const dateFilters: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7days", label: "Last 7 Days" },
  { key: "14days", label: "Last 14 Days" },
  { key: "30days", label: "Last 30 Days" },
];

const getStats = (groups: TransactionGroup[]) => {
  const all = groups.flatMap((g) => g.data);
  const totalSent = all
    .filter((t) => t.type === "send" && t.status === "completed")
    .reduce((sum, t) => sum + (t.currency === "USD" ? t.amount : 0), 0);
  const totalReceived = all
    .filter((t) => t.type === "receive" && t.status === "completed")
    .reduce((sum, t) => sum + (t.currency === "USD" ? t.amount : 0), 0);
  const pendingCount = all.filter(
    (t) => t.status === "pending" || t.status === "processing"
  ).length;
  return { totalSent, totalReceived, pendingCount, totalCount: all.length };
};

// Map date filter to which groups to show
const filterByDate = (groups: TransactionGroup[], dateFilter: DateFilter) => {
  if (dateFilter === "all") return groups;
  if (dateFilter === "today") return groups.filter((g) => g.title === "Today");
  if (dateFilter === "yesterday")
    return groups.filter((g) => g.title === "Today" || g.title === "Yesterday");
  // For 7/14/30 days, show progressively more groups
  if (dateFilter === "7days") return groups.slice(0, 3);
  if (dateFilter === "14days") return groups.slice(0, 4);
  if (dateFilter === "30days") return groups;
  return groups;
};

export const Transactions = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [activeDateFilter, setActiveDateFilter] = useState<DateFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<RecentTransaction | null>(null);
  const [detailSheetVisible, setDetailSheetVisible] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(hp(10))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerTranslateY, {
        toValue: 0,
        friction: 10,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const stats = getStats(allTransactions);

  const handleTransactionPress = (txn: RecentTransaction) => {
    setSelectedTransaction(txn);
    setDetailSheetVisible(true);
  };

  // Apply filters
  const dateFiltered = filterByDate(allTransactions, activeDateFilter);
  const filteredGroups = dateFiltered
    .map((group) => ({
      ...group,
      data: group.data.filter((txn) => {
        if (activeFilter === "sent" && txn.type !== "send") return false;
        if (activeFilter === "received" && txn.type !== "receive") return false;
        if (
          activeFilter === "pending" &&
          txn.status !== "pending" &&
          txn.status !== "processing"
        )
          return false;
        if (
          searchQuery &&
          !txn.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
        )
          return false;
        return true;
      }),
    }))
    .filter((group) => group.data.length > 0);

  const activeDateLabel =
    dateFilters.find((d) => d.key === activeDateFilter)?.label || "All Time";

  return (
    <View style={styles.container}>
      {/* Fixed header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <ThemedText variant="h4" weight="bold">
          Activity
        </ThemedText>
        {/* Date filter trigger */}
        <TouchableOpacity
          style={styles.dateFilterButton}
          onPress={() => setDatePickerOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={wp(16)} color={colors.text.primary} />
          <ThemedText variant="caption" weight="semiBold">
            {activeDateLabel}
          </ThemedText>
          <Ionicons name="chevron-down" size={wp(14)} color={colors.text.tertiary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="arrow-up" size={wp(14)} color={colors.primary.main} />
            </View>
            <ThemedText variant="caption" color="tertiary" weight="medium">
              Total Sent
            </ThemedText>
            <ThemedText variant="bodySmall" weight="bold">
              ${stats.totalSent.toLocaleString()}
            </ThemedText>
          </View>
          <View style={styles.statCard}>
            <View
              style={[styles.statIconWrap, { backgroundColor: colors.status.success + "12" }]}
            >
              <Ionicons name="arrow-down" size={wp(14)} color={colors.status.success} />
            </View>
            <ThemedText variant="caption" color="tertiary" weight="medium">
              Received
            </ThemedText>
            <ThemedText variant="bodySmall" weight="bold" color="success">
              ${stats.totalReceived.toLocaleString()}
            </ThemedText>
          </View>
          <View style={styles.statCard}>
            <View
              style={[styles.statIconWrap, { backgroundColor: colors.status.warning + "12" }]}
            >
              <Ionicons name="time" size={wp(14)} color={colors.status.warning} />
            </View>
            <ThemedText variant="caption" color="tertiary" weight="medium">
              Pending
            </ThemedText>
            <ThemedText variant="bodySmall" weight="bold" color="warning">
              {stats.pendingCount}
            </ThemedText>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
          <Ionicons
            name="search-outline"
            size={wp(18)}
            color={searchFocused ? colors.primary.main : colors.text.tertiary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={wp(18)} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab.key)}
                activeOpacity={0.7}
              >
                <ThemedText
                  variant="caption"
                  weight={isActive ? "bold" : "medium"}
                  color={isActive ? "accent" : "tertiary"}
                >
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transaction groups */}
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <View key={group.title} style={styles.group}>
              <View style={styles.groupHeader}>
                <ThemedText
                  variant="overline"
                  color="tertiary"
                  weight="semiBold"
                  style={styles.groupTitle}
                >
                  {group.title.toUpperCase()}
                </ThemedText>
                <ThemedText variant="overline" color="tertiary" weight="medium">
                  {group.data.length}{" "}
                  {group.data.length === 1 ? "transaction" : "transactions"}
                </ThemedText>
              </View>
              <View style={styles.groupCard}>
                {group.data.map((txn) => (
                  <TransactionCard
                    key={txn.id}
                    transaction={txn}
                    onPress={() => handleTransactionPress(txn)}
                  />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={wp(32)} color={colors.text.tertiary} />
            </View>
            <ThemedText variant="body" color="secondary" weight="medium" align="center">
              No transactions found
            </ThemedText>
            <ThemedText variant="caption" color="tertiary" align="center">
              Try adjusting your filters or search
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Date filter bottom sheet */}
      <Modal
        visible={datePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDatePickerOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dateSheet}>
                <View style={styles.dateSheetHandle} />
                <ThemedText variant="h6" weight="bold" style={styles.dateSheetTitle}>
                  Filter by Date
                </ThemedText>
                {dateFilters.map((df) => {
                  const isActive = activeDateFilter === df.key;
                  return (
                    <TouchableOpacity
                      key={df.key}
                      style={[styles.dateOption, isActive && styles.dateOptionActive]}
                      onPress={() => {
                        setActiveDateFilter(df.key);
                        setDatePickerOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <ThemedText
                        variant="body"
                        weight={isActive ? "bold" : "medium"}
                        color={isActive ? "accent" : "primary"}
                      >
                        {df.label}
                      </ThemedText>
                      {isActive && (
                        <Ionicons
                          name="checkmark-circle"
                          size={wp(20)}
                          color={colors.primary.main}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Transaction detail bottom sheet */}
      <TransactionDetailSheet
        transaction={selectedTransaction}
        visible={detailSheetVisible}
        onClose={() => setDetailSheetVisible(false)}
      />
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
  dateFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(6),
    paddingVertical: hp(8),
    paddingHorizontal: wp(14),
    borderRadius: wp(12),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: colors.background.secondary,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    gap: wp(10),
    paddingHorizontal: wp(24),
    marginBottom: hp(20),
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: wp(16),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: wp(14),
    gap: hp(6),
  },
  statIconWrap: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(8),
    backgroundColor: colors.primary.main + "12",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
  },
  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(10),
    marginHorizontal: wp(24),
    marginBottom: hp(16),
    paddingHorizontal: wp(16),
    height: hp(48),
    borderRadius: wp(14),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: colors.background.secondary,
  },
  searchBarFocused: {
    borderColor: colors.primary.main,
  },
  searchInput: {
    flex: 1,
    fontSize: fs(14),
    fontFamily: "Satoshi-Regular",
    color: colors.text.primary,
    height: "100%",
  },
  // Filters
  filterRow: {
    flexDirection: "row",
    gap: wp(8),
    paddingHorizontal: wp(24),
    marginBottom: hp(20),
  },
  filterTab: {
    paddingVertical: hp(8),
    paddingHorizontal: wp(16),
    borderRadius: wp(10),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "transparent",
  },
  filterTabActive: {
    backgroundColor: colors.primary.main + "12",
    borderColor: colors.primary.main + "25",
  },
  // Groups
  group: {
    marginBottom: hp(20),
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(24),
    marginBottom: hp(10),
  },
  groupTitle: {
    letterSpacing: fs(1),
  },
  groupCard: {
    marginHorizontal: wp(24),
    borderRadius: wp(18),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: colors.background.secondary,
    paddingHorizontal: wp(14),
  },
  // Empty
  emptyState: {
    alignItems: "center",
    paddingVertical: hp(60),
    gap: hp(10),
  },
  emptyIcon: {
    width: wp(64),
    height: wp(64),
    borderRadius: wp(32),
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(8),
  },
  // Date filter modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  dateSheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: wp(28),
    borderTopRightRadius: wp(28),
    paddingHorizontal: wp(24),
    paddingTop: hp(10),
    paddingBottom: hp(40),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  dateSheetHandle: {
    width: wp(40),
    height: hp(4),
    borderRadius: hp(2),
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginBottom: hp(20),
  },
  dateSheetTitle: {
    marginBottom: hp(16),
  },
  dateOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(16),
    paddingHorizontal: wp(12),
    borderRadius: wp(12),
    marginBottom: hp(2),
  },
  dateOptionActive: {
    backgroundColor: colors.primary.main + "0A",
  },
});
