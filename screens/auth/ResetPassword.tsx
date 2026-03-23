import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { AuthContainer } from "@/components/AuthContainer";
import { colors } from "@/utils/colors";
import { hp } from "@/utils/config";
import React, { useState } from "react";
import { StyleSheet } from "react-native";

interface ResetPasswordProps {
  onReset: () => void;
}

export const ResetPassword = ({ onReset }: ResetPasswordProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });

  const validateForm = () => {
    let valid = true;
    const newErrors = { password: "", confirmPassword: "" };

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = "Must be at least 8 characters";
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleReset = () => {
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onReset();
    }, 2000);
  };

  return (
    <AuthContainer
      title="Set new password"
      subtitle="Your new password must be different from previously used passwords."
    >
      <AppTextInput
        label="New Password"
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

      <AppTextInput
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
        }}
        error={errors.confirmPassword}
        isPassword
        leftIcon="lock-closed-outline"
      />

      <AppButton
        title="Reset Password"
        onPress={handleReset}
        loading={loading}
        variant="primary"
        size="large"
        fullWidth
        style={styles.resetButton}
      />
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  resetButton: {
    marginTop: hp(8),
  },
});
