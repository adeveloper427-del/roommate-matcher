import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { colors } from '../../src/constants/theme';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  dashboard: 'grid',
  users: 'people',
  organizations: 'business',
  properties: 'home',
  bookings: 'calendar',
  reports: 'bar-chart',
  settings: 'settings',
};

export default function AdminLayout() {
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
      <Tabs.Screen name="users" options={{ title: 'Users' }} />
      <Tabs.Screen name="organizations" options={{ title: 'Organizations' }} />
      <Tabs.Screen name="properties" options={{ title: 'Properties' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      <Tabs.Screen name="user-details" options={{ href: null }} />
      <Tabs.Screen name="organization-details" options={{ href: null }} />
    </Tabs>
  );
}
