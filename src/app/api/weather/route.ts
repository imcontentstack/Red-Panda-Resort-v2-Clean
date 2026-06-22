/**
 * Weather enrichment Route Handler
 * app/api/weather/route.ts
 *
 * Fetches live weather from WeatherAPI.com and upserts the result onto the
 * visitor's *existing* Lytics profile using their seerid as the identity anchor,
 * writing into the default "web" stream so no new profile or stream is created.
 *
 * Called by AgentOS as a tool. The agent resolves the visitor's seerid from
 * the Lytics profile context and passes it as a query parameter.
 *
 * Environment variables:
 *   WEATHERAPI_KEY     - WeatherAPI.com API key
 *   LYTICS_API_KEY     - Lytics account API key
 *   LYTICS_TAG         - Lytics account ID (numeric — reuses existing env var)
 *   AGENT_SECRET       - Shared secret to authenticate AgentOS tool calls
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
  location: { name: string; country: string }
  current: {
    condition: { text: string; code: number }
    temp_c: number; temp_f: number; feelslike_c: number
    humidity: number; wind_kph: number; wind_dir: string
    is_day: number; uv: number
  }
}

async function getCityFromLytics(seerid: string): Promise<string | null> {
  const apiKey = process.env.LYTICS_API_KEY
  const url = `https://api.lytics.io/api/entity/user/_seerid/${encodeURIComponent(seerid)}?key=${apiKey}`

  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) {
    console.error(`[weather] Lytics Entity API error: ${res.status}`)
    return null
  }

  const json = await res.json()
  return json?.data?.geoip_city ?? null
}

async function fetchWeather(city: string): Promise<WeatherApiResponse> {
  const url = new URL('https://api.weatherapi.com/v1/current.json')
  url.searchParams.set('key', process.env.WEATHERAPI_KEY!)
  url.searchParams.set('q', city)
  url.searchParams.set('aqi', 'no')

  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`WeatherAPI ${res.status}: ${await res.text()}`)
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

async function upsertLyticsProfileBySeerid(seerid: string, payload: WeatherPayload): Promise<void> {
  const url = `https://api.lytics.io/collect/json/${process.env.LYTICS_TAG}/default?access_token=${process.env.LYTICS_API_KEY}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ _seerid: seerid, ...payload }),
  })
  if (!res.ok) {
    console.error(`[weather] Lytics upsert failed: ${res.status} ${await res.text()}`)
  } else {
    console.log(`[weather] Lytics upsert OK — seerid=${seerid}`)
  }
}

export async function GET(req: NextRequest) {
  const seerid = req.nextUrl.searchParams.get('seerid')?.trim()

  if (!seerid) {
    return NextResponse.json({ error: 'Missing required parameter: seerid' }, { status: 400 })
  }

  const city = await getCityFromLytics(seerid)
  if (!city) {
    return NextResponse.json({ error: 'No city found on Lytics profile' }, { status: 404 })
  }

  let weatherData: WeatherApiResponse
  try {
    weatherData = await fetchWeather(city)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[weather] WeatherAPI fetch failed:', message)
    return NextResponse.json({ error: `Failed to fetch weather: ${message}` }, { status: 502 })
  }

  const payload = buildPayload(weatherData)

  upsertLyticsProfileBySeerid(seerid, payload).catch(console.error)

  return NextResponse.json({
    summary:
      `It's currently ${payload.weather_condition} in ${payload.weather_city}, `
      + `${payload.weather_country}. ${payload.weather_temp_c}°C `
      + `(feels like ${payload.weather_feels_like_c}°C), `
      + `humidity ${payload.weather_humidity}%, `
      + `wind ${payload.weather_wind_kph} km/h ${payload.weather_wind_dir}.`,
    data: payload,
    meta: { seerid, city_source: 'lytics_profile', lytics_upsert: 'dispatched' },
  })
}