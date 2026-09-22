import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, EmptyState, ErrorState } from '@/components/Common';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { SelectField } from '@/components/Select';
import { getServices } from '@/api/services';
import { getServiceCategories } from '@/api/misc';
import { apiErrorMessage } from '@/api/client';
import { spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ServicesList'>;

export function ServicesListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'ServicesList'>>();
  const [categoryId, setCategoryId] = useState(route.params?.categoryId || '');

  const { data: categories } = useQuery({ queryKey: ['service-categories'], queryFn: getServiceCategories });
  const {
    data: services,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['services', categoryId],
    queryFn: () => getServices({ categoryId: categoryId || undefined }),
  });

  const categoryOptions = [{ label: 'All categories', value: '' }, ...(categories || []).map((c) => ({ label: `${c.icon} ${c.name}`, value: c.id }))];

  return (
    <Screen edges={['bottom']}>
      <View style={styles.filterBar}>
        <SelectField value={categoryId} options={categoryOptions} onChange={setCategoryId} placeholder="All categories" />
      </View>

      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <ErrorState message={apiErrorMessage(error)} onRetry={refetch} />
      ) : !services || services.length === 0 ? (
        <EmptyState title="No services found" subtitle="Try a different category." />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(s) => s.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginBottom: spacing.sm }}>
              <ServiceCard service={item} onPress={() => navigation.navigate('ServiceDetail', { id: item.id })} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterBar: { padding: spacing.md, paddingBottom: 0 },
  list: { padding: spacing.md },
});
