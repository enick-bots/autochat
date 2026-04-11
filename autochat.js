require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');

const CANALES = process.env.CANALES_IDS ? process.env.CANALES_IDS.split(',') : [];
const botsConfig = [
  { token: process.env.TOKEN_1, frases: ["# SE VAN POR PAYPAL", "# VENDO ESTO ACEPTO SOLO PAYPAL"], fotos: ["./image-3-1.webp"], respuestas: ["solo si es compra", "solo paypal"] },
  { token: process.env.TOKEN_2, frases: ["# ME JUBILO POR BRAINROTS"], fotos: ["./img.webp"], respuestas: ["no leo md"] },
  { token: process.env.TOKEN_3, frases: ["# se van por paypal"], fotos: ["./screenshot_20260407_214952_Roblox.webp"], respuestas: ["no me interesa trade","solo paypal busco"] },
  { token: process.env.TOKEN_4, frases: ["busco robux", "acepto solo robux "], fotos: ["./1b64c693-25ac-4bf6-9d58-f1e8bfced89e-1.webp"], respuestas: ["solo acepto robux","solo busco que me compren por robux"] },
  { token: process.env.TOKEN_5, frases: ["BUSCO MONEY"], fotos: ["./screenshot_20260408_190805_Roblox-1.webp"], respuestas: ["manda tu md"] }
];

const clientes = [];
const frasesApoyo = ["revisa md pa", "ve el md", "checa md", "te mandé md bro"];

function gestionarDescanso() {
  const listos = clientes.filter(c => !c.estaDurmiendo && !c.bloqueadoPorChat && c.contadorMensajes >= 2);
  if (listos.length >= 2) {
    const seleccionados = listos.sort(() => 0.5 - Math.random()).slice(0, 2);
    seleccionados.forEach(c => {
      c.estaDurmiendo = true;
      setTimeout(() => {
        c.estaDurmiendo = false;
        c.contadorMensajes = 0;
        c.ejecutarBucle();
      }, 240000);
    });
  }
}

botsConfig.forEach((conf, index) => {
  if (!conf.token) {
    console.log(`⚠️ Falta el TOKEN_${index + 1} en el .env`);
    return;
  }

  const client = new Client({ checkUpdate: false });
  client.conf = conf;
  client.bloqueadoPorChat = false;
  client.contadorMensajes = 0;
  client.estaDurmiendo = false;

  client.on('error', () => {}); 

  client.ejecutarBucle = async function() {
    if (this.bloqueadoPorChat || this.estaDurmiendo) return;
    try {
      for (const id of CANALES) {
        const canal = await this.channels.fetch(id).catch(() => null);
        if (!canal) continue;
        const miFrase = this.conf.frases[Math.floor(Math.random() * this.conf.frases.length)];
        await canal.sendTyping();
        await new Promise(r => setTimeout(r, Math.random() * 3000 + 2000));
        await canal.send({ content: miFrase, files: this.conf.fotos });
        if (CANALES.indexOf(id) === 0) await new Promise(r => setTimeout(r, 60000));
      }
      this.contadorMensajes++;
      if (this.contadorMensajes >= 2) {
        gestionarDescanso();
      } else {
        const esperaMin = Math.floor(Math.random() * (7 - 4 + 1) + 4);
        setTimeout(() => this.ejecutarBucle(), esperaMin * 60000);
      }
    } catch (e) {
      setTimeout(() => this.ejecutarBucle(), 60000);
    }
  };

  client.on('ready', () => {
    console.log(`🚀 Listo: ${client.user.tag}`);
    clientes.push(client);
    setTimeout(() => client.ejecutarBucle(), Math.random() * 20000);
  });

  client.on('messageCreate', async (msg) => {
    if (!CANALES.includes(msg.channel.id) || msg.author.bot) return;
    const esDeMisBots = clientes.some(c => c.user.id === msg.author.id);
    if (esDeMisBots && msg.author.id !== client.user.id) {
      if (Math.random() < 0.05) { 
        setTimeout(async () => {
          const apoyo = frasesApoyo[Math.floor(Math.random() * frasesApoyo.length)];
          await msg.reply(apoyo).catch(() => {});
        }, 15000);
      }
    }
    const meMencionan = msg.mentions.has(client.user.id);
    let esReplyAMiConFoto = false;
    if (msg.reference && msg.reference.messageId) {
      try {
        const msgOriginal = msg.channel.messages.cache.get(msg.reference.messageId) || await msg.channel.messages.fetch(msg.reference.messageId);
        if (msgOriginal && msgOriginal.author.id === client.user.id && msgOriginal.attachments.size > 0) {
          esReplyAMiConFoto = true;
        }
      } catch (e) { esReplyAMiConFoto = false; }
    }
    if ((meMencionan || esReplyAMiConFoto) && /\b(m+d+|d+m+)\b/i.test(msg.content)) {
      if (client.bloqueadoPorChat || esDeMisBots) return; 
      client.bloqueadoPorChat = true;
      setTimeout(async () => {
        try {
          const res = client.conf.respuestas[Math.floor(Math.random() * client.conf.respuestas.length)];
          await msg.reply(res);
          setTimeout(() => { 
            client.bloqueadoPorChat = false; 
            client.ejecutarBucle(); 
          }, 300000);
        } catch (err) { 
          client.bloqueadoPorChat = false; 
          client.ejecutarBucle(); 
        }
      }, Math.floor(Math.random() * 20000 + 20000));
    }
  });

  client.login(conf.token).catch((err) => {
    console.log(`❌ Error login TOKEN_${index + 1}: ${err.message}`);
  });
});
