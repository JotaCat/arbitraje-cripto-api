const express = require("express");
const cors = require("cors");
const ccxt = require("ccxt");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: "https://grey-panther-206275.hostingersite.com",
  methods: ["GET"],
  optionsSuccessStatus: 200
}));

app.get("/precios", async (req, res) => {
  const coins = [
    "BTC/USDT", "ETH/USDT", "BNB/USDT",
    "SOL/USDT", "XRP/USDT"
  ];

  // Mantenemos solo los más estables por ahora
  const exchanges = ["binance", "kucoin", "kraken", "bitget"];

  const result = {};

  for (const coin of coins) {
    result[coin] = {};

    const tasks = exchanges.map(async (ex) => {
      try {
        const exchange = new ccxt[ex]({
          timeout: 4000,  // menor tiempo de espera
          enableRateLimit: true  // para evitar baneos
        });

        // Verificamos si el par existe en el exchange
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
      } catch (error) {
        console.error(`❌ Error en ${ex} para ${coin}: ${error.message}`);
        result[coin][ex] = null;
      }
    });

    await Promise.allSettled(tasks); // evitamos que falle por un solo exchange
  }

  res.json(result);
});

app.listen(port, () => {
  console.log(`✅ Servidor Express escuchando en puerto ${port}`);
});
