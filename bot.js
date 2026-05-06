const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

console.log("🚀 BOT STARTED");

const TOKEN = "8740821026:AAF0XrQBWrG2NNDb8pn1ksH330l1iv5bSSE";
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwsZp5Aeqyucj1Sjv_FLcz8WI9Nc29aoxWhaHejgEB23-tYCgVTR8jB6rK8M7GuTT9nFw/exec";
const EMPLOYEE_API = SHEET_URL + "?action=getEmployees";

const bot = new TelegramBot(TOKEN, { polling: true });
function getISTTime() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata"
  });
}

// 🟢 Distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1)*Math.PI/180;
  const Δλ = (lon2-lon1)*Math.PI/180;

  const a = Math.sin(Δφ/2)**2 +
            Math.cos(φ1)*Math.cos(φ2) *
            Math.sin(Δλ/2)**2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}


// 🟢 Employee fetch (SAFE)
async function getEmployees() {
  try {
    const res = await axios.get(EMPLOYEE_API);

    let data = res.data;

    if (typeof data === "string") {
      data = JSON.parse(data);
    }

    if (!Array.isArray(data)) {
      console.log("❌ API not array:", data);
      return [];
    }

    return data;

  } catch (err) {
    console.log("❌ Employee API error:", err.message);
    return [];
  }
}


// 🟢 START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "📍 Location bhejo attendance ke liye");
});

bot.on('message', (msg) => {
  console.log("USER ID:", msg.from.id);
});


// 🟢 LOCATION HANDLER
bot.on('location', async (msg) => {

  const user = msg.from;
  const lat = msg.location.latitude;
  const lon = msg.location.longitude;

  const employees = await getEmployees();

  if (employees.length === 0) {
    bot.sendMessage(msg.chat.id, "❌ Employee data load nahi hua");
    return;
  }

  const emp = employees.find(e => e.userId == user.id);

  if (!emp) {
    bot.sendMessage(msg.chat.id, "❌ Employee not registered");
    return;
  }

  const distance = getDistance(lat, lon, emp.lat, emp.lon);
  const status = distance <= emp.radius ? "Present" : "Outside Area";

  try {
    const res = await axios.post(SHEET_URL, {
      name: emp.name,
      userid: user.id,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      lat: lat,
      lon: lon,
      status: status
    });

    bot.sendMessage(msg.chat.id, "✅ " + res.data);

  } catch (err) {
    console.log("❌ Sheet error:", err.message);
    bot.sendMessage(msg.chat.id, "❌ Error saving attendance");
  }
});
