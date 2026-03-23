import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface AddRecipientProps {
  onSave: (recipient: any) => void;
  onBack: () => void;
}

const countries = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬", currency: "NGN" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", currency: "GHS" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", currency: "KES" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP" },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", currency: "ZAR" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", currency: "TZS" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", currency: "EGP" },
];

const deliveryMethods = [
  { id: "bank", icon: "business-outline", label: "Bank Transfer", subtitle: "Direct to bank account" },
  { id: "mobile", icon: "phone-portrait-outline", label: "Mobile Money", subtitle: "M-Pesa, MTN MoMo, etc." },
  { id: "wallet", icon: "wallet-outline", label: "Nexa Wallet", subtitle: "Send to Nexa user" },
];

export const AddRecipient = ({ onSave, onBack }: AddRecipientProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [selectedMethod, setSelectedMethod] = useState("bank");
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ fullName: "", accountNumber: "", bankName: "" });

  const validateForm = () => {
    let valid = true;
    const newErrors = { fullName: "", accountNumber: "", bankName: "" };

    if (!fullName.trim()) {
      newErrors.fullName = "Recipient name is required";
      valid = false;
    }
    if (!accountNumber.trim()) {
      newErrors.accountNumber = selectedMethod === "mobile" ? "Phone number is required" : "Account number is required";
      valid = false;
    }
    if (selectedMethod === "bank" && !bankName.trim()) {
      newErrors.bankName = "Bank name is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const initials = fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
      const accentColors = ["#3B82F6", "#22C55E", "#8B5CF6", "#F59E0B", "#EC4899"];
      const color = accentColors[Math.floor(Math.random() * accentColors.length)];
      onSave({
        id: Date.now().toString(),
        name: fullName,
        bank: selectedMethod === "bank" ? `${bankName} · ····${accountNumber.slice(-4)}` : `Mobile · ····${accountNumber.slice(-4)}`,
        country: selectedCountry.flag,
        initials,
        color,
      });
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={wp(22)} color={colors.text.primary} />
        </TouchableOpacity>
        <ThemedText variant="h6" weight="bold">Add Recipient</ThemedText>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Delivery method */}
        <ThemedText variant="overline" color="tertiary" weight="semiBold" style={styles.sectionLabel}>
          DELIVERY METHOD
        </ThemedText>
        <View style={styles.methodRow}>
          {deliveryMethods.map((method) => {
            const isActive = selectedMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodCard, isActive && styles.methodCardActive]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.methodIcon, isActive && styles.methodIconActive]}>
                  <Ionicons
                    name={method.icon as any}
                    size={wp(20)}
                    color={isActive ? colors.primary.main : colors.text.tertiary}
                  />
                </View>
                <ThemedText
                  variant="caption"
                  weight={isActive ? "bold" : "medium"}
                  color={isActive ? "accent" : "tertiary"}
                  align="center"
                >
                  {method.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Country selector */}
        <ThemedText variant="overline" color="tertiary" weight="semiBold" style={styles.sectionLabel}>
          DESTINATION COUNTRY
        </ThemedText>
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setCountryPickerOpen(true)}
          activeOpacity={0.7}
        >
          <ThemedText variant="bodyLarge" style={styles.countryFlag}>{selectedCountry.flag}</ThemedText>
          <View style={{ flex: 1 }}>
            <ThemedText variant="body" weight="semiBold">{selectedCountry.name}</ThemedText>
            <ThemedText variant="caption" color="tertiary" weight="medium">{selectedCountry.currency}</ThemedText>
          </View>
          <Ionicons name="chevron-down" size={wp(18)} color={colors.text.tertiary} />
        </TouchableOpacity>

        {/* Form */}
        <ThemedText variant="overline" color="tertiary" weight="semiBold" style={styles.sectionLabel}>
          RECIPIENT DETAILS
        </ThemedText>

        <AppTextInput
          label="Full Name"
          placeholder="Recipient's full name"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (errors.fullName) setErrors({ ...errors, fullName: "" });
          }}
          error={errors.fullName}
          leftIcon="person-outline"
          autoCapitalize="words"
        />

        <AppTextInput
          label="Email (optional)"
          placeholder="recipient@email.com"
          value={email}
          onChangeText={setEmail}
          leftIcon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {selectedMethod === "bank" && (
          <AppTextInput
            label="Bank Name"
            placeholder="e.g. Access Bank, Barclays"
            value={bankName}
            onChangeText={(text) => {
              setBankName(text);
              if (errors.bankName) setErrors({ ...errors, bankName: "" });
            }}
            error={errors.bankName}
            leftIcon="business-outline"
          />
        )}

        <AppTextInput
          label={selectedMethod === "mobile" ? "Phone Number" : "Account Number"}
          placeholder={selectedMethod === "mobile" ? "+234 800 000 0000" : "0123456789"}
          value={accountNumber}
          onChangeText={(text) => {
            setAccountNumber(text);
            if (errors.accountNumber) setErrors({ ...errors, accountNumber: "" });
          }}
          error={errors.accountNumber}
          leftIcon={selectedMethod === "mobile" ? "call-outline" : "card-outline"}
          keyboardType="number-pad"
        />

        {/* Save */}
        <AppButton
          title="Save Recipient"
          onPress={handleSave}
          loading={loading}
          variant="primary"
          size="large"
          fullWidth
          style={styles.saveButton}
          rightIcon={<Ionicons name="checkmark" size={wp(18)} color="#FFFFFF" />}
        />

        {/* Trust note */}
        <View style={styles.trustNote}>
          <Ionicons name="shield-checkmark-outline" size={wp(14)} color={colors.text.tertiary} />
          <ThemedText variant="caption" color="tertiary" weight="medium">
            Recipient details are encrypted and securely stored
          </ThemedText>
        </View>
      </ScrollView>

      {/* Country picker modal */}
      <Modal
        visible={countryPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryPickerOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setCountryPickerOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <View style={styles.pickerHandle} />
                <ThemedText variant="h6" weight="bold" style={styles.pickerTitle}>
                  Select Country
                </ThemedText>
                {countries.map((country) => {
                  const isActive = selectedCountry.code === country.code;
                  return (
                    <TouchableOpacity
                      key={country.code}
                      style={[styles.countryItem, isActive && styles.countryItemActive]}
                      onPress={() => {
                        setSelectedCountry(country);
                        setCountryPickerOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <ThemedText variant="bodyLarge" style={{ fontSize: fs(22) }}>{country.flag}</ThemedText>
                      <View style={{ flex: 1 }}>
                        <ThemedText variant="body" weight={isActive ? "bold" : "medium"}>
                          {country.name}
                        </ThemedText>
                        <ThemedText variant="caption" color="tertiary" weight="medium">
                          {country.currency}
                        </ThemedText>
                      </View>
                      {isActive && (
                        <Ionicons name="checkmark-circle" size={wp(20)} color={colors.primary.main} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: hp(62), paddingHorizontal: wp(24), paddingBottom: hp(12),
  },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: wp(24), paddingBottom: hp(40) },

  sectionLabel: { letterSpacing: fs(1), marginBottom: hp(12), marginTop: hp(8) },

  // Delivery method
  methodRow: { flexDirection: "row", gap: wp(10), marginBottom: hp(20) },
  methodCard: {
    flex: 1, alignItems: "center", gap: hp(8),
    paddingVertical: hp(16), paddingHorizontal: wp(8),
    borderRadius: wp(16), borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)", backgroundColor: colors.background.secondary,
  },
  methodCardActive: {
    borderColor: colors.primary.main + "30", backgroundColor: colors.primary.main + "08",
  },
  methodIcon: {
    width: wp(42), height: wp(42), borderRadius: wp(14),
    backgroundColor: "rgba(255,255,255,0.04)", justifyContent: "center", alignItems: "center",
  },
  methodIconActive: {
    backgroundColor: colors.primary.main + "15",
  },

  // Country selector
  countrySelector: {
    flexDirection: "row", alignItems: "center", gap: wp(14),
    paddingVertical: hp(14), paddingHorizontal: wp(16),
    borderRadius: wp(16), borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)", backgroundColor: colors.background.secondary,
    marginBottom: hp(20),
  },
  countryFlag: { fontSize: fs(24) },

  // Save
  saveButton: { marginTop: hp(8), marginBottom: hp(16) },
  trustNote: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: wp(6), paddingVertical: hp(8),
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  pickerSheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: wp(28), borderTopRightRadius: wp(28),
    paddingHorizontal: wp(24), paddingTop: hp(10), paddingBottom: hp(40),
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    maxHeight: hp(500),
  },
  pickerHandle: {
    width: wp(40), height: hp(4), borderRadius: hp(2),
    backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center", marginBottom: hp(20),
  },
  pickerTitle: { marginBottom: hp(14) },
  countryItem: {
    flexDirection: "row", alignItems: "center", gap: wp(14),
    paddingVertical: hp(14), paddingHorizontal: wp(12), borderRadius: wp(14), marginBottom: hp(2),
  },
  countryItemActive: { backgroundColor: colors.primary.main + "0A" },
});
