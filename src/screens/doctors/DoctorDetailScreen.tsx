import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, ErrorState, Button, Card } from '@/components/Common';
import { Avatar } from '@/components/Avatar';
import { getDoctor, toggleDoctorLike } from '@/api/doctors';
import { apiErrorMessage } from '@/api/client';
import { formatDate } from '@/utils/format';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DoctorDetail'>;

export function DoctorDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'DoctorDetail'>>();
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();

  const { data: doctor, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['doctor', params.id],
    queryFn: () => getDoctor(params.id),
  });

  if (isLoading) return <LoadingView />;
  if (isError || !doctor) return <ErrorState message={apiErrorMessage(error)} onRetry={refetch} />;

  const onLike = async () => {
    await toggleDoctorLike(params.id);
    queryClient.invalidateQueries({ queryKey: ['doctor', params.id] });
  };

  return (
    <Screen scroll edges={['bottom']}>
      <View style={styles.header}>
        <Avatar uri={doctor.photoUrl} name={doctor.name} size={84} square />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{doctor.name}</Text>
          {doctor.qualifications ? <Text style={styles.qual}>{doctor.qualifications}</Text> : null}
          <Text style={styles.specialty}>{doctor.specialty}</Text>
        </View>
      </View>

      <Button
        title={doctor.likedByMe ? `❤ Liked (${doctor.likeCount})` : `🤍 Like (${doctor.likeCount})`}
        variant="outline"
        onPress={onLike}
        style={{ marginTop: spacing.md }}
      />

      {doctor.services.length > 0 ? (
        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Conditions they treat</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {doctor.services.map((s) => (
              <View key={s.id} style={styles.chip}>
                <Text style={styles.chipText}>{s.name}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Chambers</Text>
      {doctor.chambers.length === 0 ? (
        <Text style={styles.muted}>No chambers listed yet.</Text>
      ) : (
        doctor.chambers.map((c) => (
          <Card key={c.id} style={{ marginBottom: spacing.sm }}>
            <Text style={styles.orgName}>{c.organizationName}</Text>
            <Text style={styles.muted}>
              {c.district ? `${c.district} · ` : ''}
              {c.area || c.address || ''}
            </Text>
            <View style={styles.feeRow}>
              {c.consultationFee != null ? <Text style={styles.fee}>Consultation: ৳{c.consultationFee}</Text> : null}
              {c.serialFee != null ? <Text style={styles.fee}>Serial: ৳{c.serialFee}</Text> : null}
            </View>
            {c.notes ? <Text style={styles.muted}>{c.notes}</Text> : null}
            {c.organizationPhone ? (
              <Text style={[styles.muted, { color: colors.primary }]} onPress={() => Linking.openURL(`tel:${c.organizationPhone}`)}>
                📞 {c.organizationPhone}
              </Text>
            ) : null}

            {c.nextAvailable ? (
              <Text style={styles.nextAvailable}>Next available: {formatDate(c.nextAvailable.date)}</Text>
            ) : (
              <Text style={styles.muted}>No open dates in the next 30 days</Text>
            )}

            <Button
              title="Book appointment"
              disabled={!c.nextAvailable}
              onPress={() =>
                navigation.navigate('BookAppointment', {
                  doctorId: doctor.id,
                  doctorName: doctor.name,
                  chamberId: c.id,
                  organizationName: c.organizationName,
                })
              }
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: spacing.md },
  name: { fontSize: 19, fontWeight: '800', color: colors.text },
  qual: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  specialty: { fontSize: 14, color: colors.primary, fontWeight: '600', marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  chip: { backgroundColor: colors.primaryLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  muted: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  orgName: { fontSize: 15, fontWeight: '700', color: colors.text },
  feeRow: { flexDirection: 'row', gap: spacing.md, marginTop: 6 },
  fee: { fontSize: 12.5, color: colors.text, fontWeight: '600' },
  nextAvailable: { fontSize: 12.5, color: colors.success, fontWeight: '700', marginTop: 6 },
});
