// Petit client pour l'API TMDB (v3).
// La clé est lue depuis le fichier .env (VITE_TMDB_API_KEY).

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE = 'https://api.themoviedb.org/3'
export const IMG = 'https://image.tmdb.org/t/p'

export const hasKey = Boolean(API_KEY && API_KEY !== 'ta_cle_ici')

async function get(path, params = {}) {
  const url = new URL(BASE + path)
  url.searchParams.set('api_key', API_KEY)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url)
  if (!res.ok) {
    if (res.status === 401) throw new Error('Clé TMDB invalide (vérifie ton fichier .env).')
    throw new Error(`Erreur TMDB ${res.status}`)
  }
  return res.json()
}

// Liste de films produits dans un pays donné (code ISO, ex: "SN", "FR").
export async function discoverByCountry(countryCode) {
  const base = {
    with_origin_country: countryCode,
    language: 'fr-FR',
    sort_by: 'popularity.desc',
    include_adult: 'false',
  }
  // D'abord des films assez connus ; sinon on élargit (petites cinématographies).
  let data = await get('/discover/movie', { ...base, 'vote_count.gte': 30 })
  if (data.results.length === 0) {
    data = await get('/discover/movie', base)
  }
  // On pioche une page au hasard pour varier les films.
  const maxPage = Math.min(data.total_pages, 5)
  if (maxPage > 1) {
    const page = 1 + Math.floor(Math.random() * maxPage)
    if (page !== 1) {
      const params = data.results.length ? { ...base, 'vote_count.gte': 30 } : base
      const other = await get('/discover/movie', { ...params, page })
      if (other.results.length) data = other
    }
  }
  return data.results
}

// Bandes-annonces YouTube, de la meilleure à la moins bonne
// (officielle, en français si possible). Le lecteur essaie la suivante si une vidéo ne marche pas.
export async function getTrailers(movieId) {
  const data = await get(`/movie/${movieId}/videos`, {
    language: 'fr-FR',
    include_video_language: 'fr,en,null',
  })
  const yt = data.results.filter((v) => v.site === 'YouTube')
  const score = (v) =>
    (v.type === 'Trailer' ? 4 : v.type === 'Teaser' ? 2 : 0) +
    (v.official ? 2 : 0) +
    (v.iso_639_1 === 'fr' ? 1 : 0)
  yt.sort((a, b) => score(b) - score(a))
  return yt.slice(0, 5).map((v) => v.key)
}

// Où regarder le film légalement (données JustWatch via TMDB).
export async function getProviders(movieId, region) {
  const data = await get(`/movie/${movieId}/watch/providers`)
  return data.results?.[region] ?? null
}
