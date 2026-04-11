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

botsConfig.forEach((conf) => {
  if (!conf.token) return;
  const client = new Client({ checkUpdate: false });
  
  client.conf = conf;
  client.bloqueadoPorChat = false;
  client.estaDurmiendo = false;
  client.estaFuera = false;
  client.buclesCompletados = 0;
  client.metaBucle = Math.floor(Math.random() * (12 - 6 + 1) + 6);
  
  client.horaDormir = 22 + Math.random() * 1.8; 
  client.horaDespertar = 7 + Math.random() * 2.8;

  client.on('error', () => {}); 

  client.ejecutarBucle = async function() {
    if (this.bloqueadoPorChat || this.estaDurmiendo || this.estaFuera) return;

    const horaActual = new Date().getHours() + new Date().getMinutes() / 60;
    const esDeNoche = this.horaDormir > this.horaDespertar 
      ? (horaActual >= this.horaDormir || horaActual < this.horaDespertar)
      : (horaActual >= this.horaDormir && horaActual < this.horaDespertar);

    if (esDeNoche) {
      this.estaFuera = false; 
      return setTimeout(() => this.ejecutarBucle(), 1800000);
    }

    if (Math.random() < 0.15 && this.buclesCompletados === 0 && !this.estaFuera) {
      this.estaFuera = true;
      const tiempoFuera = Math.floor(Math.random() * (300 - 120 + 1) + 120) * 60000; 
      console.log(`[${this.user.username}] Ocupado fuera de Discord (vuelvo en ${tiempoFuera/60000} min)`);
      return setTimeout(() => { this.estaFuera = false; this.ejecutarBucle(); }, tiempoFuera);
    }

    if (this.buclesCompletados >= this.metaBucle) {
      this.buclesCompletados = 0;
      this.metaBucle = Math.floor(Math.random() * (11 - 7 + 1) + 7);
      const descansoLargo = Math.floor(Math.random() * (60 - 25 + 1) + 25) * 60000;
      return setTimeout(() => this.ejecutarBucle(), descansoLargo);
    }

    try {
      const canalesMezclados = [...CANALES].sort(() => 0.5 - Math.random());
      for (const id of canalesMezclados) {
        if (Math.random() < 0.1) continue; 
        const canal = await this.channels.fetch(id).catch(() => null);
        if (!canal) continue;

        await canal.sendTyping();
        await new Promise(r => setTimeout(r, Math.random() * 6000 + 4000));
        await canal.send({ content: this.conf.frases[Math.floor(Math.random() * this.conf.frases.length)], files: this.conf.fotos });
        
        await new Promise(r => setTimeout(r, Math.floor(Math.random() * 120000 + 45000)));
      }

      this.buclesCompletados++;
      setTimeout(() => this.ejecutarBucle(), Math.floor(Math.random() * 8 + 4) * 60000);
    } catch (e) { setTimeout(() => this.ejecutarBucle(), 60000); }
  };

  client.on('ready', () => {
    console.log(`🚀 ${client.user.tag} activo.`);
    clientes.push(client);
    setTimeout(() => client.ejecutarBucle(), Math.random() * 1200000);
  });

  client.on('messageCreate', async (msg) => {
    if (!CANALES.includes(msg.channel.id) || msg.author.bot || client.estaFuera) return;
    const esDeMisBots = clientes.some(c => c.user.id === msg.author.id);

    if (esDeMisBots && msg.author.id !== client.user.id && Math.random() < 0.05) {
      setTimeout(async () => {
        await msg.reply(frasesApoyo[Math.floor(Math.random() * frasesApoyo.length)]).catch(() => {});
      }, Math.random() * 20000 + 15000);
    }

    let esReplyAMi = false;
    if (msg.reference) {
      try {
        const msgOriginal = await msg.channel.messages.fetch(msg.reference.messageId).catch(() => null);
        if (msgOriginal?.author.id === client.user.id && msgOriginal.attachments.size > 0) esReplyAMi = true;
      } catch (e) {}
    }

    if ((msg.mentions.has(client.user.id) || esReplyAMi) && /\b(m+d+|d+m+)\b/i.test(msg.content)) {
      if (client.bloqueadoPorChat || esDeMisBots) return; 
      client.bloqueadoPorChat = true;
      setTimeout(async () => {
        try {
          await msg.reply(client.conf.respuestas[Math.floor(Math.random() * client.conf.respuestas.length)]);
          setTimeout(() => { client.bloqueadoPorChat = false; client.ejecutarBucle(); }, 420000);
        } catch (err) { client.bloqueadoPorChat = false; client.ejecutarBucle(); }
      }, Math.floor(Math.random() * 25000 + 20000));
    }
  });

  client.login(conf.token).catch(() => {});
});
