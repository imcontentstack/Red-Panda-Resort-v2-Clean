import { NextRequest, NextResponse } from 'next/server'

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
  weather_segment: string
  weather_mood: string
  weather_hero_variant: string
}

interface WeatherApiResponse {
  location: { name: string; country: string }
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

async function getLocationFromLytics(seerid: string): Promise<string | null> {
  const apiKey = process.env.LYTICS_API_KEY
  const url = `https://api.lytics.io/api/entity/user/_uids/${encodeURIComponent(seerid)}?key=${apiKey}`

  const res = await fetch(url, { next: { revalidate: 0 } })

  if (!res.ok) {
    console.error(`[weather] Lytics Entity API error: ${res.status}`)
    return null
  }

  const json = await res.json()

  if (json?.data?.geoip_city) {
    return json.data.geoip_city
  }

  const loc = json?.data?.geoip_location

  if (loc?.lat && loc?.lon) {
    return `${loc.lat},${loc.lon}`
  }

  return null
}

async function fetchWeather(location: string): Promise<WeatherApiResponse> {
  const url = new URL('https://api.weatherapi.com/v1/current.json')
  url.searchParams.set('key', process.env.WEATHERAPI_KEY!)
  url.searchParams.set('q', location)
  url.searchParams.set('aqi', 'no')

  const res = await fetch(url.toString(), { next: { revalidate: 0 } })

  if (!res.ok) {
    throw new Error(`WeatherAPI ${res.status}: ${await res.text()}`)
  }

  return res.json()
}

function deriveWeatherFields(condition: string, tempC: number) {
  const normalized = condition.toLowerCase()

  let weather_segment = 'mild_default'
  let weather_mood = 'neutral'
  let weather_hero_variant = 'default'

  if (normalized.includes('snow') || normalized.includes('sleet') || normalized.includes('ice')) {
    weather_segment = 'snowy'
    weather_mood = 'winter'
    weather_hero_variant = 'ski_escape'
  } else if (normalized.includes('rain') || normalized.includes('drizzle') || normalized.includes('shower')) {
    weather_segment = tempC <= 8 ? 'cold_rainy' : 'rainy'
    weather_mood = 'cosy'
    weather_hero_variant = 'spa_retreat'
  } else if (normalized.includes('sunny') || normalized.includes('clear')) {
    weather_segment = tempC >= 24 ? 'hot_sunny' : 'sunny'
    weather_mood = tempC >= 24 ? 'summer' : 'bright'
    weather_hero_variant = tempC >= 24 ? 'beach_escape' : 'outdoor_escape'
  } else if (normalized.includes('cloud') || normalized.includes('overcast')) {
    weather_segment = 'cloudy'
    weather_mood = 'calm'
    weather_hero_variant = 'city_break'
  } else if (tempC >= 28) {
    weather_segment = 'hot'
    weather_mood = 'summer'
    weather_hero_variant = 'beach_escape'
  } else if (tempC <= 5) {
    weather_segment = 'cold'
    weather_mood = 'winter'
    weather_hero_variant = 'winter_sun'
  }

  return {
    weather_segment,
    weather_mood,
    weather_hero_variant,
  }
}

function buildPayload(data: WeatherApiResponse): WeatherPayload {
  const { location, current } = data
  const derived = deriveWeatherFields(current.condition.text, current.temp_c)

  return {
    weather_city: location.name,
    weather_country: location.country,
    weather_condition: current.condition.text,
    weather_condition_code: current.condition.code,
    weather_temp_c: current.temp_c,
    weather_temp_f: current.temp_f,
    weather_feels_like_c: current.feelslike_c,
    weather_humidity: current.humidity,
    weather_wind_kph: current.wind_kph,
    weather_wind_dir: current.wind_dir,
    weather_is_day: current.is_day === 1,
    weather_uv_index: current.uv,
    weather_updated_at: new Date().toISOString(),
    ...derived,
  }
}

async function upsertLyticsProfileBySeerid(seerid: string, payload: WeatherPayload) {
  const url = `https://api.lytics.io/v2/attributes/user/_uids/${encodeURIComponent(seerid)}`
  const body = JSON.stringify(payload)

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: process.env.LYTICS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body,
  })

  const responseText = await res.text()

  console.log('[weather] Lytics PATCH status:', res.status)
  console.log('[weather] Lytics PATCH response:', responseText)

  return {
    ok: res.ok,
    status: res.status,
    response: responseText,
  }
}

export async function GET(req: NextRequest) {
  const seerid = req.nextUrl.searchParams.get('seerid')?.trim()

  if (!seerid) {
    return NextResponse.json({ error: 'Missing required parameter: seerid' }, { status: 400 })
  }

  const location = await getLocationFromLytics(seerid)

  if (!location) {
    return NextResponse.json({ error: 'No usable location found on Lytics profile' }, { status: 404 })
  }

  let weatherData: WeatherApiResponse

  try {
    weatherData = await fetchWeather(location)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[weather] WeatherAPI fetch failed:', message)

    return NextResponse.json(
      { error: `Failed to fetch weather: ${message}` },
      { status: 502 }
    )
  }

  const payload = buildPayload(weatherData)
  const lyticsResult = await upsertLyticsProfileBySeerid(seerid, payload)

  return NextResponse.json({
    summary:
      `It's currently ${payload.weather_condition} in ${payload.weather_city}, `
      + `${payload.weather_country}. ${payload.weather_temp_c}°C `
      + `(feels like ${payload.weather_feels_like_c}°C), `
      + `humidity ${payload.weather_humidity}%, `
      + `wind ${payload.weather_wind_kph} km/h ${payload.weather_wind_dir}.`,
    data: payload,
    meta: {
      seerid,
      location_source: 'lytics_profile',
      location_used: location,
      lytics_upsert: lyticsResult.ok ? 'completed' : 'failed',
      lytics_status: lyticsResult.status,
    },
  })
}