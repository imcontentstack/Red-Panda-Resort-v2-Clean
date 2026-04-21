import { initializePersonalize } from '../src/lib/cspersonalize';
export default async function handler(request, context) {

  const parsedUrl = new URL(request.url);

  const pathname = parsedUrl.pathname;


  // exclude Next.js asset calls so that only page requests are processed
  if (['_next', '_vercel'].some((path) => pathname.includes(path))) {

    return fetch(request);

  }

  const {variantParam, personalize} = await initializePersonalize(request, context.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL, context.env.CONTENTSTACK_PERSONALIZATION);

  // set the variant parameter as a query param in the URL
//   parsedUrl.searchParams.set(personalize.VARIANT_QUERY_PARAM, variantParam);

  // Also set the variant parameter as a request header for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-personalize-variants', variantParam);
  requestHeaders.set('x-pathname', pathname);


  // rewrite the request with the modified URL and new headers
  const modifiedRequest = new Request(parsedUrl.toString(), {
    method: request.method,
    headers: requestHeaders,
    body: request.body,
    redirect: 'manual'
  });
  const response = await fetch(modifiedRequest);


  const modifiedResponse = new Response(response.body, response);

  // add cookies to the response
  personalize?.addStateToResponse(modifiedResponse);

  // ensure that the response is not cached on the browser
  modifiedResponse.headers.set('cache-control', 'no-store');


  return modifiedResponse;
}