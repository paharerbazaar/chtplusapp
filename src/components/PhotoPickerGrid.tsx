import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/constants/theme';
import { resolveImageUrl } from '@/utils/image';
import type { PhotoSlot } from '@/hooks/usePhotoPicker';

export function PhotoPickerGrid({
  slots,
  onAdd,
  onRemove,
  canAddMore,
}: {
  slots: PhotoSlot[];
  onAdd: () => void;
  onRemove: (key: string) => void;
  canAddMore: boolean;
}) {
  return (
    <View style={styles.row}>
      {slots.map((slot) => {
        const uri = slot.kind === 'existing' ? resolveImageUrl(slot.url) : slot.image?.uri;
        return (
          <View key={slot.key} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
            <Pressable style={styles.removeBtn} onPress={() => onRemove(slot.key)}>
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        );
      })}
      {canAddMore ? (
        <Pressable style={styles.addBtn} onPress={onAdd}>
          <Ionicons name="camera" size={22} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const SIZE = 84;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumbWrap: { width: SIZE, height: SIZE, borderRadius: radius.sm, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%', backgroundColor: colors.primaryLight },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
