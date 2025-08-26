import { useEffect, useMemo, useState, Suspense, lazy } from "react"
import { STRINGS } from "./services/i18n.js"

const WeatherPanel    = lazy(() => import("./modules/WeatherPanel.jsx"))
const DeparturesPanel = lazy(() => import("./modules/DeparturesPanel.jsx"))
const Clock           = lazy(() => import("./modules/Clock.jsx"))
const SettingsModal   = lazy(() => import("./modules/SettingsModal.jsx"))
const Screensaver     = lazy(() => import("./modules/Screensaver.jsx"))

function parseTimeToMinutes(hhmm = "00:00") {
  const [h, m] = (hhmm || "00:00").split(":").map(Number)
  return ((h || 0) * 60) + (m || 0)
}
function isWithinWindow(nowMinutes, startMin, endMin) {
  if (startMin === endMin) return false
  if (startMin < endMin) {
    return nowMinutes >= startMin && nowMinutes < endMin
  }
  return nowMinutes >= startMin || nowMinutes < endMin
}

export default function App() {
  const [settings, setSettings] = useState({
    theme: "dark",
    language: "no",
    showWeather: true,
    largeType: false,
    typeScale: 1.0,
    clock24: true,
    animatedIcons: false,
    stopPlaceId: "",
    nightModeEnabled: false,
    nightStart: "00:00",
    nightEnd: "05:00"
  })
  const [open, setOpen] = useState(false)
  const [nowMinutes, setNowMinutes] = useState(() => {
    const d = new Date(); return d.getHours() * 60 + d.getMinutes()
  })

  const [offline, setOffline] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [cameOnline, setCameOnline] = useState(false)
  const [softError, setSoftError] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem("settings")
    if (saved) {
      try { setSettings(s => ({ ...s, ...JSON.parse(saved) })) } catch {}
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme || "dark")
    const scale = settings.largeType ? Math.max(1.06, settings.typeScale || 1.0) : (settings.typeScale || 1.0)
    document.documentElement.style.setProperty("--scale-type", String(scale))
  }, [settings.theme, settings.largeType, settings.typeScale])

  useEffect(() => {
    const tick = () => {
      const d = new Date(); setNowMinutes(d.getHours() * 60 + d.getMinutes())
    }
    const id = setInterval(tick, 30 * 1000)
    return () => clearInterval(id)
  }, [])

  const nightStartMin = useMemo(() => parseTimeToMinutes(settings.nightStart), [settings.nightStart])
  const nightEndMin   = useMemo(() => parseTimeToMinutes(settings.nightEnd),   [settings.nightEnd])
  const showScreensaver = useMemo(() => {
    if (!settings.nightModeEnabled) return false
    return isWithinWindow(nowMinutes, nightStartMin, nightEndMin)
  }, [settings.nightModeEnabled, nowMinutes, nightStartMin, nightEndMin])

  const effectiveStopId = settings.stopPlaceId?.trim()
    ? settings.stopPlaceId.trim()
    : import.meta.env.VITE_STOPPLACE_ID

  useEffect(() => {
    if (!offline) {
      setCameOnline(true)
      const id = setTimeout(() => setCameOnline(false), 3000)
      return () => clearTimeout(id)
    }
  }, [offline])

  const S = STRINGS[settings.language] || STRINGS.no

  return (
    <div className="page">
      <header className="container">
        <div className="header-row">
          {/* Logo – større */}
          <div className="logo-top-right">
            <img
              src="/logo.svg"
              alt="Lysaker Info"
              style={{ height: "clamp(64px, 8vw, 160px)", display: "block", marginTop: "-12px" }}
            />
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <span
              className={`heartbeat-dot ${offline ? "is-offline" : fetching ? "is-fetching" : ""}`}
              title={offline ? S.offline : fetching ? "Fetching…" : "Idle"}
              aria-hidden="true"
            />
            {offline && (
              <span className="badge warn" style={{ fontSize:"0.9rem", padding:"4px 10px" }}>
                {S.offline}
              </span>
            )}
            {cameOnline && (
              <span className="badge ok" style={{ fontSize:"0.9rem", padding:"4px 10px" }}>
                {S.online}
              </span>
            )}
            {softError && (
              <span className="badge danger" style={{ fontSize:"0.9rem", padding:"4px 10px" }}>
                {S.error}
              </span>
            )}
            <Suspense fallback={null} className="clock-centered-top">
              <Clock clock24={settings.clock24} />
            </Suspense>
          </div>
        </div>
      </header>

      <button
        aria-label={S.settings}
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", top: 12, right: 12, zIndex: 1100,
          width: 44, height: 44, borderRadius: 12,
          background: "var(--panel-2)", color: "var(--text)",
          border: "1px solid var(--line)", cursor: "pointer",
          display: "grid", placeItems: "center"
        }}
        title={S.settings}
      >
        ⚙️
      </button>

      {showScreensaver ? (
        <Suspense fallback={null}>
          <Screensaver clock24={settings.clock24} animatedIcons={settings.animatedIcons} />
        </Suspense>
      ) : (
        <main className="container">
          {settings.showWeather && (
            <Suspense fallback={null}>
              <WeatherPanel
                language={settings.language}
                clock24={settings.clock24}
                animatedIcons={settings.animatedIcons}
                onCacheChange={(isCache) => setOffline(isCache)}
                onFetchingChange={(isFetching) => setFetching(isFetching)}
              />
            </Suspense>
          )}
          <Suspense fallback={null}>
            <DeparturesPanel
              language={settings.language}
              overrideStopPlaceId={effectiveStopId}
              clock24={settings.clock24}
              onCacheChange={(isCache) => setOffline(isCache)}
              onFetchingChange={(isFetching) => setFetching(isFetching)}
              onSoftError={(err) => setSoftError(err ? String(err) : null)}
            />
          </Suspense>
        </main>
      )}

      <footer className="container">
        <span className="muted">{S.copyright}</span>
      </footer>

      <Suspense fallback={null}>
        {open && (
          <SettingsModal
            isOpen={open}
            onClose={() => setOpen(false)}
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </Suspense>
    </div>
  )
}
