const express = require("express");
const cors = require("cors");
const ccxt = require("ccxt");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // <-- ¡Activa CORS!

app.get("/precios", async (req, res) => {
  const coins = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "XRP/USDT", "USDT/USD", "USDC/USD"];
  const exchanges = ["binance", "coinbasepro", "kraken", "kucoin", "bitmart", "cryptocom", "gemini"];
  const result = {};

  for (const coin of coins) {
    result[coin] = {};
    for (const ex of exchanges) {
      try {
        const exchange = new ccxt[ex]();
        const ticker = await exchange.fetch

