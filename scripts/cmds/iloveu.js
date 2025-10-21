module.exports.config = {
  name: "iloveu",
  version: "2.0.0",
  role: 0,
  author: "Mostakim",
  cooldowns: 5,
};

module.exports.onChat = async function({ api, event }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const loveMessages = ["i love you", "i love u"];
  const lowerBody = body.toLowerCase();

  if (loveMessages.some(msg => lowerBody.startsWith(msg))) {
    return api.sendMessage("Hmm... বস নিশানও তোমাকে ভালোবাসে😇😻 :))", threadID, messageID);
  }
};

module.exports.onStart = async function({ api, event }) {
  const { threadID, messageID } = event;
  return api.sendMessage("তুমি নিজেই টাইপ করেছো 'iloveu' 🥰\nবস নিশানের ভালোবাসা সবসময় তোমার সাথে 💖", threadID, messageID);
};
