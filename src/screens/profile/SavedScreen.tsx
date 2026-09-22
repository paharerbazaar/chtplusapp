import React from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, EmptyState } from '@/components/Common';
import { getSavedItems, SavedItem } from '@/api/misc';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ICONS: Record<SavedItem['targetType'], keyof typeof Ionicons.glyphMap> = {
  service: 'construct',
  donor: 'water',
  marketplace_listing: 'storefront',
  biodata: 'heart',
};

export function SavedScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['saved'], queryFn: getSavedItems });

  const onPress = (item: SavedItem) => {
    switch (item.targetType) {
      case 'service':
        navigation.navigate('ServiceDetail', { id: item.targetId });
        break;
      case 'donor':
        navigation.navigate('DonorDetail', { id: item.targetId });
        break;
      case 'marketplace_listing':
        navigation.navigate('ListingDetail', { id: item.targetId });
        break;
      case 'biodata':
        navigation.navigate('BiodataDetail', { id: item.targetId });
        break;
    }
  };

  return (
    <Screen edges={['bottom']}>
      {isLoading ? (
        <LoadingView />
      ) : !data || data.length === 0 ? (
        <EmptyState title="Nothing saved yet" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(s, i) => `${s.targetType}-${s.targetId}-${i}`}
          contentContainerStyle={{ padding: spacing.md }}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => onPress(item)}>
              <View style={styles.icon}>
                <Ionicons name={ICONS[item.targetType]} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title || 'Untitled'}</Text>
                {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
