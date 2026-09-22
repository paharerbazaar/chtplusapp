import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, EmptyState, ErrorState } from '@/components/Common';
import { DonorCard } from '@/components/cards/DonorCard';
import { SelectField } from '@/components/Select';
import { getDonors } from '@/api/donors';
import { apiErrorMessage } from '@/api/client';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DonorsList'>;

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => ({ label: g, value: g }));

export function DonorsListScreen() {
  const navigation = useNavigation<Nav>();
  const [bloodGroup, setBloodGroup] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const { data: donors, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['donors', bloodGroup, availableOnly],
    queryFn: () => getDonors({ bloodGroup: bloodGroup || undefined, availableOnly }),
  });

  return (
    <Screen edges={['bottom']}>
      <View style={styles.filterRow}>
        <View style={{ flex: 1 }}>
          <SelectField value={bloodGroup} options={[{ label: 'Any blood group', value: '' }, ...BLOOD_GROUPS]} onChange={setBloodGroup} />
        </View>
        <Pressable style={[styles.toggle, availableOnly && styles.toggleActive]} onPress={() => setAvailableOnly((v) => !v)}>
          <Ionicons name={availableOnly ? 'checkbox' : 'square-outline'} size={18} color={availableOnly ? colors.primary : colors.textMuted} />
          <Text style={[styles.toggleText, availableOnly && { color: colors.primary }]}>Available only</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <ErrorState message={apiErrorMessage(error)} onRetry={refetch} />
      ) : !donors || donors.length === 0 ? (
        <EmptyState title="No donors found" />
      ) : (
        <FlatList
          data={donors}
          keyExtractor={(d) => d.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginBottom: spacing.sm }}>
              <DonorCard donor={item} onPress={() => navigation.navigate('DonorDetail', { id: item.id })} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, paddingBottom: 0 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleActive: {},
  toggleText: { fontSize: 12.5, color: colors.textMuted },
  list: { padding: spacing.md },
});
