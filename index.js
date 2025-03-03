const { Telegraf } = require("telegraf");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");
const config = require("./config");
const adminData = require("./admin.json");
const premiumData = require("./premium.json");
const users = require("./users.json");
const helper = require("./utils/helper");  // Import helper.js

// Initialize Telegram bot
const bot = new Telegraf("config.8191120196:AAFO3247iEWjMQUmVcucxdVU4dr8fGeLn0Q");

// WhatsApp Connection
async function connectWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("whatsapp-session");
    const sock = makeWASocket({ auth: state });

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", ({ qr }) => {
        if (qr) {
            console.log("Scan this QR Code to pair WhatsApp:");
            console.log(qr);
        }
    });

    return sock;
}

const whatsapp = connectWhatsApp();

// ✅ User Registration
bot.command("register", (ctx) => {
    const userId = ctx.from.id;
    if (!users[userId]) {
        users[userId] = { name: ctx.from.first_name };
        fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
        ctx.reply("✅ You are now registered!");
    } else {
        ctx.reply("⚠ You are already registered.");
    }
});

// ✅ Admin & Premium Management
bot.command("listprem", (ctx) => {
    if (!helper.isAdmin(ctx.from.id, adminData.admins)) return ctx.reply("❌ You are not an admin.");
    ctx.reply(`👑 Premium Users:\n${premiumData.premium_users.join("\n")}`);
});

bot.command("addprem", (ctx) => {
    if (!helper.isAdmin(ctx.from.id, adminData.admins)) return ctx.reply("❌ You are not an admin.");
    const args = ctx.message.text.split(" ");
    if (args.length < 2) return ctx.reply("⚠ Usage: /addprem <user_id>");
    const userId = parseInt(args[1]);
    premiumData.premium_users.push(userId);
    fs.writeFileSync("premium.json", JSON.stringify(premiumData, null, 2));
    ctx.reply(`✅ User ${userId} added to premium.`);
});

bot.command("delprem", (ctx) => {
    if (!helper.isAdmin(ctx.from.id, adminData.admins)) return ctx.reply("❌ You are not an admin.");
    const args = ctx.message.text.split(" ");
    if (args.length < 2) return ctx.reply("⚠ Usage: /delprem <user_id>");
    const userId = parseInt(args[1]);
    premiumData.premium_users = premiumData.premium_users.filter((id) => id !== userId);
    fs.writeFileSync("premium.json", JSON.stringify(premiumData, null, 2));
    ctx.reply(`✅ User ${userId} removed from premium.`);
});

// ✅ Broadcast Messages
bot.command("broadcast", (ctx) => {
    if (!helper.isAdmin(ctx.from.id, adminData.admins)) return ctx.reply("❌ You are not an admin.");
    const message = ctx.message.text.replace("/broadcast ", "");
    Object.keys(users).forEach((userId) => {
        bot.telegram.sendMessage(userId, `📢 Broadcast: ${message}`);
    });
    ctx.reply("✅ Broadcast sent to all users.");
});

// ✅ Help Command (Using helper.js)
bot.command("help", (ctx) => {
    helper.handleHelpCommand(ctx);
});

// ✅ Start Bot
bot.launch();
console.log("Bot is running...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));