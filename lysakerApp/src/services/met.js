const MET_PROXY = '/api/met';

export async function fetchWeather({ lat, lon }) {
  const url = `${MET_PROXY}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
  const r = await fetch(url, { headers: { 'Accept': 'application/json' } });

  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`MET proxy ${r.status}: ${text || r.statusText}`);
  }

  return r.json();
}
