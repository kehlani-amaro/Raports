import { MilitaryFormData } from '../components/MilitaryReportForm';

export interface MilitaryProfile {
  id: string;
  pib: string;
  rank: string;
  position: string;
  division: string;
  phone: string;
  bday?: string;
  citizen?: string;
  tck?: string;
  draft?: string;
  tariff_range?: string;
  staff_category?: string;
  salary_position?: string;
  salary_rank?: string;
  features_pct?: string;
  premium_pct?: string;
  exp_years?: number;
  exp_months?: number;
  vacation_address?: string;
  updated_at: string;
}

const STORAGE_KEY = 'raportdesk_military_profiles';

function normalizePib(pib: string): string {
  return pib.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function getAllProfiles(): Promise<MilitaryProfile[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading profiles:', e);
    return [];
  }
}

async function saveProfilesList(profiles: MilitaryProfile[]): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

// Пряме збереження або редагування з форми модального вікна
export async function saveOrUpdateExplicitProfile(profile: Partial<MilitaryProfile> & { pib: string }): Promise<MilitaryProfile> {
  const currentProfiles = await getAllProfiles();
  const now = new Date().toISOString();

  if (profile.id) {
    const idx = currentProfiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      const updated: MilitaryProfile = {
        ...currentProfiles[idx],
        ...profile,
        updated_at: now
      };
      currentProfiles[idx] = updated;
      await saveProfilesList(currentProfiles);
      return updated;
    }
  }

  // Якщо створення нового або ID не знайдено
  const newProfile: MilitaryProfile = {
    id: `prof_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    pib: profile.pib.trim(),
    rank: profile.rank || '',
    position: profile.position || '',
    division: profile.division || '',
    phone: profile.phone || '',
    bday: profile.bday || '',
    citizen: profile.citizen || '',
    tck: profile.tck || '',
    draft: profile.draft || '',
    tariff_range: profile.tariff_range || '',
    staff_category: profile.staff_category || '',
    salary_position: profile.salary_position || '',
    salary_rank: profile.salary_rank || '',
    features_pct: profile.features_pct || '',
    premium_pct: profile.premium_pct || '',
    exp_years: profile.exp_years || 0,
    exp_months: profile.exp_months || 0,
    vacation_address: profile.vacation_address || '',
    updated_at: now
  };

  currentProfiles.unshift(newProfile);
  await saveProfilesList(currentProfiles);
  return newProfile;
}

// Автооновлення при генерації рапорту
export async function autoSaveOrUpdateProfile(formData: MilitaryFormData): Promise<MilitaryProfile | null> {
  if (!formData.pib || !formData.pib.trim()) return null;

  const currentProfiles = await getAllProfiles();
  const targetNormPib = normalizePib(formData.pib);
  const existingIndex = currentProfiles.findIndex(p => normalizePib(p.pib) === targetNormPib);

  if (existingIndex >= 0) {
    const existing = currentProfiles[existingIndex];
    const updated: MilitaryProfile = {
      ...existing,
      pib: formData.pib.trim() || existing.pib,
      rank: formData.rank || existing.rank,
      position: formData.position || existing.position,
      division: formData.division || existing.division,
      phone: formData.phone || existing.phone,
      bday: formData.bday || existing.bday,
      citizen: formData.citizen || existing.citizen,
      tck: formData.tck || existing.tck,
      draft: formData.draft || existing.draft,
      tariff_range: formData.tariff_range || existing.tariff_range,
      staff_category: formData.staff_category || existing.staff_category,
      salary_position: formData.salary_position || existing.salary_position,
      salary_rank: formData.salary_rank || existing.salary_rank,
      features_pct: formData.features_pct || existing.features_pct,
      premium_pct: formData.premium_pct || existing.premium_pct,
      exp_years: formData.exp_years !== undefined && formData.exp_years > 0 ? formData.exp_years : existing.exp_years,
      exp_months: formData.exp_months !== undefined && formData.exp_months > 0 ? formData.exp_months : existing.exp_months,
      vacation_address: formData.vacation_address || existing.vacation_address,
      updated_at: new Date().toISOString()
    };

    currentProfiles[existingIndex] = updated;
    await saveProfilesList(currentProfiles);
    return updated;
  } else {
    return saveOrUpdateExplicitProfile({
      pib: formData.pib,
      rank: formData.rank,
      position: formData.position,
      division: formData.division,
      phone: formData.phone,
      bday: formData.bday,
      citizen: formData.citizen,
      tck: formData.tck,
      draft: formData.draft,
      tariff_range: formData.tariff_range,
      staff_category: formData.staff_category,
      salary_position: formData.salary_position,
      salary_rank: formData.salary_rank,
      features_pct: formData.features_pct,
      premium_pct: formData.premium_pct,
      exp_years: formData.exp_years,
      exp_months: formData.exp_months,
      vacation_address: formData.vacation_address
    });
  }
}

export async function deleteProfile(id: string): Promise<void> {
  const currentProfiles = await getAllProfiles();
  const filtered = currentProfiles.filter(p => p.id !== id);
  await saveProfilesList(filtered);
}