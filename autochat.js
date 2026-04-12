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
  client.estaFuera = false;
  client.buclesCompletados = 0;
  client.metaBucle = Math.floor(Math.random() * 7 + 6);
  
  client.horaDormir = 22 + Math.random() * 1.8; 
  client.horaDespertar = 7 + Math.random() * 2.8;

  client.ejecutarBucle = async function() {
    if (this.bloqueadoPorChat || this.estaFuera) return;

    const ahora = new Date().getHours() + new Date().getMinutes() / 60;
    const nocturno = this.horaDormir > this.horaDespertar 
      ? (ahora >= this.horaDormir || ahora < this.horaDespertar)
      : (ahora >= this.horaDormir && ahora < this.horaDespertar);

    if (nocturno) {
      console.log(`[${this.user.username}] toca dormir un rato, son las ${Math.floor(ahora)}hs. despierto en unas horas.`);
      return setTimeout(() => this.ejecutarBucle(), 1800000);
    }

    if (Math.random() < 0.15 && this.buclesCompletados === 0 && !this.estaFuera) {
      this.estaFuera = true;
      const duracionFuera = Math.floor(Math.random() * 181 + 120) * 60000; 
      console.log(`[${this.user.username}] me salgo un rato del pc, vuelvo en ${Math.floor(duracionFuera/60000)} min.`);
      return setTimeout(() => { this.estaFuera = false; this.ejecutarBucle(); }, duracionFuera);
    }

    if (this.buclesCompletados >= this.metaBucle) {
      this.buclesCompletados = 0;
      this.metaBucle = Math.floor(Math.random() * 5 + 7);
      const esperaLarga = Math.floor(Math.random() * 36 + 25) * 60000;
      console.log(`[${this.user.username}] termine la tanda de mensajes, descanso de ${Math.floor(esperaLarga/60000)} min.`);
      return setTimeout(() => this.ejecutarBucle(), esperaLarga);
    }

    try {
      const colaCanales = [...CANALES].sort(() => 0.5 - Math.random());
      for (const id of colaCanales) {
        if (Math.random() < 0.1) continue; 
        const canal = await this.channels.fetch(id).catch(() => null);
        if (!canal) continue;

        await canal.sendTyping();
        const delayTyping = Math.random() * 6000 + 4000;
        await new Promise(r => setTimeout(r, delayTyping));
        
        await canal.send({ 
          content: this.conf.frases[Math.floor(Math.random() * this.conf.frases.length)], 
          files: this.conf.fotos 
        });
        
        console.log(`[${this.user.username}] mensaje enviado en #${canal.name}`);
        
        const esperaEntreCanales = Math.floor(Math.random() * 120000 + 45000);
        console.log(`[${this.user.username}] esperando ${Math.floor(esperaEntreCanales/1000)} seg para el siguiente canal`);
        await new Promise(r => setTimeout(r, esperaEntreCanales));
      }

      this.buclesCompletados++;
      const proximoBucle = Math.floor(Math.random() * 5 + 4) * 60000;
      console.log(`[${this.user.username}] tanda terminada (${this.buclesCompletados}/${this.metaBucle}). proxima vuelta en ${Math.floor(proximoBucle/60000)} min.`);
      setTimeout(() => this.ejecutarBucle(), proximoBucle);
    } catch (e) { 
      console.log(`[${this.user.username}] hubo un pequeño error, reintentando en 1 min.`);
      setTimeout(() => this.ejecutarBucle(), 60000); 
    }
  };

  client.on('ready', () => {
    console.log(`>>> cuenta logueada: ${client.user.tag}`);
    clientes.push(client);
    const inicio = Math.random() * 1200000;
    console.log(`[${client.user.username}] empezará a trabajar en ${Math.floor(inicio/60000)} min aprox.`);
    setTimeout(() => client.ejecutarBucle(), inicio);
  });

  client.on('messageCreate', async (msg) => {
    if (!CANALES.includes(msg.channel.id) || msg.author.bot || client.estaFuera) return;
    
    const esPropio = clientes.some(c => c.user.id === msg.author.id);

    if (esPropio && msg.author.id !== client.user.id && Math.random() < 0.05) {
      setTimeout(() => {
        msg.reply(frasesApoyo[Math.floor(Math.random() * frasesApoyo.length)]).catch(() => {});
        console.log(`[${client.user.username}] le di apoyo a un compañero en #${msg.channel.name}`);
      }, Math.random() * 20000 + 15000);
    }

    let esReferencia = false;
    if (msg.reference) {
      const refMsg = await msg.channel.messages.fetch(msg.reference.messageId).catch(() => null);
      if (refMsg?.author.id === client.user.id) esReferencia = true;
    }

    if ((msg.mentions.has(client.user.id) || esReferencia) && /\b(m+d+|d+m+)\b/i.test(msg.content)) {
      if (client.bloqueadoPorChat || esPropio) return; 
      client.bloqueadoPorChat = true;
      const delayR = Math.floor(Math.random() * 25000 + 20000);
      
      setTimeout(async () => {
        try {
          await msg.reply(client.conf.respuestas[Math.floor(Math.random() * client.conf.respuestas.length)]);
          console.log(`[${client.user.username}] respondi md a ${msg.author.username} en #${msg.channel.name}`);
          setTimeout(() => { 
            client.bloqueadoPorChat = false; 
            client.ejecutarBucle(); 
          }, 420000);
        } catch (err) { 
          client.bloqueadoPorChat = false; 
          client.ejecutarBucle(); 
        }
      }, delayR);
    }
  });

  client.login(conf.token).catch(() => {
    console.log(`error al entrar con un token, revisalo bien.`);
  });
});
