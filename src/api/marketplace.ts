import { api } from './client';
import type { PickedImage } from './upload';
import { toFormDataMulti } from './upload';
import type { MarketplaceListing } from '@/types';

export interface MarketplaceFilters {
  categoryId?: string;
  condition?: string;
  district?: string;
  area?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc';
  promotedOnly?: boolean;
}

export function getListings(filters: MarketplaceFilters = {}) {
  return api.get<MarketplaceListing[]>('/marketplace-listings', { params: filters }).then((r) => r.data);
}

export function getListing(id: string) {
  return api.get<MarketplaceListing>(`/marketplace-listings/${id}`).then((r) => r.data);
}

export interface ListingInput {
  categoryId: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  district: string;
  area: string;
  sellerName: string;
  sellerPhone: string;
  negotiable?: boolean;
  extraAttributes?: Record<string, unknown>;
}

function listingFields(input: ListingInput) {
  return {
    categoryId: input.categoryId,
    title: input.title,
    description: input.description,
    price: input.price,
    condition: input.condition,
    district: input.district,
    area: input.area,
    sellerName: input.sellerName,
    sellerPhone: input.sellerPhone,
    negotiable: input.negotiable ? 'true' : 'false',
    extraAttributes: input.extraAttributes ? JSON.stringify(input.extraAttributes) : undefined,
  };
}

export function createListing(input: ListingInput, photos: PickedImage[]) {
  const form = toFormDataMulti('photos', photos.slice(0, 4), listingFields(input));
  return api
    .post<{ ok: true; id: string; adNumber: string }>('/marketplace-listings', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
}

export function updateListing(id: string, input: ListingInput, newPhotos: PickedImage[], keepPhotoUrls: string[]) {
  const form = toFormDataMulti('photos', newPhotos.slice(0, 4), {
    ...listingFields(input),
    keepPhotoUrls: JSON.stringify(keepPhotoUrls),
  });
  return api.patch(`/marketplace-listings/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
}

export function deleteListing(id: string) {
  return api.delete(`/marketplace-listings/${id}`).then((r) => r.data);
}

export function sponsorListing(id: string) {
  return api
    .post<{ ok: true; coinBalance: number; sponsoredUntil: string }>(`/marketplace-listings/${id}/sponsor`)
    .then((r) => r.data);
}
