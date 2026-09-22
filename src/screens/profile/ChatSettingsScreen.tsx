import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { LoadingView, Card } from '@/components/Common';
import { getChatSettings, updateChatSettings } from '@/api/me';
import { colors, spacing } from '@/constants/theme';

export function ChatSettingsScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['chat-settings'], queryFn: getChatSettings });

  const onToggle = async (value: boolean) => {
    await updateChatSettings({ chatEnabled: value });
    queryClient.invalidateQueries({ queryKey: ['chat-settings'] });
  };

  if (isLoading) return <LoadingView />;

  return (
    <Screen>
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Allow people to message me</Text>
            <Text style={styles.subtitle}>Turning this off hides the "Message" button on your public profile.</Text>
          </View>
          <Switch value={!!data?.chatEnabled} onValueChange={onToggle} trackColor={{ true: colors.primary }} />
        </View>
      </Card>
      <Text style={styles.note}>Messages are automatically deleted after 7 days.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { fontSize: 14.5, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  note: { fontSize: 12, color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' },
});
