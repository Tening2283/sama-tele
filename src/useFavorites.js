import { useEffect, useState } from 'react'

// Les favoris sont gardés dans le navigateur (localStorage) :
// ils restent après avoir fermé la page, mais seulement sur cet appareil.
const STORAGE_KEY = 'sama-tele:favoris'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return [] // stockage indisponible (navigation privée…) ou contenu abîmé
  }
}

// On ne garde que ce qui sert à afficher le film (pas toute la réponse TMDB).
function keepUseful(movie) {
  const { id, title, original_title, release_date, overview, poster_path, backdrop_path, vote_average, vote_count } = movie
  return { id, title, original_title, release_date, overview, poster_path, backdrop_path, vote_average, vote_count }
}

export default function useFavorites() {
  const [favorites, setFavorites] = useState(load)

  // À chaque changement, on sauvegarde.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      // pas grave : les favoris marchent quand même jusqu'à la fermeture de la page
    }
  }, [favorites])

  const isFavorite = (id) => favorites.some((f) => f.id === id)

  const toggleFavorite = (movie) =>
    setFavorites((list) =>
      list.some((f) => f.id === movie.id)
        ? list.filter((f) => f.id !== movie.id) // déjà dedans → on retire
        : [keepUseful(movie), ...list], // sinon → on ajoute en premier
    )

  return { favorites, isFavorite, toggleFavorite }
}
