const express = require("express");
const cors = require("cors");
const ccxt = require("ccxt");

const app = express();
const port = process.env.PORT || 3000;

// CORS para permitir peticiones desde tu WordPress
app.use(cors({
  origin: "https://grey-panther-206275.hostingersite.com",
  methods: ["GET"],
  optionsSuccessStatus: 200
}));

app.get("/precios", async (req, res) => {
  const coins = [
    "BTC/USDT", "ETH/USDT", "BNB/USDT"
    // Puedes añadir más una vez que funcione todo fluido
  ];

  const exchanges = [
    "binance", "kraken", "kucoin"
    // Añadir más luego: "bitmart", "cryptocom", "bybit", "bitget"
  ];

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

        const ticker = await exchange.fetchTicker(coin);
        result[coin][ex] = {
          price: ticker.last,
          timestamp: ticker.timestamp
        };

        console.log(`✅ ${coin} en ${ex}: $${ticker.last}`);
      } catch (err) {
        result[coin][ex] = null;
        console.error(`❌ Error en ${ex} para ${coin}:`, err.message);
      }
    });

    // Sigue con otras tareas aunque una falle
    await Promise.allSettled(tasks);
  }

  res.json(result);
});

app.listen(port, () => {
  console.log(`✅ Servidor Express escuchando en puerto ${port}`);
});
