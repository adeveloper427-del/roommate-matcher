import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, gradients, radius, shadow, spacing, typography } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isGradient = variant === 'primary';

  const content = loading ? (
    <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textInverse} />
  ) : (
    <Text style={[styles.label, textVariantStyles[variant], size === 'sm' && styles.labelSm]}>{label}</Text>
  );

  if (isGradient) {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          pressed && !isDisabled && styles.pressed,
          !isDisabled && shadow.glow,
          style,
        ]}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, sizeStyles[size]]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  label: {
    ...typography.bodyBold,
  },
  labelSm: {
    fontSize: 13,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
};

const variantStyles: Record<Exclude<Variant, 'primary'>, ViewStyle> = {
  secondary: { backgroundColor: colors.secondary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
};

const textVariantStyles = {
  primary: { color: colors.textInverse },
  secondary: { color: colors.textInverse },
  outline: { color: colors.primary },
  ghost: { color: colors.primary },
  danger: { color: colors.textInverse },
};
