import { IMG } from '../tmdb.js'

// Rangée d'affiches des films favoris. Cliquer sur une affiche la passe à la télé.
export default function Favorites({ favorites, currentId, onPlay, onRemove }) {
  return (
    <section className="favorites">
      <h2>♥ Mes favoris {favorites.length > 0 && <span className="count">({favorites.length})</span>}</h2>
      {favorites.length === 0 ? (
        <p className="muted">Aucun favori pour l'instant. Clique sur « ♡ Ajouter aux favoris » sous un film.</p>
      ) : (
        <ul>
          {favorites.map((movie, i) => (
            <li key={movie.id} className={movie.id === currentId ? 'current' : ''}>
              <button className="fav-play" onClick={() => onPlay(i)} title={`Regarder ${movie.title}`}>
                {movie.poster_path ? (
                  <img src={`${IMG}/w185${movie.poster_path}`} alt="" />
                ) : (
                  <span className="no-poster">🎬</span>
                )}
                <span className="fav-title">{movie.title}</span>
              </button>
              <button className="fav-remove" onClick={() => onRemove(movie)} aria-label={`Retirer ${movie.title} des favoris`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
