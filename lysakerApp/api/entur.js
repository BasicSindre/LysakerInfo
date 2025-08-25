export const config = { runtime: 'edge', regions: ['arn1','fra1','cdg1'] };

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const stopPlaceId = searchParams.get('stopPlaceId');
    const timeRangeSec = Number(searchParams.get('timeRangeSec') || 10800);
    const num = Number(searchParams.get('num') || 60);
    const clientName = searchParams.get('clientName') || 'lysaker-info';

    if (!stopPlaceId || !stopPlaceId.trim()) {
      return new Response(JSON.stringify({ error: 'Missing or invalid stopPlaceId' }), {
        status: 400, headers: { 'content-type': 'application/json' }
      });
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
              journeyPattern { line { id name publicCode transportMode } }
            }
          }
        }
      }`;

    const variables = {
      id: stopPlaceId,
      start: new Date().toISOString(),
      timeRange: timeRangeSec,
      numberOfDepartures: num
    };

    const upstream = await fetch('https://api.entur.io/journey-planner/v3/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // Viktig: bruk et fornuftig navn/epost. Entur kan throttle uklare klientnavn.
        'ET-Client-Name': clientName
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store'
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        'content-type': 'application/json',
        'cache-control': 's-maxage=30, stale-while-revalidate=30'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch departures from Entur' }), {
      status: 500, headers: { 'content-type': 'application/json' }
    });
  }
}
