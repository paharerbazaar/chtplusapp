import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Common';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useAuth } from '@/auth/AuthContext';
import { colors, radius, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function MenuItem({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.primary} style={{ width: 26 }} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, me, logout } = useAuth();

  const onLogout = () => {
    Alert.alert('Log out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) return null;

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <Pressable style={styles.header} onPress={() => navigation.navigate('PublicProfile', { id: user.id })}>
        <Avatar uri={user.photoUrl} name={user.name} size={64} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {user.name}
            <VerifiedBadge active={user.blueBadge} size={16} />
          </Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>

      {me?.stats ? (
        <View style={styles.statsRow}>
          <Badge label={`${me.stats.servicesCount} services`} tone="muted" />
          <Badge label={`${me.stats.marketplaceCount} listings`} tone="muted" />
          <Badge label={`${me.stats.biodataCount} biodata`} tone="muted" />
        </View>
      ) : null}

      <Text style={styles.sectionLabel}>My activity</Text>
      <View style={styles.menuGroup}>
        <MenuItem icon="construct-outline" label="My services" onPress={() => navigation.navigate('MyServices')} />
        <MenuItem icon="storefront-outline" label="My listings" onPress={() => navigation.navigate('MyListings')} />
        <MenuItem icon="heart-outline" label="My biodata" onPress={() => navigation.navigate('MyBiodata')} />
        <MenuItem icon="calendar-outline" label="My appointments" onPress={() => navigation.navigate('MyAppointments')} />
        <MenuItem icon="water-outline" label="Blood donor profile" onPress={() => navigation.navigate('DonorForm')} />
        <MenuItem icon="bookmark-outline" label="Saved" onPress={() => navigation.navigate('Saved')} />
      </View>

      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.menuGroup}>
        <MenuItem icon="create-outline" label="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
        <MenuItem icon="people-outline" label="Followers & following" onPress={() => navigation.navigate('Followers', { userId: user.id })} />
        <MenuItem icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
        <MenuItem icon="chatbubbles-outline" label="Chat settings" onPress={() => navigation.navigate('ChatSettings')} />
        <MenuItem icon="settings-outline" label="Settings" onPress={() => navigation.navigate('Settings')} />
        <MenuItem icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
      </View>

      <Pressable style={styles.logout} onPress={onLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  email: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg, flexWrap: 'wrap' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginBottom: spacing.sm, marginTop: spacing.sm },
  menuGroup: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { flex: 1, fontSize: 14, color: colors.text },
  logout: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.xl },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
});
