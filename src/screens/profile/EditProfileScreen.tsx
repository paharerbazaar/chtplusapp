import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Button, Field, TextField, Card } from '@/components/Common';
import { SelectField } from '@/components/Select';
import { Avatar } from '@/components/Avatar';
import { PhotoCropModal, type CropRect } from '@/components/PhotoCropModal';
import { useAuth } from '@/auth/AuthContext';
import {
  updateMe, updateMeDetails, updateFieldPrivacy, uploadMyPhoto, uploadMyCoverPhoto,
  addWork, deleteWork, addEducation, deleteEducation,
} from '@/api/me';
import { apiErrorMessage } from '@/api/client';
import { resolveImageUrl } from '@/utils/image';
import { colors, spacing } from '@/constants/theme';
import type { PrivacyLevel } from '@/types';

const PRIVACY_OPTIONS = [
  { label: 'Public', value: 'public' },
  { label: 'Followers only', value: 'followers' },
  { label: 'Only me', value: 'only_me' },
];

// Cover photos are shown roughly 3:1 on the profile (app and website).
const COVER_ASPECT = 3;

type CropTarget = 'photo' | 'cover';

async function pickImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', 'Allow photo library access to choose a picture.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, name: asset.fileName, mimeType: asset.mimeType, width: asset.width, height: asset.height };
}

export function EditProfileScreen() {
  const { user, me, refreshMe } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [area, setArea] = useState(user?.area || '');
  const [bio, setBio] = useState(me?.user.bio || '');
  const [currentCity, setCurrentCity] = useState(me?.user.currentCity || '');
  const [hometown, setHometown] = useState(me?.user.hometown || '');
  const [relationshipStatus, setRelationshipStatus] = useState(me?.user.relationshipStatus || '');
  const [currentCityPrivacy, setCurrentCityPrivacy] = useState<PrivacyLevel>(me?.user.currentCityPrivacy || 'public');
  const [hometownPrivacy, setHometownPrivacy] = useState<PrivacyLevel>(me?.user.hometownPrivacy || 'public');
  const [relationshipPrivacy, setRelationshipPrivacy] = useState<PrivacyLevel>(me?.user.relationshipStatusPrivacy || 'public');
  const [saving, setSaving] = useState(false);

  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [institution, setInstitution] = useState('');

  // A picked photo first opens in the crop editor; it's uploaded only on "Update".
  const [cropping, setCropping] = useState<{ target: CropTarget; image: NonNullable<Awaited<ReturnType<typeof pickImage>>> } | null>(null);
  const [uploading, setUploading] = useState(false);

  const startCrop = async (target: CropTarget) => {
    const image = await pickImage();
    if (image) setCropping({ target, image });
  };

  const onCropConfirm = async (crop: CropRect) => {
    if (!cropping) return;
    setUploading(true);
    try {
      if (cropping.target === 'photo') await uploadMyPhoto(cropping.image, crop);
      else await uploadMyCoverPhoto(cropping.image, crop);
      await refreshMe();
      setCropping(null);
    } catch (err) {
      Alert.alert('Could not update photo', apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required');
      return;
    }
    setSaving(true);
    try {
      await updateMe({ name: name.trim(), phone: phone.trim(), area: area.trim() });
      await updateMeDetails({ bio: bio.trim(), currentCity: currentCity.trim(), hometown: hometown.trim(), relationshipStatus: relationshipStatus.trim() });
      await Promise.all([
        updateFieldPrivacy('currentCity', currentCityPrivacy),
        updateFieldPrivacy('hometown', hometownPrivacy),
        updateFieldPrivacy('relationshipStatus', relationshipPrivacy),
      ]);
      await refreshMe();
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (err) {
      Alert.alert('Could not save', apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onAddWork = async () => {
    if (!company.trim()) return;
    await addWork({ company: company.trim(), position: position.trim() || null, location: null, isCurrent: true, startDate: null, endDate: null });
    setCompany('');
    setPosition('');
    await refreshMe();
  };

  const onAddEducation = async () => {
    if (!institution.trim()) return;
    await addEducation({ institution: institution.trim(), level: 'university', fieldOfStudy: null, passingYear: null });
    setInstitution('');
    await refreshMe();
  };

  return (
    <Screen scroll>
      <View style={styles.coverWrap}>
        <Pressable onPress={() => startCrop('cover')}>
          {me?.user.coverPhotoUrl ? (
            <Image source={{ uri: resolveImageUrl(me.user.coverPhotoUrl) }} style={styles.cover} contentFit="cover" />
          ) : (
            <View style={[styles.cover, { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="image-outline" size={24} color={colors.primary} />
            </View>
          )}
        </Pressable>
        <Pressable style={styles.avatarWrap} onPress={() => startCrop('photo')}>
          <Avatar uri={user?.photoUrl} name={user?.name || ''} size={78} />
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </Pressable>
      </View>

      <View style={{ marginTop: 44 }}>
        <Field label="Name" required>
          <TextField value={name} onChangeText={setName} />
        </Field>
        <Field label="Phone">
          <TextField value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </Field>
        <Field label="Area">
          <TextField value={area} onChangeText={setArea} />
        </Field>
        <Field label="Bio">
          <TextField value={bio} onChangeText={setBio} multiline numberOfLines={3} style={{ minHeight: 72, textAlignVertical: 'top' }} />
        </Field>

        <Field label="Current city">
          <TextField value={currentCity} onChangeText={setCurrentCity} />
        </Field>
        <SelectField value={currentCityPrivacy} options={PRIVACY_OPTIONS} onChange={(v) => setCurrentCityPrivacy(v as PrivacyLevel)} />

        <View style={{ height: spacing.md }} />
        <Field label="Hometown">
          <TextField value={hometown} onChangeText={setHometown} />
        </Field>
        <SelectField value={hometownPrivacy} options={PRIVACY_OPTIONS} onChange={(v) => setHometownPrivacy(v as PrivacyLevel)} />

        <View style={{ height: spacing.md }} />
        <Field label="Relationship status">
          <TextField value={relationshipStatus} onChangeText={setRelationshipStatus} />
        </Field>
        <SelectField value={relationshipPrivacy} options={PRIVACY_OPTIONS} onChange={(v) => setRelationshipPrivacy(v as PrivacyLevel)} />

        <Button title="Save profile" onPress={onSave} loading={saving} style={{ marginTop: spacing.lg }} />

        <Text style={styles.sectionTitle}>Work</Text>
        {me?.work.map((w) => (
          <Card key={w.id} style={styles.listRow}>
            <Text style={{ flex: 1 }}>{w.position ? `${w.position} at ${w.company}` : w.company}</Text>
            <Pressable onPress={async () => { await deleteWork(w.id); refreshMe(); }}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          </Card>
        ))}
        <View style={styles.addRow}>
          <TextField value={company} onChangeText={setCompany} placeholder="Company" style={{ flex: 1 }} />
          <TextField value={position} onChangeText={setPosition} placeholder="Position" style={{ flex: 1 }} />
          <Pressable style={styles.addBtn} onPress={onAddWork}>
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Education</Text>
        {me?.education.map((e) => (
          <Card key={e.id} style={styles.listRow}>
            <Text style={{ flex: 1 }}>{e.institution}</Text>
            <Pressable onPress={async () => { await deleteEducation(e.id); refreshMe(); }}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          </Card>
        ))}
        <View style={styles.addRow}>
          <TextField value={institution} onChangeText={setInstitution} placeholder="Institution" style={{ flex: 1 }} />
          <Pressable style={styles.addBtn} onPress={onAddEducation}>
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      <PhotoCropModal
        image={cropping?.image ?? null}
        aspect={cropping?.target === 'cover' ? COVER_ASPECT : 1}
        round={cropping?.target === 'photo'}
        title={cropping?.target === 'cover' ? 'Adjust cover photo' : 'Adjust profile picture'}
        saving={uploading}
        onCancel={() => setCropping(null)}
        onConfirm={onCropConfirm}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  coverWrap: { marginHorizontal: -16, marginTop: -16 },
  cover: { width: '100%', height: 130 },
  avatarWrap: { position: 'absolute', bottom: -36, left: 20 },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, borderRadius: 12,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  listRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  addRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  addBtn: { backgroundColor: colors.primary, borderRadius: 10, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
