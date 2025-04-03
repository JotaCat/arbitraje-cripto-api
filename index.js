const express = require("express");
const cors = require("cors");
const ccxt = require("ccxt");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/precios", async (req, res) => {
  const result = {};
  const coins = ["BTC/USDT", "ETH/USDT"];
  const exchanges = ["binance", "kraken", "kucoin"];

  try {
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
  } catch (e) {
    res.status(500).json({ error: "Error al procesar precios" });
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en el puerto ${port}`);
});
