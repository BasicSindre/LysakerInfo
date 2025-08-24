import { useEffect, useState } from "react"
import { formatTime } from "../utils/time"
import { WeatherIcon } from "./Icons"
import { fetchWeather } from "../services/met"

const LAT = parseFloat(import.meta.env.VITE_LAT)
const LON = parseFloat(import.meta.env.VITE_LON)

export default function Screensaver({ clock24 = true, animatedIcons = false }) {
  const [now, setNow] = useState(new Date())
  const [wx, setWx] = useState({ symbol: null, temp: null })
  const [error, setError] = useState(null)

  // Klokke tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Hent vær hver 10. minutt
  useEffect(() => {
    let alive = true
    async function load() {
      try {
        setError(null)
        const json = await fetchWeather({ lat: LAT, lon: LON })
        if (!alive) return
        const ts = json?.properties?.timeseries?.[0]
        const symbol = ts?.data?.next_1_hours?.summary?.symbol_code
        const temp = ts?.data?.instant?.details?.air_temperature
        setWx({ symbol: symbol || null, temp: typeof temp === "number" ? Math.round(temp) : null })
      } catch (e) {
        if (!alive) return
        setError(e.message ?? "Kunne ikke hente vær")
      }
    }
    load()
    const id = setInterval(load, 10 * 60 * 1000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  const dateStr = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(now)

  return (
    <main
      className="container"
      style={{
        height: "100%",
        display: "grid",
        placeItems: "center"
      }}
    >
      {/* Ambient bakgrunns-prikker */}
      <div className="idle-ambient" aria-hidden="true" />

      <div
        className="screensaver-card"
        style={{
          display: "grid",
          gap: "18px",
          placeItems: "center",
          textAlign: "center",
          padding: "clamp(18px, 4vw, 36px)",
          background: "linear-gradient(180deg, var(--panel), var(--panel-2))",
          border: "1px solid var(--line)",
          borderRadius: "22px",
          boxShadow: "0 18px 48px rgba(0,0,0,.25)",
          minWidth: "min(92vw, 920px)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Glød i kortet */}
        <div className="idle-card-glow" aria-hidden="true" />

        <div style={{ display: "grid", gap: "8px", placeItems: "center" }}>
          <div style={{ fontSize: "clamp(2.6rem, 10vw, 8rem)", lineHeight: 1, fontWeight: 800 }}>
            {formatTime(now, clock24)}
          </div>
          <div className="muted" style={{ fontSize: "clamp(1rem, 2.4vw, 1.5rem)" }}>
            {dateStr}
          </div>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginTop: "6px"
        }}>
          <div className="icon" aria-hidden="true" style={{ width: 56, height: 56 }}>
            <WeatherIcon code={wx.symbol} size={32} animated={animatedIcons} />
          </div>
          <div style={{ display: "grid", textAlign: "left" }}>
            <div className="title" style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)" }}>
              {wx.temp != null ? `${wx.temp}°C` : "—"}
            </div>
            <div className="meta" style={{ textTransform: "capitalize" }}>
              {wx.symbol ? wx.symbol.replaceAll("_", " ") : (error ? "—" : "Henter vær…")}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
