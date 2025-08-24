// Calls our /api/entur proxy on the same origin
// Expect: fetchDepartures(stopPlaceId, _clientName, { timeRangeSec, num })

const ENTUR_PROXY = '/api/entur'

export async function fetchDepartures(stopPlaceId, _clientName, { timeRangeSec = 3 * 3600, num = 30 } = {}) {
  // GraphQL query (same shape you used earlier)
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
  `

  const variables = {
    id: stopPlaceId,
    start: new Date().toISOString(),
    timeRange: timeRangeSec,
    numberOfDepartures: num
  }

  const r = await fetch(ENTUR_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!r.ok) {
    const text = await r.text().catch(() => '')
    throw new Error(`Entur proxy ${r.status}: ${text || r.statusText}`)
  }
  return r.json()
}
