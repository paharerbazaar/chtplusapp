import { api } from './client';
import type { PrivacyLevel, PublicProfile } from '@/types';

export function getPublicProfile(id: string) {
  return api.get<PublicProfile>(`/users/${id}`).then((r) => r.data);
}

export interface AboutFields {
  currentCity: string | null;
  hometown: string | null;
  relationshipStatus: string | null;
  currentCityPrivacy: PrivacyLevel;
  hometownPrivacy: PrivacyLevel;
  relationshipStatusPrivacy: PrivacyLevel;
}

export function getUserAbout(id: string) {
  return api.get<AboutFields>(`/users/${id}/about`).then((r) => r.data);
}

export function getFollowStatus(id: string) {
  return api.get<{ following: boolean }>(`/users/${id}/follow`).then((r) => r.data);
}

export function toggleFollow(id: string) {
  return api.post<{ following: boolean; followerCount: number }>(`/users/${id}/follow`).then((r) => r.data);
}
