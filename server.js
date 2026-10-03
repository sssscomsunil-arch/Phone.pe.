const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

let demoCode = process.env.INITIAL_DEMO_CODE || "DEMO2026";

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
  console.error(
    "Missing BOT_TOKEN or ADMIN_CHAT_ID in .env"
  );
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, {
  polling: true
});

app.use(express.json());

app.use(express.static(path.join(__dirname)));


// ------------------------------
// CODE VERIFICATION
// ------------------------------

app.post("/api/verify-code", (req, res) => {

  const code =
    typeof req.body.code === "string"
      ? req.body.code.trim()
      : "";

  if (!code) {
    return res.json({
      valid: false
    });
  }

  return res.json({
    valid: code === demoCode
  });
});


// ------------------------------
// TELEGRAM ADMIN CHECK
// ------------------------------

function isAdmin(msg) {

  return String(msg.chat.id) ===
         String(ADMIN_CHAT_ID);

}


// ------------------------------
// TELEGRAM COMMANDS
// ------------------------------

bot.onText(/^\/start$/, async (msg) => {

  if (!isAdmin(msg)) {
    return bot.sendMessage(
      msg.chat.id,
      "Unauthorized."
    );
  }

  await bot.sendMessage(
    msg.chat.id,
    [
      "Phone.pe Demo Control",
      "",
      "Current demo code:",
      "Use /code to change it.",
      "",
      "Commands:",
      "/code NEWCODE",
      "/status",
      "/help"
    ].join("\n")
  );

});


bot.onText(/^\/help$/, async (msg) => {

  if (!isAdmin(msg)) {
    return bot.sendMessage(
      msg.chat.id,
      "Unauthorized."
    );
  }

  await bot.sendMessage(
    msg.chat.id,
    [
      "Demo code commands:",
      "",
      "/code NEWCODE",
      "Changes the demo access code.",
      "",
      "/status",
      "Shows whether a code is configured.",
      "",
      "Example:",
      "/code TEST2026"
    ].join("\n")
  );

});


bot.onText(/^\/status$/, async (msg) => {

  if (!isAdmin(msg)) {
    return bot.sendMessage(
      msg.chat.id,
      "Unauthorized."
    );
  }

  await bot.sendMessage(
    msg.chat.id,
    "Demo code is configured and active."
  );

});


bot.onText(/^\/code(?:\s+(.+))?$/, async (msg, match) => {

  if (!isAdmin(msg)) {
    return bot.sendMessage(
      msg.chat.id,
      "Unauthorized."
    );
  }

  const newCode =
    match && match[1]
      ? match[1].trim()
      : "";

  if (!newCode) {

    return bot.sendMessage(
      msg.chat.id,
      "Usage:\n/code NEWCODE"
    );

  }


  if (newCode.length < 4 ||
      newCode.length > 64) {

    return bot.sendMessage(
      msg.chat.id,
      "Code must be 4–64 characters."
    );

  }


  demoCode = newCode;


  await bot.sendMessage(
    msg.chat.id,
    "✓ Demo code changed successfully."
  );

});


bot.on("polling_error", (error) => {
  console.error(
    "Telegram polling error:",
    error.message
  );
});


// ------------------------------
// SERVER
// ------------------------------

app.listen(PORT, () => {

  console.log(
    `Demo server running on port ${PORT}`
  );

});
