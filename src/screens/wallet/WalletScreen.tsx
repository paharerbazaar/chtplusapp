import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Card, Button, Badge, LoadingView } from '@/components/Common';
import { getMyCoins } from '@/api/me';
import { getMyCoinPurchaseHistory, getMySubscriptionStatus } from '@/api/coins';
import { formatDateTime } from '@/utils/format';
import { API_BASE_URL } from '@/constants/config';
import { colors, spacing } from '@/constants/theme';

const STATUS_TONE = { pending: 'muted', approved: 'primary', rejected: 'danger', active: 'primary', expired: 'muted' } as const;

export function WalletScreen() {
  const { data: coins, isLoading } = useQuery({ queryKey: ['my-coins'], queryFn: getMyCoins });
  const { data: history } = useQuery({ queryKey: ['coin-history'], queryFn: getMyCoinPurchaseHistory });
  const { data: subscription } = useQuery({ queryKey: ['my-subscription'], queryFn: getMySubscriptionStatus });

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <Text style={styles.header}>Wallet</Text>

      <Card style={styles.balanceCard}>
        <Ionicons name="logo-bitcoin" size={28} color={colors.gold} />
        {isLoading ? (
          <LoadingView />
        ) : (
          <Text style={styles.balance}>{coins?.coinBalance ?? 0} coins</Text>
        )}
        <Text style={styles.balanceHint}>Spend coins to unlock matrimony biodata or boost your listings.</Text>
        <Button
          title="Buy coins on the website"
          onPress={() => Linking.openURL(`${API_BASE_URL}/coins`)}
          style={{ marginTop: spacing.md }}
        />
        <Text style={styles.note}>
          Coin purchases are completed on chtplus.xyz via bKash/Nagad — you'll come right back to the app afterwards.
        </Text>
      </Card>

      {subscription?.subscription ? (
        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Matrimony subscription</Text>
            <Badge label={subscription.subscription.status} tone={STATUS_TONE[subscription.subscription.status]} />
          </View>
          {subscription.subscription.expiresAt ? (
            <Text style={styles.muted}>Expires: {formatDateTime(subscription.subscription.expiresAt)}</Text>
          ) : null}
        </Card>
      ) : null}

      <Text style={styles.sectionTitle}>Top-up history</Text>
      {!history || history.length === 0 ? (
        <Text style={styles.muted}>No coin purchase requests yet.</Text>
      ) : (
        history.map((h) => (
          <Card key={h.id} style={{ marginBottom: spacing.sm }}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{h.coinAmount} coins · ৳{h.takaAmount}</Text>
              <Badge label={h.status} tone={STATUS_TONE[h.status]} />
            </View>
            <Text style={styles.muted}>
              {h.method.toUpperCase()} · {h.transactionId} · {formatDateTime(h.requestedAt)}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  balanceCard: { alignItems: 'center', paddingVertical: spacing.lg },
  balance: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 6 },
  balanceHint: { fontSize: 12.5, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  note: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  muted: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
