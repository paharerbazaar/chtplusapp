import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/auth/AuthContext';
import { getBanners } from '@/api/misc';
import { resolveImageUrl } from '@/utils/image';
import { colors, radius, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// "Marketplace" is a bottom-tab name, the rest are root-stack screens — React
// Navigation resolves either one by name from a screen nested in a tab.
const CATEGORIES: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap; screen: string }[] = [
  { key: 'services', label: 'Local Services', icon: 'construct', screen: 'ServicesList' },
  { key: 'donors', label: 'Blood Donors', icon: 'water', screen: 'DonorsList' },
  { key: 'marketplace', label: 'Marketplace', icon: 'storefront', screen: 'Marketplace' },
  { key: 'doctors', label: 'Doctors', icon: 'medkit', screen: 'DoctorsList' },
  { key: 'biodata', label: 'Matrimony', icon: 'heart', screen: 'BiodataList' },
];

const screenWidth = Dimensions.get('window').width;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { data: banners } = useQuery({ queryKey: ['banners'], queryFn: getBanners });

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
          <Text style={styles.subGreeting}>What do you need today?</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Notifications')} hitSlop={10}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      {banners && banners.length > 0 ? (
        <FlatList
          data={banners}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(b) => b.id}
          style={{ marginTop: spacing.md }}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => {
            const uri = resolveImageUrl(item.imageUrl);
            if (!uri) return null;
            return <Image source={{ uri }} style={{ width: screenWidth - 64, height: 130, borderRadius: radius.md }} contentFit="cover" />;
          }}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Explore</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <Pressable key={cat.key} style={styles.gridItem} onPress={() => navigation.navigate(cat.screen as never)}>
            <View style={styles.gridIcon}>
              <Ionicons name={cat.icon} size={26} color={colors.primary} />
            </View>
            <Text style={styles.gridLabel}>{cat.label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 19, fontWeight: '800', color: colors.text },
  subGreeting: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridItem: {
    width: (screenWidth - 32 - spacing.sm * 2) / 3,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    gap: 6,
  },
  gridIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: { fontSize: 11.5, fontWeight: '600', color: colors.text, textAlign: 'center' },
});
