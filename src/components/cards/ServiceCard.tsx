import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EntityCard } from '../EntityCard';
import { RatingStars } from '../RatingStars';
import type { ServiceItem } from '@/types';
import { colors } from '@/constants/theme';

export function ServiceCard({ service, onPress }: { service: ServiceItem; onPress: () => void }) {
  return (
    <EntityCard
      photoUrl={service.photos?.[0]}
      title={service.providerName}
      subtitle={`${service.categoryIcon || ''} ${service.categoryName}`.trim()}
      badge={service.paid ? { label: 'Sponsored', tone: 'gold' } : undefined}
      onPress={onPress}
      meta={
        <View style={styles.row}>
          <RatingStars rating={service.rating} count={service.ratingCount} />
          <Text style={styles.area}>{service.area}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  area: { fontSize: 11.5, color: colors.textMuted },
});
