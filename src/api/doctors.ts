import { api } from './client';
import type { AvailableDate, Doctor, DoctorDetail } from '@/types';

export interface DoctorFilters {
  specialty?: string;
  departmentId?: string;
  organizationId?: string;
  district?: string;
  area?: string;
  q?: string;
}

export function getDoctors(filters: DoctorFilters = {}) {
  return api.get<Doctor[]>('/doctors', { params: filters }).then((r) => r.data);
}

export function getDoctor(id: string) {
  return api.get<DoctorDetail>(`/doctors/${id}`).then((r) => r.data);
}

export function toggleDoctorLike(id: string) {
  return api.post<{ liked: boolean; likeCount: number }>(`/doctors/${id}/like`).then((r) => r.data);
}

export function getDoctorLikeNames(id: string) {
  return api.get<string[]>(`/doctors/${id}/likes`).then((r) => r.data);
}

export function getChamberAvailability(doctorId: string, chamberId: string, days = 30) {
  return api
    .get<AvailableDate[]>(`/doctors/${doctorId}/chambers/${chamberId}/availability`, { params: { days } })
    .then((r) => r.data);
}

export interface BookSerialInput {
  chamberId: string;
  date: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  note?: string;
}

export function bookSerial(input: BookSerialInput) {
  return api.post<{ ok: true; id: string }>('/serials', input).then((r) => r.data);
}
