import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { colors } from '../../src/constants/theme';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home',
  matches: 'heart',
  rooms: 'business',
  bookings: 'calendar',
  messages: 'chatbubble',
  profile: 'person',
};

export default function UserLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border },
        tabBarIcon: ({ color, size, focused }) => {
          const base: string = icons[route.name] ?? 'ellipse';
          const name = (focused ? base : `${base}-outline`) as keyof typeof Ionicons.glyphMap;
          return <Ionicons name={name} color={color} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches' }} />
      <Tabs.Screen name="rooms" options={{ title: 'Rooms' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="complete-profile" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="match-details" options={{ href: null }} />
      <Tabs.Screen name="room-details" options={{ href: null }} />
      <Tabs.Screen name="booking" options={{ href: null }} />
      <Tabs.Screen name="booking-confirmation" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="connections" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="ai-assistant" options={{ href: null }} />
    </Tabs>
  );
}
