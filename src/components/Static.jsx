import { useEffect, useRef } from 'react'

// Neige de télé (bruit) dessinée dans un canvas pendant le changement de chaîne.
export default function Static() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const w = (canvas.width = 160)
    const h = (canvas.height = 120)
    const img = ctx.createImageData(w, h)
    let frame

    const draw = () => {
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = 255
      }
      ctx.putImageData(img, 0, 0)
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])

  return <canvas ref={ref} className="static" aria-hidden="true" />
}
