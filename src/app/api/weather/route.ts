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
    temp_c: number; temp_f: number; feelslike_c: number
    humidity: number; wind_kph: number; wind_dir: string
    is_day: number; uv: number
  }
}

async function getCityFromLytics(seerid: string): Promise<string | null> {
  const apiKey = process.env.LYTICS_API_KEY
  const url = `https://api.lytics.io/api/entity/user/_uids/${encodeURIComponent(seerid)}?key=${apiKey}`

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

    ...derived,
  }
}

//async function upsertLyticsProfileBySeerid(seerid: string, payload: WeatherPayload): Promise<void> {
//  const url = `https://api.lytics.io/collect/json/${process.env.LYTICS_TAG}/default?access_token=${process.env.LYTICS_API_KEY}`
//  const res = await fetch(url, {
//    method: 'POST',
//    headers: { 'Content-Type': 'application/json' },
//    body: JSON.stringify({ _uid: seerid, ...payload }),
//  })
//  if (!res.ok) {
//    console.error(`[weather] Lytics upsert failed: ${res.status} ${await res.text()}`)
//  } else {
//    console.log(`[weather] Lytics upsert OK — seerid=${seerid}`)
//  }
//}

async function upsertLyticsProfileBySeerid(seerid: string, payload: WeatherPayload): Promise<void> {
  const url = `https://api.lytics.io/v2/attributes/user/_uids/${encodeURIComponent(seerid)}`

  const body = JSON.stringify(payload)

  console.log('[weather] Attribute PATCH URL:', url)
  console.log('[weather] Attribute PATCH body:', body)

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: process.env.LYTICS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body,
  })

  const responseText = await res.text()
  console.log(`[weather] Lytics attribute PATCH response: ${res.status}`, responseText)

  if (!res.ok) {
    throw new Error(`Lytics attribute PATCH failed: ${res.status} ${responseText}`)
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

  //upsertLyticsProfileBySeerid(seerid, payload).catch(console.error)
  await upsertLyticsProfileBySeerid(seerid, payload)

  return NextResponse.json({
    summary:
      `It's currently ${payload.weather_condition} in ${payload.weather_city}, `
      + `${payload.weather_country}. ${payload.weather_temp_c}°C `
      + `(feels like ${payload.weather_feels_like_c}°C), `
      + `humidity ${payload.weather_humidity}%, `
      + `wind ${payload.weather_wind_kph} km/h ${payload.weather_wind_dir}.`,
    data: payload,
    meta: { seerid, city_source: 'lytics_profile', lytics_upsert: 'completed' },
  })
}