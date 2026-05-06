const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// ================= CONFIG =================
const token = "8740821026:AAF0XrQBWrG2NNDb8pn1ksH330l1iv5bSSE";
const SHEET_URL = "
https://script.google.com/macros/s/AKfycbwX03EjwynFgJwWDOPbOMXGQGIlbDB5PwYZ3YNCdBmoGoE677yyorU_IM2zQTQU5ZCQ/exec";

const bot = new TelegramBot(token, { polling: true });

// ================= IST TIME =================
function getISTTime() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata"
  });
}

// ================= DATE =================
function getDate() {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata"
  });
}

// ================= SAVE TO SHEET =================
async function saveToSheet(name, date, time, type) {
  try {
    await axios.get(SHEET_URL, {
      params: {
        name: name,
        date: date,
        time: time,
        type: type
      }
    });
  } catch (error) {
    console.log("Sheet Error:", error.message);
  }
}

// ================= IN =================
bot.onText(/\/in/, async (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name;

  const date = getDate();
  const time = getISTTime();

  await saveToSheet(name, date, time, "IN");

  bot.sendMessage(chatId,
`🟢 IN MARKED
👤 Name: ${name}
📅 Date: ${date}
⏰ Time: ${time}`
  );
});

// ================= OUT =================
bot.onText(/\/out/, async (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name;

  const date = getDate();
  const time = getISTTime();

  await saveToSheet(name, date, time, "OUT");

  bot.sendMessage(chatId,
`🔴 OUT MARKED
👤 Name: ${name}
📅 Date: ${date}
⏰ Time: ${time}`
  );
});

// ================= START =================
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`👋 Welcome Attendance Bot

Commands:
👉 /in  = Mark IN
👉 /out = Mark OUT

⏰ Time Zone: India (IST)`
  );
});
