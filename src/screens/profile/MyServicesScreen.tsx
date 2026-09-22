import React from 'react';
import { View, FlatList, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, EmptyState, Badge } from '@/components/Common';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { getMyServices } from '@/api/me';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_TONE = { pending: 'muted', approved: 'primary', rejected: 'danger' } as const;

export function MyServicesScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['my-services'], queryFn: getMyServices });

  return (
    <Screen edges={['bottom']}>
      <Pressable style={styles.addRow} onPress={() => navigation.navigate('ServiceForm', {})}>
        <Ionicons name="add-circle" size={20} color={colors.primary} />
        <Text style={styles.addText}>Add a new service</Text>
      </Pressable>

      {isLoading ? (
        <LoadingView />
      ) : !data || data.length === 0 ? (
        <EmptyState title="You haven't added any services yet" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(s) => s.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={{ padding: spacing.md }}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginBottom: spacing.sm }}>
              {item.status && item.status !== 'approved' ? (
                <View style={{ marginBottom: 4 }}>
                  <Badge label={item.status} tone={STATUS_TONE[item.status]} />
                </View>
              ) : null}
              <ServiceCard service={item} onPress={() => navigation.navigate('ServiceDetail', { id: item.id })} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: spacing.md },
  addText: { color: colors.primary, fontWeight: '700' },
});
