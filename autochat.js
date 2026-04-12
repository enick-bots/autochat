require('dotenv').config();
const { Client, MessageAttachment } = require('discord.js-selfbot-v13');

const CANALES = process.env.CANALES_IDS ? process.env.CANALES_IDS.split(',') : [];
const botsConfig = [
  { token: process.env.TOKEN_1, frases: ["# SE VAN POR PAYPAL", "# VENDO ESTO ACEPTO SOLO PAYPAL"], fotos: ["./image-3-1.webp"], respuestas: ["solo si es compra", "solo paypal"] },
  { token: process.env.TOKEN_2, frases: ["# ME JUBILO POR BRAINROTS"], fotos: ["./img.webp"], respuestas: ["no leo md"] },
  { token: process.env.TOKEN_3, frases: ["# se van por paypal"], fotos: ["./screenshot_20260407_214952_Roblox.webp"], respuestas: ["no me interesa trade","solo paypal busco"] },
  { token: process.env.TOKEN_4, frases: ["busco robux", "acepto solo robux "], fotos: ["./1b64c693-25ac-4bf6-9d58-f1e8bfced89e-1.webp"], respuestas: ["solo acepto robux","solo busco que me compren por robux"] },
  { token: process.env.TOKEN_5, frases: ["BUSCO MONEY"], fotos: ["./screenshot_20260408_190805_Roblox-1.webp"], respuestas: ["manda tu md"] }
];

const clientes = new Map();
const ultimoAnuncioEnCanal = new Map();

function iniciarBot(conf) {
  if (clientes.has(conf.token)) {
    const viejo = clientes.get(conf.token);
    viejo.activo = false;
    viejo.destroy();
    clientes.delete(conf.token);
  }

  const client = new Client({ checkUpdate: false });
  client.conf = conf;
  client.activo = true;
  client.bloqueadoPorChat = false;
  client.buclesCompletados = 0;
  client.metaBucle = Math.floor(Math.random() * 6 + 5);

  client.ejecutarBucle = async function() {
    if (!this.activo || this.bloqueadoPorChat) return;

    if (this.buclesCompletados >= this.metaBucle) {
      const descanso = Math.floor(Math.random() * 20 + 15) * 60000;
      console.log(`[DESCANSO] ${this.user.username} libre por ${Math.floor(descanso/60000)} min`);
      this.buclesCompletados = 0;
      return setTimeout(() => this.ejecutarBucle(), descanso);
    }

    try {
      const canalesMezclados = [...CANALES].sort(() => 0.5 - Math.random());
      
      for (const id of canalesMezclados) {
        if (!this.activo) return;

        if (ultimoAnuncioEnCanal.get(id) === this.user.id) continue;

        const canal = await this.channels.fetch(id).catch(() => null);
        if (!canal) {
          console.log(`[AVISO] ${this.user.username} no ve el canal ${id}`);
          continue;
        }

        await canal.sendTyping();
        await new Promise(r => setTimeout(r, Math.random() * 4000 + 3000));

        const attachment = new MessageAttachment(this.conf.fotos[0]);
        const frase = this.conf.frases[Math.floor(Math.random() * this.conf.frases.length)];

        const enviado = await canal.send({ content: frase, files: [attachment] }).catch(() => null);
        
        if (enviado) {
          console.log(`[ANUNCIO] ${this.user.username} mando su mensaje en #${canal.name}`);
          ultimoAnuncioEnCanal.set(id, this.user.id);
          
          const esperaProxCanal = Math.floor(Math.random() * 60000 + 40000);
          console.log(`[TIEMPO] ${this.user.username} mandara otro en ${Math.floor(esperaProxCanal/1000)} seg`);
          await new Promise(r => setTimeout(r, esperaProxCanal));
        }
      }

      this.buclesCompletados++;
      setTimeout(() => this.ejecutarBucle(), Math.floor(Math.random() * 6 + 4) * 60000);
    } catch (e) {
      setTimeout(() => this.ejecutarBucle(), 60000);
    }
  };

  client.on('ready', () => {
    console.log(`[LOGIN] ${client.user.tag} (ID: ${client.user.id})`);
    clientes.set(conf.token, client);
    setTimeout(() => client.ejecutarBucle(), Math.random() * 60000 + 5000);
  });

  client.on('messageCreate', async (msg) => {
    if (!client.activo || !CANALES.includes(msg.channel.id) || msg.author.bot) return;

    const esDelGrupo = Array.from(clientes.values()).some(c => c.user?.id === msg.author.id);
    const soyYo = msg.author.id === client.user.id;

    if (esDelGrupo && !soyYo && Math.random() < 0.1) {
      const frasesApoyo = ["revisa md pa", "ve el md", "checa md", "te mandé md bro"];
      setTimeout(() => {
        msg.reply(frasesApoyo[Math.floor(Math.random() * frasesApoyo.length)]).catch(() => {});
        console.log(`[APOYO] ${client.user.username} respondio a un mensaje en #${msg.channel.name}`);
      }, Math.random() * 15000 + 10000);
    }

    const keyword = msg.content.toLowerCase().match(/\b(m+d+|d+m+)\b/i);
    if ((msg.mentions.has(client.user.id)) && keyword && !esDelGrupo) {
      if (client.bloqueadoPorChat) return;
      client.bloqueadoPorChat = true;

      setTimeout(async () => {
        const r = client.conf.respuestas[Math.floor(Math.random() * client.conf.respuestas.length)];
        await msg.reply(r).catch(() => {});
        console.log(`[RESPUESTA] ${client.user.username} mando respuesta de MD en #${msg.channel.name}`);
        setTimeout(() => { client.bloqueadoPorChat = false; client.ejecutarBucle(); }, 300000);
      }, Math.random() * 10000 + 10000);
    }
  });

  client.login(conf.token).catch(() => console.log(`[!] Error en token ${conf.token.substring(0,10)}`));
}

botsConfig.forEach(conf => iniciarBot(conf));
