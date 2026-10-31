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

// Lit la première vidéo qui fonctionne parmi `videoKeys`.
// Appelle onFail('refused' | 'timeout' | 'blocked') si aucune ne marche.
export default function YouTubePlayer({ videoKeys, onFail }) {
  const host = useRef(null)

  useEffect(() => {
    let player = null
    let done = false
    let index = 0
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
          playerVars: { autoplay: 1, mute: 1, rel: 0, playsinline: 1 },
          events: {
            onReady: (e) => {
              clearTimeout(timer)
              e.target.playVideo()
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
      player?.destroy?.()
      if (host.current) host.current.innerHTML = ''
    }
  }, [videoKeys, onFail])

  return <div ref={host} className="yt-host" />
}
