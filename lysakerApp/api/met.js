export const config = { runtime: 'edge', regions: ['arn1','fra1','cdg1'] };

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    const latitude  = Number(lat);
    const longitude = Number(lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return new Response(JSON.stringify({ error: 'Invalid coordinates' }), {
        status: 400, headers: { 'content-type': 'application/json' }
      });
    }

    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`;
    const upstream = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        // Bruk en ordentlig kontaktadresse/domene her:
        'User-Agent': 'lysaker-info (contact: youremail@example.com)'
      },
      // Edge liker at vi eksplisitt sier at vi kan cache:
      cache: 'no-store'
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        'content-type': 'application/json',
        // cache på Vercel CDN
        'cache-control': 's-maxage=300, stale-while-revalidate=60'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch weather data' }), {
      status: 500, headers: { 'content-type': 'application/json' }
    });
  }
}
