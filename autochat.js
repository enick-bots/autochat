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
      console.log(`${this.user.username} se duerme, vuelve en ${Math.floor(this.horaDespertar)} am aprox`);
      return setTimeout(() => this.ejecutarBucle(), 1800000);
    }

    if (Math.random() < 0.15 && this.buclesCompletados === 0 && !this.estaFuera) {
      this.estaFuera = true;
      const duracionFuera = Math.floor(Math.random() * 181 + 120) * 60000; 
      console.log(`${this.user.username} se fue a hacer otra cosa, vuelve en ${Math.floor(duracionFuera/60000)} min`);
      return setTimeout(() => { this.estaFuera = false; this.ejecutarBucle(); }, duracionFuera);
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
        
        await canal.send({ 
          content: this.conf.frases[Math.floor(Math.random() * this.conf.frases.length)], 
          files: this.conf.fotos 
        });
        
        console.log(`mensaje mandado por ${this.user.username} en el canal ${canal.name}`);
        
        const esperaEntre = Math.floor(Math.random() * 120000 + 45000);
        console.log(`el siguiente mensaje de ${this.user.username} sale en ${Math.floor(esperaEntre/1000)} segundos`);
        await new Promise(r => setTimeout(r, esperaEntre));
      }

      this.buclesCompletados++;
      setTimeout(() => this.ejecutarBucle(), Math.floor(Math.random() * 5 + 4) * 60000);
    } catch (e) { 
      setTimeout(() => this.ejecutarBucle(), 60000); 
    }
  };

  client.on('ready', () => {
    console.log(`log in exitoso: ${client.user.tag} (ID: ${client.user.id})`);
    clientes.push(client);
    setTimeout(() => client.ejecutarBucle(), Math.random() * 1200000);
  });

  client.on('messageCreate', async (msg) => {
    if (!CANALES.includes(msg.channel.id) || msg.author.bot || client.estaFuera) return;
    
    const esPropio = clientes.some(c => c.user.id === msg.author.id);

    if (esPropio && msg.author.id !== client.user.id && Math.random() < 0.05) {
      setTimeout(() => {
        msg.reply(frasesApoyo[Math.floor(Math.random() * frasesApoyo.length)]).catch(() => {});
      }, Math.random() * 20000 + 15000);
    }

    let esReferencia = false;
    if (msg.reference) {
      const refMsg = await msg.channel.messages.fetch(msg.reference.messageId).catch(() => null);
      if (refMsg?.author.id === client.user.id) esReferencia = true;
    }

    const tieneKeywords = /\b(m+d+|d+m+)\b/i.test(msg.content);
    if ((msg.mentions.has(client.user.id) || esReferencia) && tieneKeywords) {
      if (client.bloqueadoPorChat || esPropio) return; 
      client.bloqueadoPorChat = true;
      
      const tipoMensaje = msg.content.toLowerCase().includes('md') ? 'md' : 'dm';

      setTimeout(async () => {
        try {
          await msg.reply(client.conf.respuestas[Math.floor(Math.random() * client.conf.respuestas.length)]);
          console.log(`${client.user.username} respondió al ${tipoMensaje} de ${msg.author.username} en el canal ${msg.channel.name}`);
          setTimeout(() => { 
            client.bloqueadoPorChat = false; 
            client.ejecutarBucle(); 
          }, 420000);
        } catch (err) { 
          client.bloqueadoPorChat = false; 
          client.ejecutarBucle(); 
        }
      }, Math.floor(Math.random() * 25000 + 20000));
    }
  });

  client.login(conf.token).catch((err) => {
    console.log(`error en log in: no se pudo conectar con el token que empieza por ${conf.token.substring(0, 10)}...`);
  });
});
