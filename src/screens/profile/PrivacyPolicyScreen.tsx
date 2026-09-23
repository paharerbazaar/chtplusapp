import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Common';
import { API_BASE_URL } from '@/constants/config';
import { colors, spacing } from '@/constants/theme';

const CONTACT_EMAIL = 'support@chtplus.xyz';

function H({ children }: { children: string }) {
  return <Text style={styles.h}>{children}</Text>;
}
function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.p}>{children}</Text>;
}
function Li({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.li}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.liText}>{children}</Text>
    </View>
  );
}

// Mirrors khagrachariPlusNackend/app/privacy-policy/page.js — keep the two in
// sync if the policy text changes.
export function PrivacyPolicyScreen() {
  return (
    <Screen scroll>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.updated}>Last updated: 22 September 2026</Text>

      <P>
        This Privacy Policy applies to Khagrachari Plus / CHT Plus, both the website at chtplus.xyz and the CHT Plus
        Android app (package com.chtplus.bd). It explains what we collect, why, and how you can control or remove it.
      </P>

      <H>Information we collect</H>
      <Li><Text style={styles.bold}>Account information: </Text>name, email, password (stored as a salted hash), phone number, and area/district.</Li>
      <Li><Text style={styles.bold}>Profile information: </Text>photos, bio, work history, education, current city, hometown, and relationship status — each with its own visibility control.</Li>
      <Li><Text style={styles.bold}>Content you post: </Text>service listings, marketplace listings and photos, and reviews.</Li>
      <Li><Text style={styles.bold}>Blood donor information: </Text>blood group and last donation date, shown publicly if you register as a donor.</Li>
      <Li><Text style={styles.bold}>Matrimony (biodata) information: </Text>details you enter, shown to other users only after they unlock your profile.</Li>
      <Li><Text style={styles.bold}>Doctor appointment information: </Text>patient name, phone, age and gender, shared with the hospital/clinic you book with.</Li>
      <Li><Text style={styles.bold}>Chat messages: </Text>stored to deliver them, automatically deleted after 7 days.</Li>
      <Li><Text style={styles.bold}>Payment references: </Text>bKash/Nagad transaction ID and phone number for top-up requests — never card or bank details.</Li>
      <Li><Text style={styles.bold}>Push notification identifiers: </Text>via OneSignal, linked to your account id, not your name or email.</Li>
      <Li><Text style={styles.bold}>Google Sign-In: </Text>your name, email and profile photo from Google, if you use it to sign in.</Li>

      <H>How we use this information</H>
      <P>
        To operate the platform's core features: showing your listings and profile, connecting patients with
        hospitals, delivering chat and push notifications, verifying manual payment requests, and enforcing your
        privacy choices.
      </P>

      <H>Sharing with third parties</H>
      <Li>OneSignal — to deliver push notifications.</Li>
      <Li>Google — only if you use "Continue with Google".</Li>
      <Li>We never sell your personal information.</Li>
      <Li>Content you make public is visible to any visitor, by design.</Li>

      <H>Data retention</H>
      <P>Chat messages are kept 7 days then deleted. Other content is kept until you delete it or your account.</P>

      <H>Delete your account</H>
      <P>
        You can permanently delete your account from Profile → Settings → Delete Account. This immediately removes
        your account and everything linked to it — profile, photos, services, listings, biodata, donor profile,
        reviews, chats, follows, appointments and coin records. Without the app installed, email
        {' '}{CONTACT_EMAIL} from your account's email address to request deletion.
      </P>

      <H>Children</H>
      <P>CHT Plus is not directed at children under 13, and we do not knowingly collect their information.</P>

      <H>Contact us</H>
      <P>Questions about this policy or your data: {CONTACT_EMAIL}</P>

      <Button
        title="View the full policy on chtplus.xyz"
        variant="outline"
        onPress={() => Linking.openURL(`${API_BASE_URL}/privacy-policy`)}
        style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  updated: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: spacing.md },
  h: { fontSize: 15, fontWeight: '700', color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.xs },
  p: { fontSize: 13.5, color: colors.text, lineHeight: 20, marginBottom: spacing.xs },
  li: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  bullet: { color: colors.textMuted },
  liText: { fontSize: 13.5, color: colors.text, lineHeight: 20, flex: 1 },
  bold: { fontWeight: '700' },
});
