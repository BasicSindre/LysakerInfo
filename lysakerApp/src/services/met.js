export async function fetchWeather({ lat, lon }) {
  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    throw new Error('Invalid coordinates');
  }

  const url = `/api/met?lat=${lat}&lon=${lon}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MET proxy ${response.status}: ${text || response.statusText}`);
  }

  return response.json();
}
