// api/proxy.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  // Allow preflight requests
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
    return;
  }

  const { domain, token, query } = req.body;

  if (!domain || !token || !query) {
    return res.status(400).json({ error: "Missing domain, token, or query." });
  }

  try {
    const response = await fetch(`https://${domain}/api/graphql`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const text = await response.text();

    // Try parsing JSON, if fails return raw text for debugging
    try {
      const data = JSON.parse(text);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
      res.json(data);
    } catch (err) {
      res.status(500).json({ 
        error: "Non-JSON response from Canvas. Probably invalid token or domain.",
        raw: text 
      });
    }

  } catch (err) {
    res.status(500).json({ error: "Fetch failed: " + err.message });
  }
}
