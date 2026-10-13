export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-MBX-APIKEY, X-Target-Uri");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Prefer X-Target-Uri header so signed query string is 100% untouched
  let targetUri = req.headers["x-target-uri"] || req.url || "/fapi/v1/ping";
  if (!targetUri.startsWith("/fapi/") && !targetUri.startsWith("/dapi/")) {
    targetUri = "/fapi/v1/ping";
  }

  const targetUrl = "https://fapi.binance.com" + targetUri;
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) QuantRadarTokyo/2.0"
  };

  if (req.headers["x-mbx-apikey"]) {
    headers["X-MBX-APIKEY"] = req.headers["x-mbx-apikey"];
  }
  if (req.headers["content-type"]) {
    headers["Content-Type"] = req.headers["content-type"];
  }

  try {
    const fetchOpts = {
      method: req.method || "GET",
      headers: headers
    };
    if (req.method === "POST" && req.body) {
      fetchOpts.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOpts);
    const text = await response.text();

    res.status(response.status);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.send(text);
  } catch (err) {
    return res.status(502).json({
      status: "error",
      message: "Tokyo Relay Error: " + err.message
    });
  }
}
