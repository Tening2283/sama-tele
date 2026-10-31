import { useEffect, useMemo, useRef, useState } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import world from 'world-atlas/countries-110m.json'
import { ZONES } from '../countries.js'

const WIDTH = 960
const HEIGHT = 470
const MARGIN = 16

// world-atlas donne les frontières en « TopoJSON » (format compact).
// topojson-client les transforme en formes géographiques (GeoJSON).
// On enlève l'Antarctique (010) : pas de films, et ça prend beaucoup de place.
const shapes = feature(world, world.objects.countries).features.filter((f) => f.id !== '010')

// Calcule le tracé SVG de chaque pays pour une zone donnée.
//   - La « projection » transforme la Terre ronde (longitude, latitude) en dessin plat (x, y).
//   - fitExtent l'agrandit pour que la zone remplisse notre rectangle (c'est le zoom).
//   - geoPath transforme chaque pays en tracé SVG (l'attribut « d » d'un <path>).
function drawZone(zone) {
  const box = ZONES[zone]
  let target = { type: 'FeatureCollection', features: shapes } // Monde : toute la carte
  if (box) {
    const [w, s, e, n] = box
    // Les 4 coins + le milieu des bords de la zone.
    target = { type: 'MultiPoint', coordinates: [[w, s], [e, s], [w, n], [e, n], [(w + e) / 2, s], [(w + e) / 2, n], [w, (s + n) / 2], [e, (s + n) / 2]] }
  }
  const projection = geoNaturalEarth1().fitExtent([[MARGIN, MARGIN], [WIDTH - MARGIN, HEIGHT - MARGIN]], target)
  const toSvgPath = geoPath(projection)
  return shapes.map((f, i) => {
    const [x, y] = toSvgPath.centroid(f) // centre du pays sur le dessin
    const visible = x >= 0 && x <= WIDTH && y >= 0 && y <= HEIGHT
    return { key: f.id ?? `sans-code-${i}`, num: f.id, d: toSvgPath(f), visible }
  })
}

// Les pays de notre liste sont en couleur et cliquables, les autres restent gris.
export default function WorldMap({ countries, selected, onSelect }) {
  const [zone, setZone] = useState('Monde')
  const [hovered, setHovered] = useState(null)
  const paths = useMemo(() => drawZone(zone), [zone]) // recalculé seulement quand on change de zone
  const byNum = Object.fromEntries(countries.map((c) => [c.num, c]))
  const selectedCountry = countries.find((c) => c.code === selected)

  // Pays choisi dans le menu mais pas visible sur la carte → on zoome sur son continent.
  // Seulement quand le PAYS change : si c'est la zone qui change (clic sur « Asie »…),
  // on ne force rien, sinon on ne pourrait jamais quitter le continent du pays choisi.
  const selectedVisible = paths.find((p) => p.num === selectedCountry?.num)?.visible
  const lastSelected = useRef(selected)
  useEffect(() => {
    if (selected === lastSelected.current) return
    lastSelected.current = selected
    if (selectedCountry && selectedVisible === false) setZone(selectedCountry.zone)
  }, [selected, selectedCountry, selectedVisible])

  // Le pays choisi est dessiné en dernier pour que son contour passe au-dessus des voisins.
  const ordered = [...paths].sort((a, b) => (byNum[a.num]?.code === selected) - (byNum[b.num]?.code === selected))
  const caption = hovered?.name ?? selectedCountry?.name

  return (
    <figure className="world-map">
      <div className="zones" role="group" aria-label="Zoomer sur un continent">
        {Object.keys(ZONES).map((z) => (
          <button key={z} className={z === zone ? 'on' : ''} aria-pressed={z === zone} onClick={() => setZone(z)}>
            {z}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="group" aria-label="Carte du monde : clique sur un pays en couleur">
        {ordered.map(({ key, num, d }) => {
          const country = byNum[num]
          if (!country) return <path key={key} d={d} className="land" />
          const choose = () => onSelect(country.code)
          return (
            <path
              key={key}
              d={d}
              className={`land playable${country.code === selected ? ' selected' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={country.name}
              aria-pressed={country.code === selected}
              onClick={choose}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  choose()
                }
              }}
              onMouseEnter={() => setHovered(country)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(country)}
              onBlur={() => setHovered(null)}
            >
              <title>{country.name}</title>
            </path>
          )
        })}
      </svg>
      <figcaption>{caption ?? 'Clique sur un pays en couleur'}</figcaption>
    </figure>
  )
}
