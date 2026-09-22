import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EntityCard } from '../EntityCard';
import type { Donor } from '@/types';
import { colors } from '@/constants/theme';

export function DonorCard({ donor, onPress }: { donor: Donor; onPress: () => void }) {
  return (
    <EntityCard
      photoUrl={donor.photoUrl}
      title={donor.name}
      subtitle={donor.area}
      badge={{ label: donor.bloodGroup, tone: donor.eligible ? 'primary' : 'muted' }}
      onPress={onPress}
      meta={
        <View style={styles.row}>
          <Text style={styles.status}>{donor.eligible ? 'Available to donate' : 'Recently donated'}</Text>
          <Text style={styles.likes}>❤ {donor.likeCount}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  status: { fontSize: 11, color: colors.textMuted, flex: 1 },
  likes: { fontSize: 11.5, color: colors.textMuted },
});
