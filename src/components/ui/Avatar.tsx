import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../constants/theme';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
}

export function Avatar({ uri, name, size = 56 }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, dimension]} />;
  }

  return (
    <View style={[styles.fallback, dimension]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.border,
  },
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
