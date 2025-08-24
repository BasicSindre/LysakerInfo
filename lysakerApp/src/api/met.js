// Serverless proxy for MET Norway locationforecast 2.0 (compact)
// Injects required User-Agent (or fallbacks) and avoids CORS/user-agent limitations.

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { lat, lon } = req.query || {}
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat/lon' })
  }

  try {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
    const r = await fetch(url, {
      headers: {
        // REQUIRED by MET (put contact + app name here!)
        // Set this in Vercel → Project → Settings → Environment Variables
        // e.g. "lysaker-board/1.0 you@example.com"
        'User-Agent': process.env.MET_USER_AGENT || 'demo-app/1.0 (missing MET_USER_AGENT)',
        'Accept': 'application/json',
      }
    })
    const data = await r.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    // MET often returns cache headers; pass them through
    if (r.headers.get('cache-control')) {
      res.setHeader('Cache-Control', r.headers.get('cache-control'))
    } else {
      // Default: allow short caching at the edge
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
    }
    return res.status(r.ok ? 200 : r.status).json(data)
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Proxy error' })
  }
}
