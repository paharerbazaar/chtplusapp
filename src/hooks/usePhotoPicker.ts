import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import type { PickedImage } from '@/api/upload';

export interface PhotoSlot {
  key: string;
  kind: 'existing' | 'new';
  url?: string; // existing (already-uploaded) photo, kept unless removed
  image?: PickedImage; // newly picked local photo, to be uploaded
}

// Manages a fixed-size photo list mixing already-uploaded URLs (edit mode)
// with newly picked local images, which is exactly what the
// keepPhotoUrls/photos multipart pattern on services/listings/biodata needs.
export function usePhotoManager(initialUrls: string[] = [], max = 4) {
  const [slots, setSlots] = useState<PhotoSlot[]>(initialUrls.map((url, i) => ({ key: `existing-${i}-${url}`, kind: 'existing', url })));

  const pickMore = useCallback(async () => {
    if (slots.length >= max) {
      Alert.alert('Limit reached', `You can add up to ${max} photos.`);
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add pictures.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: max - slots.length,
    });
    if (result.canceled) return;
    const newSlots: PhotoSlot[] = result.assets.slice(0, max - slots.length).map((asset, i) => ({
      key: `new-${Date.now()}-${i}`,
      kind: 'new',
      image: { uri: asset.uri, name: asset.fileName, mimeType: asset.mimeType },
    }));
    setSlots((prev) => [...prev, ...newSlots]);
  }, [slots.length, max]);

  const remove = useCallback((key: string) => {
    setSlots((prev) => prev.filter((s) => s.key !== key));
  }, []);

  const keepPhotoUrls = slots.filter((s) => s.kind === 'existing').map((s) => s.url!) as string[];
  const newPhotos = slots.filter((s) => s.kind === 'new').map((s) => s.image!) as PickedImage[];

  return { slots, pickMore, remove, keepPhotoUrls, newPhotos, canAddMore: slots.length < max };
}
