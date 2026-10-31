import { IMG } from '../tmdb.js'

const KINDS = [
  ['flatrate', 'Abonnement'],
  ['free', 'Gratuit'],
  ['ads', 'Gratuit avec pub'],
  ['rent', 'Location'],
  ['buy', 'Achat'],
]

export default function MovieInfo({ movie, providers, region }) {
  if (!movie) return null
  const year = movie.release_date?.slice(0, 4)

  return (
    <section className="info">
      {movie.poster_path && (
        <img className="poster" src={`${IMG}/w342${movie.poster_path}`} alt={`Affiche de ${movie.title}`} />
      )}
      <div>
        <h2>
          {movie.title} {year && <span className="year">({year})</span>}
        </h2>
        {movie.original_title !== movie.title && <p className="original">{movie.original_title}</p>}
        {movie.vote_count > 0 && (
          <p className="rating">
            ★ {movie.vote_average.toFixed(1)}/10 · {movie.vote_count} votes
          </p>
        )}
        <p>{movie.overview || 'Pas de résumé en français pour ce film.'}</p>

        <h3>Où le regarder légalement ({region})</h3>
        {providers ? (
          <>
            {KINDS.map(([kind, label]) =>
              providers[kind]?.length ? (
                <div key={kind} className="providers">
                  <span>{label} :</span>
                  {providers[kind].map((p) => (
                    <img
                      key={p.provider_id}
                      src={`${IMG}/w92${p.logo_path}`}
                      alt={p.provider_name}
                      title={p.provider_name}
                    />
                  ))}
                </div>
              ) : null,
            )}
            <a href={providers.link} target="_blank" rel="noreferrer">
              Voir toutes les offres →
            </a>
          </>
        ) : (
          <p className="muted">Aucune offre connue dans ce pays.</p>
        )}
      </div>
    </section>
  )
}
