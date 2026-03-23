import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { AuthContainer } from "@/components/AuthContainer";
import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { hp, wp } from "@/utils/config";
import React, { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface LoginProps {
  onLogin: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
  onGoogleLogin: () => void;
}

export const Login = ({
  onLogin,
  onForgotPassword,
  onSignUp,
  onGoogleLogin,
}: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = () => {
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 2000);
  };

  return (
    <AuthContainer
      title="Welcome back"
      subtitle="Sign in to continue managing your payments"
      showTopLink
      topLinkText="Sign up"
      onTopLink={onSignUp}
    >
      <AppTextInput
        label="Email"
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
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors({ ...errors, password: "" });
        }}
        error={errors.password}
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
        title="Sign In"
        onPress={handleLogin}
        loading={loading}
        variant="primary"
        size="large"
        fullWidth
        style={styles.loginButton}
      />

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <ThemedText
          variant="caption"
          color="tertiary"
          style={styles.dividerText}
        >
          Or continue with
        </ThemedText>
        <View style={styles.divider} />
      </View>

      {/* Google */}
      <TouchableOpacity
        style={styles.socialButton}
        onPress={onGoogleLogin}
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

      {/* Signup link */}
      <View style={styles.signupPrompt}>
        <ThemedText variant="body" color="secondary">
          Don't have an account?{" "}
        </ThemedText>
        <TouchableOpacity onPress={onSignUp} activeOpacity={0.7}>
          <ThemedText variant="body" weight="bold" color="accent">
            Sign Up
          </ThemedText>
        </TouchableOpacity>
      </View>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: hp(4),
    marginBottom: hp(24),
  },
  loginButton: {
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
  signupPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(8),
  },
});
