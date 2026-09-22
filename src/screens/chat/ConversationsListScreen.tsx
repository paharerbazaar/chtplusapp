import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, EmptyState, ErrorState, Badge } from '@/components/Common';
import { Avatar } from '@/components/Avatar';
import { getConversations } from '@/api/chat';
import { apiErrorMessage } from '@/api/client';
import { formatRelativeShort } from '@/utils/format';
import { CHAT_LIST_POLL_INTERVAL_MS } from '@/constants/config';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ConversationsListScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: CHAT_LIST_POLL_INTERVAL_MS,
  });

  return (
    <Screen edges={['top', 'bottom']}>
      <Text style={styles.header}>Messages</Text>
      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <ErrorState message={apiErrorMessage(error)} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No conversations yet" subtitle="Message a seller or provider from their profile to start chatting." />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(c) => c.conversationId}
          refreshing={isRefetching}
          onRefresh={refetch}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() =>
                navigation.navigate('Conversation', {
                  conversationId: item.conversationId,
                  otherUserId: item.otherUserId,
                  otherUserName: item.otherUserName,
                  otherUserPhotoUrl: item.otherUserPhotoUrl,
                })
              }
            >
              <Avatar uri={item.otherUserPhotoUrl} name={item.otherUserName} size={48} />
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.name} numberOfLines={1}>{item.otherUserName}</Text>
                  <Text style={styles.time}>{formatRelativeShort(item.lastMessageAt)}</Text>
                </View>
                <View style={styles.rowBottom}>
                  <Text style={[styles.preview, item.unreadCount > 0 && styles.previewUnread]} numberOfLines={1}>
                    {item.lastMessageBody}
                  </Text>
                  {item.unreadCount > 0 ? <Badge label={String(item.unreadCount)} /> : null}
                </View>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 20, fontWeight: '800', color: colors.text, padding: spacing.md, paddingBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 14.5, fontWeight: '700', color: colors.text, flex: 1 },
  time: { fontSize: 11, color: colors.textMuted },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  preview: { fontSize: 13, color: colors.textMuted, flex: 1 },
  previewUnread: { color: colors.text, fontWeight: '600' },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 64 },
});
