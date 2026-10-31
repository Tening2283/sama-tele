import { useCallback, useEffect, useRef, useState } from 'react'
import Tv from './components/Tv.jsx'
import MovieInfo from './components/MovieInfo.jsx'
import { COUNTRIES, WATCH_REGIONS } from './countries.js'
import { discoverByCountry, getProviders, getTrailer, hasKey } from './tmdb.js'
import './App.css'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('FR')
  const [movies, setMovies] = useState([])
  const [index, setIndex] = useState(0)
  const [trailerKey, setTrailerKey] = useState(null)
  const [providers, setProviders] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(hasKey ? '' : 'Ajoute ta clé TMDB dans le fichier .env')

  // Évite d'afficher le résultat d'une ancienne requête si on zappe vite.
  const requestId = useRef(0)
  const movie = movies[index] ?? null

  // Charge la bande-annonce du film affiché.
  const tune = useCallback(async (list, i) => {
    const id = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const [key] = await Promise.all([getTrailer(list[i].id), wait(600)]) // 600 ms de neige
      if (id !== requestId.current) return
      setIndex(i)
      setTrailerKey(key)
    } catch (e) {
      if (id === requestId.current) setError(e.message)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  // Nouveau pays → nouvelle liste de films.
  const chooseCountry = async (code) => {
    setCountry(code)
    if (!code || !hasKey) return
    const id = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const list = shuffle(await discoverByCountry(code))
      if (id !== requestId.current) return
      setMovies(list)
      if (list.length === 0) {
        setError('Aucun film trouvé pour ce pays.')
        setLoading(false)
        return
      }
      tune(list, 0)
    } catch (e) {
      if (id === requestId.current) {
        setError(e.message)
        setLoading(false)
      }
    }
  }

  const zap = (step) => {
    if (!movies.length) return
    tune(movies, (index + step + movies.length) % movies.length)
  }

  // Offres légales : rechargées quand le film ou le pays du spectateur change.
  useEffect(() => {
    if (!movie) return
    let cancelled = false
    setProviders(null)
    getProviders(movie.id, region)
      .then((p) => !cancelled && setProviders(p))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [movie, region])

  return (
    <div className="app">
      <header>
        <h1>📺 Télé Monde</h1>
        <p>Choisis un pays, la télé zappe sur un de ses films.</p>
      </header>

      <div className="controls">
        <label>
          Pays du film
          <select value={country} onChange={(e) => chooseCountry(e.target.value)} disabled={!hasKey}>
            <option value="">— Choisir —</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Je regarde depuis
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {WATCH_REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Tv
        movie={movie}
        trailerKey={trailerKey}
        loading={loading}
        error={error}
        channel={index + 1}
        onNext={() => zap(1)}
        onPrev={() => zap(-1)}
      />

      {!loading && !error && <MovieInfo movie={movie} providers={providers} region={region} />}

      <footer>
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="tmdb">
          TMDB
        </a>
        <p>
          This product uses the TMDB API but is not endorsed or certified by TMDB.
          <br />
          Données « où regarder » fournies par{' '}
          <a href="https://www.justwatch.com" target="_blank" rel="noreferrer">
            JustWatch
          </a>
          . Les bandes-annonces sont lues depuis YouTube.
        </p>
      </footer>
    </div>
  )
}
