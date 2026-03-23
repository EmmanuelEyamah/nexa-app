import { colors } from "@/utils/colors";
import { fs } from "@/utils/config";
import { Text, TextProps } from "react-native";

type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body"
  | "bodyLarge"
  | "bodySmall"
  | "caption"
  | "button"
  | "overline";

type TextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "disabled"
  | "inverse"
  | "white"
  | "black"
  | "accent"
  | "success"
  | "error"
  | "warning"
  | "info";

type FontWeight =
  | "light"
  | "regular"
  | "medium"
  | "semiBold"
  | "bold"
  | "black";

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
  weight?: FontWeight;
  align?: "left" | "center" | "right" | "justify";
}

const fontFamilyMap: Record<FontWeight, string> = {
  light: "Satoshi-Light",
  regular: "Satoshi-Regular",
  medium: "Satoshi-Medium",
  semiBold: "Satoshi-Bold",
  bold: "Satoshi-Bold",
  black: "Satoshi-Black",
};

const variantStyles: Record<
  TextVariant,
  { fontSize: number; fontWeight: FontWeight; lineHeight?: number }
> = {
  h1: { fontSize: fs(32), fontWeight: "black", lineHeight: fs(40) },
  h2: { fontSize: fs(28), fontWeight: "bold", lineHeight: fs(36) },
  h3: { fontSize: fs(24), fontWeight: "bold", lineHeight: fs(32) },
  h4: { fontSize: fs(20), fontWeight: "semiBold", lineHeight: fs(28) },
  h5: { fontSize: fs(18), fontWeight: "semiBold", lineHeight: fs(24) },
  h6: { fontSize: fs(16), fontWeight: "semiBold", lineHeight: fs(22) },
  bodyLarge: { fontSize: fs(16), fontWeight: "regular", lineHeight: fs(24) },
  body: { fontSize: fs(14), fontWeight: "regular", lineHeight: fs(20) },
  bodySmall: { fontSize: fs(12), fontWeight: "regular", lineHeight: fs(18) },
  caption: { fontSize: fs(11), fontWeight: "medium", lineHeight: fs(16) },
  button: { fontSize: fs(15), fontWeight: "semiBold", lineHeight: fs(20) },
  overline: { fontSize: fs(10), fontWeight: "semiBold", lineHeight: fs(14) },
};

export const ThemedText = ({
  variant = "body",
  color = "primary",
  weight,
  align = "left",
  style,
  children,
  ...props
}: ThemedTextProps) => {
  const variantStyle = variantStyles[variant];
  const fontWeight = weight || variantStyle.fontWeight;
  const fontFamily = fontFamilyMap[fontWeight];

  const getTextColor = () => {
    switch (color) {
      case "primary":
        return colors.text.primary;
      case "secondary":
        return colors.text.secondary;
      case "tertiary":
        return colors.text.tertiary;
      case "disabled":
        return colors.text.disabled;
      case "inverse":
        return colors.text.inverse;
      case "white":
        return "#FFFFFF";
      case "black":
        return "#000000";
      case "accent":
        return colors.primary.main;
      case "success":
        return colors.status.success;
      case "error":
        return colors.status.error;
      case "warning":
        return colors.status.warning;
      case "info":
        return colors.status.info;
      default:
        return colors.text.primary;
    }
  };

  return (
    <Text
      style={[
        {
          fontFamily,
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.lineHeight,
          color: getTextColor(),
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
