import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, ErrorState, Button, Badge } from '@/components/Common';
import { Avatar } from '@/components/Avatar';
import { ReviewsSection } from '@/components/ReviewsSection';
import { getDonor, toggleDonorLike, getDonorReviews, addDonorReview } from '@/api/donors';
import { apiErrorMessage } from '@/api/client';
import { formatDate } from '@/utils/format';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

export function DonorDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'DonorDetail'>>();
  const queryClient = useQueryClient();

  const { data: donor, isLoading, isError, error, refetch } = useQuery({ queryKey: ['donor', params.id], queryFn: () => getDonor(params.id) });
  const reviewsQuery = useQuery({ queryKey: ['donor-reviews', params.id], queryFn: () => getDonorReviews(params.id) });

  if (isLoading) return <LoadingView />;
  if (isError || !donor) return <ErrorState message={apiErrorMessage(error)} onRetry={refetch} />;

  const onLike = async () => {
    await toggleDonorLike(params.id);
    queryClient.invalidateQueries({ queryKey: ['donor', params.id] });
  };

  return (
    <Screen scroll edges={['bottom']}>
      <View style={styles.header}>
        <Avatar uri={donor.photoUrl} name={donor.name} size={84} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{donor.name}</Text>
          <Badge label={donor.bloodGroup} tone="primary" />
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>📍 {donor.area}</Text>
        <Text style={styles.meta}>{donor.eligible ? '✅ Available to donate' : '⏳ Recently donated'}</Text>
      </View>
      {donor.lastDonationDate ? <Text style={styles.meta}>Last donation: {formatDate(donor.lastDonationDate)}</Text> : null}

      <View style={styles.actions}>
        <Button title={`Call ${donor.phone}`} onPress={() => Linking.openURL(`tel:${donor.phone}`)} style={{ flex: 1 }} />
        <Button title={donor.likedByMe ? `❤ Liked (${donor.likeCount})` : `🤍 Like (${donor.likeCount})`} variant="outline" onPress={onLike} style={{ flex: 1 }} />
      </View>

      <ReviewsSection
        reviews={reviewsQuery.data || []}
        onSubmit={async (rating, comment) => {
          await addDonorReview(params.id, { rating, comment });
          reviewsQuery.refetch();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  name: { fontSize: 19, fontWeight: '800', color: colors.text, marginBottom: 6 },
  metaRow: { marginTop: spacing.md, gap: 4 },
  meta: { fontSize: 13.5, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
});
