import { api } from './client';
import { toFormDataMulti } from './upload';
import type { PickedImage } from './upload';
import type { BiodataDetail, BiodataPackage, BiodataTeaser } from '@/types';

export function getBiodataList() {
  return api.get<BiodataTeaser[]>('/biodata').then((r) => r.data);
}

export function getBiodata(id: string) {
  return api.get<BiodataDetail>(`/biodata/${id}`).then((r) => r.data);
}

export interface Sibling {
  name: string;
  relation: string;
  profession: string;
  organization: string;
  maritalStatus: string;
}

// Mirrors lib/biodataFields.js's parseBiodataFormData on the backend — every
// key here is a literal FormData field name that route expects, values are
// Bangla enum strings the same way the web wizard sends them.
export interface BiodataFormInput {
  biodataType: 'পাত্রের বায়োডাটা' | 'পাত্রীর বায়োডাটা';
  maritalStatus: string;
  permanentDistrict: string;
  permanentUpazila?: string;
  currentDistrict: string;
  currentUpazila?: string;
  currentAddress: string;
  dateOfBirth: string;
  skinTone: string;
  height: string;
  bloodGroup: string;
  professionType: string;
  profession: string;
  religion?: string;

  educationMedium?: string;
  sscPassed?: 'হ্যাঁ' | 'না';
  sscYear?: string;
  sscInstitution?: string;
  sscGroup?: string;
  hscPassed?: 'হ্যাঁ' | 'না';
  hscYear?: string;
  hscInstitution?: string;
  hscGroup?: string;
  graduationPassed?: 'হ্যাঁ' | 'না';
  institutionName?: string;
  graduationDepartment?: string;
  graduationYear?: string;
  postgraduationPassed?: 'হ্যাঁ' | 'না';
  postgraduationInstitution?: string;
  postgraduationDepartment?: string;
  postgraduationYear?: string;

  fatherName: string;
  fatherProfession: string;
  motherName: string;
  motherProfession: string;
  siblings: Sibling[];

  prayerHabit?: string;
  healthCondition?: string;
  aboutSelf: string;

  wifeEducationPermission?: string;
  wifeJobPermission?: string;
  whereWifeWillLive?: string;

  expectedMaxAge?: string;
  expectedSkinTone?: string;
  expectedMinHeight?: string;
  expectedEducation?: string;
  expectedProfession?: string;
  expectedDistrict?: string;
  expectedMaritalStatus?: string;
  expectedEconomicCondition?: string;
  expectedFamilyCondition?: string;
  expectedQualities?: string;

  noteToAdmin?: string;
  guardianPhone: string;
  guardianRelation: string;
  email?: string;
}

function biodataFormData(input: BiodataFormInput, photos: PickedImage[]): FormData {
  const { siblings, ...rest } = input;
  const form = toFormDataMulti('photos', photos.slice(0, 4), rest as unknown as Record<string, string>);
  form.append('siblingsJson', JSON.stringify(siblings || []));
  form.append('policyAgreed', 'on');
  return form;
}

export function createBiodata(input: BiodataFormInput, photos: PickedImage[]) {
  return api
    .post<{ ok: true; id: string; biodataNo: string }>('/biodata/create', biodataFormData(input, photos), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
}

export function updateBiodata(id: string, input: BiodataFormInput, newPhotos: PickedImage[], keepPhotoUrls: string[]) {
  const form = biodataFormData(input, newPhotos);
  form.append('keepPhotoUrls', JSON.stringify(keepPhotoUrls));
  return api.patch(`/biodata/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
}

export function deleteBiodata(id: string) {
  return api.delete(`/biodata/${id}`).then((r) => r.data);
}

export function claimBiodata(id: string) {
  return api.post(`/biodata/${id}/claim`).then((r) => r.data);
}

export interface UnlockResult {
  ok: boolean;
  alreadyUnlocked?: boolean;
  viaSubscription?: boolean;
  coinBalance?: number;
  error?: string;
  packages?: BiodataPackage[];
  cost?: number;
}

export function unlockBiodata(id: string, packageId?: string) {
  return api
    .post<UnlockResult>(`/biodata/${id}/unlock`, packageId ? { packageId } : {})
    .then((r) => r.data)
    .catch((err) => {
      if (err?.response?.data) return err.response.data as UnlockResult;
      throw err;
    });
}

export function getBiodataSubscriptionPackages() {
  return api.get<BiodataPackage[]>('/biodata-subscription-packages').then((r) => r.data);
}
