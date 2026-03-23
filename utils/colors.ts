export const colors = {
  primary: {
    main: "#3B82F6",
    light: "#60A5FA",
    dark: "#2563EB",
    contrast: "#FFFFFF",
  },

  secondary: {
    main: "#1E293B",
    light: "#334155",
    dark: "#0F172A",
  },

  background: {
    primary: "#0B0F14",
    secondary: "#111827",
    tertiary: "#1A2332",
    card: "#111827",
  },

  text: {
    primary: "#E5E7EB",
    secondary: "#9CA3AF",
    tertiary: "#6B7280",
    disabled: "#4B5563",
    inverse: "#0B0F14",
  },

  border: {
    light: "rgba(255, 255, 255, 0.08)",
    main: "rgba(255, 255, 255, 0.12)",
    dark: "rgba(255, 255, 255, 0.20)",
  },

  status: {
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },

  overlay: "rgba(0, 0, 0, 0.6)",
  shadow: "rgba(0, 0, 0, 0.25)",

  gradient: {
    primary: ["#3B82F6", "#2563EB"] as const,
    surface: ["#111827", "#0B0F14"] as const,
  },

  opacity: {
    light: 0.08,
    medium: 0.5,
    heavy: 0.8,
  },
} as const;
