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

function iniciarBot(conf) {
  const client = new Client({ checkUpdate: false });
  client.conf = conf;
  client.bloqueadoPorChat = false;
  client.buclesCompletados = 0;
  client.metaBucle = Math.floor(Math.random() * 7 + 6);

  client.ejecutarBucle = async function() {
    if (this.bloqueadoPorChat) return;

    if (Math.random() < 0.15 && this.buclesCompletados === 0) {
      const duracionFuera = Math.floor(Math.random() * 181 + 120) * 60000; 
      console.log(`${this.user.username} se desconecta (off), vuelve en ${Math.floor(duracionFuera/60000)} min`);
      const configActual = this.conf;
      this.destroy();
      setTimeout(() => iniciarBot(configActual), duracionFuera);
      return;
    }

    if (this.buclesCompletados >= this.metaBucle) {
      this.buclesCompletados = 0;
      this.metaBucle = Math.floor(Math.random() * 5 + 7);
      const esperaLarga = Math.floor(Math.random() * 36 + 25) * 60000;
      console.log(`${this.user.username} terminó su tanda, el proximo mensaje sale en ${Math.floor(esperaLarga/60000)} min`);
      return setTimeout(() => this.ejecutarBucle(), esperaLarga);
    }

    try {
      const colaCanales = [...CANALES].sort(() => 0.5 - Math.random());
      for (const id of colaCanales) {
        if (Math.random() < 0.1) continue; 
        const canal = await this.channels.fetch(id).catch(() => null);
        if (!canal) continue;
        await canal.sendTyping();
        await new Promise(r => setTimeout(r, Math.random() * 6000 + 4000));
        const enviado = await canal.send({ content: this.conf.frases[Math.floor(Math.random() * this.conf.frases.length)], files: this.conf.fotos }).catch(() => null);
        if (enviado) console.log(`mensaje mandado por ${this.user.username} en el canal ${canal.name}`);
        const esperaEntre = Math.floor(Math.random() * 120000 + 45000);
        console.log(`el siguiente mensaje de ${this.user.username} sale en ${Math.floor(esperaEntre/1000)} segundos`);
        await new Promise(r => setTimeout(r, esperaEntre));
      }
      this.buclesCompletados++;
      setTimeout(() => this.ejecutarBucle(), Math.floor(Math.random() * 5 + 4) * 60000);
    } catch (e) { setTimeout(() => this.ejecutarBucle(), 60000); }
  };

  client.on('ready', () => {
    console.log(`log in exitoso: ${client.user.tag} (ID: ${client.user.id})`);
    if (!clientes.find(c => c.user?.id === client.user.id)) clientes.push(client);
    setTimeout(() => client.ejecutarBucle(), 5000);
  });

  client.on('messageCreate', async (msg) => {
    if (!CANALES.includes(msg.channel.id) || msg.author.bot) return;
    const esPropio = clientes.some(c => c.user?.id === msg.author.id);
    if (esPropio && msg.author.id !== client.user.id && Math.random() < 0.05) {
      setTimeout(() => { msg.reply(frasesApoyo[Math.floor(Math.random() * frasesApoyo.length)]).catch(() => {}); }, Math.random() * 20000 + 15000);
    }
    let esReferencia = false;
    if (msg.reference && msg.reference.messageId) {
      try {
        const refMsg = await msg.channel.messages.fetch(msg.reference.messageId);
        if (refMsg && refMsg.author.id === client.user.id) esReferencia = true;
      } catch (err) {}
    }
    const keywordMatch = msg.content.toLowerCase().match(/\b(m+d+|d+m+)\b/i);
    if ((msg.mentions.has(client.user.id) || esReferencia) && keywordMatch) {
      if (client.bloqueadoPorChat || esPropio) return; 
      client.bloqueadoPorChat = true;
      setTimeout(async () => {
        try {
          await msg.reply(client.conf.respuestas[Math.floor(Math.random() * client.conf.respuestas.length)]);
          console.log(`${client.user.username} respondió al ${keywordMatch} de ${msg.author.username} en el canal ${msg.channel.name}`);
          setTimeout(() => { client.bloqueadoPorChat = false; client.ejecutarBucle(); }, 420000);
        } catch (err) { client.bloqueadoPorChat = false; client.ejecutarBucle(); }
      }, Math.floor(Math.random() * 25000 + 20000));
    }
  });

  client.login(conf.token).catch(() => console.log(`error en log in: token inválido`));
}
botsConfig.forEach(conf => iniciarBot(conf));
