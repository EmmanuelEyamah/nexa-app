import { AppButton } from "@/components/AppButton";
import { AuthContainer } from "@/components/AuthContainer";
import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface VerifyOtpProps {
  email: string;
  flow: "signup" | "reset";
  onVerify: () => void;
  onBack: () => void;
}

export const VerifyOtp = ({ email, flow, onVerify, onBack }: VerifyOtpProps) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) return;
    if (text && !/^\d+$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError("");
    if (text && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (otp.join("").length !== 6) {
      setError("Please enter the complete verification code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onVerify();
    }, 2000);
  };

  return (
    <AuthContainer
      title="Verify your email"
      subtitle={`We've sent a 6-digit code to`}
      showBack
      onBack={onBack}
    >
      <ThemedText variant="body" weight="semiBold" color="accent" style={styles.email}>
        {email}
      </ThemedText>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.otpInput,
              digit ? styles.otpInputFilled : null,
              error ? styles.otpInputError : null,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {error ? (
        <ThemedText variant="caption" color="error" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      <AppButton
        title="Verify"
        onPress={handleVerify}
        loading={loading}
        variant="primary"
        size="large"
        fullWidth
        style={styles.verifyButton}
      />

      <View style={styles.resendContainer}>
        {timer > 0 ? (
          <ThemedText variant="body" color="secondary">
            Resend code in{" "}
            <ThemedText variant="body" weight="semiBold" color="accent">
              {timer}s
            </ThemedText>
          </ThemedText>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setTimer(60);
              setOtp(["", "", "", "", "", ""]);
              setError("");
            }}
            activeOpacity={0.7}
          >
            <ThemedText variant="body" weight="semiBold" color="accent">
              Resend verification code
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  email: {
    marginTop: -hp(16),
    marginBottom: hp(28),
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(16),
    gap: wp(8),
  },
  otpInput: {
    flex: 1,
    height: hp(60),
    borderRadius: wp(14),
    borderWidth: 2,
    borderColor: colors.border.light,
    backgroundColor: colors.background.secondary,
    textAlign: "center",
    fontSize: fs(24),
    fontFamily: "Satoshi-Bold",
    color: colors.text.primary,
  },
  otpInputFilled: {
    borderColor: colors.primary.main,
  },
  otpInputError: {
    borderColor: colors.status.error,
  },
  error: {
    marginBottom: hp(16),
    textAlign: "center",
  },
  verifyButton: {
    marginBottom: hp(24),
  },
  resendContainer: {
    alignItems: "center",
  },
});
