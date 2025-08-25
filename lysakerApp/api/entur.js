export default async function handler(req, res) {
  const {
    stopPlaceId,
    timeRangeSec = 3 * 3600,
    num = 30,
    clientName = 'lysaker-info'
  } = req.query;

  // Valider at stopPlaceId er en ikke-tom streng
  if (!stopPlaceId || typeof stopPlaceId !== 'string' || stopPlaceId.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid stopPlaceId' });
  }

  const query = `
    query ($id: String!, $start: DateTime, $timeRange: Int!, $numberOfDepartures: Int!) {
      stopPlace(id: $id) {
        id
        name
        estimatedCalls(startTime: $start, timeRange: $timeRange, numberOfDepartures: $numberOfDepartures) {
          realtime
          aimedDepartureTime
          expectedDepartureTime
          destinationDisplay { frontText }
          serviceJourney {
            journeyPattern {
              line {
                id
                name
                publicCode
                transportMode
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    id: stopPlaceId,
    start: new Date().toISOString(),
    timeRange: parseInt(timeRangeSec, 10),
    numberOfDepartures: parseInt(num, 10)
  };

  try {
    const response = await fetch('https://api.entur.io/journey-planner/v3/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ET-Client-Name': clientName
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Entur API error:', error);
    res.status(500).json({ error: 'Failed to fetch departures from Entur' });
  }
}
