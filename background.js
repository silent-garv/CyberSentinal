chrome.webNavigation.onCompleted.addListener(async (details) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url.startsWith("http")) return;

  const url = new URL(tab.url);
  const domain = url.hostname;

  const result = await checkUrlAgainstAPIs(domain);
  chrome.action.setBadgeText({ tabId: tab.id, text: result.status });
  chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: result.color });

  if (result.log) await sendToLogtail(result);
});

async function checkUrlAgainstAPIs(domain) {
  let risk = 0;
  let hits = [];
  const settings = await getUserSettings();

  if (settings.urlCheck) {
    const gsb = await checkGoogleSafeBrowsing(domain);
    if (gsb.flagged) risk += 4, hits.push("GSB");

    const phish = await checkPhishTank(domain);
    if (phish.flagged) risk += 3, hits.push("PhishTank");

    const otx = await checkOTX(domain);
    if (otx.flagged) risk += 2, hits.push("OTX");
  }

  const status = risk >= 7 ? "❌" : risk >= 4 ? "⚠" : "✅";
  return { type: "url", value: domain, risk_score: risk, api_hits: hits, status, color: status === "✅" ? "green" : status === "⚠" ? "orange" : "red", log: settings.logging };
}

async function sendToLogtail(data) {
  const logData = {
    ...data,
    timestamp: new Date().toISOString()
  };
  await fetch("https://in.logtail.com", {
    method: "POST",
    headers: {
      Authorization: "Bearer YOUR_LOGTAIL_TOKEN",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(logData)
  });
}

function getUserSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(["urlCheck", "ipCheck", "emailCheck", "logging"], (res) => {
      resolve({
        urlCheck: res.urlCheck !== false,
        ipCheck: res.ipCheck !== false,
        emailCheck: res.emailCheck !== false,
        logging: res.logging !== false
      });
    });
  });
}
// Mock/placeholder API functions
async function checkGoogleSafeBrowsing(domain) {
  // Replace with real Safe Browsing API call
  return { flagged: domain.includes("phish") };
}

async function checkPhishTank(domain) {
  // Replace with PhishTank lookup
  return { flagged: domain.includes("phishing") };
}

async function checkOTX(domain) {
  // Replace with AlienVault OTX threat lookup
  return { flagged: domain.includes("malware") };
}
