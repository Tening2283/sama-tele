// Code ISO 3166-1 du pays + nom (le drapeau vient de flagcdn.com).
// Ajoute ou retire des pays comme tu veux.
export const COUNTRIES = [
  { code: 'SN', name: 'Sénégal' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'ML', name: 'Mali' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'MA', name: 'Maroc' },
  { code: 'EG', name: 'Égypte' },
  { code: 'ZA', name: 'Afrique du Sud' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italie' },
  { code: 'ES', name: 'Espagne' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'US', name: 'États-Unis' },
  { code: 'MX', name: 'Mexique' },
  { code: 'BR', name: 'Brésil' },
  { code: 'AR', name: 'Argentine' },
  { code: 'IN', name: 'Inde' },
  { code: 'CN', name: 'Chine' },
  { code: 'JP', name: 'Japon' },
  { code: 'KR', name: 'Corée du Sud' },
  { code: 'TR', name: 'Turquie' },
  { code: 'IR', name: 'Iran' },
]

// Pays utilisés pour « où regarder » (les offres dépendent du pays du spectateur).
export const WATCH_REGIONS = [
  { code: 'FR', name: 'France' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'BE', name: 'Belgique' },
  { code: 'CA', name: 'Canada' },
  { code: 'CH', name: 'Suisse' },
  { code: 'US', name: 'États-Unis' },
]

// Décennies proposées dans le filtre « Époque » (1950 → années 50, etc.).
export const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020]
