require('dotenv').config();
const http = require('http');
const { Client } = require('discord.js-selfbot-v13');

const PORT = process.env.PORT || 5000;
http.createServer((req, res) => { res.writeHead(200); res.end('Stable'); }).listen(PORT);

const CANALES_IDS = process.env.CANALES_IDS ? process.env.CANALES_IDS.split(',') : [];
const MIS_BOTS_IDS = []; 

const botsConfig = [
  { 
    token: process.env.TOKEN_1, 
    frases: "# SE VAN POR PAYPAL", 
    frasesError: ["# Vrndo a paypsl.", "# se van x paypa"], 
    fotos: ["./image-3-1.webp"],
    respuestas: ["revisa al dm", "te hable al privado"],
    respuestasVenta: ["acepto ltc y binance"],
    frasesMDPositivo: ["dale md, hablemos"],
    helpingFrases: ["pasa ltc bro", "revisa el dm"]
  },
  { 
    token: process.env.TOKEN_2, 
    frases: "# ME JUBILO", 
    frasesError: ["# ME JUBLO", "# Me jublo."], 
    fotos: ["./img.webp"],
    respuestas: ["checa md", "ya te escribi"],
    respuestasVenta: ["si acepto usd"],
    frasesMDPositivo: ["mándame mensaje"],
    helpingFrases: ["tienes usd?", "checa el priv"]
  },
  { 
    token: process.env.TOKEN_3, 
    frases: "# se van por paypal", 
    frasesError: ["# se van x pypal"], 
    fotos: ["./Screenshot_20260407_214952_Roblox.webp"],
    respuestas: ["mandame soli", "check dm bro"],
    respuestasVenta: ["manejo ltc"],
    frasesMDPositivo: ["dale, hablemos"],
    helpingFrases: ["revisa soli", "manda ltc"]
  },
  { 
    token: process.env.TOKEN_4, 
    frases: "busco robux", 
    frasesError: ["busc robux"], 
    fotos: ["./1b64c693-25ac-4bf6-9d58-f1e8bfced89e-1.webp"],
    respuestas: ["revisa", "ahi te hable"],
    respuestasVenta: ["manda md"],
    frasesMDPositivo: ["revisa el dm"],
    helpingFrases: ["tienes stock?", "revisa priv"]
  },
  { 
    token: process.env.TOKEN_5, 
    frases: "BUSCO MONEY", 
    frasesError: ["BUSC MONEY"], 
    fotos: ["./Screenshot_20260408_190805_Roblox-1.webp"],
    respuestas: ["al priv", "te mandé md"],
    respuestasVenta: ["háblame al dm"],
    frasesMDPositivo: ["hablemos al privado"],
    helpingFrases: ["ve al dm", "te hable"]
  }
];

const REGEX_MD = /\b(md|dm|priv|privado)\b/i;
const REGEX_VENTA = /\b(usd|ltc|\$|binance)\b/i;

function iniciarBot(conf) {
  let client = null;
  let botActivo = false;
  let canalesCache = new Map();
  let contadorRespuestasUsuario = new Map();

  const opcionesDormir = [22, 23, 0, 1];
  const horaDormir = opcionesDormir[Math.floor(Math.random() * opcionesDormir.length)];
  const horasDeSueño = Math.floor(Math.random() * 3) + 7; 
  const horaDespertar = (horaDormir + horasDeSueño) % 24;

  const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] [${conf.frases.substring(0,10)}...] ${msg}`);

  const estaEnHorarioDeSueño = () => {
    const ahora = new Date().getHours();
    return horaDormir > horaDespertar ? (ahora >= horaDormir || ahora < horaDespertar) : (ahora >= horaDormir && ahora < horaDespertar);
  };

  const login = async () => {
    if (estaEnHorarioDeSueño()) {
        log(`Se fue a dormir, despierta a las ${horaDespertar}:00:00`);
        return setTimeout(login, 1800000);
    }
    client = new Client({ checkUpdate: false });
    client.on('ready', () => {
      botActivo = true;
      if (!MIS_BOTS_IDS.includes(client.user.id)) MIS_BOTS_IDS.push(client.user.id);
      log(`ON - Usuario: ${client.user.username}`);
      ejecutarBucle();
    });

    client.on('messageCreate', async (message) => {
      if (!botActivo || message.author.bot) return;
      const esReplyAMi = message.referencingMessage?.author.id === client.user.id;
      const esDeMisBots = MIS_BOTS_IDS.includes(message.author.id);

      if (esReplyAMi) {
        let res = null;
        let tipo = "";
        
        if (esDeMisBots && Math.random() < 0.35) {
            res = conf.frasesMDPositivo[Math.floor(Math.random() * conf.frasesMDPositivo.length)];
            tipo = "MD Positivo (Amigo)";
        } else if (!esDeMisBots) {
            const veces = contadorRespuestasUsuario.get(message.author.id) || 0;
            if (veces >= 3 || Math.random() > 0.30) return;
            
            if (REGEX_VENTA.test(message.content) && conf.respuestasVenta) {
                res = conf.respuestasVenta[Math.floor(Math.random() * conf.respuestasVenta.length)];
                tipo = "Venta";
            } else if (REGEX_MD.test(message.content) && conf.respuestas) {
                res = conf.respuestas[Math.floor(Math.random() * conf.respuestas.length)];
                tipo = "MD/Privado";
            }
            if(res) contadorRespuestasUsuario.set(message.author.id, veces + 1);
        }

        if (res) {
          const segs = 4 + Math.floor(Math.random() * 6);
          log(`${client.user.username} responderá "${res}" (${tipo}) a ${message.author.username} en ${segs}s`);
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
    if (estaEnHorarioDeSueño()) {
      log(`Se fue a dormir, despierta a las ${horaDespertar}:00:00`);
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
        
        if (anuncioAmigo && Math.random() < 0.15) {
          const fraseHelp = conf.helpingFrases[Math.floor(Math.random() * conf.helpingFrases.length)];
          log(`Ayudando a ${anuncioAmigo.author.username} en #${canal.name} con "${fraseHelp}"`);
          await new Promise(r => setTimeout(r, 8000 + Math.random() * 5000));
          await anuncioAmigo.reply(fraseHelp).catch(() => {});
        }

        if (mensajes?.first()?.author.id !== client.user.id) {
          const segs = 3 + Math.floor(Math.random() * 7);
          log(`${client.user.username} escribirá en #${canal.name} en ${segs}s`);
          await new Promise(r => setTimeout(r, segs * 1000));
          await canal.sendTyping().catch(() => {});

          if (Math.random() < 0.12 && conf.frasesError) {
            const msgErr = conf.frasesError[Math.floor(Math.random() * conf.frasesError.length)];
            const enviado = await canal.send({ content: msgErr, files: conf.fotos }).catch(() => null);
            if (enviado) {
              await new Promise(r => setTimeout(r, 4000));
              await enviado.edit(conf.frases).catch(() => {});
            }
          } else {
            await canal.send({ content: conf.frases, files: conf.fotos }).catch(() => null);
          }
        }
        await new Promise(r => setTimeout(r, Math.random() * 15000 + 25000));
      }

      botActivo = false;
      client.destroy();
      
      let esperaMs;
      let tipoD;
      
      if (Math.random() < 0.05) {
          esperaMs = (31 + Math.floor(Math.random() * 89)) * 60000;
          tipoD = "Largo";
      } else {
          esperaMs = (4 + Math.floor(Math.random() * 26)) * 60000;
          tipoD = "Corto";
      }

      log(`Acaba de desconectarse (${tipoD}), vuelve en ${Math.floor(esperaMs/60000)} minutos`);
      setTimeout(login, esperaMs);

    } catch (e) { 
      if (client) client.destroy();
      setTimeout(login, 300000); 
    }
  };

  login();
}

botsConfig.forEach(iniciarBot);
