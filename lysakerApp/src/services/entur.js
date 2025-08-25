const ENV_STOP_ID = import.meta.env.VITE_STOPPLACE_ID || 'NSR:StopPlace:58367';
const CLIENT = import.meta.env.VITE_ET_CLIENT_NAME || 'lysaker-info';

export async function fetchDepartures({ stopPlaceId = ENV_STOP_ID, clientName = CLIENT, timeRangeSec = 3 * 3600, num = 30 }) {
  const url = `/api/entur?stopPlaceId=${encodeURIComponent(stopPlaceId)}&timeRangeSec=${timeRangeSec}&num=${num}&clientName=${encodeURIComponent(clientName)}`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Entur proxy ${response.status}: ${text || response.statusText}`);
  }

  return response.json();
}
