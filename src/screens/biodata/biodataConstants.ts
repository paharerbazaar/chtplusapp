// Mirrors the Bangla enum values in khagrachariPlusNackend/app/biodata/BiodataWizard.js
// and lib/biodataFields.js exactly — these are literal values the backend
// stores and matches on, not just display labels.
export const PROFESSION_TYPES = ['চাকরি', 'ব্যবসা', 'উদ্যোক্তা', 'শিক্ষার্থী', 'অন্যান্য'];
export const SKIN_TONES = ['শ্যামলা', 'উজ্জ্বল শ্যামলা', 'ফর্সা', 'উজ্জ্বল ফর্সা'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'জানা নেই'];
export const EDU_GROUPS = ['বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা', 'অন্যান্য'];
export const MARITAL_STATUSES = ['অবিবাহিত', 'বিবাহিত', 'ডিভোর্সড', 'বিধবা', 'বিপত্নীক'];
export const SIBLING_RELATIONS = ['বড় ভাই', 'বড় বোন', 'ছোট ভাই', 'ছোট বোন'];

export const RELIGIONS = [
  { label: 'Islam', value: 'ইসলাম' },
  { label: 'Hinduism', value: 'হিন্দু' },
  { label: 'Buddhism', value: 'বৌদ্ধ' },
  { label: 'Christianity', value: 'খ্রিস্টান' },
  { label: 'Other', value: 'অন্যান্য' },
];

export const EDUCATION_MEDIUMS = [
  { label: 'General', value: 'জেনারেল' },
  { label: 'Technical', value: 'কারিগরি' },
  { label: 'Madrasa', value: 'মাদ্রাসা' },
];

export const YES_NO = [
  { label: 'Yes', value: 'হ্যাঁ' },
  { label: 'No', value: 'না' },
];

export const PRAYER_HABITS = [
  { label: 'Yes', value: 'হ্যাঁ' },
  { label: 'No', value: 'না' },
  { label: 'Try to pray regularly', value: 'নিয়মিত চেষ্টা করি' },
];

export const NEGOTIABLE_YES_NO = [
  { label: 'Yes', value: 'হ্যাঁ' },
  { label: 'No', value: 'না' },
  { label: 'Negotiable', value: 'আলোচনা সাপেক্ষে' },
];

export const GUARDIAN_RELATIONS = [
  { label: 'Father', value: 'পিতা' },
  { label: 'Mother', value: 'মাতা' },
  { label: 'Brother', value: 'ভাই' },
  { label: 'Sister', value: 'বোন' },
  { label: 'Local guardian', value: 'স্থানীয় অভিভাবক' },
  { label: 'Other', value: 'অন্যান্য' },
];

function heightOptions(): string[] {
  const opts: string[] = [];
  for (let ft = 4; ft <= 7; ft += 1) {
    const minIn = ft === 4 ? 1 : 0;
    const maxIn = ft === 7 ? 0 : 11;
    for (let inch = minIn; inch <= maxIn; inch += 1) opts.push(`${ft}'${inch}"`);
  }
  return opts;
}

function yearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let y = currentYear; y >= 1980; y -= 1) years.push(String(y));
  return years;
}

export const HEIGHT_OPTIONS = heightOptions();
export const YEAR_OPTIONS = yearOptions();

export const toOptions = (values: string[]) => values.map((v) => ({ label: v, value: v }));
export const ANY_OPTION = { label: 'Any', value: 'যেকোনো' };
