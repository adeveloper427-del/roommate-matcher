import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { colors } from '../../src/constants/theme';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  dashboard: 'grid',
  properties: 'business',
  rooms: 'bed',
  bookings: 'calendar',
  messages: 'chatbubble',
  profile: 'person',
};

export default function OrganizationLayout() {
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
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="properties" options={{ title: 'Properties' }} />
      <Tabs.Screen name="rooms" options={{ title: 'Rooms' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="add-property" options={{ href: null }} />
      <Tabs.Screen name="property-details" options={{ href: null }} />
      <Tabs.Screen name="add-room" options={{ href: null }} />
      <Tabs.Screen name="room-details" options={{ href: null }} />
      <Tabs.Screen name="booking-details" options={{ href: null }} />
    </Tabs>
  );
}
