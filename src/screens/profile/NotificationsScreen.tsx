import React from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, EmptyState, Button } from '@/components/Common';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '@/api/me';
import { resolveDeepLinkPath } from '@/utils/deepLink';
import { formatRelativeShort } from '@/utils/format';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { NotificationItem } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['notifications'], queryFn: getMyNotifications });

  const onPress = async (item: NotificationItem) => {
    if (!item.read) {
      await markNotificationRead(item.id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
    if (item.link) {
      const target = resolveDeepLinkPath(item.link);
      if (target) (navigation as unknown as { navigate: (screen: string, params?: unknown) => void }).navigate(target.screen, target.params);
    }
  };

  const onMarkAll = async () => {
    await markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <Screen edges={['bottom']}>
      {data && data.some((n) => !n.read) ? (
        <View style={{ padding: spacing.md, paddingBottom: 0 }}>
          <Button title="Mark all as read" variant="outline" onPress={onMarkAll} />
        </View>
      ) : null}

      {isLoading ? (
        <LoadingView />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No notifications yet" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={{ padding: spacing.md }}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Pressable style={[styles.row, !item.read && styles.rowUnread]} onPress={() => onPress(item)}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>{formatRelativeShort(item.createdAt)}</Text>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowUnread: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, borderRadius: 8 },
  title: { fontSize: 14, fontWeight: '700', color: colors.text },
  body: { fontSize: 13, color: colors.text, marginTop: 2 },
  time: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
});
