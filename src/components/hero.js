"use client";
import Link from "next/link";
import Header from "./header";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEntity } from "@/context/lyticsTracking";
import { useEffect, useMemo, useState } from "react";

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
 * Returns:
 *   personalizedImageUrl — the DAM image URL, or null if none found
 *   isResolving          — true only while an active fetch is in flight
 *   lyticsUser           — raw Lytics user object for any other profile fields
 */
function usePersonalizedHeroImage() {
  const lyticsProfile = useEntity();
  const lyticsUser = lyticsProfile?.data?.user || null;

  const productName =
    lyticsUser?.latest_product_add_to_cart_item ||
    lyticsUser?.product_add_to_cart_item ||
    null;

  const normalizedProductName = useMemo(
    () => normalizeValue(productName),
    [productName]
  );

  const [personalizedImageUrl, setPersonalizedImageUrl] = useState(null);
  const [lookupComplete, setLookupComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      // No product in profile — nothing to look up, unblock immediately
      if (!normalizedProductName) {
        setPersonalizedImageUrl(null);
        setLookupComplete(true);
        return;
      }

      setLookupComplete(false);

      try {
        const res = await fetch(
          `/api/personalized-hero?product_name=${encodeURIComponent(normalizedProductName)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`DAM lookup failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setPersonalizedImageUrl(data?.imageUrl || null);
          setLookupComplete(true);
        }
      } catch (err) {
        console.error("Personalized hero lookup failed:", err);
        // On any error, fall through to Personalize / base image gracefully
        if (!cancelled) {
          setPersonalizedImageUrl(null);
          setLookupComplete(true);
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [normalizedProductName]);

  return {
    personalizedImageUrl,
    isResolving: !!normalizedProductName && !lookupComplete,
    lyticsUser,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Hero({ content, locale, withHeader, cslp }) {
  const pathname = usePathname();

  // Lytics hook — result is used only to override the hero image on index 0.
  // It has no effect on variant selection, layout, video, CSLP or any other
  // Personalize-controlled behaviour.
  const { personalizedImageUrl, isResolving, lyticsUser } =
    usePersonalizedHeroImage();

  if (!content || content?.length === 0) return <div></div>;

  let positionClass = "";
  let headlineClass = "";
  let bodyClass = "";
  let buttonClass = "";

  if (content && content?.length > 0) {
    const c0 = content?.[0];
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

  if (content && content?.length > 0) {
    const c0 = content?.[0];
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

  if (content && content?.length) {
    if (content?.[0]?.header_overlay !== true) {
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
          {content?.map((hero, index) => {
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
            //   1. Lytics DAM image  — only on index 0, only when the async
            //                          lookup has returned a result
            //   2. Personalize variant image  ─┐ both come from the `content`
            //   3. Base entry image            ─┘ prop Personalize already
            //                                     resolved before render
            //
            // Each hero reads ONLY its own image — no cross-variant fallback.
            //
            const defaultImageUrl = hero?.image_options?.image?.url || null;
            const imageFile =
              index === 0 && !isResolving && personalizedImageUrl
                ? personalizedImageUrl
                : defaultImageUrl;

            // Hold the image render on index 0 while the Lytics lookup is in
            // flight. Because the Lytics profile loads almost instantly this
            // hold is imperceptible but eliminates the visible swap from the
            // base/Personalize image to the DAM image.
            const shouldHoldImage = index === 0 && isResolving;

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

            return (
              <div
                key={index}
                className={`bg-black relative isolate overflow-hidden flex ${containerHeightClass}`}
              >
                {shouldHoldImage ? (
                  // Matches the bg-black container so no visible change while
                  // the DAM lookup completes
                  <div className="absolute inset-0 -z-10 bg-black" />
                ) : videoFile ? (
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