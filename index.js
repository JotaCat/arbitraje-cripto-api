const express = require("express");
const ccxt = require("ccxt");

const app = express();
const port = process.env.PORT || 3000;

app.get("/precios", async (req, res) => {
  const coins = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "XRP/USDT", "USDT/USD", "USDC/USD"];
  const exchanges = ["binance", "coinbasepro", "kraken", "kucoin", "bitmart", "cryptocom", "gemini"];
  const result = {};

  for (const coin of coins) {
    result[coin] = {};
    for (const ex of exchanges) {
      try {
        const exchange = new ccxt[ex]();
        const ticker = await exchange.fetchTicker(coin);
        result[coin][ex] = {
          price: ticker.last,
          timestamp: ticker.timestamp,
        };
      } catch (err) {
        result[coin][ex] = null;
      }
    }
  }

  res.json(result);
});

app.listen(port, () => {
  console.log(`✅ Servidor Express escuchando en puerto ${port}`);
});

