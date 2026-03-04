// api/proxy.js — CommonJS version for Vercel
module.exports = async function (req, res) {
  // Handle preflight for CORS
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { domain, token, query } = req.body;

  if (!domain || !token || !query) {
    return res.status(400).json({ error: "Missing domain, token, or query." });
  }

  try {
    // Use native fetch (available in Vercel Node runtime)
    const response = await fetch(`https://${domain}/api/graphql`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(data);
    } catch (err) {
      res.status(500).json({
        error: "Non-JSON response from Canvas. Check token/domain.",
        raw: text,
      });
    }
  } catch (err) {
    res.status(500).json({ error: "Fetch failed: " + err.message });
  }
};
