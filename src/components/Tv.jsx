import Static from './Static.jsx'
import { IMG } from '../tmdb.js'

// La télé : affiche la bande-annonce (YouTube officiel) ou l'affiche du film.
export default function Tv({ movie, trailerKey, loading, error, channel, onNext, onPrev }) {
  let screen
  if (loading) {
    screen = <Static />
  } else if (error) {
    screen = <div className="screen-msg">{error}</div>
  } else if (!movie) {
    screen = <div className="screen-msg">Choisis un pays pour allumer la télé 📺</div>
  } else if (trailerKey) {
    screen = (
      <iframe
        key={trailerKey}
        src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&rel=0&modestbranding=1`}
        title={`Bande-annonce : ${movie.title}`}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    )
  } else {
    const bg = movie.backdrop_path || movie.poster_path
    screen = (
      <div className="screen-poster">
        {bg && <img src={`${IMG}/w780${bg}`} alt={movie.title} />}
        <span className="no-trailer">Pas de bande-annonce disponible</span>
      </div>
    )
  }

  return (
    <div className="tv">
      <div className="antenna" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="tv-body">
        <div className="screen-frame">
          <div className="screen">
            {screen}
            <div className="scanlines" aria-hidden="true" />
            {movie && !loading && <div className="osd">CH {String(channel).padStart(2, '0')}</div>}
          </div>
        </div>
        <div className="panel">
          <div className="brand">TÉLÉ MONDE</div>
          <button className="knob" onClick={onPrev} disabled={loading} title="Chaîne précédente" aria-label="Chaîne précédente">
            ◀
          </button>
          <button className="knob" onClick={onNext} disabled={loading} title="Chaîne suivante" aria-label="Chaîne suivante">
            ▶
          </button>
          <div className="speaker" aria-hidden="true" />
        </div>
      </div>
      <div className="feet" aria-hidden="true">
        <span />
        <span />
      </div>
    </div>
  )
}
