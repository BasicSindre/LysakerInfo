const ENTUR_URL = 'https://api.entur.io/journey-planner/v3/graphql'

const ENTUR_DEPARTURE_QUERY = `
  query ($stopId: String!, $timeRange: Int!, $num: Int!) {
    stopPlace(id: $stopId) {
      id
      name
      estimatedCalls(timeRange: $timeRange, numberOfDepartures: $num) {
        realtime
        aimedDepartureTime
        expectedDepartureTime
        date
        destinationDisplay { frontText }
        quay { id }
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

export async function fetchDepartures(stopPlaceId, clientName, { timeRangeSec = 3*3600, num = 10 } = {}) {
  const body = { query: ENTUR_DEPARTURE_QUERY, variables: { stopId: stopPlaceId, timeRange: timeRangeSec, num } }
  const res = await fetch(ENTUR_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ET-Client-Name': clientName, // REQUIRED
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Entur error: ${res.status}`)
  return res.json()
}
