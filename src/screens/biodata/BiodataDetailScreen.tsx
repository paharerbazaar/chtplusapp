import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Screen } from '@/components/Screen';
import { LoadingView, ErrorState, Button, Card, Badge } from '@/components/Common';
import { PackagePicker } from '@/components/PackagePicker';
import { getBiodata, unlockBiodata, deleteBiodata } from '@/api/biodata';
import { getMyBiodata } from '@/api/me';
import { toggleSaved } from '@/api/misc';
import { apiErrorMessage } from '@/api/client';
import { resolveImageUrl } from '@/utils/image';
import { colors, radius, spacing } from '@/constants/theme';
import type { BiodataPackage } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BiodataDetail'>;

function Row({ label, value }: { label: string; value?: unknown }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{String(value)}</Text>
    </View>
  );
}

export function BiodataDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'BiodataDetail'>>();
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const [unlocking, setUnlocking] = useState(false);
  const [packages, setPackages] = useState<BiodataPackage[] | null>(null);

  const { data: biodata, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['biodata', params.id],
    queryFn: () => getBiodata(params.id),
  });
  const { data: myBiodata } = useQuery({ queryKey: ['my-biodata'], queryFn: getMyBiodata });
  const isOwner = !!myBiodata?.some((b) => b.id === params.id);

  if (isLoading) return <LoadingView />;
  if (isError || !biodata) return <ErrorState message={apiErrorMessage(error)} onRetry={refetch} />;

  const doUnlock = async (packageId?: string) => {
    setUnlocking(true);
    try {
      const result = await unlockBiodata(params.id, packageId);
      if (!result.ok && result.error === 'package_required') {
        setPackages(result.packages || []);
      } else if (!result.ok && result.error === 'insufficient_coins') {
        Alert.alert("You don't have enough coins", `This package costs ${result.cost} coins. Top up your wallet first.`);
      } else if (result.ok) {
        setPackages(null);
        queryClient.invalidateQueries({ queryKey: ['biodata', params.id] });
        queryClient.invalidateQueries({ queryKey: ['me'] });
      }
    } catch (err) {
      Alert.alert('Could not unlock', apiErrorMessage(err));
    } finally {
      setUnlocking(false);
    }
  };

  const onDelete = () => {
    Alert.alert('Delete this biodata?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteBiodata(params.id);
          queryClient.invalidateQueries({ queryKey: ['my-biodata'] });
          navigation.goBack();
        },
      },
    ]);
  };

  const photo = resolveImageUrl(biodata.photos?.[0]);

  return (
    <Screen scroll edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.photoWrap}>
          {photo ? <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" blurRadius={biodata.locked ? 18 : 0} /> : null}
          {biodata.locked ? (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={22} color="#fff" />
            </View>
          ) : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.biodataNo}>{biodata.biodataNo}</Text>
          <Badge label={biodata.gender === 'মহিলা' ? 'Bride' : 'Groom'} tone="primary" />
        </View>
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <Row label="Age" value={`${biodata.age} years`} />
        <Row label="Height" value={biodata.height} />
        <Row label="Marital status" value={biodata.maritalStatus} />
        <Row label="Profession" value={biodata.profession} />
        <Row label="Area" value={biodata.area} />
      </Card>

      {biodata.locked ? (
        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.lockedNote}>Full details, contact info and photos are hidden until you unlock this profile.</Text>
          {biodata.loginRequired ? (
            <Button title="Log in to unlock" onPress={() => navigation.navigate('Login' as never)} style={{ marginTop: spacing.sm }} />
          ) : packages ? (
            <PackagePicker
              title="Choose a package to unlock"
              packages={packages.map((p) => ({ id: p.id, label: `${p.name} — ${p.biodataCount} profile(s) for ${p.coinCost} coins` }))}
              loading={unlocking}
              onPick={doUnlock}
            />
          ) : (
            <Button
              title={biodata.walletAvailable ? 'Unlock (uses your wallet)' : 'Unlock this profile'}
              onPress={() => doUnlock()}
              loading={unlocking}
              style={{ marginTop: spacing.sm }}
            />
          )}
        </View>
      ) : (
        <ScrollView style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Personal details</Text>
          <Card>
            <Row label="Date of birth" value={biodata.dateOfBirth as string} />
            <Row label="Skin tone" value={biodata.skinTone as string} />
            <Row label="Blood group" value={biodata.bloodGroup as string} />
            <Row label="Religion" value={biodata.religion as string} />
            <Row label="Permanent district" value={biodata.permanentDistrict as string} />
            <Row label="Current district" value={biodata.currentDistrict as string} />
            <Row label="Current address" value={biodata.currentAddress as string} />
          </Card>

          <Text style={styles.sectionTitle}>Education</Text>
          <Card>
            <Row label="Medium" value={biodata.educationMedium as string} />
            <Row label="SSC" value={biodata.sscYear as string} />
            <Row label="HSC" value={biodata.hscYear as string} />
            <Row label="Institution" value={biodata.institutionName as string} />
            <Row label="Graduation year" value={biodata.graduationYear as string} />
          </Card>

          <Text style={styles.sectionTitle}>Family</Text>
          <Card>
            <Row label="Father" value={[biodata.fatherName, biodata.fatherProfession].filter(Boolean).join(' · ')} />
            <Row label="Mother" value={[biodata.motherName, biodata.motherProfession].filter(Boolean).join(' · ')} />
          </Card>

          {biodata.aboutSelf ? (
            <>
              <Text style={styles.sectionTitle}>About</Text>
              <Card>
                <Text style={styles.about}>{biodata.aboutSelf as string}</Text>
              </Card>
            </>
          ) : null}

          <Text style={styles.sectionTitle}>Contact</Text>
          <Card>
            <Row label="Guardian phone" value={biodata.guardianPhone as string} />
            <Row label="Guardian relation" value={biodata.guardianRelation as string} />
            <Row label="Email" value={biodata.email as string} />
          </Card>
        </ScrollView>
      )}

      <Button title="Save" variant="outline" onPress={() => toggleSaved('biodata', params.id)} style={{ marginTop: spacing.lg }} />

      {isOwner ? (
        <View style={styles.ownerBox}>
          <Text style={styles.ownerTitle}>Your biodata</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button title="Edit" variant="outline" onPress={() => navigation.navigate('BiodataForm', { id: params.id })} style={{ flex: 1 }} />
            <Button title="Delete" variant="danger" onPress={onDelete} style={{ flex: 1 }} />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  photoWrap: { width: 84, height: 84, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.primaryLight, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  lockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  biodataNo: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowLabel: { fontSize: 12.5, color: colors.textMuted },
  rowValue: { fontSize: 12.5, color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  about: { fontSize: 13.5, color: colors.text, lineHeight: 20 },
  lockedNote: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  ownerBox: { marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg },
  ownerTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase' },
});
