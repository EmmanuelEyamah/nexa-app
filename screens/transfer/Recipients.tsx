import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface RecipientsProps {
  onSelect: (recipient: any) => void;
  onAddNew: () => void;
  onBack: () => void;
}

const recentRecipients = [
  { id: "1", name: "Adebayo", initials: "AO", color: "#3B82F6" },
  { id: "2", name: "Sarah", initials: "SM", color: "#22C55E" },
  { id: "3", name: "Kwame", initials: "KA", color: "#8B5CF6" },
  { id: "4", name: "James", initials: "JM", color: "#F59E0B" },
  { id: "5", name: "Elena", initials: "ER", color: "#EC4899" },
];

const allRecipients = [
  { id: "1", name: "Adebayo Ogunlesi", bank: "Access Bank · ····4521", country: "🇳🇬", initials: "AO", color: "#3B82F6" },
  { id: "6", name: "Amara Diallo", bank: "Ecobank · ····8832", country: "🇬🇭", initials: "AD", color: "#10B981" },
  { id: "5", name: "Elena Rossi", bank: "UniCredit · ····2190", country: "🇮🇹", initials: "ER", color: "#EC4899" },
  { id: "4", name: "James Mwangi", bank: "M-Pesa · ····7654", country: "🇰🇪", initials: "JM", color: "#F59E0B" },
  { id: "3", name: "Kwame Asante", bank: "GCB Bank · ····1298", country: "🇬🇭", initials: "KA", color: "#8B5CF6" },
  { id: "2", name: "Sarah Mitchell", bank: "Barclays · ····5673", country: "🇬🇧", initials: "SM", color: "#22C55E" },
];

export const Recipients = ({ onSelect, onAddNew, onBack }: RecipientsProps) => {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = allRecipients.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
        </TouchableOpacity>
        <ThemedText variant="h6" weight="bold">Select Recipient</ThemedText>
        <View style={styles.backBtn} />
      </View>

      {/* Search */}
      <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
        <Ionicons name="search-outline" size={wp(18)} color={searchFocused ? colors.primary.main : colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor={colors.text.tertiary}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Add new */}
        <TouchableOpacity style={styles.addNewRow} onPress={onAddNew} activeOpacity={0.7}>
          <View style={styles.addNewIcon}>
            <Ionicons name="add" size={wp(22)} color={colors.primary.main} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText variant="body" weight="semiBold">Add New Recipient</ThemedText>
            <ThemedText variant="caption" color="tertiary" weight="medium">Bank transfer, mobile money</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={wp(16)} color={colors.text.tertiary} />
        </TouchableOpacity>

        {/* Recent */}
        {!search && (
          <View style={styles.recentSection}>
            <ThemedText variant="overline" color="tertiary" weight="semiBold" style={styles.sectionLabel}>
              RECENT
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
              {recentRecipients.map((r) => (
                <TouchableOpacity key={r.id} style={styles.recentItem} onPress={() => onSelect(r)} activeOpacity={0.7}>
                  <View style={[styles.recentAvatar, { backgroundColor: r.color + "18" }]}>
                    <ThemedText variant="bodySmall" weight="bold" style={{ color: r.color }}>{r.initials}</ThemedText>
                  </View>
                  <ThemedText variant="caption" weight="medium" color="secondary" numberOfLines={1}>
                    {r.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All recipients */}
        <View style={styles.allSection}>
          <ThemedText variant="overline" color="tertiary" weight="semiBold" style={styles.sectionLabel}>
            {search ? "RESULTS" : "ALL RECIPIENTS"}
          </ThemedText>
          <View style={styles.listCard}>
            {filtered.map((r, i) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.recipientRow, i < filtered.length - 1 && styles.recipientRowBorder]}
                onPress={() => onSelect(r)}
                activeOpacity={0.7}
              >
                <View style={[styles.recipientAvatar, { backgroundColor: r.color + "15" }]}>
                  <ThemedText variant="bodySmall" weight="bold" style={{ color: r.color }}>{r.initials}</ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" weight="semiBold">{r.name}</ThemedText>
                  <ThemedText variant="caption" color="tertiary" weight="medium">
                    {r.country} {r.bank}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={wp(16)} color={colors.text.tertiary} />
              </TouchableOpacity>
            ))}
            {filtered.length === 0 && (
              <View style={styles.empty}>
                <ThemedText variant="body" color="tertiary" align="center">No recipients found</ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: hp(62), paddingHorizontal: wp(24), paddingBottom: hp(12),
  },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), justifyContent: "center", alignItems: "center" },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: wp(10),
    marginHorizontal: wp(24), marginBottom: hp(16), paddingHorizontal: wp(16), height: hp(48),
    borderRadius: wp(14), borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", backgroundColor: colors.background.secondary,
  },
  searchBarFocused: { borderColor: colors.primary.main },
  searchInput: { flex: 1, fontSize: fs(14), fontFamily: "Satoshi-Regular", color: colors.text.primary, height: "100%" },
  scrollContent: { paddingBottom: hp(40) },

  addNewRow: {
    flexDirection: "row", alignItems: "center", gap: wp(14),
    marginHorizontal: wp(24), marginBottom: hp(20), padding: wp(16),
    borderRadius: wp(18), borderWidth: 1, borderColor: colors.primary.main + "20", backgroundColor: colors.primary.main + "06",
  },
  addNewIcon: {
    width: wp(46), height: wp(46), borderRadius: wp(14),
    backgroundColor: colors.primary.main + "12", borderWidth: 1, borderColor: colors.primary.main + "20",
    justifyContent: "center", alignItems: "center",
  },

  recentSection: { marginBottom: hp(20) },
  sectionLabel: { letterSpacing: fs(1), paddingHorizontal: wp(24), marginBottom: hp(12) },
  recentScroll: { paddingHorizontal: wp(24), gap: wp(16) },
  recentItem: { alignItems: "center", gap: hp(6), width: wp(56) },
  recentAvatar: {
    width: wp(50), height: wp(50), borderRadius: wp(25), justifyContent: "center", alignItems: "center",
  },

  allSection: {},
  listCard: {
    marginHorizontal: wp(24), borderRadius: wp(18), borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)", backgroundColor: colors.background.secondary, paddingHorizontal: wp(14),
  },
  recipientRow: {
    flexDirection: "row", alignItems: "center", gap: wp(12), paddingVertical: hp(14),
  },
  recipientRowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" },
  recipientAvatar: {
    width: wp(44), height: wp(44), borderRadius: wp(14), justifyContent: "center", alignItems: "center",
  },
  empty: { paddingVertical: hp(32) },
});
