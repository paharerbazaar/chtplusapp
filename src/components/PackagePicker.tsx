import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

export function PackagePicker({
  title,
  packages,
  onPick,
  loading,
}: {
  title: string;
  packages: { id: string; label: string }[];
  onPick: (id: string) => void;
  loading?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.sm }} />
      ) : (
        packages.map((p) => (
          <Pressable key={p.id} style={styles.option} onPress={() => onPick(p.id)}>
            <Text style={styles.optionText}>{p.label}</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  title: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  option: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  optionText: { color: colors.primary, fontWeight: '600', fontSize: 13.5 },
});
