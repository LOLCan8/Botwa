// index.js
const { makeWaSocket, useMultiFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const { default: P } = require('pino');
const qrcode = require('qrcode-terminal');
const express = require('express');
const { sendPollingMenu, handleButtonReply } = require('./polling');

const port = process.env.PORT || 3000;

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWaSocket({
    logger: P({ level: 'info' }),
    printQRInTerminal: false, // kita handle QR manual
    auth: state
  });

  sock.ev.on('creds.update', saveCreds);

  // Tampilkan QR / pairing link di terminal
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log('Scan QR di WhatsApp Web / WhatsApp mobile -> Menu > Linked Devices > Link a Device');
      console.log('Atau buka link pairing dari QR jika tersedia.');
    }
    if (connection === 'close') {
      const reason = (lastDisconnect?.error)?.output?.statusCode;
      console.log('Connection closed, reason:', lastDisconnect?.error?.toString());
      // coba reconnect otomatis
      start().catch(err => console.error('restart error', err));
    }
    if (connection === 'open') {
      console.log('Connected ✅');
    }
  });

  // pesan masuk
  sock.ev.on('messages.upsert', async m => {
    try {
      const msg = m.messages[0];
      if (!msg) return;
      if (msg.key && msg.key.remoteJid === 'status@broadcast') return; // ignore statuses

      // handle button reply (interactive button)
      if (msg.message?.buttonsResponseMessage || msg.message?.listResponseMessage || msg.message?.extendedTextMessage) {
        await handleButtonReply(sock, msg);
      } else {
        // contoh: kalau user kirim "/menu" kita kirim polling
        const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
        if (text === '/menu' || text === 'menu') {
          await sendPollingMenu(sock, msg.key.remoteJid);
        }
      }
    } catch (e) {
      console.error('message handler error', e);
    }
  });

  // simple express for healthcheck (optional)
  const app = express();
  app.get('/', (req,res) => res.send('WA Polling Bot running'));
  app.listen(port, () => console.log('HTTP server listening on', port));
}

start().catch(err => console.error(err));