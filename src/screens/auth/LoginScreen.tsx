import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Button, Field, TextField } from '@/components/Common';
import { useAuth } from '@/auth/AuthContext';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { apiErrorMessage } from '@/api/client';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, loginWithGoogle } = useAuth();
  const google = useGoogleAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing information', 'Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Could not log in', apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const idToken = await google.signIn();
      if (idToken) await loginWithGoogle(idToken);
    } catch (err) {
      if (!google.isCancelled(err)) {
        Alert.alert('Google sign-in failed', apiErrorMessage(err));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <View style={styles.brand}>
        <Image source={require('../../../assets/icon.png')} style={styles.logo} />
        <Text style={styles.brandTitle}>CHT Plus</Text>
        <Text style={styles.brandSubtitle}>Khagrachari · Rangamati · Bandarban</Text>
      </View>

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
      <Field label="Password">
        <TextField value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry textContentType="password" />
      </Field>

      <Button title="Log in" onPress={onLogin} loading={loading} style={{ marginTop: spacing.sm }} />

      {google.ready ? (
        <Button
          title="Continue with Google"
          onPress={onGoogleLogin}
          loading={googleLoading}
          variant="outline"
          style={{ marginTop: spacing.sm }}
        />
      ) : null}

      <Pressable style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>
          New here? <Text style={{ color: colors.primary, fontWeight: '700' }}>Create an account</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  logo: { width: 84, height: 84, borderRadius: 20, marginBottom: 12 },
  brandTitle: { fontSize: 24, fontWeight: '800', color: colors.primary },
  brandSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  registerLink: { marginTop: spacing.xl, alignItems: 'center' },
  registerText: { color: colors.textMuted, fontSize: 13.5 },
});
