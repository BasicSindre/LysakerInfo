export async function fetchWeather({ lat, lon }) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`
  // Prod: MET ønsker identifiserende User-Agent. For best praksis, prox’ via backend.
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(`MET error: ${res.status}`)
  return res.json()
}
