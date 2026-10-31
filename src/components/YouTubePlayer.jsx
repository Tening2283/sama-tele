import { useEffect, useRef } from 'react'

// Charge une seule fois l'API officielle du lecteur YouTube.
let apiPromise = null
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve(window.YT)
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.onerror = () => {
        apiPromise = null
        reject(new Error('blocked'))
      }
      document.head.appendChild(script)
    })
  }
  return apiPromise
}

const LOAD_TIMEOUT = 10000 // 10 s sans réponse du lecteur → on abandonne
const SOUND_CHECK = 1000 // on vérifie l'état du son toutes les secondes
const SOUND_GRACE = 1500 // temps laissé à YouTube pour appliquer un changement de son

// Applique « muted » au lecteur. Pour remettre le son : unMute + volume à 100,
// et on relance la lecture si le navigateur l'a mise en pause.
function applySound(player, muted) {
  if (muted) {
    player.mute()
    return
  }
  player.unMute()
  player.setVolume(100)
  if (player.getPlayerState() !== 1) player.playVideo() // 1 = en lecture
}

// Lit la première vidéo qui fonctionne parmi `videoKeys`.
// Appelle onFail('refused' | 'timeout' | 'blocked') si aucune ne marche.
// Appelle onMutedChange(true/false) quand le son change DANS la vidéo
// (haut-parleur de YouTube, ou navigateur qui refuse le son).
export default function YouTubePlayer({ videoKeys, muted, onFail, onMutedChange }) {
  const host = useRef(null)
  const playerRef = useRef(null) // le lecteur, une fois prêt
  const mutedRef = useRef(muted) // valeur à jour de « muted », lue par le lecteur
  mutedRef.current = muted
  const onMutedChangeRef = useRef(onMutedChange)
  onMutedChangeRef.current = onMutedChange
  const lastSoundCommand = useRef(0) // heure du dernier changement de son demandé par l'appli

  useEffect(() => {
    let player = null
    let done = false
    let index = 0
    let soundTimer = null
    const fail = (reason) => {
      if (done) return
      console.warn(`[Télé] Bande-annonce abandonnée : ${reason}`)
      done = true
      clearTimeout(timer)
      onFail(reason)
    }
    const timer = setTimeout(() => fail('timeout'), LOAD_TIMEOUT)

    loadYouTubeApi()
      .then((YT) => {
        if (done) return
        const el = document.createElement('div')
        host.current.appendChild(el)
        player = new YT.Player(el, {
          videoId: videoKeys[0],
          playerVars: { autoplay: 1, mute: mutedRef.current ? 1 : 0, rel: 0, playsinline: 1 },
          events: {
            onReady: (e) => {
              clearTimeout(timer)
              playerRef.current = e.target
              // Le son a pu changer pendant le chargement (clic sur 🔇, touche M) :
              // on applique la valeur actuelle, sinon ce clic serait perdu.
              lastSoundCommand.current = Date.now()
              applySound(e.target, mutedRef.current)
              e.target.playVideo()

              // YouTube ne prévient pas quand le son change dans la vidéo.
              // On vérifie donc régulièrement, pour que le bouton de la télé dise la vérité.
              soundTimer = setInterval(() => {
                const p = playerRef.current
                if (!p?.isMuted || Date.now() - lastSoundCommand.current < SOUND_GRACE) return
                const reallyMuted = p.isMuted() || p.getVolume() === 0
                if (reallyMuted !== mutedRef.current) {
                  if (reallyMuted) console.warn('[Télé] Le son est coupé dans la vidéo (ou bloqué par le navigateur)')
                  onMutedChangeRef.current?.(reallyMuted)
                }
              }, SOUND_CHECK)
            },
            // Vidéo supprimée, privée ou interdite en intégration → la suivante.
            onError: (e) => {
              console.warn(`[Télé] Vidéo YouTube ${videoKeys[index]} refusée (code ${e.data}), on essaie la suivante`)
              index += 1
              if (index < videoKeys.length) player.loadVideoById(videoKeys[index])
              else fail('refused')
            },
          },
        })
      })
      .catch(() => fail('blocked'))

    return () => {
      done = true
      clearTimeout(timer)
      clearInterval(soundTimer)
      playerRef.current = null
      player?.destroy?.()
      if (host.current) host.current.innerHTML = ''
    }
  }, [videoKeys, onFail])

  // Bouton son / touche M : on agit sur le lecteur existant (sans le recréer).
  useEffect(() => {
    const player = playerRef.current
    if (!player) return // pas encore prêt : onReady appliquera la bonne valeur
    lastSoundCommand.current = Date.now()
    applySound(player, muted)
  }, [muted])

  return <div ref={host} className="yt-host" />
}
