import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { AuthContainer } from "@/components/AuthContainer";
import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import React, { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface SignupProps {
  onSignup: (email: string) => void;
  onLogin: () => void;
  onGoogleSignup: () => void;
}

export const Signup = ({ onSignup, onLogin, onGoogleSignup }: SignupProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { fullName: "", email: "", phone: "", password: "" };

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      valid = false;
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      valid = false;
    }
    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = "Must be at least 8 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = () => {
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignup(email);
    }, 2000);
  };

  return (
    <AuthContainer
      title="Create your account"
      subtitle="Start sending money across borders in minutes"
      showTopLink
      topLinkText="Sign in"
      onTopLink={onLogin}
    >
      <AppTextInput
        label="Full Name"
        placeholder="John Doe"
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
        label="Business Email"
        placeholder="you@business.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors({ ...errors, email: "" });
        }}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon="mail-outline"
      />

      <AppTextInput
        label="Phone Number"
        placeholder="+234 800 000 0000"
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          if (errors.phone) setErrors({ ...errors, phone: "" });
        }}
        error={errors.phone}
        keyboardType="phone-pad"
        leftIcon="call-outline"
      />

      <AppTextInput
        label="Password"
        placeholder="Min. 8 characters"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors({ ...errors, password: "" });
        }}
        error={errors.password}
        isPassword
        leftIcon="lock-closed-outline"
      />

      <AppButton
        title="Create Account"
        onPress={handleSignup}
        loading={loading}
        variant="primary"
        size="large"
        fullWidth
        style={styles.signupButton}
      />

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <ThemedText
          variant="caption"
          color="tertiary"
          style={styles.dividerText}
        >
          Or sign up with
        </ThemedText>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity
        style={styles.socialButton}
        onPress={onGoogleSignup}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../assets/images/google.png")}
          style={{ width: wp(22), height: wp(22) }}
          resizeMode="contain"
        />
        <ThemedText variant="body" weight="semiBold">
          Google
        </ThemedText>
      </TouchableOpacity>

      <ThemedText variant="caption" color="tertiary" style={styles.terms}>
        By creating an account, you agree to our{" "}
        <ThemedText variant="caption" weight="semiBold" color="accent">
          Terms of Service
        </ThemedText>{" "}
        and{" "}
        <ThemedText variant="caption" weight="semiBold" color="accent">
          Privacy Policy
        </ThemedText>
      </ThemedText>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  signupButton: {
    marginTop: hp(4),
    marginBottom: hp(24),
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(24),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    marginHorizontal: wp(16),
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: hp(54),
    borderRadius: wp(14),
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.secondary,
    marginBottom: hp(24),
    gap: wp(12),
  },
  terms: {
    textAlign: "center",
    lineHeight: fs(18),
    paddingHorizontal: wp(16),
    marginBottom: hp(8),
  },
});
