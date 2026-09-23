import { api } from './client';
import type { CropRect } from '@/components/PhotoCropModal';
import type {
  MeResponse,
  User,
  WorkItem,
  EducationItem,
  NotificationItem,
  Serial,
  ServiceItem,
  MarketplaceListing,
  BiodataTeaser,
  Review,
  PrivacyLevel,
} from '@/types';
import type { PickedImage } from './upload';
import { toFormData } from './upload';

export function getMe() {
  return api.get<MeResponse>('/me').then((r) => r.data);
}

export function updateMe(input: Partial<Pick<User, 'name' | 'email' | 'phone' | 'area'>>) {
  return api.patch<{ user: User }>('/me', input).then((r) => r.data);
}

export function updateMeDetails(input: { bio: string; currentCity: string; hometown: string; relationshipStatus: string }) {
  return api.post('/me/details', input).then((r) => r.data);
}

export function updateFieldPrivacy(field: 'currentCity' | 'hometown' | 'relationshipStatus', privacy: PrivacyLevel) {
  return api.post('/me/details/privacy', { field, privacy }).then((r) => r.data);
}

function cropFields(crop?: CropRect): Record<string, string> | undefined {
  if (!crop) return undefined;
  return { cropX: String(crop.x), cropY: String(crop.y), cropWidth: String(crop.width), cropHeight: String(crop.height) };
}

export function uploadMyPhoto(image: PickedImage, crop?: CropRect) {
  return api
    .post<{ ok: true; photoUrl: string }>('/me/photo', toFormData('photo', image, cropFields(crop)), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
}

export function uploadMyCoverPhoto(image: PickedImage, crop?: CropRect) {
  return api
    .post<{ ok: true; coverPhotoUrl: string }>('/me/cover-photo', toFormData('photo', image, cropFields(crop)), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
}

export function getMyCoins() {
  return api.get<{ coinBalance: number }>('/me/coins').then((r) => r.data);
}

export function getMyNotifications() {
  return api.get<NotificationItem[]>('/me/notifications').then((r) => r.data);
}

export function markNotificationRead(id: number) {
  return api.post(`/me/notifications/${id}/read`).then((r) => r.data);
}

export function markAllNotificationsRead() {
  return api.post('/me/notifications/read-all').then((r) => r.data);
}

export interface FollowUser {
  id: string;
  name: string;
  photoUrl: string | null;
  blueBadge: boolean;
}

export function getMyFollows() {
  return api
    .get<{ following: FollowUser[]; followers: FollowUser[] }>('/me/follows')
    .then((r) => r.data);
}

export function addWork(input: Omit<WorkItem, 'id'>) {
  return api.post<WorkItem>('/me/work', input).then((r) => r.data);
}

export function deleteWork(id: number) {
  return api.delete(`/me/work/${id}`).then((r) => r.data);
}

export function addEducation(input: Omit<EducationItem, 'id'>) {
  return api.post<EducationItem>('/me/education', input).then((r) => r.data);
}

export function deleteEducation(id: number) {
  return api.delete(`/me/education/${id}`).then((r) => r.data);
}

export function saveHomePreferences(interests: string[]) {
  return api.post('/me/home-preferences', { interests }).then((r) => r.data);
}

export function getChatSettings() {
  return api.get<{ chatEnabled: boolean; chatNoticeSeen: boolean }>('/me/chat-settings').then((r) => r.data);
}

export function updateChatSettings(input: { chatEnabled?: boolean; noticeSeen?: boolean }) {
  return api.patch('/me/chat-settings', input).then((r) => r.data);
}

export function getChatUnreadCount() {
  return api.get<{ count: number }>('/me/chat-unread-count').then((r) => r.data);
}

export function getMySerials() {
  return api.get<Serial[]>('/me/serials').then((r) => r.data);
}

export function getMyServices() {
  return api.get<ServiceItem[]>('/me/services').then((r) => r.data);
}

export function getMyListings() {
  return api.get<MarketplaceListing[]>('/me/marketplace-listings').then((r) => r.data);
}

export function getMyBiodata() {
  return api.get<BiodataTeaser[]>('/me/biodata').then((r) => r.data);
}

export function getMyDoctorLikes() {
  return api.get<string[]>('/me/doctor-likes').then((r) => r.data);
}

export function getMyDonorLikes() {
  return api.get<string[]>('/me/donor-likes').then((r) => r.data);
}

export function getMyReviews() {
  return api.get<Review[]>('/me/reviews').then((r) => r.data);
}

export function deleteMyAccount() {
  return api.delete('/me/account').then((r) => r.data);
}
