import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle, StyleProp, TextInput, TextInputProps } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

export function LoadingView({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Text style={styles.mutedText}>{label}</Text> : null}
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.mutedText}>{subtitle}</Text> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.mutedText}>{message}</Text>
      {onRetry ? (
        <Pressable style={[styles.button, { marginTop: spacing.md }]} onPress={onRetry}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({ label, tone = 'primary' }: { label: string; tone?: 'primary' | 'gold' | 'muted' | 'danger' }) {
  const bg = { primary: colors.primaryLight, gold: '#fbf1da', muted: colors.border, danger: '#fbe4e1' }[tone];
  const fg = { primary: colors.primary, gold: colors.gold, muted: colors.textMuted, danger: colors.danger }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isOutline = variant === 'outline';
  const bg = variant === 'danger' ? colors.danger : isOutline ? 'transparent' : colors.primary;
  const borderColor = isOutline ? colors.primary : bg;
  const textColor = isOutline ? colors.primary : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: bg, borderColor, borderWidth: isOutline ? 1.5 : 0, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>}
    </Pressable>
  );
}

export function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
      </Text>
      {children}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function TextField(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.textMuted} {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: 6 },
  mutedText: { color: colors.textMuted, fontSize: 13.5, textAlign: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11.5, fontWeight: '700' },
  button: {
    paddingVertical: 13,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontWeight: '700', fontSize: 14.5 },
  label: { fontSize: 13.5, fontWeight: '600', color: colors.text, marginBottom: 6 },
  hint: { fontSize: 11.5, color: colors.textMuted, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14.5,
    color: colors.text,
    backgroundColor: colors.surface,
  },
});
