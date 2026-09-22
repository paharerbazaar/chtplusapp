import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Common';
import { useAuth } from '@/auth/AuthContext';
import { saveHomePreferences } from '@/api/me';
import { colors, radius, spacing } from '@/constants/theme';

const INTERESTS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'services', label: 'Local Services', icon: 'construct' },
  { key: 'donors', label: 'Blood Donors', icon: 'water' },
  { key: 'marketplace', label: 'Marketplace', icon: 'storefront' },
  { key: 'biodata', label: 'Matrimony', icon: 'heart' },
  { key: 'doctors', label: 'Doctor Appointments', icon: 'medkit' },
];

export function OnboardingScreen() {
  const { refreshMe } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (key: string) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const finish = async () => {
    setLoading(true);
    try {
      await saveHomePreferences(selected);
      await refreshMe();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>What are you here for?</Text>
      <Text style={styles.subtitle}>Pick what matters to you — we'll put it front and center on your home screen.</Text>

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        {INTERESTS.map((item) => {
          const active = selected.includes(item.key);
          return (
            <Pressable key={item.key} style={[styles.option, active && styles.optionActive]} onPress={() => toggle(item.key)}>
              <Ionicons name={item.icon} size={22} color={active ? colors.primary : colors.textMuted} />
              <Text style={[styles.optionLabel, active && { color: colors.primary, fontWeight: '700' }]}>{item.label}</Text>
              {active ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>

      <Button title="Continue" onPress={finish} loading={loading} style={{ marginTop: spacing.xl }} />
      <Pressable onPress={finish} style={{ marginTop: spacing.md, alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted }}>Skip for now</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  subtitle: { fontSize: 13.5, color: colors.textMuted, marginTop: 6 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionLabel: { fontSize: 15, color: colors.text, flex: 1 },
});
