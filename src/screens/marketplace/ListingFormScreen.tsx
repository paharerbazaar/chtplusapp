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
import { getListing, createListing, updateListing } from '@/api/marketplace';
import { getMarketplaceCategories, getDistricts } from '@/api/misc';
import { apiErrorMessage } from '@/api/client';
import { spacing } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ListingForm'>;

const CONDITIONS = [
  { label: 'New', value: 'নতুন' },
  { label: 'Used', value: 'ব্যবহৃত' },
  { label: 'Refurbished', value: 'রিফার্বিশড্' },
];

export function ListingFormScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ListingForm'>>();
  const queryClient = useQueryClient();
  const editingId = params?.id;

  const { data: categories } = useQuery({ queryKey: ['marketplace-categories'], queryFn: getMarketplaceCategories });
  const { data: districts } = useQuery({ queryKey: ['districts'], queryFn: getDistricts });
  const { data: existing, isLoading } = useQuery({
    queryKey: ['listing', editingId],
    queryFn: () => getListing(editingId!),
    enabled: !!editingId,
  });

  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('ব্যবহৃত');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [saving, setSaving] = useState(false);
  const photos = usePhotoManager(existing?.photos || [], 4);

  useEffect(() => {
    if (existing) {
      setCategoryId(existing.categoryId || '');
      setTitle(existing.title);
      setDescription(existing.description || '');
      setPrice(String(existing.price));
      setCondition(existing.condition);
      setDistrict(existing.district || '');
      setArea(existing.area);
      setSellerName(existing.sellerName || '');
      setSellerPhone(existing.sellerPhone);
      setNegotiable(!!existing.negotiable);
    }
  }, [existing]);

  if (editingId && isLoading) return <LoadingView />;

  const categoryOptions = (categories || []).map((c) => ({ label: `${c.icon} ${c.name}`, value: c.id }));
  const districtOptions = (districts || []).map((d) => ({ label: d.name, value: d.name }));

  const onSave = async () => {
    const priceNum = Number(price);
    if (!categoryId || !title.trim() || !description.trim() || !Number.isFinite(priceNum) || priceNum < 0 || !area.trim() || !sellerName.trim() || !sellerPhone.trim()) {
      Alert.alert('Missing information', 'Please fill in all required fields with a valid price.');
      return;
    }
    setSaving(true);
    const input = {
      categoryId,
      title: title.trim(),
      description: description.trim(),
      price: priceNum,
      condition,
      district,
      area: area.trim(),
      sellerName: sellerName.trim(),
      sellerPhone: sellerPhone.trim(),
      negotiable,
    };
    try {
      if (editingId) {
        await updateListing(editingId, input, photos.newPhotos, photos.keepPhotoUrls);
      } else {
        await createListing(input, photos.newPhotos);
      }
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      if (editingId) queryClient.invalidateQueries({ queryKey: ['listing', editingId] });
      Alert.alert(editingId ? 'Updated' : 'Submitted', 'Your listing will be reviewed and shown publicly once approved.');
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
      <Field label="Title" required>
        <TextField value={title} onChangeText={setTitle} placeholder="e.g. Samsung Galaxy A14" />
      </Field>
      <Field label="Description" required>
        <TextField
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the item, its condition, accessories included…"
          multiline
          numberOfLines={4}
          style={{ minHeight: 96, textAlignVertical: 'top' }}
        />
      </Field>
      <Field label="Price (৳)" required>
        <TextField value={price} onChangeText={setPrice} placeholder="e.g. 15000" keyboardType="number-pad" />
      </Field>
      <Field label="Condition" required>
        <SelectField value={condition} options={CONDITIONS} onChange={setCondition} />
      </Field>
      <Field label="District">
        <SelectField value={district} options={districtOptions} onChange={setDistrict} placeholder="Select district" searchable />
      </Field>
      <Field label="Area" required>
        <TextField value={area} onChangeText={setArea} placeholder="e.g. Khagrachari Sadar" />
      </Field>
      <Field label="Seller name" required>
        <TextField value={sellerName} onChangeText={setSellerName} placeholder="Your name" />
      </Field>
      <Field label="Seller phone" required>
        <TextField value={sellerPhone} onChangeText={setSellerPhone} placeholder="01XXXXXXXXX" keyboardType="phone-pad" />
      </Field>
      <Button
        title={negotiable ? '✓ Price is negotiable' : 'Price is negotiable?'}
        variant={negotiable ? 'primary' : 'outline'}
        onPress={() => setNegotiable((v) => !v)}
        style={{ marginBottom: spacing.md }}
      />
      <Field label="Photos" hint="Up to 4 photos">
        <PhotoPickerGrid slots={photos.slots} onAdd={photos.pickMore} onRemove={photos.remove} canAddMore={photos.canAddMore} />
      </Field>

      <Button title={editingId ? 'Save changes' : 'Post listing'} onPress={onSave} loading={saving} style={{ marginTop: spacing.md }} />
    </Screen>
  );
}
