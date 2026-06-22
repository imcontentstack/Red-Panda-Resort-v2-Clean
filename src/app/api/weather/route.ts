/**
 * Weather enrichment Route Handler
 * app/api/weather/route.ts
 *
 * Registered as an AgentOS tool. Accepts a city and an optional Lytics
 * identifier, fetches live weather from WeatherAPI.com, and asynchronously
 * writes the result back to the Lytics profile so the data persists for
 * segmentation without blocking the agent response.
 *
 * Environment variables:
 *   WEATHERAPI_KEY        - WeatherAPI.com API key
 *   LYTICS_API_KEY        - Lytics account API key
 *   LYTICS_ACCOUNT_ID     - Lytics numeric account ID
 *   LYTICS_WEATHER_STREAM - Lytics stream to write into (default: "weather_enrichment")
 *   AGENT_SECRET          - Shared secret to authenticate AgentOS tool calls
 */

import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WeatherPayload {
  weather_city: string
  weather_country: string
  weather_condition: string
  weather_condition_code: number
  weather_temp_c: number
  weather_temp_f: number
  weather_feels_like_c: number
  weather_humidity: number
  weather_wind_kph: number
  weather_wind_dir: string
  weather_is_day: boolean
  weather_uv_index: number
  weather_updated_at: string
}

interface WeatherApiResponse {
  location: {
    name: string
    country: string
    localtime: string
  }
  current: {
    condition: { text: string; code: number }
    temp_c: number
    temp_f: number
    feelslike_c: number
    humidity: number
    wind_kph: number
    wind_dir: string
    is_day: number
    uv: number
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchWeather(city: string): Promise<WeatherApiResponse> {
  const url = new URL('https://api.weatherapi.com/v1/current.json')
  url.searchParams.set('key', process.env.WEATHERAPI_KEY!)
  url.searchParams.set('q', city)
  url.searchParams.set('aqi', 'no')

  const res = await fetch(url.toString(), {
    next: { revalidate: 0 }, // always fresh — no Next.js caching
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`WeatherAPI error ${res.status}: ${body}`)
  }

  return res.json()
}

function buildPayload(data: WeatherApiResponse): WeatherPayload {
  const { location, current } = data
  return {
    weather_city:           location.name,
    weather_country:        location.country,
    weather_condition:      current.condition.text,
    weather_condition_code: current.condition.code,
    weather_temp_c:         current.temp_c,
    weather_temp_f:         current.temp_f,
    weather_feels_like_c:   current.feelslike_c,
    weather_humidity:       current.humidity,
    weather_wind_kph:       current.wind_kph,
    weather_wind_dir:       current.wind_dir,
    weather_is_day:         current.is_day === 1,
    weather_uv_index:       current.uv,
    weather_updated_at:     new Date().toISOString(),
  }
}

/**
 * Fire-and-forget Lytics Track API write.
 * Uses the Collect JSON endpoint — identity is anchored by the same field
 * used to look up the profile so Lytics merges rather than creates.
 */
async function writeLyticsWeatherAsync(
  identifierField: string,
  identifierValue: string,
  payload: WeatherPayload,
): Promise<void> {
  const accountId = process.env.LYTICS_ACCOUNT_ID
  const apiKey    = process.env.LYTICS_API_KEY
  const stream    = process.env.LYTICS_WEATHER_STREAM ?? 'weather_enrichment'

  const url = `https://api.lytics.io/collect/json/${accountId}/${stream}?access_token=${apiKey}`

  const body = {
    [identifierField]: identifierValue,
    ...payload,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    // Log but don't surface — this is async and must not affect the agent response
    console.error(`Lytics write-back failed: ${res.status} ${await res.text()}`)
  } else {
    console.log(`Lytics weather write-back OK for ${identifierField}=${identifierValue}`)
  }
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  // -- Auth -----------------------------------------------------------------
  // AgentOS passes the shared secret as a Bearer token.
  // Remove this block if your AgentOS setup handles auth at the gateway level.
  const authHeader = req.headers.get('authorization') ?? ''
  const secret = process.env.AGENT_SECRET

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // -- Input validation -----------------------------------------------------
  const { searchParams } = req.nextUrl

  const city = searchParams.get('city')?.trim()
  if (!city) {
    return NextResponse.json(
      { error: 'Missing required parameter: city' },
      { status: 400 },
    )
  }

  // Optional Lytics identity for write-back.
  // AgentOS should pass whichever identifier it resolved from the profile.
  const lyticsField = searchParams.get('lytics_field') ?? 'email'  // field name
  const lyticsValue = searchParams.get('lytics_value')              // field value

  // -- Fetch weather --------------------------------------------------------
  let weatherData: WeatherApiResponse
  try {
    weatherData = await fetchWeather(city)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('WeatherAPI fetch failed:', message)
    return NextResponse.json(
      { error: `Failed to fetch weather: ${message}` },
      { status: 502 },
    )
  }

  const payload = buildPayload(weatherData)

  // -- Async Lytics write-back (fire-and-forget) ----------------------------
  if (lyticsValue) {
    // Do NOT await — the agent gets its response immediately
    writeLyticsWeatherAsync(lyticsField, lyticsValue, payload).catch(console.error)
  }

  // -- Response to AgentOS --------------------------------------------------
  // Return a clean, human-readable summary alongside the raw fields so the
  // agent can decide how to surface this to the visitor.
  return NextResponse.json({
    summary: `It's currently ${payload.weather_condition} in ${payload.weather_city}, ${payload.weather_country}. `
           + `${payload.weather_temp_c}°C (feels like ${payload.weather_feels_like_c}°C), `
           + `humidity ${payload.weather_humidity}%, wind ${payload.weather_wind_kph} km/h ${payload.weather_wind_dir}.`,
    data: payload,
    lytics_write_back: lyticsValue ? 'dispatched' : 'skipped (no lytics_value provided)',
  })
}