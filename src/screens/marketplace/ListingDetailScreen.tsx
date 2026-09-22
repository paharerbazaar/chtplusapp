import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Linking, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, ErrorState, Button, Badge } from '@/components/Common';
import { getListing, deleteListing, sponsorListing } from '@/api/marketplace';
import { getMyListings } from '@/api/me';
import { toggleSaved } from '@/api/misc';
import { apiErrorMessage } from '@/api/client';
import { resolveImageUrl } from '@/utils/image';
import { formatTaka } from '@/utils/format';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ListingDetail'>;
const screenWidth = Dimensions.get('window').width;

export function ListingDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'ListingDetail'>>();
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const [sponsoring, setSponsoring] = useState(false);

  const { data: listing, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['listing', params.id],
    queryFn: () => getListing(params.id),
  });
  const { data: myListings } = useQuery({ queryKey: ['my-listings'], queryFn: getMyListings });
  const isOwner = !!myListings?.some((l) => l.id === params.id);

  if (isLoading) return <LoadingView />;
  if (isError || !listing) return <ErrorState message={apiErrorMessage(error)} onRetry={refetch} />;

  const onDelete = () => {
    Alert.alert('Delete this listing?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteListing(params.id);
          queryClient.invalidateQueries({ queryKey: ['my-listings'] });
          navigation.goBack();
        },
      },
    ]);
  };

  const onSponsor = async () => {
    setSponsoring(true);
    try {
      await sponsorListing(params.id);
      queryClient.invalidateQueries({ queryKey: ['listing', params.id] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      Alert.alert('Boosted!', 'Your listing will now be shown as boosted.');
    } catch (err) {
      Alert.alert('Could not boost', apiErrorMessage(err));
    } finally {
      setSponsoring(false);
    }
  };

  const photos = listing.photos?.length ? listing.photos : [null];

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
            <View style={{ width: screenWidth, height: 260, backgroundColor: colors.primaryLight }}>
              {uri ? <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
            </View>
          );
        }}
      />

      <View style={{ marginTop: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {listing.paid ? <Badge label="Boosted" tone="gold" /> : null}
          {listing.negotiable ? <Badge label="Negotiable" tone="muted" /> : null}
          {listing.adNumber ? <Badge label={listing.adNumber} tone="muted" /> : null}
        </View>
        <Text style={styles.price}>{formatTaka(listing.price)}</Text>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.meta}>
          {listing.categoryIcon} {listing.categoryName} · {listing.condition} · {listing.area}
        </Text>
        {listing.description ? <Text style={styles.description}>{listing.description}</Text> : null}

        <View style={styles.actions}>
          <Button title={`Call ${listing.sellerPhone}`} onPress={() => Linking.openURL(`tel:${listing.sellerPhone}`)} style={{ flex: 1 }} />
          <Button title="Save" variant="outline" onPress={() => toggleSaved('marketplace_listing', params.id)} style={{ flex: 1 }} />
        </View>

        {isOwner ? (
          <View style={styles.ownerBox}>
            <Text style={styles.ownerTitle}>Your listing</Text>
            <View style={styles.actions}>
              <Button title="Edit" variant="outline" onPress={() => navigation.navigate('ListingForm', { id: params.id })} style={{ flex: 1 }} />
              <Button title="Delete" variant="danger" onPress={onDelete} style={{ flex: 1 }} />
            </View>
            <Button title="Boost this listing" onPress={onSponsor} loading={sponsoring} style={{ marginTop: spacing.sm }} />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  price: { fontSize: 22, fontWeight: '800', color: colors.primary, marginTop: spacing.sm },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 2 },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  description: { fontSize: 14, color: colors.text, lineHeight: 21, marginTop: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  ownerBox: { marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg },
  ownerTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase' },
});
