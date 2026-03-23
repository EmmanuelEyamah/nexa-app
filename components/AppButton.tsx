import { colors } from "@/utils/colors";
import { fs, hp, wp } from "@/utils/config";
import { ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { ThemedText } from "./ThemedText";

type ButtonVariant = "primary" | "secondary" | "outlined" | "ghost" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface AppButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppButton = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}: AppButtonProps) => {
  const isDisabled = disabled || loading;

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "small":
        return {
          paddingVertical: hp(10),
          paddingHorizontal: wp(24),
          height: hp(42),
          minWidth: wp(100),
        };
      case "large":
        return {
          paddingVertical: hp(18),
          paddingHorizontal: wp(48),
          height: hp(60),
          minWidth: wp(160),
        };
      default:
        return {
          paddingVertical: hp(16),
          paddingHorizontal: wp(40),
          height: hp(54),
          minWidth: wp(140),
        };
    }
  };

  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...getSizeStyles(),
      borderRadius: 100,
      alignItems: "center",
      justifyContent: "center",
    };

    if (isDisabled && !loading) {
      return {
        ...baseStyle,
        backgroundColor: colors.border.light,
        borderWidth: 0,
      };
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: colors.primary.main,
          shadowColor: colors.primary.main,
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 8,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: colors.background.tertiary,
          borderWidth: 1,
          borderColor: colors.border.light,
        };
      case "outlined":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: colors.primary.main,
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
      case "danger":
        return {
          ...baseStyle,
          backgroundColor: colors.status.error,
          shadowColor: colors.status.error,
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 8,
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    if (disabled && !loading) return colors.text.disabled;

    switch (variant) {
      case "primary":
      case "danger":
        return "#FFFFFF";
      case "secondary":
        return colors.text.primary;
      case "outlined":
        return colors.primary.main;
      case "ghost":
        return colors.primary.main;
      default:
        return "#FFFFFF";
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small":
        return fs(13);
      case "large":
        return fs(17);
      default:
        return fs(15);
    }
  };

  const getLoaderColor = () => {
    switch (variant) {
      case "primary":
      case "danger":
        return "#FFFFFF";
      case "outlined":
      case "ghost":
        return colors.primary.main;
      case "secondary":
        return colors.text.primary;
      default:
        return "#FFFFFF";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[getVariantStyles(), fullWidth && { width: "100%" }, style]}
    >
      <View style={styles.content}>
        {!loading && leftIcon && <View>{leftIcon}</View>}

        {title && (
          <ThemedText
            variant="button"
            weight="semiBold"
            style={[
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                opacity: loading ? 0 : 1,
              },
              textStyle,
            ]}
          >
            {title}
          </ThemedText>
        )}

        {!loading && rightIcon && <View>{rightIcon}</View>}

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color={getLoaderColor()} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(8),
  },
  loader: {
    position: "absolute",
  },
});
