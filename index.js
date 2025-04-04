const express = require("express");
const cors = require("cors");
const ccxt = require("ccxt");

const app = express();
const port = process.env.PORT || 8080;

// CORS para permitir peticiones desde tu WordPress
app.use(cors({
  origin: "https://grey-panther-206275.hostingersite.com",
  methods: ["GET"],
  optionsSuccessStatus: 200
}));

// Nuevas monedas y exchanges
const coins = [
  "BTC/USDT", "ETH/USDT", "BNB/USDT",
  "SOL/USDT", "DOGE/USDT", "ADA/USDT"
];

const exchanges = [
  "binance", "kraken", "kucoin",
  "bitget", "bybit", "okx"
];

app.get("/precios", async (req, res) => {
  const result = {};

  for (const coin of coins) {
    result[coin] = {};

    const tasks = exchanges.map(async (ex) => {
      try {
        if ((ex === "kraken" && coin === "BNB/USDT") || 
            (ex === "kraken" && coin === "ADA/USDT")) {
          result[coin][ex] = null;
          console.warn(`⛔ ${coin} no soportado en ${ex}`);
          return;
        }

        const exchange = new ccxt[ex]({
          timeout: 10000,
          enableRateLimit: true,
          options: ex === "binance" ? { defaultType: "spot" } : {}
        });

        await exchange.loadMarkets();

        if (!exchange.markets || !exchange.markets[coin]) {
          result[coin][ex] = null;
          console.warn(`⚠️ ${coin} no está disponible en ${ex}`);
          return;
        }

        const ticker = await exchange.fetchTicker(coin);
        result[coin][ex] = {
          price: ticker.last,
          timestamp: ticker.timestamp
        };

        console.log(`✅ ${coin} en ${ex}: $${ticker.last}`);
      } catch (err) {
        result[coin][ex] = null;
        console.error(`❌ Error en ${ex} para ${coin}: ${err.message}`);
      }
    });

    await Promise.allSettled(tasks);
  }

  res.json(result);
});

app.listen(port, () => {
  console.log(`✅ Servidor Express escuchando en puerto ${port}`);
});
