import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, helperText, isPassword, style, containerStyle, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(isPassword);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputWrapFocused,
          error && styles.inputWrapError,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {isPassword && (
          <Ionicons
            name={secure ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={colors.textMuted}
            onPress={() => setSecure((s) => !s)}
          />
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  inputWrapFocused: {
    borderColor: colors.primary,
  },
  inputWrapError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
