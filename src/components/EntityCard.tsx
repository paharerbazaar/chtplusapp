import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, spacing } from '@/constants/theme';
import { resolveImageUrl } from '@/utils/image';
import { Badge } from './Common';

export function EntityCard({
  photoUrl,
  title,
  subtitle,
  meta,
  badge,
  onPress,
  footer,
}: {
  photoUrl?: string | null;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  badge?: { label: string; tone?: 'primary' | 'gold' | 'muted' | 'danger' };
  onPress: () => void;
  footer?: React.ReactNode;
}) {
  const resolved = resolveImageUrl(photoUrl);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.thumbWrap}>
        {resolved ? (
          <Image source={{ uri: resolved }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]} />
        )}
        {badge ? (
          <View style={styles.badgeOverlay}>
            <Badge label={badge.label} tone={badge.tone} />
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {meta}
      </View>
      {footer}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  thumbWrap: { width: '100%', aspectRatio: 1.4, position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  thumbFallback: { backgroundColor: colors.primaryLight },
  badgeOverlay: { position: 'absolute', top: 8, left: 8 },
  body: { padding: spacing.sm, gap: 3 },
  title: { fontSize: 14, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 12.5, color: colors.textMuted },
});
