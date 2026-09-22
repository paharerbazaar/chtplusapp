import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { Screen } from '@/components/Screen';
import { API_BASE_URL } from '@/constants/config';
import { colors, radius, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function Row({ icon, label, onPress, danger }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.primary} style={{ width: 26 }} />
      <Text style={[styles.label, danger && { color: colors.danger }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <Screen scroll>
      <View style={styles.group}>
        <Row icon="chatbubbles-outline" label="Chat settings" onPress={() => navigation.navigate('ChatSettings')} />
        <Row icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
        <Row icon="globe-outline" label="Visit chtplus.xyz" onPress={() => Linking.openURL(API_BASE_URL)} />
      </View>

      <View style={styles.group}>
        <Row icon="trash-outline" label="Delete account" onPress={() => navigation.navigate('DeleteAccount')} danger />
      </View>

      <Text style={styles.version}>CHT Plus v{Constants.expoConfig?.version || '1.0.0'}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { flex: 1, fontSize: 14, color: colors.text },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: spacing.lg },
});
