// code : code ISO à 2 lettres (utilisé par TMDB et pour le drapeau sur flagcdn.com)
// num  : code ISO numérique (utilisé par la carte du monde « world-atlas »)
// zone : continent sur lequel la carte zoome si le pays est choisi dans le menu
//        alors qu'il n'est pas visible (doit exister dans ZONES plus bas)
// Ajoute ou retire des pays comme tu veux.
export const COUNTRIES = [
  { code: 'SN', num: '686', zone: 'Afrique', name: 'Sénégal' },
  { code: 'CI', num: '384', zone: 'Afrique', name: "Côte d'Ivoire" },
  { code: 'ML', num: '466', zone: 'Afrique', name: 'Mali' },
  { code: 'BF', num: '854', zone: 'Afrique', name: 'Burkina Faso' },
  { code: 'NG', num: '566', zone: 'Afrique', name: 'Nigeria' },
  { code: 'MA', num: '504', zone: 'Afrique', name: 'Maroc' },
  { code: 'EG', num: '818', zone: 'Afrique', name: 'Égypte' },
  { code: 'ZA', num: '710', zone: 'Afrique', name: 'Afrique du Sud' },
  { code: 'FR', num: '250', zone: 'Europe', name: 'France' },
  { code: 'IT', num: '380', zone: 'Europe', name: 'Italie' },
  { code: 'ES', num: '724', zone: 'Europe', name: 'Espagne' },
  { code: 'DE', num: '276', zone: 'Europe', name: 'Allemagne' },
  { code: 'GB', num: '826', zone: 'Europe', name: 'Royaume-Uni' },
  { code: 'US', num: '840', zone: 'Amériques', name: 'États-Unis' },
  { code: 'MX', num: '484', zone: 'Amériques', name: 'Mexique' },
  { code: 'BR', num: '076', zone: 'Amériques', name: 'Brésil' },
  { code: 'AR', num: '032', zone: 'Amériques', name: 'Argentine' },
  { code: 'IN', num: '356', zone: 'Asie', name: 'Inde' },
  { code: 'CN', num: '156', zone: 'Asie', name: 'Chine' },
  { code: 'JP', num: '392', zone: 'Asie', name: 'Japon' },
  { code: 'KR', num: '410', zone: 'Asie', name: 'Corée du Sud' },
  { code: 'TR', num: '792', zone: 'Asie', name: 'Turquie' },
  { code: 'IR', num: '364', zone: 'Asie', name: 'Iran' },
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

// Zones de zoom de la carte : [longitude min, latitude min, longitude max, latitude max].
export const ZONES = {
  Monde: null, // null = toute la carte
  Afrique: [-20, -36, 52, 38],
  "Afrique de l'Ouest": [-18, 3, 16, 26],
  Europe: [-12, 35, 40, 61],
  Amériques: [-130, -56, -32, 55],
  Asie: [25, -8, 146, 55],
}
