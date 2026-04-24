import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { initializePersonalize } from './lib/cspersonalize';
import { getRedirects } from './lib/redirects';

const intlMiddleware = createMiddleware({
  locales: ['en', 'es', 'fr', 'de'],
  defaultLocale: 'en',
});

// In-memory cache for redirects (Edge middleware persists across warm requests)
let redirectCache: { redirects: { from: string; to: string }[]; timestamp: number } | null = null;
const REDIRECT_CACHE_TTL = 60 * 1000; // 60 seconds

// ---------------------------------------------------------------------------
// Lytics / Personalize manifest sync
// ---------------------------------------------------------------------------

/**
 * Reads the cs-lytics-audiences cookie and returns a sorted, normalised set
 * of audience slugs the user currently belongs to.
 *
 * The cookie value looks like: |abandoned_basket|smt_new|anonymous_profiles|
 */
function getLyticsAudiences(req: NextRequest): string {
  const raw = req.cookies.get('cs-lytics-audiences')?.value || '';
  return raw
    .split('|')
    .map((a) => a.trim())
    .filter(Boolean)
    .sort()
    .join(',');
}

/**
 * Reads the cs-personalize-manifest cookie and returns the audience snapshot
 * that was used when it was last evaluated, stored as a sorted comma-separated
 * string — or empty string if none recorded.
 *
 * We store this snapshot ourselves (see below) so we can detect when Lytics
 * audiences have changed since the manifest was last written.
 */
function getManifestAudienceSnapshot(req: NextRequest): string {
  return req.cookies.get('cs-personalize-manifest-audiences')?.value || '';
}

/**
 * Returns true if the current Lytics audiences differ from what was recorded
 * when the Personalize manifest was last evaluated — meaning the manifest is
 * stale and needs to be invalidated so Personalize re-evaluates.
 */
function manifestIsStale(req: NextRequest): boolean {
  const currentAudiences = getLyticsAudiences(req);
  const snapshotAudiences = getManifestAudienceSnapshot(req);

  // If there are no Lytics audiences yet, don't invalidate
  if (!currentAudiences) return false;

  // If the snapshot is missing or differs from current audiences, stale
  return currentAudiences !== snapshotAudiences;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export default async function middleware(req: NextRequest) {
  // Check CMS redirects first (skip for API/oauth)
  if (!req.nextUrl.pathname.startsWith('/api') && !req.nextUrl.pathname.startsWith('/oauth')) {
    try {
      if (!redirectCache || Date.now() - redirectCache.timestamp > REDIRECT_CACHE_TTL) {
        redirectCache = {
          redirects: await getRedirects({ edge: true }),
          timestamp: Date.now(),
        };
      }
      const match = redirectCache.redirects.find((r) => r.from === req.nextUrl.pathname);
      if (match) {
        const dest = new URL(match.to, req.url);
        dest.search = req.nextUrl.search;
        console.log(`[redirect] ${req.nextUrl.pathname} -> ${match.to}`);
        return NextResponse.redirect(dest, 308);
      }
    } catch (err) {
      console.error('[middleware] Redirect check failed:', err);
    }
  }

  if (!process.env.HOSTING || (process.env.HOSTING && process.env.HOSTING !== 'launch')) {
    const projectUid = process.env.CONTENTSTACK_PERSONALIZATION as string;

    // ── Manifest staleness check ─────────────────────────────────────────────
    //
    // If the Lytics audiences have changed since the manifest was last written
    // (e.g. user just qualified for abandoned_basket), we delete the manifest
    // cookie from the request before passing it to initializePersonalize.
    // This forces Personalize.init() to re-evaluate from scratch, picking up
    // the new audience membership and serving the correct variant.
    //
    let reqToUse = req;
    const stale = manifestIsStale(req);

    if (stale) {
      console.log('[middleware] Lytics audiences changed — invalidating Personalize manifest');
      // Clone the request and strip the stale manifest cookie so
      // initializePersonalize sees a clean slate
      const newHeaders = new Headers(req.headers);
      const cleanedCookies = req.headers
        .get('cookie')
        ?.split(';')
        .filter((c) => !c.trim().startsWith('cs-personalize-manifest='))
        .join(';') || '';
      newHeaders.set('cookie', cleanedCookies);
      reqToUse = new NextRequest(req.url, {
        headers: newHeaders,
        method: req.method,
        body: req.body,
      });
    }
    // ────────────────────────────────────────────────────────────────────────

    const { variantParam, personalize } = await initializePersonalize(
      reqToUse,
      process.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL,
      projectUid
    );

    // Current Lytics audience snapshot to store alongside the manifest
    const currentAudiences = getLyticsAudiences(req);

    // For non-API routes, rewrite the URL to support next-intl
    if (!req.nextUrl.pathname.startsWith('/api') && !req.nextUrl.pathname.startsWith('/oauth')) {
      const parsedUrl = new URL(req.url);
      const newReq = new NextRequest(parsedUrl.toString(), reqToUse);
      newReq.headers.set('x-personalize-variants', variantParam || '');
      newReq.headers.set('x-pathname', req.nextUrl.pathname);
      const response = intlMiddleware(newReq);
      personalize?.addStateToResponse(response);

      // ── Store audience snapshot alongside the manifest ───────────────────
      // This lets us detect on the next request whether audiences have changed.
      // We match the manifest cookie's session lifetime.
      if (currentAudiences) {
        response.cookies.set('cs-personalize-manifest-audiences', currentAudiences, {
          path: '/',
          sameSite: 'lax',
        });
      }
      // ────────────────────────────────────────────────────────────────────

      return response;
    }

    // For API routes, pass variants via headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-personalize-variants', variantParam || '');

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    personalize?.addStateToResponse(response);

    // Store audience snapshot for API routes too
    if (currentAudiences) {
      response.cookies.set('cs-personalize-manifest-audiences', currentAudiences, {
        path: '/',
        sameSite: 'lax',
      });
    }

    return response;
  }

  if (req.nextUrl.pathname.startsWith('/api') || req.nextUrl.pathname.startsWith('/oauth')) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
  ]
};