export default async function handler(req, res) {
  const { lat, lon } = req.query;

  // Valider at lat og lon er tall og ikke NaN
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (!lat || !lon || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Missing or invalid lat/lon' });
  }

  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'lysaker-info@yourdomain.com' // MET krever dette
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('MET API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}
