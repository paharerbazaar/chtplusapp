import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Button, Field, TextField, LoadingView } from '@/components/Common';
import { SelectField } from '@/components/Select';
import { PhotoPickerGrid } from '@/components/PhotoPickerGrid';
import { usePhotoManager } from '@/hooks/usePhotoPicker';
import { createBiodata, updateBiodata, getBiodata, Sibling } from '@/api/biodata';
import { getDistricts, getUpazilas } from '@/api/misc';
import { apiErrorMessage } from '@/api/client';
import { colors, spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import {
  PROFESSION_TYPES, SKIN_TONES, BLOOD_GROUPS, EDU_GROUPS, MARITAL_STATUSES, SIBLING_RELATIONS,
  RELIGIONS, EDUCATION_MEDIUMS, YES_NO, PRAYER_HABITS, NEGOTIABLE_YES_NO, GUARDIAN_RELATIONS,
  HEIGHT_OPTIONS, YEAR_OPTIONS, toOptions, ANY_OPTION,
} from './biodataConstants';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BiodataForm'>;

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const initialForm = () => ({
  biodataType: 'পাত্রের বায়োডাটা' as 'পাত্রের বায়োডাটা' | 'পাত্রীর বায়োডাটা',
  maritalStatus: 'অবিবাহিত',
  permanentDistrict: '',
  permanentUpazila: '',
  currentDistrict: '',
  currentUpazila: '',
  currentAddress: '',
  dateOfBirth: '',
  skinTone: '',
  height: '',
  bloodGroup: '',
  professionType: 'চাকরি',
  profession: '',
  religion: 'ইসলাম',
  educationMedium: 'জেনারেল',
  sscPassed: '' as string,
  sscYear: '',
  sscInstitution: '',
  sscGroup: '',
  hscPassed: '' as string,
  hscYear: '',
  hscInstitution: '',
  hscGroup: '',
  graduationPassed: '' as string,
  institutionName: '',
  graduationDepartment: '',
  graduationYear: '',
  postgraduationPassed: '' as string,
  postgraduationInstitution: '',
  postgraduationDepartment: '',
  postgraduationYear: '',
  fatherName: '',
  fatherProfession: '',
  motherName: '',
  motherProfession: '',
  siblings: [] as Sibling[],
  prayerHabit: 'নিয়মিত চেষ্টা করি',
  healthIssue: '',
  healthDetails: '',
  aboutSelf: '',
  wifeEducationPermission: 'হ্যাঁ',
  wifeJobPermission: 'আলোচনা সাপেক্ষে',
  whereWifeWillLive: '',
  expectedMaxAge: '',
  expectedSkinTone: 'যেকোনো',
  expectedMinHeight: 'যেকোনো',
  expectedEducation: '',
  expectedDistrict: '',
  expectedMaritalStatus: 'যেকোনো',
  expectedProfession: '',
  expectedEconomicCondition: '',
  expectedFamilyCondition: '',
  expectedQualities: '',
  noteToAdmin: '',
  guardianPhone: '',
  guardianRelation: 'পিতা',
  email: '',
});

type FormState = ReturnType<typeof initialForm>;

export function BiodataFormScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'BiodataForm'>>();
  const queryClient = useQueryClient();
  const editingId = params?.id;

  const { data: districts } = useQuery({ queryKey: ['districts'], queryFn: getDistricts });
  const { data: existing, isLoading } = useQuery({
    queryKey: ['biodata', editingId],
    queryFn: () => getBiodata(editingId!),
    enabled: !!editingId,
  });

  const [form, setForm] = useState<FormState>(initialForm());
  const [saving, setSaving] = useState(false);
  const photos = usePhotoManager((existing?.photos as string[]) || [], 4);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (existing && !existing.locked) {
      const e = existing as unknown as Record<string, unknown>;
      setForm((f) => ({
        ...f,
        ...Object.fromEntries(Object.keys(f).map((k) => [k, e[k] ?? (f as Record<string, unknown>)[k]])),
        biodataType: e.gender === 'মহিলা' ? 'পাত্রীর বায়োডাটা' : 'পাত্রের বায়োডাটা',
        sscPassed: e.sscPassed ? 'হ্যাঁ' : 'না',
        hscPassed: e.hscPassed ? 'হ্যাঁ' : 'না',
        graduationPassed: e.graduationPassed ? 'হ্যাঁ' : 'না',
        postgraduationPassed: e.postgraduationPassed ? 'হ্যাঁ' : 'না',
        healthIssue: e.healthCondition && e.healthCondition !== 'না' ? 'হ্যাঁ' : e.healthCondition === 'না' ? 'না' : '',
        healthDetails: e.healthCondition && e.healthCondition !== 'না' ? String(e.healthCondition) : '',
        siblings: Array.isArray(e.siblings) ? (e.siblings as Sibling[]) : [],
      }));
    }
  }, [existing]);

  const { data: permanentUpazilas } = useQuery({
    queryKey: ['upazilas-by-name', form.permanentDistrict, districts],
    queryFn: () => getUpazilas(districts!.find((d) => d.bnName === form.permanentDistrict)!.id),
    enabled: !!form.permanentDistrict && !!districts,
  });
  const { data: currentUpazilas } = useQuery({
    queryKey: ['upazilas-by-name', form.currentDistrict, districts],
    queryFn: () => getUpazilas(districts!.find((d) => d.bnName === form.currentDistrict)!.id),
    enabled: !!form.currentDistrict && !!districts,
  });

  const districtOptions = useMemo(() => (districts || []).map((d) => ({ label: d.bnName, value: d.bnName })), [districts]);
  const isMuslim = form.religion === 'ইসলাম';
  const isGroom = form.biodataType === 'পাত্রের বায়োডাটা';
  const sscYes = form.sscPassed === 'হ্যাঁ';
  const hscYes = sscYes && form.hscPassed === 'হ্যাঁ';
  const gradYes = hscYes && form.graduationPassed === 'হ্যাঁ';
  const postgradYes = gradYes && form.postgraduationPassed === 'হ্যাঁ';

  const setSiblingCount = (count: number) => {
    setForm((f) => {
      const next = f.siblings.slice(0, count);
      while (next.length < count) next.push({ name: '', relation: 'বড় ভাই', profession: 'শিক্ষার্থী', organization: '', maritalStatus: 'অবিবাহিত' });
      return { ...f, siblings: next };
    });
  };
  const updateSibling = (i: number, key: keyof Sibling, value: string) => {
    setForm((f) => ({ ...f, siblings: f.siblings.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)) }));
  };

  if (editingId && isLoading) return <LoadingView />;

  const onSave = async () => {
    const required: [string, string][] = [
      [form.maritalStatus, 'Marital status'],
      [form.permanentDistrict, 'Permanent district'],
      [form.currentDistrict, 'Current district'],
      [form.currentAddress, 'Current address'],
      [form.dateOfBirth, 'Date of birth'],
      [form.skinTone, 'Skin tone'],
      [form.height, 'Height'],
      [form.bloodGroup, 'Blood group'],
      [form.professionType, 'Profession type'],
      [form.profession, 'Profession'],
      [form.fatherName, "Father's name"],
      [form.fatherProfession, "Father's profession"],
      [form.motherName, "Mother's name"],
      [form.motherProfession, "Mother's profession"],
      [form.aboutSelf, 'About yourself'],
      [form.guardianPhone, "Guardian's phone"],
      [form.guardianRelation, 'Guardian relation'],
    ];
    const missing = required.find(([v]) => !v || !v.toString().trim());
    if (missing) {
      Alert.alert('Missing information', `Please fill in: ${missing[1]}`);
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(form.guardianPhone)) {
      Alert.alert('Invalid phone', "Enter a valid Bangladeshi guardian's mobile number.");
      return;
    }

    setSaving(true);
    const healthCondition = form.healthIssue === 'হ্যাঁ' ? form.healthDetails : form.healthIssue === 'না' ? 'না' : '';
    const payload = {
      biodataType: form.biodataType,
      maritalStatus: form.maritalStatus,
      permanentDistrict: form.permanentDistrict,
      permanentUpazila: form.permanentUpazila,
      currentDistrict: form.currentDistrict,
      currentUpazila: form.currentUpazila,
      currentAddress: form.currentAddress,
      dateOfBirth: form.dateOfBirth,
      skinTone: form.skinTone,
      height: form.height,
      bloodGroup: form.bloodGroup,
      professionType: form.professionType,
      profession: form.profession,
      religion: form.religion,
      educationMedium: form.educationMedium,
      sscPassed: sscYes ? ('হ্যাঁ' as const) : ('না' as const),
      sscYear: sscYes ? form.sscYear : undefined,
      sscInstitution: sscYes ? form.sscInstitution : undefined,
      sscGroup: sscYes ? form.sscGroup : undefined,
      hscPassed: hscYes ? ('হ্যাঁ' as const) : ('না' as const),
      hscYear: hscYes ? form.hscYear : undefined,
      hscInstitution: hscYes ? form.hscInstitution : undefined,
      hscGroup: hscYes ? form.hscGroup : undefined,
      graduationPassed: gradYes ? ('হ্যাঁ' as const) : ('না' as const),
      institutionName: gradYes ? form.institutionName : undefined,
      graduationDepartment: gradYes ? form.graduationDepartment : undefined,
      graduationYear: gradYes ? form.graduationYear : undefined,
      postgraduationPassed: postgradYes ? ('হ্যাঁ' as const) : ('না' as const),
      postgraduationInstitution: postgradYes ? form.postgraduationInstitution : undefined,
      postgraduationDepartment: postgradYes ? form.postgraduationDepartment : undefined,
      postgraduationYear: postgradYes ? form.postgraduationYear : undefined,
      fatherName: form.fatherName,
      fatherProfession: form.fatherProfession,
      motherName: form.motherName,
      motherProfession: form.motherProfession,
      siblings: form.siblings,
      prayerHabit: isMuslim ? form.prayerHabit : undefined,
      healthCondition,
      aboutSelf: form.aboutSelf,
      wifeEducationPermission: isGroom ? form.wifeEducationPermission : undefined,
      wifeJobPermission: isGroom ? form.wifeJobPermission : undefined,
      whereWifeWillLive: isGroom ? form.whereWifeWillLive : undefined,
      expectedMaxAge: form.expectedMaxAge || undefined,
      expectedSkinTone: form.expectedSkinTone,
      expectedMinHeight: form.expectedMinHeight,
      expectedEducation: form.expectedEducation || undefined,
      expectedDistrict: form.expectedDistrict || 'যেকোনো',
      expectedMaritalStatus: form.expectedMaritalStatus,
      expectedProfession: form.expectedProfession || undefined,
      expectedEconomicCondition: form.expectedEconomicCondition || undefined,
      expectedFamilyCondition: form.expectedFamilyCondition || undefined,
      expectedQualities: form.expectedQualities || undefined,
      noteToAdmin: form.noteToAdmin || undefined,
      guardianPhone: form.guardianPhone,
      guardianRelation: form.guardianRelation,
      email: form.email || undefined,
    };

    try {
      if (editingId) {
        await updateBiodata(editingId, payload, photos.newPhotos, photos.keepPhotoUrls);
      } else {
        const res = await createBiodata(payload, photos.newPhotos);
        queryClient.invalidateQueries({ queryKey: ['my-biodata'] });
        Alert.alert('Submitted', `Your biodata (${res.biodataNo}) has been submitted for verification.`);
        navigation.goBack();
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['my-biodata'] });
      queryClient.invalidateQueries({ queryKey: ['biodata', editingId] });
      Alert.alert('Saved', 'Your biodata has been updated.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <SectionTitle>Biodata type</SectionTitle>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {(['পাত্রের বায়োডাটা', 'পাত্রীর বায়োডাটা'] as const).map((t) => (
          <Pressable
            key={t}
            style={[styles.typeChip, form.biodataType === t && styles.typeChipActive]}
            onPress={() => update('biodataType', t)}
          >
            <Text style={[styles.typeChipText, form.biodataType === t && { color: '#fff' }]}>
              {t === 'পাত্রের বায়োডাটা' ? 'Groom' : 'Bride'}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle>General information</SectionTitle>
      <Field label="Marital status" required>
        <SelectField value={form.maritalStatus} options={toOptions(MARITAL_STATUSES)} onChange={(v) => update('maritalStatus', v)} />
      </Field>
      <Field label="Date of birth" required hint="YYYY-MM-DD">
        <TextField value={form.dateOfBirth} onChangeText={(v) => update('dateOfBirth', v)} placeholder="2000-01-31" />
      </Field>
      <Field label="Skin tone" required>
        <SelectField value={form.skinTone} options={toOptions(SKIN_TONES)} onChange={(v) => update('skinTone', v)} placeholder="Select" />
      </Field>
      <Field label="Height" required>
        <SelectField value={form.height} options={toOptions(HEIGHT_OPTIONS)} onChange={(v) => update('height', v)} placeholder="Select" searchable />
      </Field>
      <Field label="Blood group" required>
        <SelectField value={form.bloodGroup} options={toOptions(BLOOD_GROUPS)} onChange={(v) => update('bloodGroup', v)} placeholder="Select" />
      </Field>
      <Field label="Profession type" required>
        <SelectField value={form.professionType} options={toOptions(PROFESSION_TYPES)} onChange={(v) => update('professionType', v)} />
      </Field>
      <Field label="Profession details" required>
        <TextField value={form.profession} onChangeText={(v) => update('profession', v)} placeholder="e.g. Officer, Krishi Bank" />
      </Field>
      <Field label="Religion" required>
        <SelectField value={form.religion} options={RELIGIONS} onChange={(v) => update('religion', v)} />
      </Field>

      <SectionTitle>Address</SectionTitle>
      <Field label="Permanent district" required>
        <SelectField value={form.permanentDistrict} options={districtOptions} onChange={(v) => update('permanentDistrict', v)} searchable />
      </Field>
      <Field label="Permanent thana/upazila">
        <SelectField
          value={form.permanentUpazila}
          options={(permanentUpazilas || []).map((u) => ({ label: u.bnName, value: u.bnName }))}
          onChange={(v) => update('permanentUpazila', v)}
          placeholder="Select"
        />
      </Field>
      <Field label="Current district" required>
        <SelectField value={form.currentDistrict} options={districtOptions} onChange={(v) => update('currentDistrict', v)} searchable />
      </Field>
      <Field label="Current thana/upazila">
        <SelectField
          value={form.currentUpazila}
          options={(currentUpazilas || []).map((u) => ({ label: u.bnName, value: u.bnName }))}
          onChange={(v) => update('currentUpazila', v)}
          placeholder="Select"
        />
      </Field>
      <Field label="Current address (details)" required>
        <TextField value={form.currentAddress} onChangeText={(v) => update('currentAddress', v)} multiline numberOfLines={3} style={{ minHeight: 72, textAlignVertical: 'top' }} />
      </Field>

      <SectionTitle>Photos</SectionTitle>
      <Field label="Photos" hint="Up to 4, first one is the main photo">
        <PhotoPickerGrid slots={photos.slots} onAdd={photos.pickMore} onRemove={photos.remove} canAddMore={photos.canAddMore} />
      </Field>

      <SectionTitle>Education</SectionTitle>
      <Field label="Medium of education" required>
        <SelectField value={form.educationMedium} options={EDUCATION_MEDIUMS} onChange={(v) => update('educationMedium', v)} />
      </Field>
      <Field label="Passed SSC / equivalent?" required>
        <SelectField value={form.sscPassed} options={YES_NO} onChange={(v) => update('sscPassed', v)} placeholder="Select" />
      </Field>
      {sscYes && (
        <>
          <Field label="SSC passing year" required>
            <SelectField value={form.sscYear} options={toOptions(YEAR_OPTIONS)} onChange={(v) => update('sscYear', v)} searchable />
          </Field>
          <Field label="SSC group" required>
            <SelectField value={form.sscGroup} options={toOptions(EDU_GROUPS)} onChange={(v) => update('sscGroup', v)} />
          </Field>
          <Field label="SSC institution" required>
            <TextField value={form.sscInstitution} onChangeText={(v) => update('sscInstitution', v)} />
          </Field>
          <Field label="Passed HSC / equivalent?" required>
            <SelectField value={form.hscPassed} options={YES_NO} onChange={(v) => update('hscPassed', v)} placeholder="Select" />
          </Field>
        </>
      )}
      {hscYes && (
        <>
          <Field label="HSC passing year" required>
            <SelectField value={form.hscYear} options={toOptions(YEAR_OPTIONS)} onChange={(v) => update('hscYear', v)} searchable />
          </Field>
          <Field label="HSC group" required>
            <SelectField value={form.hscGroup} options={toOptions(EDU_GROUPS)} onChange={(v) => update('hscGroup', v)} />
          </Field>
          <Field label="HSC institution" required>
            <TextField value={form.hscInstitution} onChangeText={(v) => update('hscInstitution', v)} />
          </Field>
          <Field label="Passed graduation?" required>
            <SelectField value={form.graduationPassed} options={YES_NO} onChange={(v) => update('graduationPassed', v)} placeholder="Select" />
          </Field>
        </>
      )}
      {gradYes && (
        <>
          <Field label="Graduation institution" required>
            <TextField value={form.institutionName} onChangeText={(v) => update('institutionName', v)} />
          </Field>
          <Field label="Department / degree" required>
            <TextField value={form.graduationDepartment} onChangeText={(v) => update('graduationDepartment', v)} />
          </Field>
          <Field label="Graduation passing year" required>
            <SelectField value={form.graduationYear} options={toOptions(YEAR_OPTIONS)} onChange={(v) => update('graduationYear', v)} searchable />
          </Field>
          <Field label="Passed post-graduation?">
            <SelectField value={form.postgraduationPassed} options={YES_NO} onChange={(v) => update('postgraduationPassed', v)} placeholder="Select" />
          </Field>
        </>
      )}
      {postgradYes && (
        <>
          <Field label="Post-graduation institution" required>
            <TextField value={form.postgraduationInstitution} onChangeText={(v) => update('postgraduationInstitution', v)} />
          </Field>
          <Field label="Post-graduation department" required>
            <TextField value={form.postgraduationDepartment} onChangeText={(v) => update('postgraduationDepartment', v)} />
          </Field>
          <Field label="Post-graduation passing year" required>
            <SelectField value={form.postgraduationYear} options={toOptions(YEAR_OPTIONS)} onChange={(v) => update('postgraduationYear', v)} searchable />
          </Field>
        </>
      )}

      <SectionTitle>Family</SectionTitle>
      <Field label="Father's name" required>
        <TextField value={form.fatherName} onChangeText={(v) => update('fatherName', v)} />
      </Field>
      <Field label="Father's profession" required>
        <TextField value={form.fatherProfession} onChangeText={(v) => update('fatherProfession', v)} />
      </Field>
      <Field label="Mother's name" required>
        <TextField value={form.motherName} onChangeText={(v) => update('motherName', v)} />
      </Field>
      <Field label="Mother's profession" required>
        <TextField value={form.motherProfession} onChangeText={(v) => update('motherProfession', v)} />
      </Field>
      <Field label="Number of siblings">
        <SelectField
          value={String(form.siblings.length)}
          options={Array.from({ length: 11 }, (_, n) => ({ label: String(n), value: String(n) }))}
          onChange={(v) => setSiblingCount(Number(v))}
        />
      </Field>
      {form.siblings.map((sib, i) => (
        <View key={i} style={styles.siblingCard}>
          <Text style={styles.siblingTitle}>Sibling {i + 1}</Text>
          <Field label="Name">
            <TextField value={sib.name} onChangeText={(v) => updateSibling(i, 'name', v)} />
          </Field>
          <Field label="Relationship">
            <SelectField value={sib.relation} options={toOptions(SIBLING_RELATIONS)} onChange={(v) => updateSibling(i, 'relation', v)} />
          </Field>
          <Field label="Profession">
            <SelectField value={sib.profession} options={toOptions(PROFESSION_TYPES)} onChange={(v) => updateSibling(i, 'profession', v)} />
          </Field>
          <Field label="Organization / institute">
            <TextField value={sib.organization} onChangeText={(v) => updateSibling(i, 'organization', v)} />
          </Field>
          <Field label="Marital status">
            <SelectField value={sib.maritalStatus} options={toOptions(MARITAL_STATUSES)} onChange={(v) => updateSibling(i, 'maritalStatus', v)} />
          </Field>
        </View>
      ))}

      <SectionTitle>Personal information</SectionTitle>
      {isMuslim && (
        <Field label="Do you pray five times a day?">
          <SelectField value={form.prayerHabit} options={PRAYER_HABITS} onChange={(v) => update('prayerHabit', v)} />
        </Field>
      )}
      <Field label="Any mental or physical illness?" required>
        <SelectField value={form.healthIssue} options={YES_NO} onChange={(v) => update('healthIssue', v)} placeholder="Select" />
      </Field>
      {form.healthIssue === 'হ্যাঁ' && (
        <Field label="Give details" required>
          <TextField value={form.healthDetails} onChangeText={(v) => update('healthDetails', v)} multiline numberOfLines={2} style={{ minHeight: 60, textAlignVertical: 'top' }} />
        </Field>
      )}
      <Field label="Write something about yourself" required>
        <TextField value={form.aboutSelf} onChangeText={(v) => update('aboutSelf', v)} multiline numberOfLines={4} style={{ minHeight: 96, textAlignVertical: 'top' }} />
      </Field>

      {isGroom && (
        <>
          <SectionTitle>Marriage-related information</SectionTitle>
          <Field label="Let your wife study after marriage?">
            <SelectField value={form.wifeEducationPermission} options={NEGOTIABLE_YES_NO} onChange={(v) => update('wifeEducationPermission', v)} />
          </Field>
          <Field label="Let your wife work after marriage?">
            <SelectField value={form.wifeJobPermission} options={NEGOTIABLE_YES_NO} onChange={(v) => update('wifeJobPermission', v)} />
          </Field>
          <Field label="Where will you keep your wife after marriage?">
            <TextField value={form.whereWifeWillLive} onChangeText={(v) => update('whereWifeWillLive', v)} multiline numberOfLines={2} style={{ minHeight: 60, textAlignVertical: 'top' }} />
          </Field>
        </>
      )}

      <SectionTitle>Expected life partner</SectionTitle>
      <Field label="Maximum age">
        <TextField value={form.expectedMaxAge} onChangeText={(v) => update('expectedMaxAge', v)} keyboardType="number-pad" />
      </Field>
      <Field label="Skin tone">
        <SelectField value={form.expectedSkinTone} options={[ANY_OPTION, ...toOptions(SKIN_TONES)]} onChange={(v) => update('expectedSkinTone', v)} />
      </Field>
      <Field label="Minimum height">
        <SelectField value={form.expectedMinHeight} options={[ANY_OPTION, ...toOptions(HEIGHT_OPTIONS)]} onChange={(v) => update('expectedMinHeight', v)} searchable />
      </Field>
      <Field label="Minimum educational qualification">
        <TextField value={form.expectedEducation} onChangeText={(v) => update('expectedEducation', v)} />
      </Field>
      <Field label="District">
        <SelectField value={form.expectedDistrict} options={[ANY_OPTION, ...districtOptions]} onChange={(v) => update('expectedDistrict', v)} searchable />
      </Field>
      <Field label="Marital status">
        <SelectField value={form.expectedMaritalStatus} options={[ANY_OPTION, ...toOptions(MARITAL_STATUSES)]} onChange={(v) => update('expectedMaritalStatus', v)} />
      </Field>
      <Field label="Profession">
        <TextField value={form.expectedProfession} onChangeText={(v) => update('expectedProfession', v)} placeholder="e.g. Govt. service holder, Any" />
      </Field>
      <Field label="Economic condition">
        <TextField value={form.expectedEconomicCondition} onChangeText={(v) => update('expectedEconomicCondition', v)} />
      </Field>
      <Field label="Family condition">
        <TextField value={form.expectedFamilyCondition} onChangeText={(v) => update('expectedFamilyCondition', v)} multiline numberOfLines={2} style={{ minHeight: 60, textAlignVertical: 'top' }} />
      </Field>
      <Field label="Traits or qualities you expect">
        <TextField value={form.expectedQualities} onChangeText={(v) => update('expectedQualities', v)} multiline numberOfLines={3} style={{ minHeight: 72, textAlignVertical: 'top' }} />
      </Field>

      <SectionTitle>For the authority</SectionTitle>
      <Field label="Anything special you want to tell the authority">
        <TextField value={form.noteToAdmin} onChangeText={(v) => update('noteToAdmin', v)} multiline numberOfLines={2} style={{ minHeight: 60, textAlignVertical: 'top' }} />
      </Field>

      <SectionTitle>Contact / guardian information</SectionTitle>
      <Field label="Guardian's number" required>
        <TextField value={form.guardianPhone} onChangeText={(v) => update('guardianPhone', v)} keyboardType="phone-pad" placeholder="01XXXXXXXXX" />
      </Field>
      <Field label="Relationship" required>
        <SelectField value={form.guardianRelation} options={GUARDIAN_RELATIONS} onChange={(v) => update('guardianRelation', v)} />
      </Field>
      <Field label="Email address (optional)">
        <TextField value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" />
      </Field>

      <Text style={styles.policyNote}>
        By submitting, you agree that this information will be reviewed and published on CHT Plus, and that full details are
        only revealed to other users after they unlock your profile.
      </Text>

      <Button title={editingId ? 'Save changes' : 'Submit biodata'} onPress={onSave} loading={saving} style={{ marginTop: spacing.md, marginBottom: spacing.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
  typeChip: { flex: 1, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 999, paddingVertical: 10, alignItems: 'center' },
  typeChipActive: { backgroundColor: colors.primary },
  typeChipText: { color: colors.primary, fontWeight: '700' },
  siblingCard: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  siblingTitle: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  policyNote: { fontSize: 11.5, color: colors.textMuted, marginTop: spacing.md, lineHeight: 17 },
});
