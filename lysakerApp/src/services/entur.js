const ENV_STOP_ID = import.meta.env.VITE_STOPPLACE_ID || 'NSR:StopPlace:58367';
const CLIENT = import.meta.env.VITE_ET_CLIENT_NAME || 'lysaker-info';

export async function fetchDepartures({
  stopPlaceId = ENV_STOP_ID, clientName = CLIENT, timeRangeSec = 3 * 3600, num = 30
}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = new URL('/api/entur', origin);
  url.searchParams.set('stopPlaceId', stopPlaceId);
  url.searchParams.set('timeRangeSec', String(timeRangeSec));
  url.searchParams.set('num', String(num));
  url.searchParams.set('clientName', clientName);

  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Entur proxy ${res.status}: ${await res.text() || res.statusText}`);
  return res.json();
}
