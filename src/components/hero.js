"use client";
import Link from "next/link";
import Header from "./header";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEntity } from "@/context/lyticsTracking";
import { useEffect, useMemo, useState } from "react";
import { resolveCampaignHero } from "@/utils/resolveCampaignHero";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalises a product name into a DAM-friendly slug.
 * e.g. "Nike Air Max & Co." → "nike-air-max-and-co"
 */
function normalizeValue(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Hook — all Lytics logic is isolated here and touches nothing else
// ---------------------------------------------------------------------------

/**
 * Looks up a personalised hero image from the DAM based on the last product
 * the user interacted with in their Lytics profile.
 *
 * Starts in a holding state (ready: false) so the entire first hero is
 * withheld from rendering until we know definitively which image to show.
 * Because the Lytics profile loads almost instantly this hold is
 * imperceptible, but eliminates any visible flash of the base/Personalize
 * image or text before the personalised version appears.
 *
 * Returns:
 *   personalizedImageUrl — the DAM image URL, or null if none found
 *   ready                — false until we have a definitive answer
 *   lyticsUser           — raw Lytics user object for any other profile fields
 */
function usePersonalizedHeroImage() {
  const lyticsProfile = useEntity();

  // Track whether the Lytics profile itself has loaded yet
  const profileLoaded = lyticsProfile !== undefined && lyticsProfile !== null;
  const lyticsUser = lyticsProfile?.data?.user || null;

  const productName =
    lyticsUser?.latest_product_add_to_cart_item ||
    lyticsUser?.product_add_to_cart_item ||
    lyticsUser?.add_to_basket?.[0] ||
    lyticsUser?.product_name?.[0] ||
    lyticsUser?.top_unpurchased_product ||
    null;

  console.log("UC1 DAM lookup productName:", productName);

  const normalizedProductName = useMemo(
    () => normalizeValue(productName),
    [productName]
  );

  const [personalizedImageUrl, setPersonalizedImageUrl] = useState(null);

  // Start not ready — hold the entire first hero render until we have a
  // definitive answer. This prevents any flash of base content.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Profile hasn't loaded yet — keep holding
    if (!profileLoaded) return;

    let cancelled = false;

    async function resolve() {
      // Profile loaded but no product in it — release hold immediately
      if (!normalizedProductName) {
        if (!cancelled) {
          setPersonalizedImageUrl(null);
          setReady(true);
        }
        return;
      }

      // Product found — fetch the DAM image before releasing the hold
      try {
        const res = await fetch(
          `/api/personalized-hero?product_name=${encodeURIComponent(normalizedProductName)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`DAM lookup failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setPersonalizedImageUrl(data?.imageUrl || null);
          setReady(true);
        }
      } catch (err) {
        console.error("Personalized hero lookup failed:", err);
        // On any error release the hold and show Personalize/base content
        if (!cancelled) {
          setPersonalizedImageUrl(null);
          setReady(true);
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [profileLoaded, normalizedProductName]);

  return {
    personalizedImageUrl,
    ready,
    lyticsUser,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Hero({ content, campaigns = [], locale, withHeader, cslp }) {
  const pathname = usePathname();

  // Lytics hook — result is used only to override the hero image on index 0.
  // It has no effect on variant selection, layout, video, CSLP or any other
  // Personalize-controlled behaviour.
  const { personalizedImageUrl, ready, lyticsUser } =
    usePersonalizedHeroImage();

if (!content || content?.length === 0) return <div></div>;

// DEBUG:
// lets us inspect exactly what Personalize/base content
// Hero.js is receiving before resolver logic runs
console.log(
  "Hero content received by Hero.js",
  content
);

const hasCampaignResolverData =
  Array.isArray(campaigns) && campaigns.length > 0;

const {
  heroes: resolvedContent,
  reason: campaignDecisionReason,
} = hasCampaignResolverData
  ? resolveCampaignHero({
      heroes: content,
      campaigns,
      lyticsUser,
    })
  : {
      heroes: content,
      reason: "uc1_existing_behaviour",
    };

  let positionClass = "";
  let headlineClass = "";
  let bodyClass = "";
  let buttonClass = "";

  if (resolvedContent && resolvedContent?.length > 0) {
    const c0 = resolvedContent?.[0];
    if (c0?.text_position === "Top Left") {
      positionClass = "top-16 left-16";
    } else if (c0?.text_position === "Top Center") {
      positionClass = "top-16 left-1/2 transform -translate-x-1/2 ";
    } else if (c0?.text_position === "Top Right") {
      positionClass = "top-16 right-16";
    } else if (c0?.text_position === "Left") {
      positionClass = "top-1/2 left-16 transform -translate-y-1/2";
    } else if (c0?.text_position === "Center") {
      positionClass =
        "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    } else if (c0?.text_position === "Right") {
      positionClass = "top-1/2 right-16 transform -translate-y-1/2";
      headlineClass = "text-right";
      bodyClass = "text-right";
      buttonClass = "justify-end";
    } else if (c0?.text_position === "Bottom Left") {
      positionClass = "bottom-16 left-16";
    } else if (c0?.text_position === "Bottom Center") {
      positionClass = "bottom-16 left-1/2 transform -translate-x-1/2";
    } else if (c0?.text_position === "Bottom Right") {
      positionClass = "bottom-16 right-16";
    }
  }

  if (resolvedContent && resolvedContent?.length > 0) {
    const c0 = resolvedContent?.[0];
    if (c0?.alignment === "Left") {
      headlineClass = "text-left";
      bodyClass = "text-left";
      buttonClass = "justify-start";
    } else if (c0?.alignment === "Center") {
      headlineClass = "text-center";
      bodyClass = "";
      buttonClass = "justify-center";
    } else if (c0?.alignment === "Right") {
      headlineClass = "text-right";
      bodyClass = "text-right";
      buttonClass = "justify-end";
    }
  }

  if (resolvedContent && resolvedContent?.length) {
    if (resolvedContent?.[0]?.header_overlay !== true) {
      withHeader = false;
    }
  }

  return (
    <>
      {!withHeader && pathname === `/${locale}` && <Header locale={locale} />}
      <motion.div
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true }}
      >
        <div className=" ">
          {resolvedContent?.map((hero, index) => {
            // ── Aspect ratio (unchanged from base) ──────────────────────────
            let aspectRatioClass = "aspect-video";
            if (hero?.aspect_ratio === "16:9") {
              aspectRatioClass = "aspect-video";
            } else if (hero?.aspect_ratio === "3:2") {
              aspectRatioClass = "aspect-[3/2]";
            } else if (hero?.aspect_ratio === "2:1") {
              aspectRatioClass = "aspect-[2/1]";
            } else if (hero?.aspect_ratio === "21:9") {
              aspectRatioClass = "aspect-[21/9]";
            }

            const mediaOpacity = hero?.media_overlay || "75%";

            // ── Image resolution ────────────────────────────────────────────
            //
            // Priority order:
            //   1. Lytics DAM image  — only on index 0, only once ready
            //   2. Personalize variant image  ─┐ both come from the `content`
            //   3. Base entry image            ─┘ prop Personalize already
            //                                     resolved before render
            //
            // Each hero reads ONLY its own image — no cross-variant fallback.
            //
            
            const defaultImageUrl = hero?.image_options?.image?.url || null;

            const allowUc1DamOverride =
              campaignDecisionReason === "contentstack_personalize_or_default" ||
              campaignDecisionReason === "uc1_existing_behaviour" ||
              campaignDecisionReason === "personalize_raw_test";

            const imageFile =
              index === 0 &&
              ready &&
              personalizedImageUrl &&
              allowUc1DamOverride
                ? personalizedImageUrl
                : defaultImageUrl;

            // ───────────────────────────────────────────────────────────────

            const imageHeight = hero?.image_options?.image_height || "h-auto";
            const isScreenHeight = imageHeight === "h-screen";

            const videoFile = hero?.video_options?.video?.url || null;
            const videoControls = hero?.video_options?.video_controls;
            const videoLoop = hero?.video_options?.in_loop;

            const containerHeightClass = videoFile
              ? aspectRatioClass
              : isScreenHeight
              ? "h-screen w-full"
              : aspectRatioClass;

            // ── Hold the entire first hero until the Lytics lookup is done ──
            // This prevents any flash of base image or text before the
            // personalised content is ready. The container is kept at the
            // correct dimensions so the page layout does not shift.
            // if (index === 0 && !ready) {
            //  return (
            //    <div
            //      key={index}
            //      className={`bg-black relative isolate overflow-hidden flex ${containerHeightClass}`}
            //    />
            //  );
            //}
            // ───────────────────────────────────────────────────────────────

            return (
              <div
                key={index}
                className={`bg-black relative isolate overflow-hidden flex ${containerHeightClass}`}
              >
                {process.env.NODE_ENV === "development" && index === 0 && (
                  <div className="absolute top-4 right-4 z-50 rounded bg-black/70 px-4 py-2 text-xs text-white">
                    Campaign: {hero?.campaign_key || "default"} | Reason: {campaignDecisionReason}
                  </div>
                )}

                {videoFile ? (
                  <video
                    className="absolute inset-0 -z-10 min-h-full min-w-full h-full w-full object-cover"
                    style={{ opacity: mediaOpacity }}
                    autoPlay={videoControls === "Autoplay"}
                    controls={videoControls === "Show Controls"}
                    muted={videoControls === "Autoplay"}
                    loop={
                      videoControls === "Autoplay"
                        ? true
                        : videoControls === "Show Controls"
                        ? videoLoop
                        : false
                    }
                  >
                    <source src={videoFile} />
                  </video>
                ) : imageFile ? (
                  <img
                    className="absolute inset-0 -z-10 min-h-full min-w-full h-full w-full object-cover"
                    style={{ opacity: mediaOpacity }}
                    src={imageFile}
                    alt={hero?.header || "Hero image"}
                    {...hero?.image_options?.$?.image}
                    onError={(e) => {
                      // If the Lytics DAM image fails to load, fall back to
                      // whatever Personalize / the base entry provided
                      if (
                        defaultImageUrl &&
                        e.currentTarget.src !== defaultImageUrl
                      ) {
                        e.currentTarget.src = defaultImageUrl;
                      }
                    }}
                  />
                ) : null}

                {withHeader ? <Header color="white" locale={locale} /> : <></>}

                <div className={"absolute max-w-2xl " + positionClass}>
                  <div className="md:w-[42rem]">
                    <motion.div
                      variants={{
                        hidden: { y: 300 },
                        visible: {
                          y: 0,
                          transition: {
                            type: "spring",
                            stiffness: 170,
                            damping: 30,
                          },
                        },
                      }}
                      initial="hidden"
                      animate="visible"
                      {...hero?.$?.text_position}
                    >
                      <h1
                        className={"mt-8 text-white " + headlineClass}
                        {...hero?.$?.header}
                      >
                        {hero?.header}
                      </h1>

                      <p
                        className={"mt-8 text-left text-white " + bodyClass}
                        style={{
                          fontSize: hero?.body_text_size
                            ? hero?.body_text_size
                            : "16px",
                        }}
                        {...hero?.$?.body}
                      >
                        {hero?.body}
                      </p>

                      {hero?.button_text !== "" && (
                        <div
                          className={
                            "mt-10 flex items-center gap-x-6 " + buttonClass
                          }
                        >
                          {hero?.page && (
                            <Link
                              href={
                                hero?.page?.length > 0 && hero?.page?.[0]?.url
                                  ? hero?.page?.[0]?.url
                                  : "#"
                              }
                              className="rounded-md button px-8 py-4 text-md tracking-widest uppercase font-bold text-white shadow-sm ring-2 ring-inset ring-gray-300 hover:text-neutral-700 hover:bg-gray-50"
                              {...hero?.$?.button_text}
                              onClick={() => {
                                const lytics = hero?.analytics_lytics_tracking;

                                if (typeof window !== "undefined" && window?.jstag && lytics?.lytics_event_name) {
                                  window.jstag.send({
                                    event: lytics.lytics_event_name,
                                    cta_name: lytics.lytics_cta_name || hero?.button_text,
                                    intent: lytics.lytics_intent || "",
                                    campaign: lytics.lytics_campaign || "",
                                    hero_header: hero?.header || "",
                                    button_text: hero?.button_text || "",
                                    page_url: window.location.pathname,
                                    destination_url:
                                      hero?.page?.length > 0 && hero?.page?.[0]?.url
                                        ? hero.page[0].url
                                        : "",
                                  });
                                }
                              }}
                            >
                              {hero?.button_text}
                            </Link>
                          )}
                        </div>
                      )}

                      {/* ── Lytics loyalty badge ──────────────────────────────
                          Purely additive — renders below the CTA if the Lytics
                          profile indicates a loyalty member. Has no effect on
                          Personalize variant selection or any other hero content.
                      ──────────────────────────────────────────────────────── */}
                      {lyticsUser?.cc_customer_data_loyalty_program_member && (
                        <div className="mt-8 flex justify-center w-full">
                          <span
                            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide shadow-lg ring-1 ring-white/30"
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.18)",
                              color: "white",
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            {lyticsUser?.cc_customer_data_loyalty_tier ||
                              "Loyalty"}{" "}
                            member
                            {lyticsUser?.cc_customer_data_loyalty_points !=
                              null && (
                              <>
                                <span className="opacity-70" aria-hidden>
                                  ·
                                </span>
                                {Number(
                                  lyticsUser.cc_customer_data_loyalty_points
                                ).toLocaleString()}{" "}
                                points
                              </>
                            )}
                            <span className="opacity-70" aria-hidden>
                              —
                            </span>
                            your perks are ready when you are
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}