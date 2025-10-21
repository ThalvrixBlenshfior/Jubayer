const { GoatWrapper } = require("fca-liane-utils");

const cooldown = new Map();

module.exports = {
  config: {
    name: "daily",
    aliases: ["dcoin"],
    version: "1.0",
    author: "Nisanxnx",
    countDown: 5,
    role: 0,
    shortDescription: "Claim daily coins",
    longDescription: "Get daily reward coins every 24 hours",
    category: "economy",
    guide: "{p}daily"
  },

  onStart: async function ({ message, event, usersData }) {
    const userID = event.senderID;
    const now = Date.now();

    if (cooldown.has(userID)) {
      const last = cooldown.get(userID);
      const diff = 86400000 - (now - last);
      if (diff > 0) {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return message.reply(`🕐 আবার ${hours} ঘণ্টা ${minutes} মিনিট পরে চেষ্টা করুন!`);
      }
    }

    const amount = Math.floor(Math.random() * 101) + 50; // ৫০ - ১৫০ কয়েন

    const userData = await usersData.get(userID);
    const current = userData.money || 0;
    await usersData.set(userID, { money: current + amount });

    cooldown.set(userID, now);
    return message.reply(`✅ আপনি আজকের জন্য ${amount} কয়েন পেয়েছেন!`);
  }
};
