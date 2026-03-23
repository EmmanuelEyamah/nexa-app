import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap | React.ReactNode;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

export const AppTextInput = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  ...props
}: AppTextInputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const renderRightIcon = () => {
    if (isPassword) {
      return (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.rightIcon}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
            size={wp(20)}
            color={colors.text.tertiary}
          />
        </TouchableOpacity>
      );
    }

    if (!rightIcon) return null;

    if (typeof rightIcon === "string") {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.rightIcon}
          activeOpacity={0.7}
        >
          <Ionicons
            name={rightIcon}
            size={wp(20)}
            color={colors.text.tertiary}
          />
        </TouchableOpacity>
      );
    }

    return rightIcon;
  };

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText variant="bodySmall" weight="medium" style={styles.label}>
          {label}
        </ThemedText>
      )}

      <View
        style={[
          styles.inputContainer,
          error && styles.inputError,
          isFocused && styles.inputFocused,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={wp(20)}
            color={isFocused ? colors.primary.main : colors.text.tertiary}
            style={styles.leftIcon}
          />
        )}

        <RNTextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon]}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {renderRightIcon()}
      </View>

      {error && (
        <ThemedText variant="caption" color="error" style={styles.errorText}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(20),
  },
  label: {
    marginBottom: hp(8),
    color: colors.text.primary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: wp(14),
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: wp(16),
    height: hp(56),
  },
  inputError: {
    borderColor: colors.status.error,
  },
  inputFocused: {
    borderColor: colors.primary.main,
    backgroundColor: colors.background.primary,
  },
  input: {
    flex: 1,
    fontSize: fs(15),
    fontFamily: "Satoshi-Regular",
    color: colors.text.primary,
    height: "100%",
  },
  inputWithLeftIcon: {
    marginLeft: wp(8),
  },
  leftIcon: {
    marginRight: wp(4),
  },
  rightIcon: {
    padding: wp(8),
    marginLeft: wp(4),
  },
  errorText: {
    marginTop: hp(6),
    marginLeft: wp(4),
  },
});
