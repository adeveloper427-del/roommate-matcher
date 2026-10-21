import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export function Header({ title, showBack = false, rightIcon, onRightPress }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {showBack && (
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>
        {rightIcon && (
          <Pressable onPress={onRightPress} hitSlop={12}>
            <Ionicons name={rightIcon} size={22} color={colors.textPrimary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  side: {
    width: 32,
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
});
