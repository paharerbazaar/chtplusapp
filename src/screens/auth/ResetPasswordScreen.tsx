import React, { useState } from 'react';
import { Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Screen } from '@/components/Screen';
import { Button, Field, TextField } from '@/components/Common';
import { useAuth } from '@/auth/AuthContext';
import { requestPasswordReset } from '@/api/auth';
import { apiErrorMessage } from '@/api/client';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

export function ResetPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ResetPassword'>>();
  const { resetPassword } = useAuth();
  const { email } = route.params;

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async () => {
    if (!code.trim() || newPassword.length < 6) {
      Alert.alert('Check your details', 'Enter the 6-digit code and a new password of at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, code: code.trim(), newPassword });
    } catch (err) {
      Alert.alert('Could not reset password', apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    try {
      await requestPasswordReset(email);
      Alert.alert('Code sent', `A new code was sent to ${email}.`);
    } catch (err) {
      Alert.alert('Could not resend code', apiErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.intro}>
        We sent a 6-digit code to <Text style={{ fontWeight: '700', color: colors.text }}>{email}</Text>. Enter it below along
        with your new password.
      </Text>

      <Field label="Verification code">
        <TextField
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          keyboardType="number-pad"
          maxLength={6}
        />
      </Field>
      <Field label="New password" hint="At least 6 characters">
        <TextField value={newPassword} onChangeText={setNewPassword} placeholder="••••••••" secureTextEntry />
      </Field>

      <Button title="Reset password" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.sm }} />

      <Pressable style={styles.resendLink} onPress={onResend} disabled={resending}>
        <Text style={styles.resendText}>{resending ? 'Sending…' : "Didn't get a code? Resend"}</Text>
      </Pressable>

      <Pressable style={styles.backLink} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.resendText}>Back to log in</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.textMuted, fontSize: 13.5, marginBottom: spacing.lg, lineHeight: 19 },
  resendLink: { marginTop: spacing.lg, alignItems: 'center' },
  backLink: { marginTop: spacing.md, alignItems: 'center' },
  resendText: { color: colors.primary, fontSize: 13.5, fontWeight: '600' },
});
