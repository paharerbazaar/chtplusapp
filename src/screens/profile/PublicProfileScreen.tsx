import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, ErrorState, Button } from '@/components/Common';
import { Avatar } from '@/components/Avatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { MarketplaceCard } from '@/components/cards/MarketplaceCard';
import { DonorCard } from '@/components/cards/DonorCard';
import { getPublicProfile, getFollowStatus, toggleFollow } from '@/api/users';
import { startConversation } from '@/api/chat';
import { apiErrorMessage } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { resolveImageUrl } from '@/utils/image';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PublicProfileScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'PublicProfile'>>();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [startingChat, setStartingChat] = useState(false);
  const isSelf = user?.id === params.id;

  const { data: profile, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['public-profile', params.id],
    queryFn: () => getPublicProfile(params.id),
  });
  const { data: followStatus } = useQuery({
    queryKey: ['follow-status', params.id],
    queryFn: () => getFollowStatus(params.id),
    enabled: !isSelf,
  });

  if (isLoading) return <LoadingView />;
  if (isError || !profile) return <ErrorState message={apiErrorMessage(error)} onRetry={refetch} />;

  const cover = resolveImageUrl(profile.coverPhotoUrl);

  const onFollow = async () => {
    await toggleFollow(params.id);
    queryClient.invalidateQueries({ queryKey: ['follow-status', params.id] });
    queryClient.invalidateQueries({ queryKey: ['public-profile', params.id] });
  };

  const onMessage = async () => {
    setStartingChat(true);
    try {
      const res = await startConversation(params.id);
      navigation.navigate('Conversation', {
        conversationId: res.conversationId,
        otherUserId: params.id,
        otherUserName: profile.name,
        otherUserPhotoUrl: profile.photoUrl,
      });
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <Screen scroll edges={['bottom']}>
      <View style={styles.coverWrap}>
        {cover ? <Image source={{ uri: cover }} style={styles.cover} contentFit="cover" /> : <View style={[styles.cover, { backgroundColor: colors.primaryLight }]} />}
        <View style={styles.avatarWrap}>
          <Avatar uri={profile.photoUrl} name={profile.name} size={84} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name}>
          {profile.name}
          <VerifiedBadge active={profile.blueBadge} size={18} />
        </Text>
        {profile.area ? <Text style={styles.area}>📍 {profile.area}</Text> : null}
        <Text style={styles.followCounts}>
          {profile.followerCount} followers · {profile.followingCount} following
        </Text>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        {!isSelf ? (
          <View style={styles.actions}>
            <Button title={followStatus?.following ? 'Following' : 'Follow'} variant="outline" onPress={onFollow} style={{ flex: 1 }} />
            {profile.chatEnabled ? <Button title="Message" onPress={onMessage} loading={startingChat} style={{ flex: 1 }} /> : null}
          </View>
        ) : null}

        {profile.work.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work</Text>
            {profile.work.map((w) => (
              <Text key={w.id} style={styles.line}>
                {w.position ? `${w.position} at ` : ''}
                {w.company}
                {w.isCurrent ? ' · Present' : ''}
              </Text>
            ))}
          </View>
        ) : null}

        {profile.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((e) => (
              <Text key={e.id} style={styles.line}>
                {e.institution}
                {e.fieldOfStudy ? ` · ${e.fieldOfStudy}` : ''}
                {e.passingYear ? ` (${e.passingYear})` : ''}
              </Text>
            ))}
          </View>
        ) : null}

        {profile.donor ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Blood Donor</Text>
            <DonorCard donor={profile.donor} onPress={() => navigation.navigate('DonorDetail', { id: profile.donor!.id })} />
          </View>
        ) : null}

        {profile.services.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <FlatList
              data={profile.services}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(s) => s.id}
              contentContainerStyle={{ gap: spacing.sm }}
              renderItem={({ item }) => (
                <View style={{ width: 160 }}>
                  <ServiceCard service={item} onPress={() => navigation.navigate('ServiceDetail', { id: item.id })} />
                </View>
              )}
            />
          </View>
        ) : null}

        {profile.listings.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Marketplace</Text>
            <FlatList
              data={profile.listings}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(l) => l.id}
              contentContainerStyle={{ gap: spacing.sm }}
              renderItem={({ item }) => (
                <View style={{ width: 160 }}>
                  <MarketplaceCard listing={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id })} />
                </View>
              )}
            />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  coverWrap: { marginHorizontal: -16, marginTop: -16 },
  cover: { width: '100%', height: 140 },
  avatarWrap: { position: 'absolute', bottom: -36, left: 20, borderWidth: 3, borderColor: colors.background, borderRadius: 999 },
  body: { marginTop: 44 },
  name: { fontSize: 19, fontWeight: '800', color: colors.text },
  area: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  followCounts: { fontSize: 12.5, color: colors.textMuted, marginTop: 4 },
  bio: { fontSize: 13.5, color: colors.text, marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  line: { fontSize: 13, color: colors.text, marginBottom: 4 },
});
