import Static from './Static.jsx'
import YouTubePlayer from './YouTubePlayer.jsx'
import { IMG } from '../tmdb.js'

const FAIL_MESSAGES = {
  unavailable: 'Pas de bande-annonce disponible',
  refused: 'YouTube ne permet pas de lire cette bande-annonce ici',
  timeout: 'La vidéo ne se charge pas (connexion lente ou bloqueur de pub ?)',
  blocked: 'YouTube est bloqué (bloqueur de pub ?)',
}

// La télé : affiche la bande-annonce (YouTube officiel) ou l'affiche du film.
export default function Tv({ movie, trailerKeys, trailerError, onTrailerFail, loading, error, channel, typed, muted, onToggleMute, onMutedChange, onNext, onPrev }) {
  let screen
  if (loading) {
    screen = <Static />
  } else if (error) {
    screen = <div className="screen-msg">{error}</div>
  } else if (!movie) {
    screen = <div className="screen-msg">Choisis un pays pour allumer la télé 📺</div>
  } else if (trailerKeys.length && !trailerError) {
    screen = <YouTubePlayer videoKeys={trailerKeys} muted={muted} onFail={onTrailerFail} onMutedChange={onMutedChange} />
  } else {
    const bg = movie.backdrop_path || movie.poster_path
    const reason = trailerError || 'unavailable'
    screen = (
      <div className="screen-poster">
        {bg && <img src={`${IMG}/w780${bg}`} alt={movie.title} />}
        <span className="no-trailer">
          {FAIL_MESSAGES[reason]}
          {trailerKeys[0] && (
            <>
              {' · '}
              <a href={`https://www.youtube.com/watch?v=${trailerKeys[0]}`} target="_blank" rel="noreferrer">
                Voir sur YouTube
              </a>
            </>
          )}
        </span>
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
          </div>
        </div>
        <div className="panel">
          <div className="brand">TÉLÉ MONDE</div>
          <div className={`channel-display${movie || typed ? '' : ' off'}`} aria-label="Numéro de chaîne" aria-live="polite">
            {typed === 'ERR' ? 'ERR' : typed ? `CH ${typed.padEnd(2, '_')}` : `CH ${movie ? String(channel).padStart(2, '0') : '--'}`}
          </div>
          <button className="knob" onClick={onPrev} disabled={loading} title="Chaîne précédente (←)" aria-label="Chaîne précédente">
            ◀
          </button>
          <button className="knob" onClick={onNext} disabled={loading} title="Chaîne suivante (→)" aria-label="Chaîne suivante">
            ▶
          </button>
          <button
            className="knob sound"
            onClick={onToggleMute}
            aria-pressed={!muted}
            title={muted ? 'Remettre le son (M)' : 'Couper le son (M)'}
            aria-label={muted ? 'Remettre le son' : 'Couper le son'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <span className={`sound-label${muted ? ' off' : ''}`} aria-hidden="true">
            {muted ? 'MUET' : 'SON'}
          </span>
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
