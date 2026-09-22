import React, { useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Button, Field, TextField } from '@/components/Common';
import { requestPasswordReset } from '@/api/auth';
import { apiErrorMessage } from '@/api/client';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

export function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      Alert.alert('Missing information', 'Enter your account email.');
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(trimmed);
      navigation.navigate('ResetPassword', { email: trimmed });
    } catch (err) {
      Alert.alert('Something went wrong', apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.intro}>
        Enter the email address linked to your account. We'll send a 6-digit code you can use to reset your password.
      </Text>

      <Field label="Email">
        <TextField
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
      </Field>

      <Button title="Send reset code" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.textMuted, fontSize: 13.5, marginBottom: spacing.lg, lineHeight: 19 },
});
