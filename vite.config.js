import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { tmdbProxy } from './server/tmdbProxy.js'

// En local (npm run dev), ce petit plugin joue le rôle de la fonction Vercel api/tmdb.js :
// il répond à /api/tmdb avec le même code (server/tmdbProxy.js).
function localTmdbApi(apiKey) {
  return {
    name: 'local-tmdb-api',
    configureServer(server) {
      server.middlewares.use('/api/tmdb', async (req, res) => {
        const query = new URL(req.url, 'http://localhost').searchParams
        const { status, body } = await tmdbProxy(query, apiKey)
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Lit le fichier .env. Le 3e argument '' = toutes les variables, pas seulement VITE_…
  // TMDB_API_KEY ne commence PAS par VITE_ : Vite ne l'envoie donc jamais au navigateur.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localTmdbApi(env.TMDB_API_KEY)],
  }
})
