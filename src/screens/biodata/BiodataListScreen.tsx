import React from 'react';
import { View, FlatList, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, EmptyState, ErrorState } from '@/components/Common';
import { BiodataCard } from '@/components/cards/BiodataCard';
import { getBiodataList } from '@/api/biodata';
import { apiErrorMessage } from '@/api/client';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BiodataList'>;

export function BiodataListScreen() {
  const navigation = useNavigation<Nav>();
  const { data: list, isLoading, isError, error, refetch, isRefetching } = useQuery({ queryKey: ['biodata-list'], queryFn: getBiodataList });

  return (
    <Screen edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerNote}>Verified matrimony profiles</Text>
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate('BiodataForm', {})}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add biodata</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <ErrorState message={apiErrorMessage(error)} onRetry={refetch} />
      ) : !list || list.length === 0 ? (
        <EmptyState title="No biodata yet" />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(b) => b.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginBottom: spacing.sm }}>
              <BiodataCard biodata={item} onPress={() => navigation.navigate('BiodataDetail', { id: item.id })} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, paddingBottom: spacing.sm },
  headerNote: { fontSize: 12.5, color: colors.textMuted, flex: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 12.5 },
  list: { padding: spacing.md, paddingTop: 0 },
});
