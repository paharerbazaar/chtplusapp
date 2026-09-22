import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Button, Field, TextField } from '@/components/Common';
import { SelectField } from '@/components/Select';
import { useAuth } from '@/auth/AuthContext';
import { upsertMyDonorProfile } from '@/api/donors';
import { getDistricts } from '@/api/misc';
import { apiErrorMessage } from '@/api/client';
import { spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DonorForm'>;
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => ({ label: g, value: g }));

export function DonorFormScreen() {
  const navigation = useNavigation<Nav>();
  const { me, refreshMe } = useAuth();
  const queryClient = useQueryClient();
  const donor = me?.donor;
  const { data: districts } = useQuery({ queryKey: ['districts'], queryFn: getDistricts });

  const [name, setName] = useState(donor?.name || me?.user.name || '');
  const [bloodGroup, setBloodGroup] = useState(donor?.bloodGroup || '');
  const [phone, setPhone] = useState(donor?.phone || me?.user.phone || '');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState(donor?.area || '');
  const [lastDonationDate, setLastDonationDate] = useState(donor?.lastDonationDate || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (donor) {
      setName(donor.name);
      setBloodGroup(donor.bloodGroup);
      setPhone(donor.phone);
      setArea(donor.area);
      setLastDonationDate(donor.lastDonationDate || '');
    }
  }, [donor]);

  const districtOptions = (districts || []).map((d) => ({ label: d.name, value: d.name }));

  const onSave = async () => {
    if (!name.trim() || !bloodGroup || !phone.trim() || !area.trim()) {
      Alert.alert('Missing information', 'Name, blood group, phone and area are required.');
      return;
    }
    setSaving(true);
    try {
      await upsertMyDonorProfile({
        name: name.trim(),
        bloodGroup,
        phone: phone.trim(),
        district: district || undefined,
        area: area.trim(),
        lastDonationDate: lastDonationDate || undefined,
      });
      await refreshMe();
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      Alert.alert('Saved', 'Your blood donor profile is live.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <Field label="Name" required>
        <TextField value={name} onChangeText={setName} placeholder="Your name" />
      </Field>
      <Field label="Blood group" required>
        <SelectField value={bloodGroup} options={BLOOD_GROUPS} onChange={setBloodGroup} placeholder="Select blood group" />
      </Field>
      <Field label="Phone" required>
        <TextField value={phone} onChangeText={setPhone} placeholder="01XXXXXXXXX" keyboardType="phone-pad" />
      </Field>
      <Field label="District">
        <SelectField value={district} options={districtOptions} onChange={setDistrict} placeholder="Select district" searchable />
      </Field>
      <Field label="Area" required>
        <TextField value={area} onChangeText={setArea} placeholder="e.g. Khagrachari Sadar" />
      </Field>
      <Field label="Last donation date" hint="YYYY-MM-DD, leave blank if never donated">
        <TextField value={lastDonationDate} onChangeText={setLastDonationDate} placeholder="2026-01-15" />
      </Field>

      <Button title="Save donor profile" onPress={onSave} loading={saving} style={{ marginTop: spacing.md }} />
    </Screen>
  );
}
