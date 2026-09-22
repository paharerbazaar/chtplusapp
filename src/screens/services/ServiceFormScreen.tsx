import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Button, Field, TextField, LoadingView } from '@/components/Common';
import { SelectField } from '@/components/Select';
import { PhotoPickerGrid } from '@/components/PhotoPickerGrid';
import { usePhotoManager } from '@/hooks/usePhotoPicker';
import { getService, createService, updateService } from '@/api/services';
import { getServiceCategories, getDistricts } from '@/api/misc';
import { apiErrorMessage } from '@/api/client';
import { spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ServiceForm'>;

export function ServiceFormScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ServiceForm'>>();
  const queryClient = useQueryClient();
  const editingId = params?.id;

  const { data: categories } = useQuery({ queryKey: ['service-categories'], queryFn: getServiceCategories });
  const { data: districts } = useQuery({ queryKey: ['districts'], queryFn: getDistricts });
  const { data: existing, isLoading } = useQuery({
    queryKey: ['service', editingId],
    queryFn: () => getService(editingId!),
    enabled: !!editingId,
  });

  const [categoryId, setCategoryId] = useState('');
  const [providerName, setProviderName] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const photos = usePhotoManager(existing?.photos || [], 2);

  useEffect(() => {
    if (existing) {
      setCategoryId(existing.categoryId || '');
      setProviderName(existing.providerName);
      setDescription(existing.descriptionText || '');
      setDistrict(existing.district || '');
      setArea(existing.area);
      setPhone(existing.phone);
    }
  }, [existing]);

  if (editingId && isLoading) return <LoadingView />;

  const districtOptions = (districts || []).map((d) => ({ label: d.name, value: d.name }));
  const categoryOptions = (categories || []).map((c) => ({ label: `${c.icon} ${c.name}`, value: c.id }));

  const onSave = async () => {
    if (!categoryId || !providerName.trim() || !description.trim() || !area.trim() || !phone.trim()) {
      Alert.alert('Missing information', 'Category, name, description, area and phone are required.');
      return;
    }
    setSaving(true);
    const input = { categoryId, providerName: providerName.trim(), description: description.trim(), district, area: area.trim(), phone: phone.trim() };
    try {
      if (editingId) {
        await updateService(editingId, input, photos.newPhotos, photos.keepPhotoUrls);
      } else {
        await createService(input, photos.newPhotos);
      }
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      if (editingId) queryClient.invalidateQueries({ queryKey: ['service', editingId] });
      Alert.alert(
        editingId ? 'Updated' : 'Submitted',
        'Your service will be reviewed and shown publicly once approved.'
      );
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <Field label="Category" required>
        <SelectField value={categoryId} options={categoryOptions} onChange={setCategoryId} placeholder="Choose a category" />
      </Field>
      <Field label="Provider / business name" required>
        <TextField value={providerName} onChangeText={setProviderName} placeholder="e.g. Rahman Electricians" />
      </Field>
      <Field label="Description" required>
        <TextField
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the service you offer…"
          multiline
          numberOfLines={4}
          style={{ minHeight: 96, textAlignVertical: 'top' }}
        />
      </Field>
      <Field label="District">
        <SelectField value={district} options={districtOptions} onChange={setDistrict} placeholder="Select district" searchable />
      </Field>
      <Field label="Area" required>
        <TextField value={area} onChangeText={setArea} placeholder="e.g. Khagrachari Sadar" />
      </Field>
      <Field label="Phone" required>
        <TextField value={phone} onChangeText={setPhone} placeholder="01XXXXXXXXX" keyboardType="phone-pad" />
      </Field>
      <Field label="Photos" hint="Up to 2 photos">
        <PhotoPickerGrid slots={photos.slots} onAdd={photos.pickMore} onRemove={photos.remove} canAddMore={photos.canAddMore} />
      </Field>

      <Button title={editingId ? 'Save changes' : 'Submit service'} onPress={onSave} loading={saving} style={{ marginTop: spacing.md }} />
    </Screen>
  );
}
