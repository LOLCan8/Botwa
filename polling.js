// polling.js
const { MessageType } = require('@adiwajshing/baileys');

async function sendPollingMenu(sock, to) {
  // interactive button template
  const buttons = [
    { buttonId: 'ai_gemini', buttonText: { displayText: '🤖 Gemini' }, type: 1 },
    { buttonId: 'ai_chatgpt', buttonText: { displayText: '💬 ChatGPT' }, type: 1 },
    { buttonId: 'ai_brat', buttonText: { displayText: '🐍 Brat' }, type: 1 },
    { buttonId: 'make_sticker', buttonText: { displayText: '🎨 Sticker' }, type: 1 }
  ];

  const buttonMessage = {
    text: 'Pilih AI yang ingin kamu gunakan:',
    footer: 'Pilih salah satu — setelah selesai, menu akan muncul lagi',
    buttons,
    headerType: 1
  };

  await sock.sendMessage(to, buttonMessage);
}

async function handleButtonReply(sock, msg) {
  const from = msg.key.remoteJid;
  // Baileys: buttonsResponseMessage.selectedButtonId
  const buttonResp = msg.message?.buttonsResponseMessage;
  const selectedId = buttonResp?.selectedButtonId;

  if (!selectedId) return;

  if (selectedId === 'ai_gemini') {
    await sock.sendMessage(from, { text: 'Kamu pilih 🤖 Gemini — (contoh, panggil API Gemini di sini)' });
    // TODO: panggil fungsi Gemini kemudian kirim hasil
  } else if (selectedId === 'ai_chatgpt') {
    await sock.sendMessage(from, { text: 'Kamu pilih 💬 ChatGPT — (contoh, panggil OpenAI API di sini)' });
  } else if (selectedId === 'ai_brat') {
    await sock.sendMessage(from, { text: 'Kamu pilih 🐍 Brat — (opsi internal atau fungsi custom)' });
  } else if (selectedId === 'make_sticker') {
    await sock.sendMessage(from, { text: '🎨 Kirim foto yang ingin kamu jadikan sticker.' });
    // setiap user flow untuk sticker bisa disimpan ke DB/var session
  }

  // kirim lagi menu polling agar user bisa pilih ulang
  await sendPollingMenu(sock, from);
}

module.exports = { sendPollingMenu, handleButtonReply };