import { api } from './client';
import type { PickedImage } from './upload';
import { toFormDataMulti } from './upload';
import type { Review, ServiceItem } from '@/types';

export interface ServiceFilters {
  categoryId?: string;
  paidOnly?: boolean;
  district?: string;
  area?: string;
  search?: string;
}

export function getServices(filters: ServiceFilters = {}) {
  return api.get<ServiceItem[]>('/services', { params: filters }).then((r) => r.data);
}

export function getService(id: string) {
  return api.get<ServiceItem>(`/services/${id}`).then((r) => r.data);
}

export interface CreateServiceInput {
  categoryId: string;
  providerName: string;
  description: string;
  area: string;
  district?: string;
  phone: string;
}

export function createService(input: CreateServiceInput, photos: PickedImage[]) {
  const form = toFormDataMulti('photos', photos.slice(0, 2), input as unknown as Record<string, string>);
  return api.post<{ ok: true; id: string }>('/services', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
}

export function updateService(id: string, input: CreateServiceInput, newPhotos: PickedImage[], keepPhotoUrls: string[]) {
  const form = toFormDataMulti('photos', newPhotos.slice(0, 2), {
    ...input,
    keepPhotoUrls: JSON.stringify(keepPhotoUrls),
  } as unknown as Record<string, string>);
  return api.patch(`/services/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
}

export function deleteService(id: string) {
  return api.delete(`/services/${id}`).then((r) => r.data);
}

export function getServiceReviews(id: string) {
  return api.get<Review[]>(`/services/${id}/reviews`).then((r) => r.data);
}

export function addServiceReview(id: string, input: { rating: number; comment: string }) {
  return api.post(`/services/${id}/reviews`, input).then((r) => r.data);
}

export function sponsorService(id: string, packageId: string) {
  return api
    .post<{ ok: true; coinBalance: number; sponsoredUntil: string }>(`/services/${id}/sponsor`, { packageId })
    .then((r) => r.data);
}
