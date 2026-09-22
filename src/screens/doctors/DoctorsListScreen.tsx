import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, EmptyState, ErrorState, TextField } from '@/components/Common';
import { DoctorCard } from '@/components/cards/DoctorCard';
import { SelectField } from '@/components/Select';
import { getDoctors } from '@/api/doctors';
import { getDiseaseDepartments } from '@/api/misc';
import { apiErrorMessage } from '@/api/client';
import { spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DoctorsList'>;

export function DoctorsListScreen() {
  const navigation = useNavigation<Nav>();
  const [departmentId, setDepartmentId] = useState('');
  const [q, setQ] = useState('');

  const { data: departments } = useQuery({ queryKey: ['disease-departments'], queryFn: getDiseaseDepartments });
  const { data: doctors, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['doctors', departmentId, q],
    queryFn: () => getDoctors({ departmentId: departmentId || undefined, q: q || undefined }),
  });

  const departmentOptions = [{ label: 'All departments', value: '' }, ...(departments || []).map((d) => ({ label: d.name, value: d.id }))];

  return (
    <Screen edges={['bottom']}>
      <View style={styles.filterCol}>
        <TextField value={q} onChangeText={setQ} placeholder="Search by name or specialty" />
        <SelectField value={departmentId} options={departmentOptions} onChange={setDepartmentId} placeholder="All departments" />
      </View>

      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <ErrorState message={apiErrorMessage(error)} onRetry={refetch} />
      ) : !doctors || doctors.length === 0 ? (
        <EmptyState title="No doctors found" />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(d) => d.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginBottom: spacing.sm }}>
              <DoctorCard doctor={item} onPress={() => navigation.navigate('DoctorDetail', { id: item.id })} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterCol: { gap: spacing.sm, padding: spacing.md, paddingBottom: 0 },
  list: { padding: spacing.md },
});
