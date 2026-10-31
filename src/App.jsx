import { useCallback, useEffect, useRef, useState } from 'react'
import Tv from './components/Tv.jsx'
import MovieInfo from './components/MovieInfo.jsx'
import Favorites from './components/Favorites.jsx'
import WorldMap from './components/WorldMap.jsx'
import useFavorites from './useFavorites.js'
import useRemote from './useRemote.js'
import { COUNTRIES, DECADES, WATCH_REGIONS } from './countries.js'
import { discoverMovies, getGenres, getProviders, getTrailers, hasKey } from './tmdb.js'
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
  const [genre, setGenre] = useState('') // '' = tous les genres
  const [decade, setDecade] = useState('') // '' = toutes les époques
  const [genres, setGenres] = useState([]) // liste chargée depuis TMDB
  const [region, setRegion] = useState('FR')
  const [movies, setMovies] = useState([])
  const [index, setIndex] = useState(0)
  const [trailerKeys, setTrailerKeys] = useState([])
  const [trailerError, setTrailerError] = useState('')
  const [providers, setProviders] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(hasKey ? '' : 'Ajoute ta clé TMDB dans le fichier .env')
  const [mode, setMode] = useState('country') // 'country' = films du pays, 'favorites' = mes favoris
  const [reloadKey, setReloadKey] = useState(0) // +1 pour relancer la recherche du pays
  const { favorites, isFavorite, toggleFavorite } = useFavorites()
  const [muted, setMuted] = useState(true) // son coupé au départ (sinon les navigateurs bloquent la lecture auto)
  const [helpOpen, setHelpOpen] = useState(false)

  // Évite d'afficher le résultat d'une ancienne requête si on zappe vite.
  const requestId = useRef(0)
  const movie = movies[index] ?? null

  // Charge la bande-annonce du film affiché.
  const tune = useCallback(async (list, i) => {
    const id = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const [keys] = await Promise.all([getTrailers(list[i].id), wait(600)]) // 600 ms de neige
      if (id !== requestId.current) return
      setIndex(i)
      setTrailerKeys(keys)
      setTrailerError('')
    } catch (e) {
      if (id === requestId.current) setError(e.message)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  // Au démarrage : on charge la liste des genres une seule fois.
  useEffect(() => {
    if (hasKey) getGenres().then(setGenres).catch(() => {})
  }, [])

  // Dès que le pays, le genre ou l'époque change → nouvelle liste de films.
  useEffect(() => {
    if (!country || !hasKey) return
    setMode('country')
    const id = ++requestId.current
    setLoading(true)
    setError('')
    discoverMovies({ country, genre, decade })
      .then((found) => {
        if (id !== requestId.current) return
        const list = shuffle(found)
        setMovies(list)
        if (list.length === 0) {
          setError('Aucun film trouvé pour ces filtres.')
          setLoading(false)
        } else {
          tune(list, 0)
        }
      })
      .catch((e) => {
        if (id !== requestId.current) return
        setError(e.message)
        setLoading(false)
      })
  }, [country, genre, decade, reloadKey, tune])

  // Clic sur un favori → la télé passe sur la « chaîne Favoris ».
  // Les boutons ◀ ▶ zappent alors entre les favoris.
  const playFavorite = (i) => {
    setMode('favorites')
    setMovies(favorites)
    tune(favorites, i)
  }

  // Texte « Chaîne : … » affiché au-dessus de la télé.
  const countryName = COUNTRIES.find((c) => c.code === country)?.name
  const genreName = genres.find((g) => String(g.id) === genre)?.name
  const channelName =
    mode === 'favorites'
      ? '♥ Mes favoris'
      : [countryName, genreName, decade && `années ${decade.slice(2)}`].filter(Boolean).join(' · ')

  // Stable (useCallback) pour ne pas recréer le lecteur YouTube à chaque rendu.
  const onTrailerFail = useCallback((reason) => setTrailerError(reason), [])

  const zap = (step) => {
    if (!movies.length) return
    tune(movies, (index + step + movies.length) % movies.length)
  }

  // Télécommande au clavier (← → chiffres M F ?).
  const typed = useRemote({
    onNext: () => zap(1),
    onPrev: () => zap(-1),
    // Aller directement à une chaîne : renvoie false si elle n'existe pas (affiche « ERR »).
    onChannel: (n) => {
      if (n < 1 || n > movies.length) return false
      tune(movies, n - 1)
      return true
    },
    onFavorite: () => movie && !loading && toggleFavorite(movie),
    onMute: () => setMuted((m) => !m),
    onHelp: () => setHelpOpen((o) => !o),
  })

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
        <p>Clique sur un pays de la carte : la télé zappe sur un de ses films.</p>
      </header>

      <WorldMap countries={COUNTRIES} selected={country} onSelect={setCountry} />

      <div className="controls">
        <label>
          <span className="label-row">
            Pays du film
            {country && <img className="flag" src={`https://flagcdn.com/w40/${country.toLowerCase()}.png`} alt="" />}
          </span>
          <select value={country} onChange={(e) => setCountry(e.target.value)} disabled={!hasKey}>
            <option value="">— Choisir —</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Genre
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">Tous les genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Époque
          <select value={decade} onChange={(e) => setDecade(e.target.value)}>
            <option value="">Toutes les époques</option>
            {DECADES.map((d) => (
              <option key={d} value={d}>
                Années {String(d).slice(2)}
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

      {movie && (
        <p className="now-playing">
          Chaîne : <strong>{channelName}</strong>
          {mode === 'favorites' && country && (
            <button onClick={() => setReloadKey((k) => k + 1)}>↩ Revenir à {countryName}</button>
          )}
        </p>
      )}

      <Tv
        movie={movie}
        trailerKeys={trailerKeys}
        trailerError={trailerError}
        onTrailerFail={onTrailerFail}
        loading={loading}
        error={error}
        channel={index + 1}
        typed={typed}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
        onNext={() => zap(1)}
        onPrev={() => zap(-1)}
      />

      <details className="remote-help" open={helpOpen} onToggle={(e) => setHelpOpen(e.currentTarget.open)}>
        <summary>⌨️ Télécommande clavier (touche ?)</summary>
        <ul>
          <li><kbd>←</kbd> <kbd>→</kbd> chaîne précédente / suivante</li>
          <li><kbd>0</kbd>…<kbd>9</kbd> aller à une chaîne (ex. <kbd>1</kbd> puis <kbd>2</kbd> → CH 12)</li>
          <li><kbd>M</kbd> couper / remettre le son</li>
          <li><kbd>F</kbd> ajouter / retirer des favoris</li>
          <li><kbd>?</kbd> afficher / cacher cette aide</li>
        </ul>
        <p className="muted">Si tu as cliqué dans la vidéo, clique à côté pour que la télé reçoive à nouveau les touches.</p>
      </details>

      {!loading && !error && (
        <MovieInfo
          movie={movie}
          providers={providers}
          region={region}
          isFavorite={movie ? isFavorite(movie.id) : false}
          onToggleFavorite={() => toggleFavorite(movie)}
        />
      )}

      <Favorites
        favorites={favorites}
        currentId={mode === 'favorites' ? movie?.id : null}
        onPlay={playFavorite}
        onRemove={toggleFavorite}
      />

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
