// Bruk Entur sitt offentlige GraphQL-endepunkt
const ENTUR_API_URL = 'https://corsproxy.io/?https://api.entur.io/journey-planner/v3/graphql'


export async function fetchDepartures(stopPlaceId, _clientName, { timeRangeSec = 3 * 3600, num = 30 } = {}) {
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

  const r = await fetch(ENTUR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ET-Client-Name': _clientName || 'your-client-name' // Entur krever dette header-feltet
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!r.ok) {
    const text = await r.text().catch(() => '')
    throw new Error(`Entur API ${r.status}: ${text || r.statusText}`)
  }

  return r.json()
}
