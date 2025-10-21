/**
 * @English
 * Flashy Welcome & Leave Messages v2 by Nisan
 * Whitelist ON will not block messages, only actions.
 */

const fs = require("fs");
const path = require("path");
const Canvas = require("canvas");

module.exports = {
	config: {
		name: "automsg",
		version: "9.0",
		author: "Nisan",
		category: "events"
	},

	onStart: async function ({ api, event, threadsData, usersData }) {
		const { threadID, logMessageType, logMessageData, author } = event;

		// Load mainAdmin from config.json
		const configPath = path.join(__dirname, "../../config.json");
		let mainAdmin = "";
		try {
			const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
			mainAdmin = configData.mainAdmin || "";
		} catch (err) {
			console.error("Failed to load mainAdmin from config.json", err);
		}

		// Fetch thread settings
		const threadSetting = await threadsData.get(threadID) || {};
		let { autoMsg = true, whitelistThread = false, whitelistID = [], antiout = false, antijoin = false } = threadSetting;

		if (!autoMsg) return;

		// Fetch author info
		const userInfo = await usersData.get(author) || {};
		const isAdmin = userInfo.role === "ADMIN";
		const isMainAdmin = author === mainAdmin;

		// -------------------
		// Helper: Create Welcome/Leave Image
		// -------------------
		const createCard = async (memberName, type = "welcome", avatarURL = null) => {
			const width = 800;
			const height = 400;
			const canvas = Canvas.createCanvas(width, height);
			const ctx = canvas.getContext("2d");

			// Background
			ctx.fillStyle = type === "welcome" ? "#00bfff" : "#ff4d4d";
			ctx.fillRect(0, 0, width, height);

			// Avatar
			if (avatarURL) {
				try {
					const avatar = await Canvas.loadImage(avatarURL);
					ctx.drawImage(avatar, 50, 50, 300, 300);
				} catch (err) {}
			}

			// Member name
			ctx.fillStyle = "#fff";
			ctx.font = "bold 50px Sans";
			ctx.fillText(memberName, 400, 200);

			// Event type
			ctx.font = "bold 40px Sans";
			ctx.fillText(type === "welcome" ? "Joined the Group!" : "Left the Group", 400, 270);

			return canvas.toBuffer();
		};

		// -------------------
		// JOIN Event
		// -------------------
		if (logMessageType === "log:subscribe") {
			const addedMembers = logMessageData.addedParticipants;
			for (const user of addedMembers) {
				const name = user.fullName || "New Member";
				const avatarURL = `https://graph.facebook.com/${user.userFbId}/picture?type=large`;
				const imageBuffer = await createCard(name, "welcome", avatarURL);
				api.sendMessage({ body: `🎉 Welcome ${name}!`, attachment: imageBuffer }, threadID);
			}
		}

		// -------------------
		// LEAVE / REMOVED Event
		// -------------------
		else if (logMessageType === "log:unsubscribe") {
			const leftMemberID = logMessageData.leftParticipantFbId;
			const botID = api.getCurrentUserID();

			// Fetch left member name & avatar
			let leftMemberName = "A member";
			let avatarURL = null;
			try {
				const leftUser = await usersData.get(leftMemberID);
				if (leftUser && leftUser.name) leftMemberName = leftUser.name;
				avatarURL = `https://graph.facebook.com/${leftMemberID}/picture?type=large`;
			} catch (err) {}

			// Bot removed
			if (leftMemberID === botID) {
				api.sendMessage("🤖 The bot has been removed from this group. Goodbye!", threadID);
			} else {
				// Non-admin or non-mainAdmin action blocked only
				if (!isAdmin && !isMainAdmin) {
					api.sendMessage(`⚠️ A non-admin (${author}) tried to remove someone. Bot will not perform action.`, threadID);
				}
				const imageBuffer = await createCard(leftMemberName, "leave", avatarURL);
				api.sendMessage({ body: `👋 ${leftMemberName} has left the group.`, attachment: imageBuffer }, threadID);
			}
		}
	}
};
