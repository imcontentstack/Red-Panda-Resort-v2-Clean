/**
 * GET /api/personalized-hero?product_name=sunflower-bouquet
 *
 * Searches the Contentstack DAM for an asset whose title most closely matches
 * the normalised product name from the Lytics user profile, then returns its
 * CDN URL for use as a personalised hero banner image.
 *
 * Falls back gracefully — returns { imageUrl: null } rather than erroring if
 * no match is found, so the hero banner always has something to show.
 */

const CONTENTSTACK_API_KEY = process.env.CONTENTSTACK_API_KEY;
const CONTENTSTACK_DELIVERY_TOKEN = process.env.CONTENTSTACK_DELIVERY_TOKEN;
const CONTENTSTACK_ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT;
const CONTENTSTACK_CDN_HOST =
  process.env.CONTENTSTACK_CDN_HOST || "cdn.contentstack.io";
const CONTENTSTACK_BRANCH = process.env.CONTENTSTACK_BRANCH || "main";

/**
 * Normalises a string into a DAM-friendly slug for comparison.
 * Matches the same normalisation applied in hero.js.
 */
function normalizeValue(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productName = searchParams.get("product_name");

  // No product name supplied — return early with null
  if (!productName) {
    return Response.json({ imageUrl: null });
  }

  try {
    // ── Step 1: Search DAM assets by title ──────────────────────────────────
    //
    // The Contentstack Assets API supports a `title` query param for partial
    // title matching. We search using the raw slugified product name which is
    // close enough to the DAM asset title (e.g. "sunflower-bouquet" will
    // match assets containing "sunflower" in the title at the scoring stage).
    //
    // We fetch up to 10 candidates and then pick the closest match ourselves
    // using normalised string comparison, so minor title variations in the DAM
    // (e.g. "Sunflower Bouquet" vs "sunflower-bouquet") are handled correctly.
    //
    const assetsUrl = new URL(
      `https://${CONTENTSTACK_CDN_HOST}/v3/assets`
    );
    assetsUrl.searchParams.set("environment", CONTENTSTACK_ENVIRONMENT);
    assetsUrl.searchParams.set("branch", CONTENTSTACK_BRANCH);
    assetsUrl.searchParams.set("query", JSON.stringify({
      title: { $regex: productName.replace(/-/g, " "), $options: "i" }
    }));
    assetsUrl.searchParams.set("include_dimension", "false");
    assetsUrl.searchParams.set("count", "10");

    const assetsRes = await fetch(assetsUrl.toString(), {
      headers: {
        api_key: CONTENTSTACK_API_KEY,
        access_token: CONTENTSTACK_DELIVERY_TOKEN,
      },
      cache: "no-store",
    });

    if (!assetsRes.ok) {
      console.error(
        `Contentstack DAM search failed: ${assetsRes.status} ${assetsRes.statusText}`
      );
      return Response.json({ imageUrl: null });
    }

    const assetsData = await assetsRes.json();
    const assets = assetsData?.assets || [];

    if (assets.length === 0) {
      // No assets found in DAM for this product name
      return Response.json({ imageUrl: null });
    }

    // ── Step 2: Pick the closest matching asset ──────────────────────────────
    //
    // Normalise each returned asset title and compare against the incoming
    // normalised product name. Pick the asset whose normalised title most
    // closely matches — exact match wins, otherwise first result is used.
    //
    const normalizedProduct = normalizeValue(productName.replace(/-/g, " "));

    let bestMatch = assets[0];

    for (const asset of assets) {
      const normalizedTitle = normalizeValue(asset.title);
      if (normalizedTitle === normalizedProduct) {
        bestMatch = asset;
        break;
      }
    }

    const imageUrl = bestMatch?.url || null;

    return Response.json({ imageUrl });
  } catch (error) {
    console.error("Personalized hero route error:", error);
    // Always return a safe fallback — never let this break the hero render
    return Response.json({ imageUrl: null });
  }
}