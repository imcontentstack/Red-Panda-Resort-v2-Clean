import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Proxies the authorization code to the hub's exchange endpoint,
 * receives Supabase tokens, and sets the Supabase session via cookies
 * so auth.uid() works in RLS policies for subsequent requests.
 *
 * Body: { code }
 * Requires: NEXT_PUBLIC_OAUTH_URL (used to derive hub base URL)
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { code } = body || {}

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }

    const oauthUrl = process.env.NEXT_PUBLIC_OAUTH_URL
    if (!oauthUrl) {
      console.error('Missing NEXT_PUBLIC_OAUTH_URL')
      return NextResponse.json({ error: 'Server OAuth configuration missing' }, { status: 500 })
    }

    const hubOrigin = new URL(oauthUrl).origin
    const exchangeUrl = `${hubOrigin}/api/oauth/exchange-code`


    let hubRes
    try {
      hubRes = await fetch(exchangeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
    } catch (fetchErr) {
      console.error('[exchange-code] fetch to hub failed:', fetchErr.message)
      return NextResponse.json(
        { error: `Cannot reach hub at ${exchangeUrl}: ${fetchErr.message}` },
        { status: 502 }
      )
    }

    if (!hubRes.ok) {
      const errText = await hubRes.text()
      console.error('[exchange-code] hub returned', hubRes.status, errText)
      return NextResponse.json(
        { error: `Hub returned ${hubRes.status}`, details: errText },
        { status: 502 }
      )
    }

    const tokens = await hubRes.json()
    const { access_token, refresh_token } = tokens

    if (!access_token || !refresh_token) {
      console.error('[exchange-code] missing tokens in response:', tokens)
      return NextResponse.json(
        { error: 'Invalid token response: missing access_token or refresh_token', details: JSON.stringify(tokens) },
        { status: 502 }
      )
    }

    // Set session server-side so server components and RLS work
    const supabase = await createClient()
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token })

    if (error) {
      console.error('Supabase setSession error:', error)
      return NextResponse.json(
        { error: 'Failed to set session', details: error.message },
        { status: 502 }
      )
    }

    // Also return tokens so the client can call supabase.auth.setSession()
    // for browser-side RLS queries
    return NextResponse.json({
      ok: true,
      access_token,
      refresh_token,
      user: data?.user
        ? { id: data.user.id, email: data.user.email ?? undefined }
        : undefined,
    })
  } catch (e) {
    console.error('exchange-code error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
