import React, { PropsWithChildren } from 'react';
import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

interface ModalProps extends PropsWithChildren {
  visible: boolean;
  onClose: () => void;
}

export function Modal({ visible, onClose, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '85%',
  },
});
