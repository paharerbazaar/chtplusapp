import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { EntityCard } from '../EntityCard';
import type { BiodataTeaser } from '@/types';
import { colors } from '@/constants/theme';

export function BiodataCard({ biodata, onPress }: { biodata: BiodataTeaser; onPress: () => void }) {
  return (
    <EntityCard
      photoUrl={biodata.photos?.[0]}
      title={biodata.biodataNo}
      subtitle={`${biodata.age} yrs · ${biodata.height}`}
      badge={{ label: biodata.gender === 'মহিলা' ? 'Bride' : 'Groom', tone: 'primary' }}
      onPress={onPress}
      meta={
        <Text style={styles.line} numberOfLines={1}>
          {biodata.profession} · {biodata.area}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  line: { fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
});
