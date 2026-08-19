import { MilitaryFormData } from '../components/MilitaryReportForm';

export type MilitaryStatus = 
  | 'active'              // На службі / В строю
  | 'business_trip'       // Відрядження
  | 'vacation_main'       // Відпустка Основна
  | 'vacation_treatment'  // Відпустка Лікування
  | 'awol'                // СЗЧ
  | 'deceased';           // Загинув

export interface MilitaryProfile {
  id: string;
  pib: string;
  short_pib?: string;
  status?: MilitaryStatus; // Статус бійця
  rank: string;
  position: string;
  full_position?: string;
  position_index?: string;
  vos?: string;
  division: string;
  service_type?: string;
  phone: string;
  bday?: string;
  birth_place?: string;
  full_years?: string;
  citizen?: string;
  tck?: string;
  draft?: string;
  arrived_from?: string;
  
  tariff_range?: string;
  staff_category?: string;
  salary_position?: string;
  salary_rank?: string;
  features_pct?: string;
  premium_pct?: string;
  
  exp_years?: number;
  exp_months?: number;
  exp_days?: number;
  
  acceptance_date?: string;
  arrival_date?: string;
  rank_order?: string;
  rank_order_date?: string;
  appointment_order?: string;
  appointment_order_num?: string;
  appointment_order_date?: string;
  military_id_card?: string;
  contract_end_date?: string;
  
  ubd_status?: string;
  ubd_period?: string;
  ipn?: string;
  fitness_vlk?: string;
  vlk_certificate?: string;
  vlk_date?: string;
  marital_status?: string;
  contact_person?: string;
  education?: string;
  education_degree?: string;
  gender?: string;
  registration_address?: string;
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

export async function saveOrUpdateExplicitProfile(
  profile: Partial<MilitaryProfile> & { pib: string }
): Promise<MilitaryProfile> {
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

  const newProfile: MilitaryProfile = {
    rank: '',
    position: '',
    division: '',
    phone: '',
    status: 'active',
    ...profile,
    id: profile.id || `prof_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    pib: profile.pib.trim(),
    updated_at: now
  };

  currentProfiles.unshift(newProfile);
  await saveProfilesList(currentProfiles);
  return newProfile;
}

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
      acceptance_date: formData.acceptance_date || existing.acceptance_date,
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
      acceptance_date: formData.acceptance_date,
      vacation_address: formData.vacation_address,
      status: 'active'
    });
  }
}

export async function deleteProfile(id: string): Promise<void> {
  const currentProfiles = await getAllProfiles();
  const filtered = currentProfiles.filter(p => p.id !== id);
  await saveProfilesList(filtered);
}

// Масове видалення списку профілів
export async function deleteProfilesBulk(ids: string[]): Promise<void> {
  const set = new Set(ids);
  const currentProfiles = await getAllProfiles();
  const filtered = currentProfiles.filter(p => !set.has(p.id));
  await saveProfilesList(filtered);
}

// Оновлення статусу одного або кількох профілів
export async function updateProfilesStatus(ids: string[], status: MilitaryStatus): Promise<void> {
  const set = new Set(ids);
  const currentProfiles = await getAllProfiles();
  const now = new Date().toISOString();
  
  const updated = currentProfiles.map(p => {
    if (set.has(p.id)) {
      return { ...p, status, updated_at: now };
    }
    return p;
  });
  
  await saveProfilesList(updated);
}
export async function replaceAllProfiles(profiles: MilitaryProfile[]): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}