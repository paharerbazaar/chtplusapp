import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Common';
import { useAuth } from '@/auth/AuthContext';
import { deleteMyAccount } from '@/api/me';
import { apiErrorMessage } from '@/api/client';
import { colors, spacing } from '@/constants/theme';

export function DeleteAccountScreen() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const onDelete = () => {
    Alert.alert(
      'Delete your account?',
      'Your account and everything you posted (services, listings, biodata, reviews, chats) will be permanently deleted. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteMyAccount();
              await logout();
            } catch (err) {
              Alert.alert('Could not delete account', apiErrorMessage(err));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.center}>
        <Ionicons name="warning-outline" size={48} color={colors.danger} />
        <Text style={styles.title}>Delete your account</Text>
        <Text style={styles.body}>
          Deleting your account will:{'\n\n'}
          • Permanently remove your account, name, photos, bio and contact details{'\n'}
          • Delete everything you posted: services, marketplace listings, biodata, donor profile and reviews{'\n'}
          • Delete your chats, follows, appointments, saved items and coin history{'\n\n'}
          This cannot be undone.
        </Text>
        <Button title="Delete my account" variant="danger" onPress={onDelete} loading={loading} style={{ marginTop: spacing.xl, width: '100%' }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { fontSize: 19, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  body: { fontSize: 13.5, color: colors.textMuted, marginTop: spacing.md, lineHeight: 20 },
});
