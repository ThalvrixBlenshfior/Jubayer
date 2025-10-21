const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
	config: {
		name: "info",
   aliases: ["owner", "botinfo" ],
		version: "1.0",
		author: "NTKhang",
		countDown: 20,
		role: 0,
		shortDescription: { vi: "", en: "" },
		longDescription: { vi: "", en: "" },
		category: "owner",
		guide: { en: "" },
		envConfig: {}
	},
	onStart: async function ({ message }) {
		const authorName = " ⩸_ 𝙽𝙸 𝚂 𝙰𝙽 _⩸ ";
		const ownAge = "『 ⩸_ 20 _⩸ 』";
		const messenger = " //m.me/nisan.005";
		const authorFB = " //www.facebook.com/profile.php?id=61576178781718";
		const authorNumber = "017××××××98";
		const Status = "⩸__ 𝚁𝙻𝚂 𝚆𝙷𝙸𝚃 𝙵𝙰𝚁𝙸𝚈𝙰__⩸";
		const urls = [
"https://drive.google.com/uc?id=1a72QhBuup4I3IcYhDblJBe1D__fyIh4k",
"https://drive.google.com/uc?id=1WPeoXpdO7OZ1y9NiyGgYdwsQawV21Oju"
];
		const link = urls[Math.floor(Math.random() * urls.length)];
		const now = moment().tz('Asia/Jakarta');
		const date = now.format('MMMM Do YYYY');
		const time = now.format('h:mm:ss A');
		const uptime = process.uptime();
		const seconds = Math.floor(uptime % 60);
		const minutes = Math.floor((uptime / 60) % 60);
		const hours = Math.floor((uptime / (60 * 60)) % 24);
		const days = Math.floor(uptime / (60 * 60 * 24));
		const uptimeString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;

		message.reply({
			body: `✨《 𝐁𝐨𝐭 𝐀𝐧𝐝 𝐎𝐰𝐧𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 》🎀
\🤖彡𝐵𝑜𝑡 𝑁𝑎𝑚𝑒 :  ${global.GoatBot.config.nickNameBot}
\👾彡𝐵𝑜𝑡 𝑆𝑦𝑠𝑡𝑒𝑚 𝑃𝑟𝑒𝑓𝑖𝑥 : ${global.GoatBot.config.prefix}
\💙彡𝑂𝑤𝑛𝑒𝑟 𝑁𝑎𝑚𝑒 : ${authorName}
\📝彡𝐴𝑔𝑒  : ${ownAge}
\💕彡𝑅𝑒𝑙𝑎𝑡𝑖𝑜𝑛𝑆ℎ𝑖𝑝: ${Status}
\🌐彡𝑊𝑝 : ${authorNumber}
\🌍彡𝐹𝑎𝑐𝑒𝑏𝑜𝑜𝑘 𝐿𝑖𝑛𝑘 :  ${authorFB}
\🗓彡𝐷𝑎𝑡𝑒 : ${date}
\⏰彡𝑁𝑜𝑤 𝑇𝑖𝑚𝑒 : ${time}
\🔰彡𝐴𝑛𝑦 𝐻𝑒𝑙𝑝 𝐶𝑜𝑛𝑡𝑎𝑐𝑡 : ${messenger}__⩸
\📛彡𝐵𝑜𝑡 𝐼𝑠 𝑅𝑢𝑛𝑛𝑖𝑛𝑔 𝐹𝑜𝑟 : ${uptimeString}
    𝑻𝒈:  //t.me/nisan_editz
    𝑰𝒏𝒔𝒕𝒂:  //www.instagram.com/im_editz_x2.0?
\===============`,
			attachment: await global.utils.getStreamFromURL(link)
		});
	},
	onChat: async function ({ event, message, getLang }) {
		if (event.body && event.body.toLowerCase() === "info") {
			this.onStart({ message });
		}
	}
};
