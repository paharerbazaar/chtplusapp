import { api } from './client';
import type { Donor, Review } from '@/types';

export interface DonorFilters {
  bloodGroup?: string;
  district?: string;
  area?: string;
  availableOnly?: boolean;
}

export function getDonors(filters: DonorFilters = {}) {
  return api.get<Donor[]>('/donors', { params: filters }).then((r) => r.data);
}

export function getDonor(id: string) {
  return api.get<Donor>(`/donors/${id}`).then((r) => r.data);
}

export interface UpsertDonorInput {
  name: string;
  bloodGroup: string;
  phone: string;
  district?: string;
  area: string;
  lastDonationDate?: string;
  photoUrl?: string;
}

export function upsertMyDonorProfile(input: UpsertDonorInput) {
  return api.post<{ ok: true; id: string }>('/donors', input).then((r) => r.data);
}

export function toggleDonorLike(id: string) {
  return api.post<{ liked: boolean; likeCount: number }>(`/donors/${id}/like`).then((r) => r.data);
}

export function getDonorLikeNames(id: string) {
  return api.get<string[]>(`/donors/${id}/likes`).then((r) => r.data);
}

export function getDonorReviews(id: string) {
  return api.get<Review[]>(`/donors/${id}/reviews`).then((r) => r.data);
}

export function addDonorReview(id: string, input: { rating: number; comment: string }) {
  return api.post(`/donors/${id}/reviews`, input).then((r) => r.data);
}
