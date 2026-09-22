import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, EmptyState } from '@/components/Common';
import { Avatar } from '@/components/Avatar';
import { getMyFollows } from '@/api/me';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function FollowersScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Followers'>>();
  const [tab, setTab] = useState<'followers' | 'following'>(params?.initialTab || 'followers');
  const { data, isLoading } = useQuery({ queryKey: ['my-follows'], queryFn: getMyFollows });

  const list = tab === 'followers' ? data?.followers : data?.following;

  return (
    <Screen edges={['bottom']}>
      <View style={styles.tabs}>
        {(['followers', 'following'] as const).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && { color: colors.primary }]}>{t === 'followers' ? 'Followers' : 'Following'}</Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <LoadingView />
      ) : !list || list.length === 0 ? (
        <EmptyState title={`No ${tab} yet`} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => navigation.navigate('PublicProfile', { id: item.id })}>
              <Avatar uri={item.photoUrl} name={item.name} size={44} />
              <Text style={styles.name}>{item.name}</Text>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontWeight: '700', color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 10 },
  name: { fontSize: 14.5, color: colors.text, fontWeight: '600' },
});
