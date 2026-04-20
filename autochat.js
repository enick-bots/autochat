require('dotenv').config();
const http = require('http');
const { Client } = require('discord.js-selfbot-v13');

const PORT = process.env.PORT || 5000;
http.createServer((req, res) => { res.writeHead(200); res.end('Stable'); }).listen(PORT);

const CANALES_IDS = process.env.CANALES_IDS ? process.env.CANALES_IDS.split(',') : [];
const MIS_BOTS_IDS = []; 
const INICIO_SCRIPT = Date.now();

const botsConfig = [
  { 
    token: process.env.TOKEN_1, 
    frases: "# SE VAN POR PAYPAL", 
    fotos: ["./image-3-1.webp"],
    respuestas: ["revisa al dm", "te hable al privado"],
    respuestasVenta: ["acepto ltc y binance"],
    frasesMDPositivo: ["dale md, hablemos"],
    helpingFrases: ["pasa ltc bro", "revisa el dm"]
  },
  { 
    token: process.env.TOKEN_2, 
    frases: "# ME JUBILO", 
    fotos: ["./img.webp"],
    respuestas: ["checa md", "ya te escribi"],
    respuestasVenta: ["si acepto usd"],
    frasesMDPositivo: ["mándame mensaje"],
    helpingFrases: ["tienes usd?", "checa el priv"]
  },
  { 
    token: process.env.TOKEN_3, 
    frases: "# se van por paypal", 
    fotos: ["./Screenshot_20260407_214952_Roblox.webp"],
    respuestas: ["mandame soli", "check dm bro"],
    respuestasVenta: ["manejo ltc"],
    frasesMDPositivo: ["dale, hablemos"],
    helpingFrases: ["revisa soli", "manda ltc"]
  },
  { 
    token: process.env.TOKEN_4, 
    frases: "busco robux", 
    fotos: ["./1b64c693-25ac-4bf6-9d58-f1e8bfced89e-1.webp"],
    respuestas: ["revisa", "ahi te hable"],
    respuestasVenta: ["manda md"],
    frasesMDPositivo: ["revisa el dm"],
    helpingFrases: ["tienes stock?", "revisa priv"]
  },
  { 
    token: process.env.TOKEN_5, 
    frases: "BUSCO MONEY", 
    fotos: ["./Screenshot_20260408_190805_Roblox-1.webp"],
    respuestas: ["al priv", "te mandé md"],
    respuestasVenta: ["háblame al dm"],
    frasesMDPositivo: ["hablemos al privado"],
    helpingFrases: ["ve al dm", "te hable"]
  }
];

const REGEX_MD = /\b(md|dm|priv|privado)\b/i;
const REGEX_VENTA = /\b(usd|ltc|\$|binance)\b/i;

function iniciarBot(conf, index) {
  let client = null;
  let botActivo = false;
  let canalesCache = new Map();
  let contadorRespuestasUsuario = new Map();

  const horaDormir = 1; 
  const horaDespertar = 8;

  const log = (msg) => {
    const time = new Date().toLocaleTimeString();
    console.log(`\x1b[36m[${time}]\x1b[0m \x1b[35m[BOT-${index + 1}]\x1b[0m ${msg}`);
  };

  const estaEnHorarioDeSueño = () => {
    if (Date.now() - INICIO_SCRIPT < 900000) return false; 
    const ahora = new Date().getHours();
    return ahora >= horaDormir && ahora < horaDespertar;
  };

  const login = async () => {
    if (estaEnHorarioDeSueño()) {
        log(`\x1b[33mZzz... Despierta a las ${horaDespertar}:00\x1b[0m`);
        return setTimeout(login, 1800000);
    }
    client = new Client({ checkUpdate: false });
    client.on('ready', () => {
      botActivo = true;
      if (!MIS_BOTS_IDS.includes(client.user.id)) MIS_BOTS_IDS.push(client.user.id);
      log(`\x1b[32mON - ${client.user.username}\x1b[0m`);
      ejecutarBucle();
    });

    client.on('messageCreate', async (message) => {
      if (!botActivo || message.author.bot) return;
      const esReplyAMi = message.referencingMessage?.author.id === client.user.id;
      const esDeMisBots = MIS_BOTS_IDS.includes(message.author.id);

      if (esReplyAMi) {
        let res = null;
        let tLabel = "";
        if (esDeMisBots && Math.random() < 0.35) {
            res = conf.frasesMDPositivo[Math.floor(Math.random() * conf.frasesMDPositivo.length)];
            tLabel = "Helping";
        } else if (!esDeMisBots) {
            const veces = contadorRespuestasUsuario.get(message.author.id) || 0;
            if (veces >= 3 || Math.random() > 0.40) return;
            if (REGEX_VENTA.test(message.content) && conf.respuestasVenta) res = conf.respuestasVenta[Math.floor(Math.random() * conf.respuestasVenta.length)];
            else if (REGEX_MD.test(message.content) && conf.respuestas) res = conf.respuestas[Math.floor(Math.random() * conf.respuestas.length)];
            if(res) {
                contadorRespuestasUsuario.set(message.author.id, veces + 1);
                tLabel = "Usuario";
            }
        }
        if (res) {
          const segs = 3 + Math.floor(Math.random() * 4);
          log(`Respuesta ${tLabel} en ${segs}s a ${message.author.username}`);
          await new Promise(r => setTimeout(r, segs * 1000));
          await message.channel.sendTyping().catch(() => {});
          await message.reply(res).catch(() => {});
        }
      }
    });

    client.login(conf.token).catch(() => setTimeout(login, 120000));
  };

  const ejecutarBucle = async () => {
    if (!botActivo) return;

    const tiempoTranscurrido = Date.now() - INICIO_SCRIPT;
    if (tiempoTranscurrido > 780000 && tiempoTranscurrido < 800000) {
        log(`\x1b[31m⚠️ AVISO: 2 min para modo humano\x1b[0m`);
    }

    if (estaEnHorarioDeSueño()) {
      log(`\x1b[33mCerrando sesión para dormir\x1b[0m`);
      botActivo = false;
      client.destroy();
      return setTimeout(login, 3600000);
    }

    try {
      const canales = [...CANALES_IDS].sort(() => Math.random() - 0.5);
      for (const id of canales) {
        if (!botActivo) return;
        let canal = canalesCache.get(id) || await client.channels.fetch(id).catch(() => null);
        if (!canal) continue;
        canalesCache.set(id, canal);

        const mensajes = await canal.messages.fetch({ limit: 5 }).catch(() => null);
        const anuncioAmigo = mensajes?.find(m => MIS_BOTS_IDS.includes(m.author.id) && m.author.id !== client.user.id);
        
        if (anuncioAmigo && Math.random() < 0.20) {
          const fraseHelp = conf.helpingFrases[Math.floor(Math.random() * conf.helpingFrases.length)];
          log(`Helping en \x1b[34m#${canal.name}\x1b[0m`);
          await new Promise(r => setTimeout(r, 6000));
          await anuncioAmigo.reply(fraseHelp).catch(() => {});
        }

        if (mensajes?.first()?.author.id !== client.user.id) {
          const segs = 2 + Math.floor(Math.random() * 4);
          await new Promise(r => setTimeout(r, segs * 1000));
          await canal.sendTyping().catch(() => {});
          await canal.send({ content: conf.frases, files: conf.fotos }).catch(() => null);
          log(`Publicado en \x1b[34m#${canal.name}\x1b[0m`);
        }
        await new Promise(r => setTimeout(r, Math.random() * 15000 + 20000));
      }

      botActivo = false;
      client.destroy();
      
      let esperaMs;
      if (Math.random() < 0.01) {
          esperaMs = (31 + Math.floor(Math.random() * 30)) * 60000;
          log(`\x1b[41mDescanso Largo: ${Math.floor(esperaMs/60000)}m\x1b[0m`);
      } else {
          esperaMs = (2 + Math.floor(Math.random() * 4)) * 60000;
          log(`Descanso Corto: ${Math.floor(esperaMs/60000)}m`);
      }
      setTimeout(login, esperaMs);

    } catch (e) { 
      if (client) client.destroy();
      setTimeout(login, 60000); 
    }
  };

  const retrasoInicial = index * (Math.floor(Math.random() * 60000) + 180000);
  log(`Esperando ${Math.floor(retrasoInicial/60000)}m para escalonar inicio`);
  setTimeout(login, retrasoInicial);
}

console.log('\x1b[44m SISTEMA DE SELF-BOTS INICIADO \x1b[0m');
botsConfig.forEach((bot, index) => iniciarBot(bot, index));
