const express = require("express");
const cors = require("cors");
const ccxt = require("ccxt");

const app = express();
const port = process.env.PORT || 8080;

// CORS para permitir peticiones desde tu WordPress
app.use(cors({
  origin: "https://grey-panther-206275.hostingersite.com", // tu dominio
  methods: ["GET"],
  optionsSuccessStatus: 200
}));

app.get("/precios", async (req, res) => {
  const coins = ["BTC/USDT", "ETH/USDT", "BNB/USDT"];
  const exchanges = ["binance", "kraken", "kucoin"];

  const result = {};

  for (const coin of coins) {
    result[coin] = {};

    const tasks = exchanges.map(async (ex) => {
      try {
        // Excluir pares no soportados directamente
        if (ex === "kraken" && coin === "BNB/USDT") {
          result[coin][ex] = null;
          console.warn(`⛔ Kraken no soporta ${coin}`);
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

    await Promise.allSettled(tasks); // evita que un error pare todo
  }

  res.json(result);
});

app.listen(port, () => {
  console.log(`✅ Servidor Express escuchando en puerto ${port}`);
});
