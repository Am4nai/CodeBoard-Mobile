import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { useNavigationState } from "@react-navigation/native";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeIcon from "@/assets/icons/home.svg";
import MenuIcon from "@/assets/icons/menu-burger.svg";
import CreateIcon from "@/assets/icons/plus.svg";
import SearchIcon from "@/assets/icons/search.svg";
import TopIcon from "@/assets/icons/trophy.svg";

import { useTheme } from "@/src/theme/useTheme";

const SmartTabIcon = ({ routeName, Icon, size, t, isCreate = false }: any) => {
  const activeRouteName = useNavigationState(
    (state) => state?.routes[state.index]?.name,
  );

  const isFocused = activeRouteName === routeName;

  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const activeY = isCreate ? -6 : -4;

    const springConfig = {
      damping: 20,
      stiffness: 300,
      mass: 0.5,
    };

    translateY.value = withSpring(isFocused ? activeY : 0, springConfig);
    scale.value = withSpring(isFocused ? 1.2 : 1, springConfig);
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const color = isFocused ? (isCreate ? t.primary : t.text) : t.textSecondary;

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <Icon
        width={isFocused ? size + 4 : size}
        height={isFocused ? size + 4 : size}
        fill={color}
      />
    </Animated.View>
  );
};

export default function Layout() {
  const t = useTheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      tabBar={(props) => (
        <BottomTabBar
          {...props}
          insets={{ bottom: 0, top: 0, left: 0, right: 0 }}
        />
      )}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: bottom + 8,
          height: 64,
          borderRadius: 32,
          backgroundColor: t.surface,
          borderTopWidth: 0,
          paddingHorizontal: 16,
          marginHorizontal: 16,
          shadowColor: "black",
          elevation: 10,
        },
        tabBarItemStyle: {
          flex: 1,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: () => (
            <SmartTabIcon routeName="home" Icon={HomeIcon} size={20} t={t} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: () => (
            <SmartTabIcon
              routeName="search"
              Icon={SearchIcon}
              size={20}
              t={t}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: () => (
            <SmartTabIcon
              routeName="create"
              Icon={CreateIcon}
              size={28}
              t={t}
              isCreate
            />
          ),
        }}
      />
      <Tabs.Screen
        name="top"
        options={{
          tabBarIcon: () => (
            <SmartTabIcon routeName="top" Icon={TopIcon} size={20} t={t} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon: () => (
            <SmartTabIcon routeName="menu" Icon={MenuIcon} size={20} t={t} />
          ),
        }}
      />

      <Tabs.Screen name="collections" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
