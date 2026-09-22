import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Linking, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, ErrorState, Button, Badge } from '@/components/Common';
import { RatingStars } from '@/components/RatingStars';
import { ReviewsSection } from '@/components/ReviewsSection';
import { getService, getServiceReviews, addServiceReview, deleteService, sponsorService } from '@/api/services';
import { getMyServices } from '@/api/me';
import { getServiceSubscriptionPackages, toggleSaved } from '@/api/misc';
import { apiErrorMessage } from '@/api/client';
import { resolveImageUrl } from '@/utils/image';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { PackagePicker } from '@/components/PackagePicker';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ServiceDetail'>;
const screenWidth = Dimensions.get('window').width;

export function ServiceDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'ServiceDetail'>>();
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const [sponsoring, setSponsoring] = useState(false);

  const { data: service, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['service', params.id],
    queryFn: () => getService(params.id),
  });
  const { data: myServices } = useQuery({ queryKey: ['my-services'], queryFn: getMyServices });
  const isOwner = !!myServices?.some((s) => s.id === params.id);

  const reviewsQuery = useQuery({ queryKey: ['service-reviews', params.id], queryFn: () => getServiceReviews(params.id) });
  const packagesQuery = useQuery({ queryKey: ['service-packages'], queryFn: getServiceSubscriptionPackages, enabled: isOwner });

  if (isLoading) return <LoadingView />;
  if (isError || !service) return <ErrorState message={apiErrorMessage(error)} onRetry={refetch} />;

  const onDelete = () => {
    Alert.alert('Delete this service?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteService(params.id);
          queryClient.invalidateQueries({ queryKey: ['my-services'] });
          navigation.goBack();
        },
      },
    ]);
  };

  const onSponsor = async (packageId: string) => {
    setSponsoring(true);
    try {
      await sponsorService(params.id, packageId);
      queryClient.invalidateQueries({ queryKey: ['service', params.id] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      Alert.alert('Sponsored!', 'Your service will now be shown as sponsored.');
    } catch (err) {
      Alert.alert('Could not sponsor', apiErrorMessage(err));
    } finally {
      setSponsoring(false);
    }
  };

  const photos = service.photos?.length ? service.photos : [null];

  return (
    <Screen scroll edges={['bottom']}>
      <FlatList
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        style={{ marginHorizontal: -16, marginTop: -16 }}
        renderItem={({ item }) => {
          const uri = resolveImageUrl(item);
          return (
            <View style={{ width: screenWidth, height: 240, backgroundColor: colors.primaryLight }}>
              {uri ? <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
            </View>
          );
        }}
      />

      <View style={{ marginTop: spacing.md }}>
        {service.paid ? <Badge label="Sponsored" tone="gold" /> : null}
        <Text style={styles.title}>{service.providerName}</Text>
        <Text style={styles.category}>
          {service.categoryIcon} {service.categoryName} · {service.area}
        </Text>
        <RatingStars rating={service.rating} count={service.ratingCount} size={15} />

        <Text style={styles.description}>{service.descriptionText}</Text>

        <View style={styles.actions}>
          <Button title={`Call ${service.phone}`} onPress={() => Linking.openURL(`tel:${service.phone}`)} style={{ flex: 1 }} />
          <Button
            title="Save"
            variant="outline"
            onPress={() => toggleSaved('service', params.id)}
            style={{ flex: 1 }}
          />
        </View>

        {isOwner ? (
          <View style={styles.ownerBox}>
            <Text style={styles.ownerTitle}>Your listing</Text>
            <View style={styles.actions}>
              <Button title="Edit" variant="outline" onPress={() => navigation.navigate('ServiceForm', { id: params.id })} style={{ flex: 1 }} />
              <Button title="Delete" variant="danger" onPress={onDelete} style={{ flex: 1 }} />
            </View>
            {packagesQuery.data && packagesQuery.data.length > 0 ? (
              <PackagePicker
                title="Sponsor this service"
                packages={packagesQuery.data.map((p) => ({ id: p.id, label: `${p.name} — ${p.coinCost} coins / ${p.durationDays} days` }))}
                loading={sponsoring}
                onPick={onSponsor}
              />
            ) : null}
          </View>
        ) : null}

        <ReviewsSection
          reviews={reviewsQuery.data || []}
          onSubmit={async (rating, comment) => {
            await addServiceReview(params.id, { rating, comment });
            reviewsQuery.refetch();
          }}
          onReviewsChanged={() => reviewsQuery.refetch()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 6 },
  category: { fontSize: 13.5, color: colors.textMuted, marginTop: 2, marginBottom: 6 },
  description: { fontSize: 14, color: colors.text, lineHeight: 21, marginTop: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  ownerBox: { marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg },
  ownerTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase' },
});
