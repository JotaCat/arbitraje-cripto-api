const express = require("express");
const cors = require("cors");
const ccxt = require("ccxt");

const app = express();
const port = process.env.PORT || 8080;

// ✅ CORS para permitir peticiones desde tu WordPress
app.use(cors({
  origin: "https://grey-panther-206275.hostingersite.com",
  methods: ["GET"],
  optionsSuccessStatus: 200
}));

// 🪙 Pares de criptos y exchanges
const coins = ["BTC/USDT", "ETH/USDT", "BNB/USDT"];
const exchanges = ["binance", "kraken", "kucoin"]; // Agrega más cuando esté estable

app.get("/precios", async (req, res) => {
  const result = {};

  for (const coin of coins) {
    result[coin] = {};

    const tasks = exchanges.map(async (ex) => {
      try {
        const exchange = new ccxt[ex]({
          timeout: 10000,
          enableRateLimit: true,
          options: ex === "binance" ? { defaultType: "spot" } : {}
        });

        await exchange.loadMarkets();

        if (!exchange.markets[coin]) {
          console.warn(`⚠️ ${coin} no soportado en ${ex}`);
          result[coin][ex] = null;
          return;
        }

        const ticker = await exchange.fetchTicker(coin);

        result[coin][ex] = {
          price: ticker.last,
          timestamp: ticker.timestamp
        };

        console.log(`✅ ${coin} en ${ex}: $${ticker.last}`);
      } catch (err) {
        console.error(`❌ Error en ${ex} para ${coin}:`, err.message);
        result[coin][ex] = null;
      }
    });

    await Promise.allSettled(tasks); // Para que no se caiga si falla un exchange
  }

  res.json(result);
});

app.listen(port, () => {
  console.log(`✅ Servidor Express escuchando en puerto ${port}`);
});
