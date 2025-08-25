import { useEffect, useState } from 'react'
import { fetchWeather } from '../services/met'
import { useRowFit } from '../hooks/useRowFit'
import { WeatherIcon } from './Icons'
import { STRINGS } from '../services/i18n.js'


const LAT = parseFloat(import.meta.env.VITE_LAT) || 59.9142;
const LON = parseFloat(import.meta.env.VITE_LON) || 10.7500;


const CACHE_KEY = "weatherCache"
const NORMAL_INTERVAL = 5 * 60 * 1000
const BACKOFF_STEPS = [5000, 15000, 30000] // 5s → 15s → 30s

const localeFor = (lang) => (lang === "en" ? "en-GB" : "no-NO")
const fmtTimeFactory = (lang, clock24) => (t) =>
  new Date(t).toLocaleTimeString(localeFor(lang), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !clock24
  })

export default function WeatherPanel({
  language = "no",
  clock24 = true,
  animatedIcons = false,
  onCacheChange,
  onFetchingChange
}) {
  const S = STRINGS[language] || STRINGS.no
  const fmtTime = fmtTimeFactory(language, clock24)

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [lastUpdatedTs, setLastUpdatedTs] = useState(null) // number | null
  const [isCache, setIsCache] = useState(false)

  const [bodyRef, rowsThatFit, measure] = useRowFit()

  useEffect(() => {
    let alive = true
    let failCount = 0
    let timeoutId = null

    const poll = async () => {
      if (!alive) return
      try {
        onFetchingChange?.(true)
        setError(null)

        const json = await fetchWeather({ lat: LAT, lon: LON })
        if (!alive) return

        setData(json)
        setLastUpdatedTs(Date.now())
        setIsCache(false)
        onCacheChange?.(false)

        // cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: json }))

        requestAnimationFrame(measure)
        failCount = 0
        timeoutId = setTimeout(poll, NORMAL_INTERVAL)
      } catch (e) {
        if (!alive) return
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { ts, data } = JSON.parse(cached)
          setData(data)
          setLastUpdatedTs(ts)
          setIsCache(true)
          onCacheChange?.(true)
        } else {
          setError((e && e.message) || S.error)
          onCacheChange?.(false)
        }
        requestAnimationFrame(measure)
        const delay = BACKOFF_STEPS[Math.min(failCount, BACKOFF_STEPS.length - 1)]
        failCount++
        timeoutId = setTimeout(poll, delay)
      } finally {
        onFetchingChange?.(false)
      }
    }

    poll()
    return () => { alive = false; if (timeoutId) clearTimeout(timeoutId) }
  }, [measure, onCacheChange, onFetchingChange, language, clock24])

  const series = data?.properties?.timeseries ?? []
  const items = series.slice(0, rowsThatFit)

  const updatedLabel = lastUpdatedTs
    ? `${(S.updated || "Updated")} ${fmtTime(lastUpdatedTs)}${isCache ? " (cache)" : ""}`
    : ""

  return (
    <section className="card">
      <div className="card-header">
        <h2>{S.weather}</h2>
        <div className="updated">{updatedLabel}</div>
      </div>

      <div ref={bodyRef} className="panel-body">
        <div className="list">
          {!data && !error && <div className="loading">{S.loadingWeather}</div>}
          {error && <div className="error">{error}</div>}
          {data && items.length === 0 && <div className="error">{S.noWeather}</div>}

          {items.map((it) => {
            const t = it.time
            const d = it.data?.instant?.details ?? {}
            const sym = it.data?.next_1_hours?.summary?.symbol_code
            const temp = d.air_temperature
            const wind = d.wind_speed
            const precip = it.data?.next_1_hours?.details?.precipitation_amount

            return (
              <div className="row" key={t}>
                <div className="icon" aria-hidden="true">
                  <WeatherIcon code={sym} size={28} animated={animatedIcons} />
                </div>
                <div className="time">{fmtTime(t)}</div>
                <div className="line-pill">{Math.round(temp)}°C</div>
                <div>
                  <div className="title">{(sym || '').replaceAll('_',' ')}</div>
                  <div className="meta">
                    {(language === "en" ? "wind" : "vind")} {Math.round(wind ?? 0)} m/s
                    {precip != null ? ` · ${precip} mm` : ''}
                  </div>
                </div>
                <div><span className="badge">MET</span></div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
