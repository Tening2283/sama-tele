// Intermédiaire entre le navigateur et TMDB.
// Il tourne CÔTÉ SERVEUR : la clé TMDB n'est jamais envoyée au navigateur.
//
//   Navigateur → /api/tmdb?path=/discover/movie&with_origin_country=SN
//   Serveur    → https://api.themoviedb.org/3/discover/movie?with_origin_country=SN&api_key=…
//
// Utilisé à deux endroits :
//   - en local (npm run dev) par le petit plugin dans vite.config.js
//   - en ligne par la fonction Vercel api/tmdb.js

// Seules les adresses dont l'appli a besoin sont autorisées.
// Sinon, n'importe qui pourrait utiliser notre serveur (et notre clé) pour tout TMDB.
const ALLOWED = [
  /^\/discover\/movie$/,
  /^\/genre\/movie\/list$/,
  /^\/movie\/\d+\/videos$/,
  /^\/movie\/\d+\/watch\/providers$/,
]

// query : les paramètres reçus du navigateur (URLSearchParams)
// apiKey : la clé TMDB, lue dans les variables d'environnement du serveur
// Renvoie { status, body } : le code HTTP et le JSON à renvoyer au navigateur.
export async function tmdbProxy(query, apiKey) {
  if (!apiKey) {
    return { status: 500, body: { error: 'Clé TMDB manquante : ajoute TMDB_API_KEY dans .env (ou dans les réglages Vercel).' } }
  }

  const path = query.get('path') ?? ''
  if (!ALLOWED.some((re) => re.test(path))) {
    return { status: 400, body: { error: `Adresse TMDB non autorisée : ${path}` } }
  }

  const url = new URL(`https://api.themoviedb.org/3${path}`)
  for (const [k, v] of query) if (k !== 'path') url.searchParams.set(k, v)
  url.searchParams.set('api_key', apiKey) // ajoutée ici, côté serveur seulement

  try {
    const res = await fetch(url)
    const body = await res.json()
    if (res.status === 401) return { status: 401, body: { error: 'Clé TMDB invalide (vérifie TMDB_API_KEY).' } }
    return { status: res.status, body }
  } catch {
    return { status: 502, body: { error: 'TMDB ne répond pas.' } }
  }
}
