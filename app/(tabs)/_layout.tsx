import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text, View, Pressable } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: "row",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: Math.max(insets.bottom, 12),
        paddingTop: 12,
        justifyContent: "space-around",
        alignItems: "center",
        elevation: 12, // slightly higher for android
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        borderTopWidth: 1,
        borderColor: "#f3f4f5",
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          if (Platform.OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName: any = "home";
        let labelText = "HOME";

        if (route.name === "index") {
          iconName = "home";
          labelText = "HOME";
        } else if (route.name === "gallery") {
          iconName = "images";
          labelText = "LIBRARY";
        } else if (route.name === "explore") {
          iconName = "bulb";
          labelText = "TIPS";
        }

        const color = isFocused ? "#6e37d0" : "#abadaf";

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isFocused ? "rgba(110,55,208,0.08)" : "transparent",
              borderRadius: 16,
              paddingVertical: 8,
              minWidth: 72,
            }}
          >
            <Ionicons size={22} name={iconName} color={color} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "800",
                color,
                marginTop: 4,
                letterSpacing: 0.5,
              }}
            >
              {labelText}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="gallery" />
      <Tabs.Screen name="explore" />
    </Tabs>
  );
}
