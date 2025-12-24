// ============================================
// Area Data for Malaysia Cities
// ============================================

import type { City } from './types';

export interface AreaOption {
  value: string;
  label: string;
  tier: 'budget' | 'mid' | 'premium';
}

export const AREAS_BY_CITY: Record<City, AreaOption[]> = {
  klang_valley: [
    // Budget Areas
    { value: 'cheras', label: 'Cheras', tier: 'budget' },
    { value: 'seri_kembangan', label: 'Seri Kembangan', tier: 'budget' },
    { value: 'setapak', label: 'Setapak', tier: 'budget' },
    { value: 'kepong', label: 'Kepong', tier: 'budget' },
    { value: 'puchong', label: 'Puchong', tier: 'budget' },
    { value: 'kajang', label: 'Kajang', tier: 'budget' },
    { value: 'semenyih', label: 'Semenyih', tier: 'budget' },
    // Mid-tier Areas
    { value: 'petaling_jaya', label: 'Petaling Jaya', tier: 'mid' },
    { value: 'old_klang_road', label: 'Old Klang Road', tier: 'mid' },
    { value: 'subang_jaya', label: 'Subang Jaya', tier: 'mid' },
    { value: 'shah_alam', label: 'Shah Alam', tier: 'mid' },
    { value: 'kota_damansara', label: 'Kota Damansara', tier: 'mid' },
    { value: 'ampang', label: 'Ampang', tier: 'mid' },
    // Premium Areas
    { value: 'mont_kiara', label: 'Mont Kiara', tier: 'premium' },
    { value: 'bangsar', label: 'Bangsar', tier: 'premium' },
    { value: 'damansara_heights', label: 'Damansara Heights', tier: 'premium' },
    { value: 'klcc', label: 'KLCC', tier: 'premium' },
    { value: 'bukit_bintang', label: 'Bukit Bintang', tier: 'premium' },
    { value: 'desa_parkcity', label: 'Desa ParkCity', tier: 'premium' },
    { value: 'ttdi', label: 'TTDI', tier: 'premium' },
  ],
  penang: [
    // Budget Areas
    { value: 'butterworth', label: 'Butterworth', tier: 'budget' },
    { value: 'bayan_lepas', label: 'Bayan Lepas', tier: 'budget' },
    { value: 'jelutong', label: 'Jelutong', tier: 'budget' },
    { value: 'air_itam', label: 'Air Itam', tier: 'budget' },
    // Mid-tier Areas
    { value: 'gelugor', label: 'Gelugor', tier: 'mid' },
    { value: 'pulau_tikus', label: 'Pulau Tikus', tier: 'mid' },
    { value: 'tanjung_tokong', label: 'Tanjung Tokong', tier: 'mid' },
    // Premium Areas
    { value: 'georgetown', label: 'Georgetown', tier: 'premium' },
    { value: 'gurney', label: 'Gurney', tier: 'premium' },
    { value: 'tanjung_bungah', label: 'Tanjung Bungah', tier: 'premium' },
  ],
  johor_bahru: [
    // Budget Areas
    { value: 'skudai', label: 'Skudai', tier: 'budget' },
    { value: 'tampoi', label: 'Tampoi', tier: 'budget' },
    { value: 'perling', label: 'Perling', tier: 'budget' },
    { value: 'taman_universiti', label: 'Taman Universiti', tier: 'budget' },
    { value: 'masai', label: 'Masai', tier: 'budget' },
    // Mid-tier Areas
    { value: 'mount_austin', label: 'Mount Austin', tier: 'mid' },
    { value: 'tebrau', label: 'Tebrau', tier: 'mid' },
    { value: 'taman_molek', label: 'Taman Molek', tier: 'mid' },
    { value: 'bukit_indah', label: 'Bukit Indah', tier: 'mid' },
    // Premium Areas
    { value: 'medini', label: 'Medini', tier: 'premium' },
    { value: 'puteri_harbour', label: 'Puteri Harbour', tier: 'premium' },
    { value: 'iskandar_puteri', label: 'Iskandar Puteri', tier: 'premium' },
  ],
};

export function getAreaLabel(city: City, areaValue: string): string {
  const area = AREAS_BY_CITY[city].find(a => a.value === areaValue);
  return area?.label || areaValue;
}

export function getAreasForCity(city: City): AreaOption[] {
  return AREAS_BY_CITY[city] || [];
}

export function getAreasByTier(city: City, tier: 'budget' | 'mid' | 'premium'): AreaOption[] {
  return AREAS_BY_CITY[city].filter(a => a.tier === tier);
}
