import { useEffect, useRef, useState } from 'react'

const CHANNEL_DELAY = 1000 // temps laissé pour taper le 2e chiffre (1 puis 2 → chaîne 12)

// Télécommande au clavier.
// Renvoie ce qui est en train d'être tapé ('1', '12', 'ERR' ou '') pour l'afficher sur la télé.
export default function useRemote({ onNext, onPrev, onChannel, onFavorite, onMute, onHelp }) {
  const [typed, setTyped] = useState('')

  // On garde toujours la dernière version des fonctions dans une « ref » :
  // ainsi l'écouteur clavier est installé une seule fois, mais appelle quand même
  // les fonctions à jour (avec la bonne liste de films, le bon film…).
  const actions = useRef(null)
  actions.current = { onNext, onPrev, onChannel, onFavorite, onMute, onHelp }

  useEffect(() => {
    let digits = ''
    let timer = null

    const handleKey = (e) => {
      // Ctrl/Cmd/Alt + touche = raccourci du navigateur, on n'y touche pas.
      if (e.ctrlKey || e.metaKey || e.altKey) return
      // Dans un menu déroulant ou un champ de texte, les touches servent à ce champ.
      if (['SELECT', 'INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      const a = actions.current
      const key = e.key.toLowerCase()

      if (key === 'arrowright') a.onNext()
      else if (key === 'arrowleft') a.onPrev()
      else if (key === 'm') a.onMute()
      else if (key === 'f') a.onFavorite()
      else if (key === '?') a.onHelp()
      else if (/^[0-9]$/.test(key)) {
        // On garde les 2 derniers chiffres tapés, puis on attend un peu
        // au cas où un 2e chiffre arrive.
        digits = (digits + key).slice(-2)
        setTyped(digits)
        clearTimeout(timer)
        timer = setTimeout(() => {
          const ok = actions.current.onChannel(Number(digits))
          digits = ''
          if (ok) {
            setTyped('')
          } else {
            setTyped('ERR') // chaîne qui n'existe pas
            timer = setTimeout(() => setTyped(''), 800)
          }
        }, CHANNEL_DELAY)
      } else return // touche non utilisée : on laisse le navigateur faire

      e.preventDefault() // ex. : empêche la flèche de faire défiler la page
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      clearTimeout(timer)
    }
  }, [])

  return typed
}
