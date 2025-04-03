const express = require("express");
const cors = require("cors");
const ccxt = require("ccxt");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/precios", async (req, res) => {
  try {
    const coins = ["BTC/USDT", "ETH/USDT", "BNB/USDT"];
    const exchanges = ["binance", "kraken", "kucoin"];
    const result = {};

    for (const coin of coins) {
      result[coin] = {};
      for (const ex of exchanges) {
        try {
          const exchange = new ccxt[ex]();
          const ticker = await exchange.fetchTicker(coin);
          result[coin][ex] = {
            price: ticker.last,
            timestamp: ticker.timestamp
          };
        } catch {
          result[coin][ex] = null;
        }
      }
    }

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor Express escuchando en puerto ${port}`);
});

