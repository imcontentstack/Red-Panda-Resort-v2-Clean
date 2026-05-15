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
    header: campaign?.campaign_name || heroes[0]?.header,
    body: campaign?.page_title || heroes[0]?.body,
    campaign_key: key,
  };
}

export function resolveCampaignHero({ heroes = [], campaigns = [], lyticsUser }) {
  const activeCampaigns = campaigns.filter(isCampaignActive);

  const testAffinity =
    typeof window !== "undefined" ? localStorage.getItem("test_affinity") : null;

  const matchedAudienceKeys = [
    "all",
    testAffinity ? String(testAffinity).trim().toLowerCase() : null,
    lyticsUser?.audience_christmas ? "christmas" : null,
    lyticsUser?.audience_pokemon ? "pokemon" : null,
    lyticsUser?.audience_zelda ? "zelda" : null,
    lyticsUser?.audience_parent ? "duplo" : null,
    lyticsUser?.audience_afol ? "technic" : null,
    lyticsUser?.primary_trading_set_affinity
      ? String(lyticsUser.primary_trading_set_affinity).trim().toLowerCase()
      : null,
  ].filter(Boolean);

  if (typeof window !== "undefined") {
    console.log("Campaign resolver debug", {
      testAffinity,
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

  const audienceMatch = activeCampaigns
    .filter((campaign) => {
      const key = getCampaignKey(campaign);
      return key && matchedAudienceKeys.includes(key);
    })
    .sort((a, b) => getPriority(b) - getPriority(a))[0];

  if (audienceMatch) {
    const hero = findHeroForCampaign(heroes, audienceMatch);
    return {
      heroes: hero ? [hero] : heroes?.length ? [heroes[0]] : [],
      reason: testAffinity ? "test_affinity_match" : "audience_match",
    };
  }

  return {
    heroes: heroes?.length ? [heroes[0]] : [],
    reason: "default",
  };
}