// React Native's FormData accepts a { uri, name, type } object in place of a
// Blob/File. This is the shape we need from expo-image-picker results.
export interface PickedImage {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
}

function toRNFilePart(image: PickedImage, fallbackName: string) {
  const extFromMime = image.mimeType?.split('/')?.[1];
  const name = image.name || `${fallbackName}.${extFromMime || 'jpg'}`;
  return {
    uri: image.uri,
    name,
    type: image.mimeType || 'image/jpeg',
  } as unknown as Blob;
}

export function toFormData(field: string, image: PickedImage, extraFields?: Record<string, string>): FormData {
  const form = new FormData();
  form.append(field, toRNFilePart(image, field));
  if (extraFields) {
    Object.entries(extraFields).forEach(([key, value]) => form.append(key, value));
  }
  return form;
}

// For endpoints that accept multiple files under the same field name
// ("photos"), e.g. services / marketplace-listings.
export function toFormDataMulti(field: string, images: PickedImage[], extraFields?: Record<string, string | number | boolean | undefined | null>): FormData {
  const form = new FormData();
  images.forEach((image, i) => form.append(field, toRNFilePart(image, `${field}-${i}`)));
  if (extraFields) {
    Object.entries(extraFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) form.append(key, String(value));
    });
  }
  return form;
}
