import { api } from './client';
import type { Banner, Category, District, Organization } from '@/types';

export function getBanners() {
  return api.get<Banner[]>('/banners').then((r) => r.data);
}

export function getWelcomePopup() {
  return api.get<{ popup: { imageUrl: string; url?: string } | null }>('/welcome-popup').then((r) => r.data);
}

export function getDistricts() {
  return api.get<District[]>('/locations/districts').then((r) => r.data);
}

export function getUpazilas(districtId: string | number) {
  return api.get<District[]>('/locations/upazilas', { params: { districtId } }).then((r) => r.data);
}

export function getServiceCategories() {
  return api.get<Category[]>('/service-categories').then((r) => r.data);
}

export function getServiceSubscriptionPackages() {
  return api.get<{ id: string; name: string; coinCost: number; durationDays: number }[]>('/service-subscription-packages').then((r) => r.data);
}

export function getMarketplaceCategories() {
  return api.get<Category[]>('/marketplace-categories').then((r) => r.data);
}

export function getMarketplaceSubscriptionPackages() {
  return api
    .get<{ id: string; name: string; coinCost: number; durationDays: number }[]>('/marketplace-subscription-packages')
    .then((r) => r.data);
}

export function getOrganizations() {
  return api.get<Organization[]>('/organizations').then((r) => r.data);
}

export function getDiseaseDepartments() {
  return api.get<{ id: string; name: string }[]>('/disease-departments').then((r) => r.data);
}

export interface AppConfig {
  googleClientId: string;
  oneSignalAppId: string;
}

export function getAppConfig() {
  return api.get<AppConfig>('/app-config').then((r) => r.data);
}

export type SavedTargetType = 'service' | 'donor' | 'marketplace_listing' | 'biodata';

export interface SavedItem {
  targetType: SavedTargetType;
  targetId: string;
  title: string;
  subtitle: string;
}

export function getSavedItems() {
  return api.get<SavedItem[]>('/saved').then((r) => r.data);
}

export function toggleSaved(targetType: SavedTargetType, targetId: string) {
  return api.post<{ saved: boolean }>('/saved', { targetType, targetId }).then((r) => r.data);
}
