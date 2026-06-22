'use client'

import { useEffect } from 'react'

const SESSION_KEY = 'wx_enriched'
const JSTAG_TIMEOUT = 5000

function getSeerid() {
  return new Promise((resolve) => {
    const start = Date.now()
    const attempt = () => {
      if (window.jstag?.call) {
        window.jstag.call('getid', (result) => resolve(result ?? null))
        return
      }
      if (Date.now() - start >= JSTAG_TIMEOUT) {
        resolve(null)
        return
      }
      setTimeout(attempt, 200)
    }
    attempt()
  })
}

export default function WeatherEnrichment() {
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    async function enrich() {
      const seerid = await getSeerid()

      if (!seerid) {
        console.warn('[WeatherEnrichment] No seerid — skipping')
        return
      }

      try {
        const res = await fetch(`/api/weather?seerid=${encodeURIComponent(seerid)}`)

        if (!res.ok) {
          console.error(`[WeatherEnrichment] Error: ${res.status}`)
          return
        }

        const json = await res.json()
        console.log(`[WeatherEnrichment] ${json.summary}`)
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch (err) {
        console.error('[WeatherEnrichment] Fetch failed:', err)
      }
    }

    enrich()
  }, [])

  return null
}