// Bruk MET sitt offentlige vær-API
const MET_API_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact'

export async function fetchWeather({ lat, lon }) {
  const url = `${MET_API_URL}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`

  const r = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'your-app-name@example.com' // MET krever en identifiserbar User-Agent
    }
  })

  if (!r.ok) {
    const text = await r.text().catch(() => '')
    throw new Error(`MET API ${r.status}: ${text || r.statusText}`)
  }

  return r.json()
}
