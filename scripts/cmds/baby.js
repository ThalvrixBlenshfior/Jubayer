const axios = require('axios');
const baseApiUrl = async () => `https://www.noobs-api.rf.gd/dipto`; // base API

// Track mentioned users per thread
const mentionedUsers = new Map();

module.exports.config = {
    name: "bby",
    aliases: ["baby", "bbe", "babe", "lisa"],
    version: "7.9.0",
    author: "dipto",
    countDown: 0,
    role: 0,
    description: "better than all sim simi",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR all OR\nedit [YourMessage] - [NewMessage]"
    }
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

// Generate flashy box message
function boxStyleMessage(name, text) {
    const emojiTop = flashyEmojis[Math.floor(Math.random()*flashyEmojis.length)];
    const emojiBottom = flashyEmojis[Math.floor(Math.random()*flashyEmojis.length)];
    const lines = text.split("\n").slice(0,4);
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

    const info = await api.sendMessage({body: finalMessage}, threadID, event.messageID);

    // Random reaction
    const react = randomReacts[Math.floor(Math.random()*randomReacts.length)];
    api.setMessageReaction(react, info.messageID, err=>{if(err)console.log("Reaction error:",err.message)});
}

module.exports.onStart = async ({ api, event, args, usersData })=>{
    const link = `${await baseApiUrl()}/baby`;
    const uid = event.senderID;

    try{
        const dipto = args.join(" ").toLowerCase();
        let replyText = "";

        if(!args[0]){
            const n = Math.floor(Math.random()*3)+1;
            replyText = Array.from({length:n},()=> randomReplies[Math.floor(Math.random()*randomReplies.length)]).join("\n");
        } else if(args[0] === 'remove'){
            const fina = dipto.replace("remove ", "");
            const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
            return api.sendMessage(dat, event.threadID, event.messageID);
        } else if(args[0] === 'rm' && dipto.includes('-')){
            const [fi, f] = dipto.replace("rm ", "").split(/\s*-\s*/);
            const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
            return api.sendMessage(da, event.threadID, event.messageID);
        } else if(args[0] === 'list'){
            if(args[1]==='all'){
                const data = (await axios.get(`${link}?list=all`)).data;
                const limit = parseInt(args[2]) || 100;
                const limited = data?.teacher?.teacherList?.slice(0, limit)
                const teachers = await Promise.all(limited.map(async (item) => {
                    const number = Object.keys(item)[0];
                    const value = item[number];
                    const name = await usersData.getName(number).catch(() => number) || "Not found";
                    return {name,value};
                }));
                teachers.sort((a,b)=>b.value-a.value);
                const output = teachers.map((t,i)=>`${i+1}/ ${t.name}: ${t.value}`).join('\n');
                return api.sendMessage(`Total Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`, event.threadID, event.messageID);
            } else {
                const d = (await axios.get(`${link}?list=all`)).data;
                return api.sendMessage(`❇️ | Total Teach = ${d.length || "api off"}\n♻️ | Total Response = ${d.responseLength || "api off"}`, event.threadID, event.messageID);
            }
        } else if(args[0] === 'msg'){
            const fuk = dipto.replace("msg ", "");
            const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
            return api.sendMessage(`Message ${fuk} = ${d}`, event.threadID, event.messageID);
        } else if(args[0] === 'edit'){
            const command = dipto.split(/\s*-\s*/)[1];
            if(command.length<2) return api.sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]',event.threadID,event.messageID);
            const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${command}&senderID=${uid}`)).data.message;
            return api.sendMessage(`changed ${dA}`, event.threadID,event.messageID);
        } else if(args[0] === 'teach' && args[1]!=='amar' && args[1]!=='react'){
            const [comd,command] = dipto.split(/\s*-\s*/);
            const final = comd.replace("teach ","");
            if(command.length<2) return api.sendMessage('❌ | Invalid format!',event.threadID,event.messageID);
            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}&threadID=${event.threadID}`);
            const tex = re.data.message;
            const teacher = (await usersData.get(re.data.teacher)).name;
            return api.sendMessage(`✅ Replies added ${tex}\nTeacher: ${teacher}\nTeachs: ${re.data.teachs}`,event.threadID,event.messageID);
        } else if(args[0]==='teach' && args[1]==='amar'){
            const [comd,command] = dipto.split(/\s*-\s*/);
            const final = comd.replace("teach ","");
            if(command.length<2) return api.sendMessage('❌ | Invalid format!',event.threadID,event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`,event.threadID,event.messageID);
        } else if(args[0]==='teach' && args[1]==='react'){
            const [comd,command] = dipto.split(/\s*-\s*/);
            const final = comd.replace("teach react ","");
            if(command.length<2) return api.sendMessage('❌ | Invalid format!',event.threadID,event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`,event.threadID,event.messageID);
        } else if(dipto.includes('amar name ki') || dipto.includes('amr nam ki') || dipto.includes('amar nam ki') || dipto.includes('amr name ki') || dipto.includes('whats my name')){
            const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
            return api.sendMessage(data,event.threadID,event.messageID);
        } else {
            replyText = (await axios.get(`${link}?text=${encodeURIComponent(dipto)}&senderID=${uid}&font=1`)).data.reply;
        }

        // Send cinematic reply
        await sendCinematicMessage(api,event.threadID,event,usersData,replyText);

    } catch(e){
        console.log(e);
        api.sendMessage("Check console for error",event.threadID,event.messageID);
    }
};

module.exports.onReply = async ({ api, event, Reply })=>{
    if([api.getCurrentUserID()].includes(event.senderID)) return;
    try{
        if(event.type==="message_reply"){
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
            await sendCinematicMessage(api,event.threadID,event,Reply?.usersData,a);
        }
    } catch(err){
        return api.sendMessage(`Error: ${err.message}`,event.threadID,event.messageID);
    }
};

module.exports.onChat = async ({ api, event, usersData })=>{
    try{
        const body = event.body ? event.body.toLowerCase() : "";
        if(!body.startsWith("baby") && !body.startsWith("bby") && !body.startsWith("bot") && !body.startsWith("jan") && !body.startsWith("babu") && !body.startsWith("janu")) return;

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
