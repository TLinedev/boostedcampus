// api/proxy.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { domain, token, query } = req.body;

  if(!domain || !token || !query) 
      return res.status(400).json({ error: "Missing parameters" });

  try {
    const response = await fetch(`https://${domain}/api/graphql`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();

    // Allow browser to fetch from this server
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
