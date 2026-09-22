import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button, Field, TextField } from '@/components/Common';
import { useAuth } from '@/auth/AuthContext';
import { apiErrorMessage } from '@/api/client';
import { spacing } from '@/constants/theme';

export function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Check your details', 'Name, email, and a password of at least 6 characters are required.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), password, phone: phone.trim() || undefined, area: area.trim() || undefined });
    } catch (err) {
      Alert.alert('Could not create account', apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Field label="Full name" required>
        <TextField value={name} onChangeText={setName} placeholder="Your name" />
      </Field>
      <Field label="Email" required>
        <TextField value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
      </Field>
      <Field label="Phone number">
        <TextField value={phone} onChangeText={setPhone} placeholder="01XXXXXXXXX" keyboardType="phone-pad" />
      </Field>
      <Field label="Area">
        <TextField value={area} onChangeText={setArea} placeholder="e.g. Khagrachari Sadar" />
      </Field>
      <Field label="Password" required hint="At least 6 characters">
        <TextField value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
      </Field>

      <Button title="Create account" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
    </Screen>
  );
}
