import { ThemedText } from "@/components/ThemedText";
import { colors } from "@/utils/colors";
import { hp, wp } from "@/utils/config";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface TabBarIconProps {
  focused: boolean;
  iconName: string;
  iconNameFocused: string;
  label: string;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({
  focused,
  iconName,
  iconNameFocused,
  label,
}) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.85)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1 : 0.85,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <View style={styles.tabItemContainer}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            backgroundColor: focused ? colors.primary.main : "transparent",
          },
        ]}
      >
        <Ionicons
          name={focused ? (iconNameFocused as any) : (iconName as any)}
          size={wp(22)}
          color={focused ? "#FFFFFF" : colors.text.tertiary}
        />
      </Animated.View>
      <ThemedText
        variant="caption"
        weight={focused ? "semiBold" : "medium"}
        style={[
          styles.label,
          { color: focused ? colors.primary.main : colors.text.tertiary },
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const tabPositions = [0, 1, 2, 3];
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  const translateX = slideAnim.interpolate({
    inputRange: tabPositions,
    outputRange: tabPositions.map((i) => i * (wp(360) / 4) + wp(15)),
  });

  return (
    <View style={styles.tabBarContainer}>
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            transform: [{ translateX }],
            backgroundColor: colors.primary.main + "15",
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        let iconName = "home-outline";
        let iconNameFocused = "home";
        let label = "Home";

        if (route.name === "home") {
          iconName = "home-outline";
          iconNameFocused = "home";
          label = "Home";
        } else if (route.name === "transactions") {
          iconName = "swap-horizontal-outline";
          iconNameFocused = "swap-horizontal";
          label = "Activity";
        } else if (route.name === "wallets") {
          iconName = "wallet-outline";
          iconNameFocused = "wallet";
          label = "Wallets";
        } else if (route.name === "profile") {
          iconName = "person-outline";
          iconNameFocused = "person";
          label = "Profile";
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <TabBarIcon
              focused={isFocused}
              iconName={iconName}
              iconNameFocused={iconNameFocused}
              label={label}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function DashboardLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="wallets" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: hp(30),
    left: wp(20),
    right: wp(20),
    flexDirection: "row",
    height: hp(72),
    borderRadius: wp(36),
    paddingHorizontal: wp(8),
    paddingVertical: hp(8),
    alignItems: "center",
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: hp(12) },
    shadowOpacity: 0.15,
    shadowRadius: wp(24),
    elevation: 12,
    ...Platform.select({
      android: { elevation: 16 },
    }),
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  tabItemContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: hp(4),
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
  },
  label: {
    fontSize: wp(10),
  },
  activeIndicator: {
    position: "absolute",
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    left: 0,
  },
});
