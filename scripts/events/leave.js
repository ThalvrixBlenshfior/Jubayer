const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "2.0",
		author: "Nisan Editz",
		category: "events"
	},

	onStart: async ({ threadsData, message, event, api, usersData }) => {
		if (event.logMessageType !== "log:unsubscribe") return;

		const { threadID } = event;
		const threadData = await threadsData.get(threadID);
		if (!threadData?.settings?.sendLeaveMessage) return;

		const { leftParticipantFbId } = event.logMessageData;
		if (leftParticipantFbId == api.getCurrentUserID()) return;

		const userName = await usersData.getName(leftParticipantFbId);
		const threadInfo = await api.getThreadInfo(threadID);
		const memberCount = threadInfo.participantIDs.length;

		const hours = getTime("HH");
		let session = "";
		if (hours <= 10) session = "🌅 শুভ সকাল";
		else if (hours <= 12) session = "🌞 শুভ দুপুর";
		else if (hours <= 18) session = "🌇 শুভ বিকাল";
		else session = "🌙 শুভ সন্ধ্যা";

		// Random cute text 😍
		const randomText = [
			"আশা করি ওর দিনটা ভালো কাটবে! 💫",
			"আমরা মিস করবো ওকে 😢",
			"গ্রুপটা একটু ফাঁকা লাগবে এখন 😔",
			"ওকে ছাড়া গ্রুপটা আগের মতো রইল না 💔",
			"আবার দেখা হবে হয়তো কোনো দিনে 😊"
		];
		const cuteMsg = randomText[Math.floor(Math.random() * randomText.length)];

		const type = leftParticipantFbId == event.author
			? "নিজে থেকে চলে গেছে 🥲"
			: "গ্রুপ থেকে রিমুভ করা হয়েছে 🚫";

		const msg = `✨ ${session} ✨

${userName} ${type}।

${cuteMsg}

👥 এখন গ্রুপে আছে মোট ${memberCount} জন মেম্বার ❤️`;

		const form = {
			body: msg,
			mentions: [{
				id: leftParticipantFbId,
				tag: userName
			}]
		};

		// Optional: যদি কোনো লিভ ইমেজ সেট করা থাকে
		if (threadData.data?.leaveAttachment) {
			const files = threadData.data.leaveAttachment;
			const attachments = files.reduce((acc, file) => {
				acc.push(drive.getFile(file, "stream"));
				return acc;
			}, []);
			form.attachment = (await Promise.allSettled(attachments))
				.filter(({ status }) => status === "fulfilled")
				.map(({ value }) => value);
		}

		message.send(form);
	}
};
