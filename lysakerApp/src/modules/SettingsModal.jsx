import { useEffect, useRef, useState, useMemo } from "react"
import { STRINGS } from "../services/i18n.js"

const THEMES = ["dark", "light", "autumn", "red"]

// Små fargeprøver til temakort
const THEME_PREVIEW = {
  dark:   { panel:"#171d32", panel2:"#141a2c", line:"#2a3556", text:"#f2f4fa", bg1:"#121936", bg2:"#0f1320" },
  light:  { panel:"#ffffff", panel2:"#f3f6fc", line:"#cfd6e6", text:"#111111", bg1:"#ffffff", bg2:"#e9edf6" },
  autumn: { panel:"#332018", panel2:"#2a1712", line:"#52322a", text:"#f6eae2", bg1:"#402018", bg2:"#241410" },
  red:    { panel:"#2d0a0d", panel2:"#24070a", line:"#5a1f25", text:"#fbe9ec", bg1:"#2a0508", bg2:"#200305" },
}

// Lokale tekster for innstillinger (ikke i hoved-STRINGS)
const UI = {
  no: {
    title: "Innstillinger",
    appearance: "Utseende",
    display: "Visning",
    data: "Data",
    theme: "Tema",
    language: "Språk",
    norwegian: "Norsk",
    english: "English",
    typography: "Typografi",
    largeType: "Stor typografi",
    textSize: "Tekststørrelse",
    small: "Liten",
    normal: "Normal",
    large: "Stor",
    icons: "Ikoner",
    animatedWeatherIcons: "Animerte værikoner",
    panels: "Paneler",
    showWeather: "Vis værmelding",
    clock24: "24-timers klokke",
    nightMode: "Nattmodus (skjermsparer)",
    nightEnable: "Aktiver nattmodus",
    start: "Start",
    end: "Slutt",
    stopPlace: "Stoppested ID",
    cancel: "Avbryt",
    save: "Lagre",
    legendTitle: "Statusindikator",
    legendIdle: "Idle – venter på neste oppdatering",
    legendFetch: "Henter data nå",
    legendOffline: "Offline – viser cachede data"
  },
  en: {
    title: "Settings",
    appearance: "Appearance",
    display: "Display",
    data: "Data",
    theme: "Theme",
    language: "Language",
    norwegian: "Norwegian",
    english: "English",
    typography: "Typography",
    largeType: "Large typography",
    textSize: "Text size",
    small: "Small",
    normal: "Normal",
    large: "Large",
    icons: "Icons",
    animatedWeatherIcons: "Animated weather icons",
    panels: "Panels",
    showWeather: "Show weather",
    clock24: "24-hour clock",
    nightMode: "Night mode (screensaver)",
    nightEnable: "Enable night mode",
    start: "Start",
    end: "End",
    stopPlace: "Stop place ID",
    cancel: "Cancel",
    save: "Save",
    legendTitle: "Status indicator",
    legendIdle: "Idle – waiting for next update",
    legendFetch: "Fetching data",
    legendOffline: "Offline – showing cached data"
  }
}

// Fast dimensjon på modalinnhold (hopper ikke mellom seksjoner)
const MODAL_W = 920
const MODAL_H = 560
const NAV_W   = 220

export default function SettingsModal({ isOpen, onClose, settings, setSettings }) {
  // Kjør ALLTID hooks i samme rekkefølge – vi skjuler modalen via CSS når den er lukket.
  const [local, setLocal] = useState({
    typeScale: 1.0,
    animatedIcons: false,
    nightModeEnabled: false,
    nightStart: "00:00",
    nightEnd: "05:00",
    language: "no",
    ...settings
  })
  const [section, setSection] = useState("appearance")
  const originalThemeRef = useRef(settings.theme || "dark")

  useEffect(() => {
    setLocal(prev => ({
      typeScale: 1.0,
      animatedIcons: false,
      nightModeEnabled: false,
      nightStart: "00:00",
      nightEnd: "05:00",
      language: "no",
      ...prev,
      ...settings
    }))
    originalThemeRef.current = settings.theme || "dark"
  }, [settings])

  const lang = local.language || settings.language || "no"
  const T = UI[lang] || UI.no
  // STRINGS S brukes ev. hvis du vil vise globale tekster her inne
  // const S = STRINGS[lang] || STRINGS.no

  const save = () => {
    setSettings(local)
    localStorage.setItem("settings", JSON.stringify(local))
    onClose()
  }

  const handleCancel = () => {
    // Revert live preview av tema/typografi ved Avbryt
    document.documentElement.setAttribute("data-theme", settings.theme || "dark")
    const scale = settings.largeType
      ? Math.max(1.06, Number(settings.typeScale || 1.0))
      : Number(settings.typeScale || 1.0)
    document.documentElement.style.setProperty("--scale-type", String(scale))
    setLocal(settings)
    onClose()
  }

  // Live preview – tema
  const previewTheme = (t) => {
    setLocal({ ...local, theme: t })
    document.documentElement.setAttribute("data-theme", t)
  }
  // Live preview – typografi
  const previewLargeType = (checked) => {
    const scale = checked ? Math.max(1.06, Number(local.typeScale || 1.0)) : 1.0
    const next = { ...local, largeType: checked, typeScale: scale }
    setLocal(next)
    document.documentElement.style.setProperty("--scale-type", String(scale))
  }
  const previewTypeScale = (value) => {
    const n = Number(value)
    setLocal({ ...local, typeScale: n, largeType: n > 1.02 })
    document.documentElement.style.setProperty("--scale-type", String(n))
  }

  // Toggle-komponent
  const Toggle = ({ checked, onChange }) => (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange}/>
      <span className="slider"></span>
    </label>
  )

  // Tema-kort
  const ThemeCard = ({ name, selected, onClick }) => {
    const p = THEME_PREVIEW[name]
    return (
      <button
        onClick={onClick}
        aria-label={`${T.theme}: ${name}`}
        style={{
          width: 132, height: 96,
          borderRadius: 12,
          border: selected ? "3px solid var(--ok)" : "1px solid var(--line)",
          cursor: "pointer",
          overflow: "hidden",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 8,
          background: `radial-gradient(600px 400px at 15% 0%, ${p.bg1} 0%, ${p.bg2} 60%)`,
          color: p.text
        }}
      >
        <div
          style={{
            flex: 1,
            borderRadius: 8,
            border: `1px solid ${p.line}`,
            background: `linear-gradient(180deg, ${p.panel}, ${p.panel2})`
          }}
          aria-hidden="true"
        />
        <span style={{ fontSize: ".8rem", marginTop: 6, textTransform: "capitalize" }}>
          {name}
        </span>
      </button>
    )
  }

  // Sidemeny-knapp
  const NavBtn = ({ id, label }) => (
    <button
      onClick={() => setSection(id)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 10,
        border: section === id ? "2px solid var(--ok)" : "1px solid var(--line)",
        background: section === id ? "var(--glass)" : "transparent",
        color: "var(--text)",
        cursor: "pointer",
        fontWeight: 600
      }}
    >
      {label}
    </button>
  )

  // ===== Innhold pr. seksjon =====
  const AppearancePane = (
    <div style={{ display:"grid", gap:16 }}>
      <div>
        <h3 style={{ margin:"0 0 8px 0" }}>{T.theme}</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {THEMES.map(t => (
            <ThemeCard
              key={t}
              name={t}
              selected={local.theme === t}
              onClick={() => previewTheme(t)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ margin:"12px 0 8px 0" }}>{T.language}</h3>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button
            onClick={() => setLocal({ ...local, language: "no" })}
            style={{
              padding:"8px 12px", borderRadius:8,
              border: (local.language === "no") ? "2px solid var(--ok)" : "1px solid var(--line)",
              background: (local.language === "no") ? "var(--glass)" : "transparent",
              color:"var(--text)", cursor:"pointer", fontWeight:600
            }}
          >{T.norwegian}</button>
          <button
            onClick={() => setLocal({ ...local, language: "en" })}
            style={{
              padding:"8px 12px", borderRadius:8,
              border: (local.language === "en") ? "2px solid var(--ok)" : "1px solid var(--line)",
              background: (local.language === "en") ? "var(--glass)" : "transparent",
              color:"var(--text)", cursor:"pointer", fontWeight:600
            }}
          >{T.english}</button>
        </div>
      </div>

      <div>
        <h3 style={{ margin:"12px 0 8px 0" }}>{T.typography}</h3>
        <div style={{ display:"grid", gap:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span>{T.largeType}</span>
            <Toggle
              checked={!!local.largeType}
              onChange={(e)=>previewLargeType(e.target.checked)}
            />
          </div>

          <div>
            <label style={{ display:"block", color:"var(--muted)", marginBottom:6 }}>
              {T.textSize}
              <span style={{ marginLeft:8, color:"var(--text)" }}>
                {(local.typeScale ?? 1.0).toFixed(2)}×
              </span>
            </label>
            <input
              type="range"
              min={0.90} max={1.20} step={0.02}
              value={local.typeScale ?? 1.0}
              onChange={(e)=>previewTypeScale(e.target.value)}
              style={{ width:"100%" }}
            />
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--muted)" }}>
              <span>{T.small}</span><span>{T.normal}</span><span>{T.large}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ margin:"12px 0 8px 0" }}>{T.icons}</h3>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span>{T.animatedWeatherIcons}</span>
          <Toggle
            checked={!!local.animatedIcons}
            onChange={(e)=>{
              const v = e.target.checked
              setLocal({...local, animatedIcons: v})
              // Live preview i appen (ikke nødvendig å lagre først)
              setSettings(s => ({ ...s, animatedIcons: v }))
            }}
          />
        </div>
      </div>
    </div>
  )

  const DisplayPane = (
    <div style={{ display:"grid", gap:16 }}>
      <h3 style={{ margin:"0 0 8px 0" }}>{T.panels}</h3>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>{T.showWeather}</span>
        <Toggle
          checked={!!local.showWeather}
          onChange={e=>{
            const v = e.target.checked
            setLocal({...local, showWeather: v})
            setSettings(s => ({ ...s, showWeather: v }))
          }}
        />
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>{T.clock24}</span>
        <Toggle
          checked={!!local.clock24}
          onChange={e=>{
            const v = e.target.checked
            setLocal({...local, clock24: v})
            setSettings(s => ({ ...s, clock24: v }))
          }}
        />
      </div>

      <h3 style={{ margin:"12px 0 8px 0" }}>{T.nightMode}</h3>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>{T.nightEnable}</span>
        <Toggle
          checked={!!local.nightModeEnabled}
          onChange={e=>{
            const v = e.target.checked
            setLocal({...local, nightModeEnabled: v})
            setSettings(s => ({ ...s, nightModeEnabled: v }))
          }}
        />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, opacity: local.nightModeEnabled ? 1 : .5 }}>
        <label style={{ display:"grid", gap:6 }}>
          <span className="muted">{T.start}</span>
          <input
            type="time"
            value={local.nightStart || "00:00"}
            onChange={e=>{
              const v = e.target.value || "00:00"
              setLocal({...local, nightStart: v})
              setSettings(s => ({ ...s, nightStart: v }))
            }}
            style={{
              background:"var(--panel-2)", color:"var(--text)",
              border:"1px solid var(--line)", borderRadius:8, padding:"6px 8px"
            }}
            disabled={!local.nightModeEnabled}
          />
        </label>

        <label style={{ display:"grid", gap:6 }}>
          <span className="muted">{T.end}</span>
          <input
            type="time"
            value={local.nightEnd || "05:00"}
            onChange={e=>{
              const v = e.target.value || "05:00"
              setLocal({...local, nightEnd: v})
              setSettings(s => ({ ...s, nightEnd: v }))
            }}
            style={{
              background:"var(--panel-2)", color:"var(--text)",
              border:"1px solid var(--line)", borderRadius:8, padding:"6px 8px"
            }}
            disabled={!local.nightModeEnabled}
          />
        </label>
      </div>

      {/* Heartbeat legend */}
      <div style={{
        marginTop:8,
        padding:"10px 12px",
        border:"1px solid var(--line)",
        borderRadius:8,
        background:"var(--panel-2)",
        display:"grid", gap:8
      }}>
        <h4 style={{margin:"0 0 4px 0", fontSize:"1rem"}}>{T.legendTitle}</h4>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <span className="heartbeat-dot" />
          <span className="muted">{T.legendIdle}</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <span className="heartbeat-dot is-fetching" />
          <span className="muted">{T.legendFetch}</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <span className="heartbeat-dot is-offline" />
          <span className="muted">{T.legendOffline}</span>
        </div>
      </div>
    </div>
  )

  const DataPane = (
    <div style={{ display:"grid", gap:16 }}>
      <h3 style={{ margin:"0 0 8px 0" }}>{T.data}</h3>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
        <span>{T.stopPlace}</span>
        <input
          type="text"
          value={local.stopPlaceId || ""}
          onChange={e=>setLocal({...local, stopPlaceId:e.target.value})}
          placeholder="NSR:StopPlace:582"
          style={{
            background:"var(--panel-2)", color:"var(--text)",
            border:"1px solid var(--line)", borderRadius:8, padding:"6px 8px",
            width: 240
          }}
        />
      </div>
    </div>
  )

  const Content = useMemo(() => {
    if (section === "appearance") return AppearancePane
    if (section === "display")    return DisplayPane
    return DataPane
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, local, settings, lang])

  // I stedet for å returnere null: vi skjuler hele overlegg når lukket
  const overlayStyle = isOpen
    ? {}
    : { display: "none" }

  return (
    <div
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"rgba(0,0,0,0.55)",
        display:"flex", justifyContent:"center", alignItems:"center",
        ...overlayStyle
      }}
      onClick={handleCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e)=>e.stopPropagation()}
        style={{
          width: `min(92vw, ${MODAL_W}px)`,
          height:`min(90dvh, ${MODAL_H}px)`,
          background:"var(--panel)",
          border:"1px solid var(--line)", borderRadius:16,
          boxShadow:"0 18px 48px rgba(0,0,0,.4)",
          color:"var(--text)", padding:0,
          display:"grid",
          gridTemplateRows:"auto 1fr auto",
        }}
      >
        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"14px 16px", borderBottom:"1px solid var(--line)"
        }}>
          <h2 style={{ margin:0 }}>{T.title}</h2>
          <button onClick={handleCancel}
            style={{
              border:"1px solid var(--line)", borderRadius:8,
              background:"var(--panel-2)", color:"var(--text)",
              padding:"6px 10px", cursor:"pointer"
            }}>✕</button>
        </div>

        {/* Body: venstre nav + høyre innhold (fast, innhold scroller) */}
        <div style={{
          display:"grid",
          gridTemplateColumns: `${NAV_W}px 1fr`,
          minHeight:0
        }}>
          {/* Nav */}
          <aside style={{
            borderRight:"1px solid var(--line)",
            padding:12,
            display:"grid",
            alignContent:"start",
            gap:8
          }}>
            <NavBtn id="appearance" label={T.appearance} />
            <NavBtn id="display"    label={T.display} />
            <NavBtn id="data"       label={T.data} />
          </aside>

          {/* Content */}
          <section style={{
            padding:16,
            overflow:"auto",
            minHeight:0,
            display:"block"
          }}>
            {Content}
          </section>
        </div>

        {/* Footer */}
        <div style={{
          display:"flex", justifyContent:"flex-end", gap:12,
          padding:"12px 16px", borderTop:"1px solid var(--line)"
        }}>
          <button onClick={handleCancel}
            style={{
              padding:"8px 12px", border:"1px solid var(--line)", borderRadius:8,
              background:"transparent", color:"var(--text)"
            }}>
            {T.cancel}
          </button>
          <button onClick={save}
            style={{
              padding:"8px 14px", border:"1px solid var(--line)", borderRadius:8,
              background:"var(--ok)", color:"#000", fontWeight:700
            }}>
            {T.save}
          </button>
        </div>
      </div>
    </div>
  )
}
