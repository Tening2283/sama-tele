// Fonction serveur Vercel : chaque fichier du dossier « api/ » devient une adresse.
// Ce fichier répond donc à /api/tmdb.
// La clé est lue dans les variables d'environnement réglées sur Vercel (TMDB_API_KEY).
import { tmdbProxy } from '../server/tmdbProxy.js'

export default async function handler(req, res) {
  const query = new URL(req.url, 'http://localhost').searchParams
  const { status, body } = await tmdbProxy(query, process.env.TMDB_API_KEY)

  // Les réponses réussies sont gardées 1 h en cache par Vercel :
  // le site est plus rapide et on appelle TMDB moins souvent.
  if (status === 200) res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(status).json(body)
}
