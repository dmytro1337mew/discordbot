const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is alive!"));
app.get("/healthz", (req, res) => res.send("OK"));

app.listen(PORT, () => console.log(`✅ Healthcheck server running on port ${PORT}`));