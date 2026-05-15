export function isCampaignActive(hero) {
  const now = new Date();

  const active =
    hero?.campaign_active === true ||
    hero?.active === true ||
    hero?.campaign_section?.active === true;

  const startDate =
    hero?.campaign_start_date ||
    hero?.start_date ||
    hero?.campaign_section?.start_date;

  const endDate =
    hero?.campaign_end_date ||
    hero?.end_date ||
    hero?.campaign_section?.end_date;

  const startOk = !startDate || new Date(startDate) <= now;
  const endOk = !endDate || new Date(endDate) >= now;

  return active && startOk && endOk;
}

function getPriority(hero) {
  return Number(hero?.priority || hero?.campaign_section?.priority || 0);
}

function getCampaignKey(hero) {
  return String(
    hero?.campaign_key || hero?.campaign_section?.campaign_key || ""
  )
    .trim()
    .toLowerCase();
}

export function resolveCampaignHero({ heroes = [], lyticsUser }) {
  const activeHeroes = heroes.filter(isCampaignActive);

  const testAffinity =
    typeof window !== "undefined"
      ? localStorage.getItem("test_affinity")
      : null;

  const manualOverride = activeHeroes
    .filter(
      (hero) =>
        hero?.manual_override === true ||
        hero?.campaign_section?.manual_override === true
    )
    .sort((a, b) => getPriority(b) - getPriority(a))[0];

  if (manualOverride) {
    return {
      heroes: [manualOverride],
      reason: "manual_override",
    };
  }

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
      activeHeroes: activeHeroes.map((hero) => ({
        header: hero?.header,
        campaign_key: hero?.campaign_key || hero?.campaign_section?.campaign_key,
        active: hero?.active || hero?.campaign_active || hero?.campaign_section?.active,
        manual_override:
          hero?.manual_override || hero?.campaign_section?.manual_override,
        priority: hero?.priority || hero?.campaign_section?.priority,
      })),
    });
  }

  const audienceMatch = activeHeroes
    .filter((hero) => {
      const key = getCampaignKey(hero);
      return key && matchedAudienceKeys.includes(key);
    })
    .sort((a, b) => getPriority(b) - getPriority(a))[0];

  if (audienceMatch) {
    return {
      heroes: [audienceMatch],
      reason: testAffinity ? "test_affinity_match" : "audience_match",
    };
  }

  return {
    heroes: heroes?.length ? [heroes[0]] : [],
    reason: "default",
  };
}