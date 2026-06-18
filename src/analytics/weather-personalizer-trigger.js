javascript
// Client-side pattern:
// - Trigger AgentOS Weather Personalizer on the FIRST page load only
// - Don’t run again for 24 hours (per browser)
// - Always pass the visitor’s Lytics seerid as `uid`
//
// NOTE: You still need to paste your AgentOS HTTP Request Trigger Invocation URL here.
// The Lytics PATCH endpoint you shared is NOT the trigger URL.

const AGENT_INVOCATION_URL = "https://app.contentstack.com/agents-api/agents/execute/4bf0c672c59a4f929021b5f5b85ebb4c";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = "weather_personalizer_last_run_ts";

function shouldRunWeatherPersonalizer(now = Date.now()) {
  const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
  return !last || now - last >= ONE_DAY_MS;
}

function markWeatherPersonalizerRan(now = Date.now()) {
  localStorage.setItem(STORAGE_KEY, String(now));
}

// Your site needs to provide the visitor seerid.
// The agent expects a uid in the request body or a header.
function getVisitorSeerid() {
  // Replace with your actual seerid source.
  // Must be the Lytics seerid/uid you want used for the profile lookup & write-back.
  return window.lyticsSeerid || null;
}

async function runWeatherPersonalizerOncePerDay() {
  if (!shouldRunWeatherPersonalizer()) return;

  const uid = getVisitorSeerid();
  if (!uid) return; // agent will skip if uid is missing

  // Call the agent trigger.
  // Using POST with JSON body so `body.uid` is present (matches agent instructions).
  await fetch(AGENT_INVOCATION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Alternative if you prefer header instead of body:
      // "uid": uid,
    },
    body: JSON.stringify({ uid }),
  });

  // Mark as ran even if the agent returns a "skipped" writeback_status;
  // this enforces the once-per-24-hours behavior.
  markWeatherPersonalizerRan();
}

// Call on every page load; it will only trigger once per 24 hours.
runWeatherPersonalizerOncePerDay();