const express = require("express");
const cors = require("cors");
const ccxt = require("ccxt");

const app = express();
const port = process.env.PORT || 8080;

// ✅ CORS configurado para tu dominio de WordPress
app.use(cors({
  origin: ["https://grey-panther-206275.hostingersite.com"], // <--- tu dominio WordPress
  methods: ["GET"],
  optionsSuccessStatus: 200
}));

// ⏱️ Establece un timeout global por si algún exchange se cuelga
const TIMEOUT = 5000;

// 🪙 Pares y exchanges a usar
const coins = [
  "BTC/USDT", "ETH/USDT", "BNB/USDT"
];

const exchanges = [
  "binance", "kraken", "kucoin"
];

app.get("/precios", async (req, res) => {
  const result = {};

  for (const coin of coins) {
    result[coin] = {};

    const tasks = exchanges.map(async (ex) => {
      try {
        const exchange = new ccxt[ex]({
          timeout: TIMEOUT
        });

        const ticker = await exchange.fetchTicker(coin);

        result[coin][ex] = {
          price: ticker.last,
          timestamp: ticker.timestamp
        };

        console.log(`✅ ${coin} en ${ex}: $${ticker.last}`);
      } catch (err) {
        console.log(`❌ Error en ${ex} para ${coin}:`, err.message);
        result[coin][ex] = null;
      }
    });

    await Promise.all(tasks);
  }

  res.json(result);
});

// 🔥 Inicia el servidor
app.listen(port, () => {
  console.log(`✅ Servidor Express escuchando en puerto ${port}`);
});
