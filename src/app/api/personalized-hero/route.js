/**
 * GET /api/personalized-hero?product_name=paris-city-of-love
 *
 * Searches the Contentstack DAM for an asset whose title most closely matches
 * the normalised product name from the Lytics user profile, then returns its
 * CDN URL for use as a personalised hero banner image.
 *
 * Handles special characters in DAM asset titles (em dashes, ampersands, etc.)
 * by searching on significant words rather than the full normalised slug, so
 * titles like "Paris – City of Love" are matched correctly even though the
 * Lytics profile value gets normalised to "paris-city-of-love".
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

// Common words that are not useful for matching — excluded from the
// significant words search to avoid overly broad DAM results
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "of", "in", "on", "at", "to",
  "for", "with", "by", "from", "is", "it", "its", "as",
]);

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

/**
 * Extracts significant words from a normalised slug, filtering stop words.
 * e.g. "paris-city-of-love" → ["paris", "city", "love"]
 */
function significantWords(slug) {
  return slug
    .split("-")
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Scores how well a DAM asset title matches the target product name.
 * Returns a number between 0 and 1 — higher is better.
 * Exact normalised match scores 1. Partial word matches score proportionally.
 */
function scoreMatch(assetTitle, targetSlug, targetWords) {
  const assetSlug = normalizeValue(assetTitle);

  // Exact normalised match — best possible score
  if (assetSlug === targetSlug) return 1;

  // Count how many significant target words appear in the normalised asset title
  const assetWords = assetSlug.split("-");
  const matchedWords = targetWords.filter((word) => assetWords.includes(word));

  return targetWords.length > 0 ? matchedWords.length / targetWords.length : 0;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productName = searchParams.get("product_name");

  // No product name supplied — return early with null
  if (!productName) {
    return Response.json({ imageUrl: null });
  }

  try {
    const targetSlug = productName; // already normalised by hero.js
    const targetWords = significantWords(targetSlug);

    if (targetWords.length === 0) {
      return Response.json({ imageUrl: null });
    }

    // ── Step 1: Search DAM assets by significant words ───────────────────────
    //
    // We build a regex from the significant words so that special characters
    // in the DAM title (em dashes, ampersands, accents, etc.) are not a
    // problem — as long as the key words are present the asset will be found.
    //
    // e.g. targetWords ["paris", "city", "love"] produces a regex that matches
    // any title containing all three words in any order, regardless of what
    // separates them (spaces, dashes, em dashes, etc.)
    //
    const regexConditions = targetWords.map((word) => ({
      title: { $regex: word, $options: "i" },
    }));

    const assetsUrl = new URL(`https://${CONTENTSTACK_CDN_HOST}/v3/assets`);
    assetsUrl.searchParams.set("environment", CONTENTSTACK_ENVIRONMENT);
    assetsUrl.searchParams.set("branch", CONTENTSTACK_BRANCH);
    assetsUrl.searchParams.set(
      "query",
      JSON.stringify({
        $and: regexConditions,
      })
    );
    assetsUrl.searchParams.set("include_dimension", "false");
    assetsUrl.searchParams.set("count", "20");

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
      return Response.json({ imageUrl: null });
    }

    // ── Step 2: Score and pick the best matching asset ───────────────────────
    //
    // Because we searched on individual words we may get multiple results.
    // Score each one and pick the highest — exact normalised title matches
    // always win, otherwise the asset with the most matching significant
    // words is chosen.
    //
    let bestMatch = null;
    let bestScore = 0;

    for (const asset of assets) {
      const score = scoreMatch(asset.title, targetSlug, targetWords);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = asset;
      }
    }

    // Require at least half the significant words to match to avoid
    // returning a completely unrelated asset
    if (!bestMatch || bestScore < 0.5) {
      return Response.json({ imageUrl: null });
    }

    return Response.json({ imageUrl: bestMatch.url });
  } catch (error) {
    console.error("Personalized hero route error:", error);
    // Always return a safe fallback — never let this break the hero render
    return Response.json({ imageUrl: null });
  }
}