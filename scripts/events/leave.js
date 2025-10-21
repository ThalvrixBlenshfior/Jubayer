const fs = require("fs");
const path = require("path");
const Canvas = require("canvas");
const axios = require("axios");

module.exports = {
  config: {
    name: "leave_nisan",
    version: "1.2.0",
    author: "Nisan x GPT-5",
    category: "events"
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData.settings.sendLeaveMessage) return;

    const { leftParticipantFbId } = event.logMessageData;
    if (leftParticipantFbId == api.getCurrentUserID()) return;

    const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo.threadName || "NVC_VIDEO_CREATOR";
    const userName = await usersData.getName(leftParticipantFbId);

    const isSelfLeave = leftParticipantFbId == event.author;

    // ===== Random background list =====
    const bgs = [
      "https://i.imgur.com/bot-bg-RSb9Y1g.jpg",
      "https://i.imgur.com/bby-bg-AZgGFtp.jpg"
    ];
    const bgUrl = bgs[Math.floor(Math.random() * bgs.length)];

    // ===== Load images =====
    const bg = await Canvas.loadImage(bgUrl);
    const profileUrl = `https://graph.facebook.com/${leftParticipantFbId}/picture?width=512&height=512`;
    const profile = await Canvas.loadImage(profileUrl);

    const canvas = Canvas.createCanvas(900, 500);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.drawImage(bg, 0, 0, 900, 500);

    // ===== Glow pink frame =====
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

    // ===== Load custom Bangla font =====
    const fontPath = path.join(__dirname, "NisanBangla.ttf");
    if (fs.existsSync(fontPath)) {
      Canvas.registerFont(fontPath, { family: "NisanBangla" });
    }

    // ===== Text: Bangla Style =====
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = '40px "NisanBangla"';
    ctx.fillText("বিদায় 👋", 450, 380);
    ctx.fillText("আবার দেখা হবে 🥀", 450, 420);

    // ===== Text: English Name & Group =====
    ctx.font = "bold 30px Sans";
    ctx.fillStyle = "#ffb6c1";
    ctx.fillText(`${userName}`, 450, 330);
    ctx.fillStyle = "#00e5ff";
    ctx.fillText(`${groupName}`, 450, 460);

    // Save image
    const imagePath = path.join(__dirname, "leave_nisan.png");
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(imagePath, buffer);

    // ===== Custom Bangla leave message =====
    const leaveText = `
💔 ${userName} ${
      isSelfLeave ? "নিজে থেকেই গ্রুপটি ছেড়ে গেছেন 😢" : "অ্যাডমিন দ্বারা রিমুভ হয়েছেন 🚫"
    }

📌 গ্রুপের নাম: ${groupName}
🕰️ সময়: ${new Date().toLocaleTimeString("bn-BD")}

🌷 ${userName}, তোমার অভাব অনুভব করবো 🥀
আশা করি আবার দেখা হবে 💞
`;

    api.sendMessage(
      {
        body: leaveText,
        attachment: fs.createReadStream(imagePath)
      },
      threadID
    );
  }
};
