const ENTUR_PROXY = '/api/entur';

export async function fetchDepartures(stopPlaceId, _clientName, { timeRangeSec = 3 * 3600, num = 30 } = {}) {
  const url = `${ENTUR_PROXY}?stopPlaceId=${encodeURIComponent(stopPlaceId)}&timeRangeSec=${timeRangeSec}&num=${num}&clientName=${_clientName || 'lysaker-info'}`;

  const r = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });

  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`Entur proxy ${r.status}: ${text || r.statusText}`);
  }

  return r.json();
}
