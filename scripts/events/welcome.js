const fs = require("fs");
const path = require("path");
const Canvas = require("canvas");
const axios = require("axios");

module.exports = {
  config: {
    name: "welcome_nisan",
    version: "1.0.0",
    author: "Nisan x GPT-5",
    category: "events"
  },

  onStart: async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo.threadName || "Our Group";

    const admins = threadInfo.adminIDs.map(a => ({ tag: "@admin", id: a.id }));
    const adminTags = admins.map(a => a.tag).join(", ");

    const added = event.logMessageData.addedParticipants;
    for (const user of added) {
      if (user.userFbId == api.getCurrentUserID()) continue;
      const userName = user.fullName;

      // ======= Random Background =======
      const bgs = [
        "https://i.imgur.com/bot-bg-RSb9Y1g.jpg", // bot-bg-RSb9Y1g এর ভিতরের direct image link দিতে পারো
        "https://i.imgur.com/bby-bg-AZgGFtp.jpg"  // bby-bg-AZgGFtp
      ];
      const bgUrl = bgs[Math.floor(Math.random() * bgs.length)];

      // ======= Load Profile + BG =======
      const profileUrl = `https://graph.facebook.com/${user.userFbId}/picture?width=512&height=512`;
      const bg = await Canvas.loadImage(bgUrl);
      const profile = await Canvas.loadImage(profileUrl);

      const canvas = Canvas.createCanvas(900, 500);
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.drawImage(bg, 0, 0, 900, 500);

      // Add pink glow frame
      ctx.save();
      ctx.shadowColor = "rgba(255,105,180,0.8)";
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(450, 220, 120, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.clip();
      ctx.drawImage(profile, 330, 100, 240, 240);
      ctx.restore();

      // Add custom font
      const fontPath = path.join(__dirname, "NisanEnglish.ttf");
      if (fs.existsSync(fontPath)) {
        Canvas.registerFont(fontPath, { family: "NisanEnglish" });
        ctx.font = '36px "NisanEnglish"';
      } else {
        ctx.font = "36px Sans";
      }

      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText("WELCOME TO", 450, 390);
      ctx.fillText(groupName.toUpperCase(), 450, 430);

      const imagePath = path.join(__dirname, "welcome_nisan.png");
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imagePath, buffer);

      // ======= Custom Welcome Text =======
      const welcomeText = `
𒁍⃝⃝♥️আসসালামু আলাইকুম♥⃝🪽

📌এ গ্রুপে জয়েন হওয়ার জন্য আপনাকে অসংখ্য ধন্যবাদ😊❤️

╔━━❖❖👑❖❖━━╗
♥️${userName}❤️
╚━━❖❖🤗❖❖━━╝

🥰❖😍❖☺️❖🤗❖😘
💞💞𝗪𝗘𝗟𝗖𝗢𝗠𝗘💞💞
　　   ┊┊┊┊┊💜      
　  　 ┊┊┊┊♥️  
　　   ┊┊┊🖤    
　　   ┊┊🤍         
　　   ┊💚          
　　  💛

${groupName.toUpperCase()}

𒁍⃝⃝🥰গ্রুঁপেঁরঁ পঁক্ষঁ থেঁকেঁ♥⃝🪽

𒁍⃝⃝꧁𝗪𝗘𝗟𝗟𝗖𝗢𝗠𝗘꧂♥⃝🪽

📪এর গ্রুপে আপনাকে স্বাগতম।🌹

📌এই গ্রুপের পক্ষ থেকে আপনাকে ভালোবাসা অবিরাম,আমার গ্রুপটি ভালো লাগলে গ্রুপের সাথে থাকুন।(ধন্যবাদ)

🌹মনে রাখবেন সবাই একই গ্রুপে আছি মানে সবাই আমরা একে অপর এর ভাই বোন 🫂🥰

🔰আশা করি সারা জীবন আমাদের পাশে থাকবেন🥰

🙂যেকোনো প্রয়োজনে মেসেজ দিন⤵️

╔━━━❖❖👑❖❖━━━╗
♥️${adminTags}❤️
╚━━━❖❖🤗❖❖━━━╝

😘Love You My All New Members🤗
📌Welcome Set Your Nickname
`;

      // ======= Send Final Message =======
      api.sendMessage(
        {
          body: welcomeText,
          attachment: fs.createReadStream(imagePath),
          mentions: admins
        },
        threadID
      );
    }
  }
};
