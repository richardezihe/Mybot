module.exports = {
    isAdmin: (userId, adminList) => adminList.includes(userId),
    isPremium: (userId, premiumList) => premiumList.includes(userId),

    handleHelpCommand: (ctx) => {
        ctx.reply(`
📌 *Bot Commands:*
/register - Register yourself
/listprem - Show premium users (Admin only)
/addprem <user_id> - Add premium user (Admin only)
/delprem <user_id> - Remove premium user (Admin only)
/broadcast <message> - Send message to all users (Admin only)
/help - Show this help menu
        `, { parse_mode: "Markdown" });
    }
};