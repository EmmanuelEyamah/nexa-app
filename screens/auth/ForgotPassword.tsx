import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { AuthContainer } from "@/components/AuthContainer";
import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { hp, wp } from "@/utils/config";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface ForgotPasswordProps {
  onSubmit: (email: string) => void;
  onBack: () => void;
}

export const ForgotPassword = ({ onSubmit, onBack }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit(email);
    }, 1500);
  };

  return (
    <AuthContainer
      title="Forgot password?"
      subtitle="Enter the email associated with your account and we'll send a verification code to reset your password."
      showBack
      onBack={onBack}
    >
      <AppTextInput
        label="Email"
        placeholder="you@business.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon="mail-outline"
      />

      <AppButton
        title="Send Reset Code"
        onPress={handleSubmit}
        loading={loading}
        variant="primary"
        size="large"
        fullWidth
        style={styles.submitButton}
      />

      <TouchableOpacity style={styles.loginLink} onPress={onBack} activeOpacity={0.7}>
        <ThemedText variant="body" color="secondary">
          Remember your password?{" "}
          <ThemedText variant="body" weight="bold" color="accent">
            Sign In
          </ThemedText>
        </ThemedText>
      </TouchableOpacity>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  submitButton: {
    marginTop: hp(8),
    marginBottom: hp(24),
  },
  loginLink: {
    alignItems: "center",
  },
});
