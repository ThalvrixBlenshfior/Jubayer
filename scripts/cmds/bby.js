const axios = require('axios');
const baseApiUrl = async () => `https://www.noobs-api.rf.gd/dipto`; // base API

// Track mentioned users per thread
const mentionedUsers = new Map();

module.exports.config = {
    name: "bby",
    aliases: ["baby", "bbe", "babe", "lisa"],
    version: "7.7.0",
    author: "dipto",
    countDown: 0,
    role: 0,
    description: "cinematic chat bot reply",
    category: "chat"
};

// Emojis & reactions
const flashyEmojis = ["💖","🌸","✨","💫","😚","🥰","💌"];
const randomReplies = [
    "Hey cutie! 😘",
    "Hello gorgeous 💕",
    "I'm here just for you 🌟",
    "What’s up, sunshine? ☀️",
    "Hey hey 😎, how's my favorite person?",
    "Bolo jaan, ki plan aaj? 💖",
    "Hii 😚, miss you!"
];
const randomReacts = ["😍","😂","😎","💖","🥰","✨","💫"];

// Generate box with emoji rain
function boxStyleMessage(name, text) {
    const emojiTop = flashyEmojis[Math.floor(Math.random()*flashyEmojis.length)];
    const emojiBottom = flashyEmojis[Math.floor(Math.random()*flashyEmojis.length)];
    const lines = text.split("\n").slice(0,4); // max 4 lines
    const top = `┏━🌟 ${name ? '𝗠𝗲𝘀𝘀𝗮𝗴𝗲 𝗳𝗿𝗼𝗺 ' + name : 'Message'} 🌟━┓`;
    const middle = lines.map(line=>`┃ ${line}`).join("\n");
    const bottom = `┗${'━'.repeat(top.length-2)}┛`;
    return `${emojiTop}\n${top}\n${middle}\n${bottom}\n${emojiBottom}`;
}

// Send cinematic message with first-time mention
async function sendCinematicMessage(api, threadID, event, usersData, text) {
    const uid = event.senderID;
    const name = await usersData.getName(uid).catch(()=> "User");

    if(!mentionedUsers.has(threadID)) mentionedUsers.set(threadID,new Set());
    const threadMentioned = mentionedUsers.get(threadID);

    let finalMessage = "";
    if(!threadMentioned.has(uid)){
        finalMessage = boxStyleMessage(name, text);
        threadMentioned.add(uid);
    } else {
        finalMessage = boxStyleMessage("", text);
    }

    const info = await api.sendMessage({body: finalMessage, mentions: !threadMentioned.has(uid) ? [{tag:name,id:uid}] : []}, threadID, event.messageID);

    // Add random reaction
    const react = randomReacts[Math.floor(Math.random()*randomReacts.length)];
    api.setMessageReaction(react, info.messageID, err=>{if(err)console.log("Reaction error:",err.message)});
}

module.exports.onStart = async ({ api, event, args, usersData })=>{
    const link = `${await baseApiUrl()}/baby`;
    const uid = event.senderID;

    try{
        let replyText = "";
        if(!args[0]){
            const n = Math.floor(Math.random()*3)+1;
            replyText = Array.from({length:n},()=> randomReplies[Math.floor(Math.random()*randomReplies.length)]).join("\n");
        } else {
            const dipto = args.join(" ").toLowerCase();
            replyText = (await axios.get(`${link}?text=${encodeURIComponent(dipto)}&senderID=${uid}&font=1`)).data.reply;
        }

        await sendCinematicMessage(api,event.threadID,event,usersData,replyText);

    } catch(err){
        return api.sendMessage(`Error: ${err.message}`,event.threadID,event.messageID);
    }
};

module.exports.onStart = async ({ api, event, usersData })=>{
    try{
        const body = event.body ? event.body.toLowerCase() : "";
        if(!body.startsWith("baby") && !body.startsWith("bby") && !body.startsWith("bot") && !body.startsWith("lisa") && !body.startsWith("babu") && !body.startsWith("janu")) return;

        const arr = body.replace(/^\S+\s*/,"");
        const uid = event.senderID;
        const link = `${await baseApiUrl()}/baby`;

        let replyText = "";
        if(!arr){
            const n = Math.floor(Math.random()*3)+1;
            replyText = Array.from({length:n},()=> randomReplies[Math.floor(Math.random()*randomReplies.length)]).join("\n");
        } else {
            replyText = (await axios.get(`${link}?text=${encodeURIComponent(arr)}&senderID=${uid}&font=1`)).data.reply;
        }

        await sendCinematicMessage(api,event.threadID,event,usersData,replyText);

    } catch(err){
        return api.sendMessage(`Error: ${err.message}`,event.threadID,event.messageID);
    }
};
