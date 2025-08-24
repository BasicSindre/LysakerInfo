// Minimal SVG wrapper – videresender ...rest til <svg>
const Svg = ({ children, size = 28, viewBox = "0 0 24 24", className = "", ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
  >
    {children}
  </svg>
)

/* =======================
   TRANSPORT (KUN TOG)
   Tema-tilpasset med CSS-variabler:
   --train-body, --train-window, --train-light,
   --train-wheel, --train-wheel-stroke, --train-rail
   ======================= */

export const RailIcon = ({ size = 36 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    role="img"
    aria-hidden="true"
  >
    {/* Kropp */}
    <rect
      x="8" y="12" width="48" height="30" rx="7" ry="7"
      fill="var(--train-body)"
    />
    {/* Front/roof-curve for litt mer karakter */}
    <path
      d="M10 20c2-6 8-10 14-10h16c6 0 12 4 14 10"
      fill="none"
      stroke="var(--train-body)"
      strokeWidth="2"
      opacity="0.85"
    />
    {/* Vinduer (tema-tilpasset kontrast) */}
    <rect x="14" y="18" width="11" height="8" rx="2" fill="var(--train-window)" />
    <rect x="27" y="18" width="10" height="8" rx="2" fill="var(--train-window)" />
    <rect x="39" y="18" width="11" height="8" rx="2" fill="var(--train-window)" />

    {/* Frontlys (tema-tilpasset) */}
    <circle cx="16" cy="34" r="2.8" fill="var(--train-light)" />
    <circle cx="48" cy="34" r="2.8" fill="var(--train-light)" />

    {/* Dører (små vertikale markører) */}
    <rect x="24.5" y="24" width="1.2" height="10" rx="0.6" fill="var(--train-window)" opacity=".65" />
    <rect x="38.3" y="24" width="1.2" height="10" rx="0.6" fill="var(--train-window)" opacity=".65" />

    {/* Hjul med felg/stroke for tydelighet */}
    <circle cx="22" cy="46" r="4.2" fill="var(--train-wheel)" stroke="var(--train-wheel-stroke)" strokeWidth="1.5" />
    <circle cx="42" cy="46" r="4.2" fill="var(--train-wheel)" stroke="var(--train-wheel-stroke)" strokeWidth="1.5" />

    {/* Skinner */}
    <line x1="12" y1="54" x2="52" y2="54" stroke="var(--train-rail)" strokeWidth="3" />
    <line x1="16" y1="58" x2="48" y2="58" stroke="var(--train-rail)" strokeWidth="3" />
  </svg>
)

/* =======================
   VÆR (statiske + subtile animasjoner)
   ======================= */

export const SunIcon = ({ size = 28, animated = false }) => (
  <Svg size={size} stroke="var(--icon-sun)" className={animated ? "wx-anim-sun" : ""}>
    <circle className="sun-core" cx="12" cy="12" r="5" fill="var(--icon-sun)" stroke="none" />
    <g className="sun-rays" strokeWidth="1.6">
      <path d="M12 2.2v2.3" />
      <path d="M12 19.5v2.3" />
      <path d="M2.2 12h2.3" />
      <path d="M19.5 12h2.3" />
      <path d="M4.2 4.2l1.7 1.7" />
      <path d="M18.1 18.1l1.7 1.7" />
      <path d="M18.1 5.9l1.7-1.7" />
      <path d="M4.2 19.8l1.7-1.7" />
    </g>
  </Svg>
)

export const RainIcon = ({ size = 28, animated = false }) => (
  <Svg size={size} stroke="var(--icon-rain)" className={animated ? "wx-anim-rain" : ""}>
    <path className="cloud" d="M5 14h10a3.5 3.5 0 0 0 0-7 5.5 5.5 0 0 0-10 2" strokeWidth="1.6" />
    <g className="rain">
      <path className="drop" d="M9 17l-1 3" strokeWidth="1.6" />
      <path className="drop" d="M12 17l-1 3" strokeWidth="1.6" />
      <path className="drop" d="M15 17l-1 3" strokeWidth="1.6" />
    </g>
  </Svg>
)

export const HeavyRainIcon = ({ size = 28, animated = false }) => (
  <Svg size={size} stroke="var(--icon-rain)" className={animated ? "wx-anim-rain" : ""}>
    <path className="cloud" d="M5 14h10a3.5 3.5 0 0 0 0-7 5.5 5.5 0 0 0-10 2" strokeWidth="1.6" />
    <g className="rain">
      <path className="drop" d="M8 17l-1.4 4" strokeWidth="1.6" />
      <path className="drop" d="M11 17l-1.4 4" strokeWidth="1.6" />
      <path className="drop" d="M14 17l-1.4 4" strokeWidth="1.6" />
    </g>
  </Svg>
)

export const CloudIcon = ({ size = 28 }) => (
  <Svg size={size} stroke="var(--icon-cloud)">
    <path d="M6 16h10a4 4 0 0 0 0-8 6 6 0 0 0-11 2" strokeWidth="1.6" />
  </Svg>
)

export const ThunderIcon = ({ size = 28 }) => (
  <Svg size={size} stroke="var(--icon-thunder)">
    <path d="M5 14h10a3.5 3.5 0 0 0 0-7 5.5 5.5 0 0 0-10 2" strokeWidth="1.6" />
    <path d="M12 12l-2 4h3l-2 4" strokeWidth="1.6" />
  </Svg>
)

export const SnowIcon = ({ size = 28, animated = false }) => (
  <Svg size={size} stroke="var(--icon-snow)" className={animated ? "wx-anim-snow" : ""}>
    <path className="cloud" d="M5 14h10a3.5 3.5 0 0 0 0-7 5.5 5.5 0 0 0-10 2" strokeWidth="1.6" />
    <g className="snow">
      <path className="flake" d="M10 17v4" strokeWidth="1.6" />
      <path className="flake" d="M8.5 18.5l3 3" strokeWidth="1.6" />
      <path className="flake" d="M13.5 18.5l-3 3" strokeWidth="1.6" />
    </g>
  </Svg>
)

export const FogIcon = ({ size = 28, animated = false }) => (
  <Svg size={size} stroke="var(--icon-cloud)" className={animated ? "wx-anim-fog" : ""}>
    <path className="fog" d="M5 10h10" strokeWidth="1.6" />
    <path className="fog" d="M3 13h14" strokeWidth="1.6" />
    <path className="fog" d="M6 16h10" strokeWidth="1.6" />
  </Svg>
)

/* Velger vær-ikon basert på MET symbol_code */
export const WeatherIcon = ({ code, size = 28, animated = false }) => {
  const s = (code || "").toLowerCase()
  if (s.includes("clearsky")) return <SunIcon size={size} animated={animated} />
  if (s.includes("fair")) return <SunIcon size={size} animated={animated} />
  if (s.includes("partlycloudy")) return <CloudIcon size={size} />
  if (s.includes("cloudy")) return <CloudIcon size={size} />
  if (s.includes("fog")) return <FogIcon size={size} />
  if (s.includes("heavyrain")) return <HeavyRainIcon size={size} animated={animated} />
  if (s.includes("rainshowersandthunder") || s.includes("thunder")) return <ThunderIcon size={size} />
  if (s.includes("rainshowers") || s.includes("rain")) return <RainIcon size={size} animated={animated} />
  if (s.includes("snow") || s.includes("sleet")) return <SnowIcon size={size} />
  return <CloudIcon size={size} />
}
