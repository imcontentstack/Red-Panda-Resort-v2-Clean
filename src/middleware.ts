import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { initializePersonalize } from './lib/cspersonalize';
import { getRedirects } from './lib/redirects';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'fr', 'de'],

  // Used when no locale matches
  defaultLocale: 'en',
  //localeDetection: false
});

// In-memory cache for redirects (Edge middleware persists across warm requests)
let redirectCache: { redirects: { from: string; to: string }[]; timestamp: number } | null = null;
const REDIRECT_CACHE_TTL = 60 * 1000; // 60 seconds

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

    const { variantParam, personalize } = await initializePersonalize(req, process.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL, projectUid);

    // For non-API routes, we must rewrite the URL to support next-intl
    if (!req.nextUrl.pathname.startsWith('/api') && !req.nextUrl.pathname.startsWith('/oauth')) {
      const parsedUrl = new URL(req.url);
      // parsedUrl.searchParams.set(personalize.VARIANT_QUERY_PARAM, variantParam);
      const newReq = new NextRequest(parsedUrl.toString(), req);
      newReq.headers.set('x-personalize-variants', variantParam || '');
      newReq.headers.set('x-pathname', req.nextUrl.pathname);
      const response = intlMiddleware(newReq);
      personalize?.addStateToResponse(response);
      return response;
    }


    // For API routes, it's more reliable to pass the variants via headers.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-personalize-variants', variantParam || '');

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });


    // add cookies to the response
    personalize?.addStateToResponse(response);


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