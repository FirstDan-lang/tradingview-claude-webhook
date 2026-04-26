const express = require("express");
const app = express();
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.post("/webhook", async (req, res) => {
  const alert = req.body;
  console.log("🔔 Alert received from TradingView:", JSON.stringify(alert, null, 2));

  const prompt = `
    A TradingView alert just fired. Here is the data:
    - Ticker: ${alert.ticker}
    - Price: ${alert.price}
    - Interval/Timeframe: ${alert.interval}
    - Signal: ${alert.signal}
    - Time: ${alert.time}

    Please do the following:
    1. Analyze this trading signal and what it suggests about market direction.
    2. Based on the price and ticker, identify likely key support and resistance levels.
    3. Give a clear trade idea with: Entry price, Stop Loss, and Take Profit target.
    4. Rate the trade setup quality: Strong / Moderate / Weak — and explain why.
  `;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const analysis = data.content[0].text;

    console.log("🤖 Claude's Analysis:\n");
    console.log(analysis);
    console.log("\n" + "=".repeat(60) + "\n");

    res.json({ success: true, analysis });

  } catch (err) {
    console.error("❌ Error calling Claude:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("✅ Webhook server is running and ready!");
});
