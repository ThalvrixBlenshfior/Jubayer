/**
 * @English
 * Command: automsg
 * Author: Nisan
 * Admins can turn auto join/leave messages ON or OFF in the group.
 */

const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "automsg",
		version: "2.0",
		author: "Nisan",
		category: "admin",
		usage: "[on/off]"
	},

	run: async function ({ api, event, args, threadsData, usersData }) {
		const { threadID, author } = event;

		// Load mainAdmin from config.json
		const configPath = path.join(__dirname, "../../config.json");
		let mainAdmin = "";
		try {
			const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
			mainAdmin = configData.mainAdmin || "";
		} catch (err) {
			console.error("Failed to load mainAdmin from config.json", err);
		}

		// Check if author is admin or mainAdmin
		const userInfo = await usersData.get(author) || {};
		const isAdmin = userInfo.role === "ADMIN";
		const isMainAdmin = author === mainAdmin;

		if (!isAdmin && !isMainAdmin) {
			return api.sendMessage("❌ Only admin or mainAdmin can change auto message settings.", threadID);
		}

		if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
			return api.sendMessage("⚠️ Usage: /automsg on OR /automsg off", threadID);
		}

		// Update thread setting
		let threadSetting = await threadsData.get(threadID) || {};
		threadSetting.autoMsg = args[0].toLowerCase() === "on";
		await threadsData.set(threadID, threadSetting);

		api.sendMessage(`✅ Auto message has been turned ${threadSetting.autoMsg ? "ON" : "OFF"} for this group.`, threadID);
	}
};
