import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { EntityCard } from '../EntityCard';
import type { MarketplaceListing } from '@/types';
import { formatTaka } from '@/utils/format';

export function MarketplaceCard({ listing, onPress }: { listing: MarketplaceListing; onPress: () => void }) {
  return (
    <EntityCard
      photoUrl={listing.photos?.[0]}
      title={listing.title}
      subtitle={listing.area}
      badge={listing.paid ? { label: 'Boosted', tone: 'gold' } : undefined}
      onPress={onPress}
      meta={<Text style={styles.price}>{formatTaka(listing.price)}</Text>}
    />
  );
}

const styles = StyleSheet.create({
  price: { fontSize: 15, fontWeight: '800', color: '#145c39', marginTop: 2 },
});
