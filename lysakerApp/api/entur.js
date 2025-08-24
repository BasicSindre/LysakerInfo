// Serverless proxy for Entur Journey Planner GraphQL v3
// Injects ET-Client-Name and avoids CORS/browser header limitations.

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const body = req.body || {}
    const endpoint = 'https://api.entur.io/journey-planner/v3/graphql'
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // IMPORTANT: Set this in Vercel → Project → Settings → Environment Variables
        // Example: "lysaker-board (you@example.com)"
        'ET-Client-Name': process.env.ENTUR_CLIENT || 'demo-app (missing ENTUR_CLIENT)',
      },
      body: JSON.stringify(body),
    })

    const data = await r.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    // forward Entur cache headers where sensible
    if (r.headers.get('cache-control')) {
      res.setHeader('Cache-Control', r.headers.get('cache-control'))
    }
    return res.status(r.ok ? 200 : r.status).json(data)
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Proxy error' })
  }
}
