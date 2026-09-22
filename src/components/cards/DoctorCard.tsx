import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { EntityCard } from '../EntityCard';
import type { Doctor } from '@/types';
import { colors } from '@/constants/theme';

export function DoctorCard({ doctor, onPress }: { doctor: Doctor; onPress: () => void }) {
  return (
    <EntityCard
      photoUrl={doctor.photoUrl}
      title={doctor.name}
      subtitle={doctor.specialty}
      onPress={onPress}
      meta={doctor.qualifications ? <Text style={styles.qual} numberOfLines={1}>{doctor.qualifications}</Text> : undefined}
    />
  );
}

const styles = StyleSheet.create({
  qual: { fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
});
