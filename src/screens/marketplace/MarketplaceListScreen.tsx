import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, EmptyState, ErrorState } from '@/components/Common';
import { MarketplaceCard } from '@/components/cards/MarketplaceCard';
import { SelectField } from '@/components/Select';
import { getListings, MarketplaceFilters } from '@/api/marketplace';
import { getMarketplaceCategories } from '@/api/misc';
import { apiErrorMessage } from '@/api/client';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SORT_OPTIONS = [
  { label: 'Newest first', value: '' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
];

export function MarketplaceListScreen() {
  const navigation = useNavigation<Nav>();
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState<MarketplaceFilters['sort'] | ''>('');

  const { data: categories } = useQuery({ queryKey: ['marketplace-categories'], queryFn: getMarketplaceCategories });
  const {
    data: listings,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['listings', categoryId, sort],
    queryFn: () => getListings({ categoryId: categoryId || undefined, sort: (sort || undefined) as MarketplaceFilters['sort'] }),
  });

  const categoryOptions = [{ label: 'All categories', value: '' }, ...(categories || []).map((c) => ({ label: `${c.icon} ${c.name}`, value: c.id }))];

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <Pressable onPress={() => navigation.navigate('ListingForm', {})} hitSlop={10}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        <View style={{ flex: 1 }}>
          <SelectField value={categoryId} options={categoryOptions} onChange={setCategoryId} placeholder="All categories" />
        </View>
        <View style={{ flex: 1 }}>
          <SelectField value={sort} options={SORT_OPTIONS} onChange={(v) => setSort(v as MarketplaceFilters['sort'])} placeholder="Sort" />
        </View>
      </View>

      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <ErrorState message={apiErrorMessage(error)} onRetry={refetch} />
      ) : !listings || listings.length === 0 ? (
        <EmptyState title="No listings yet" subtitle="Be the first to list something for sale." />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(l) => l.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginBottom: spacing.sm }}>
              <MarketplaceCard listing={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id })} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  filterRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, paddingBottom: 0 },
  list: { padding: spacing.md },
});
