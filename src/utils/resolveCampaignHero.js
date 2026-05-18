export function isCampaignActive(campaign) {
  const now = new Date();

  const active =
    campaign?.campaign_active === true ||
    campaign?.active === true ||
    campaign?.campaign_section?.active === true;

  const startDate =
    campaign?.campaign_start_date ||
    campaign?.start_date ||
    campaign?.campaign_section?.start_date;

  const endDate =
    campaign?.campaign_end_date ||
    campaign?.end_date ||
    campaign?.campaign_section?.end_date;

  const startOk = !startDate || new Date(startDate) <= now;
  const endOk = !endDate || new Date(endDate) >= now;

  return active && startOk && endOk;
}

function getPriority(campaign) {
  return Number(campaign?.priority || campaign?.campaign_section?.priority || 0);
}

function getCampaignKey(item) {
  return String(item?.campaign_key || item?.campaign_section?.campaign_key || "")
    .trim()
    .toLowerCase();
}

function findHeroForCampaign(heroes, campaign) {
  const key = getCampaignKey(campaign);

  const matchedHero =
    heroes.find((hero) => getCampaignKey(hero) === key) ||
    heroes.find((hero) =>
      String(hero?.header || "").toLowerCase().includes(key)
    );

  if (matchedHero) return matchedHero;

  return {
    ...heroes[0],
    ...(campaign?.hero || {}),
    header:
      campaign?.hero?.headline ||
      campaign?.hero?.header ||
      campaign?.campaign_name ||
      heroes[0]?.header,
    body:
      campaign?.hero?.details ||
      campaign?.hero?.body ||
      campaign?.page_title ||
      heroes[0]?.body,
    image_options: {
      ...(heroes[0]?.image_options || {}),
      image:
        campaign?.hero?._metadata?.image?.url
          ? campaign.hero._metadata.image
          : campaign?.hero?.image?.url
          ? campaign.hero.image
          : campaign?.hero?.image_options?.image?.url
          ? campaign.hero.image_options.image
          : heroes[0]?.image_options?.image,
    },
    campaign_key: key,
  };
}

export function resolveCampaignHero({ heroes = [], campaigns = [], lyticsUser }) {
  const activeCampaigns = campaigns.filter(isCampaignActive);

  const testAffinity =
    typeof window !== "undefined" ? localStorage.getItem("test_affinity") : null;

  const latestCampaignInterest = lyticsUser?.latest_campaign_interest
    ? String(lyticsUser.latest_campaign_interest).trim().toLowerCase()
    : null;

const matchedAudienceKeys = [
  "all",
  testAffinity ? String(testAffinity).trim().toLowerCase() : null,
  latestCampaignInterest,

  lyticsUser?.audience_christmas ? "christmas" : null,
  lyticsUser?.audience_pokemon ? "pokemon" : null,
  lyticsUser?.audience_zelda ? "zelda" : null,
  lyticsUser?.audience_parent ? "duplo" : null,
  lyticsUser?.audience_afol ? "technic" : null,

  hasSegment("poc_uc2_low_affinity") ? "low-affinity" : null,

  lyticsUser?.primary_trading_set_affinity
    ? String(lyticsUser.primary_trading_set_affinity).trim().toLowerCase()
    : null,
].filter(Boolean);

  if (typeof window !== "undefined") {
    console.log("Campaign resolver debug", {
      testAffinity,
      latestCampaignInterest,
      matchedAudienceKeys,
      activeCampaigns: activeCampaigns.map((campaign) => ({
        campaign_key: getCampaignKey(campaign),
        active:
          campaign?.active ||
          campaign?.campaign_active ||
          campaign?.campaign_section?.active,
        manual_override:
          campaign?.manual_override || campaign?.campaign_section?.manual_override,
        priority: getPriority(campaign),
      })),
    });
  }

  const manualOverride = activeCampaigns
    .filter(
      (campaign) =>
        campaign?.manual_override === true ||
        campaign?.campaign_section?.manual_override === true
    )
    .sort((a, b) => getPriority(b) - getPriority(a))[0];

  if (manualOverride) {
    const hero = findHeroForCampaign(heroes, manualOverride);
    return {
      heroes: hero ? [hero] : heroes?.length ? [heroes[0]] : [],
      reason: "manual_override",
    };
  }

  if (latestCampaignInterest) {
    const latestInterestMatch = activeCampaigns.find((campaign) => {
      const key = getCampaignKey(campaign);
      return key && key === latestCampaignInterest && matchedAudienceKeys.includes(key);
    });

   const segments = Array.isArray(lyticsUser?.segments)
  ? lyticsUser.segments
  : [];

    const hasSegment = (segment) => segments.includes(segment);
    
  if (latestInterestMatch) {
      const hero = findHeroForCampaign(heroes, latestInterestMatch);
      return {
        heroes: hero ? [hero] : heroes?.length ? [heroes[0]] : [],
        reason: "latest_interest_match",
      };
    }
  }

  // HYBRID MODE:
  // If there is no manual override and no latest-interest campaign winner,
  // do NOT force a CMS campaign match here.
  // Return the original hero content exactly as Contentstack Personalize resolved it.
  return {
    heroes: heroes?.length ? heroes : [],
    reason: "contentstack_personalize_or_default",
  };
}