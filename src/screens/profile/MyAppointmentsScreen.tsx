import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, EmptyState, Card, Badge } from '@/components/Common';
import { getMySerials } from '@/api/me';
import { formatDate } from '@/utils/format';
import { colors, spacing } from '@/constants/theme';

const STATUS_TONE = { pending: 'muted', confirmed: 'primary', rejected: 'danger', completed: 'primary', cancelled: 'danger' } as const;

export function MyAppointmentsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['my-serials'], queryFn: getMySerials });

  return (
    <Screen edges={['bottom']}>
      {isLoading ? (
        <LoadingView />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No appointments yet" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: spacing.md }}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: spacing.sm }}>
              <View style={styles.row}>
                <Text style={styles.doctor}>{item.doctorName || 'Doctor appointment'}</Text>
                <Badge label={item.status} tone={STATUS_TONE[item.status]} />
              </View>
              <Text style={styles.muted}>{item.organizationName}</Text>
              <Text style={styles.muted}>{formatDate(item.appointmentDate)}{item.serialNumber ? ` · Serial #${item.serialNumber}` : ''}</Text>
              <Text style={styles.muted}>Patient: {item.patientName} · {item.patientPhone}</Text>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  doctor: { fontSize: 14.5, fontWeight: '700', color: colors.text },
  muted: { fontSize: 12.5, color: colors.textMuted, marginTop: 3 },
});
