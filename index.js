const express = require("express");
const cors = require("cors");
const ccxt = require("ccxt");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/precios", async (req, res) => {
  const coins = [
    "BTC/USDT",
    "ETH/USDT",
    "BNB/USDT",
    "SOL/USDT",
    "XRP/USDT",
    "ARB/USDT",
    "OP/USDT",
    "PEPE/USDT",
    "DOGE/USDT"
  ];

  const exchanges = [
    "binance",
    "kraken",
    "kucoin",
    "bitmart",
    "cryptocom",
    "bybit",
    "bitget"
  ];

  const result = {};

  for (const coin of coins) {
    result[coin] = {};

    const promises = exchanges.map(async (ex) => {
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
    });

    await Promise.all(promises);
  }

  res.json(result);
});

app.listen(port, () => {
  console.log(`✅ Servidor Express escuchando en puerto ${port}`);
});
