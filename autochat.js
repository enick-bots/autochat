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
    frasesMDPositivo: ["dale md, hablemos", "va bro, hablemos al priv"]
  },
  { 
    token: process.env.TOKEN_2, 
    frases: "# ME JUBILO", 
    frasesError: ["# ME JUBLO", "# Me jublo."], 
    fotos: ["./img.webp"],
    respuestas: ["checa md", "ya te escribi"],
    respuestasVenta: ["si acepto usd"],
    frasesMDPositivo: ["mándame mensaje", "dale al dm"]
  },
  { 
    token: process.env.TOKEN_3, 
    frases: "# se van por paypal", 
    frasesError: ["# se van x pypal"], 
    fotos: ["./Screenshot_20260407_214952_Roblox.webp"],
    respuestas: ["mandame soli", "check dm bro"],
    respuestasVenta: ["manejo ltc"],
    frasesMDPositivo: ["dale, hablemos"]
  },
  { 
    token: process.env.TOKEN_4, 
    frases: "busco robux", 
    frasesError: ["busc robux"], 
    fotos: ["./1b64c693-25ac-4bf6-9d58-f1e8bfced89e-1.webp"],
    respuestas: ["revisa", "ahi te hable"],
    frasesMDPositivo: ["revisa el dm"]
  },
  { 
    token: process.env.TOKEN_5, 
    frases: "BUSCO MONEY", 
    frasesError: ["BUSC MONEY"], 
    fotos: ["./Screenshot_20260408_190805_Roblox-1.webp"],
    respuestas: ["al priv", "te mandé md"],
    frasesMDPositivo: ["hablemos al privado"]
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

  const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] [${conf.token.substring(0,8)}] ${msg}`);

  const estaEnHorarioDeSueño = () => {
    const ahora = new Date().getHours();
    return horaDormir > horaDespertar ? (ahora >= horaDormir || ahora < horaDespertar) : (ahora >= horaDormir && ahora < horaDespertar);
  };

  const login = async () => {
    if (estaEnHorarioDeSueño()) return setTimeout(login, 1800000);
    client = new Client({ checkUpdate: false });
    client.on('ready', () => {
      botActivo = true;
      if (!MIS_BOTS_IDS.includes(client.user.id)) MIS_BOTS_IDS.push(client.user.id);
      log(`ON - Rutina: Duerme ${horaDormir}h / Despierta ${horaDespertar}h`);
      ejecutarBucle();
    });

    client.on('messageCreate', async (message) => {
      if (!botActivo || message.author.bot) return;
      const esReplyAMi = message.referencingMessage?.author.id === client.user.id;
      const esDeMisBots = MIS_BOTS_IDS.includes(message.author.id);

      if (esReplyAMi && esDeMisBots) {
        if (Math.random() > 0.4) return;
        await new Promise(r => setTimeout(r, 7000));
        const res = conf.frasesMDPositivo[Math.floor(Math.random() * conf.frasesMDPositivo.length)];
        await message.reply(res).catch(() => {});
        return;
      }

      if (esReplyAMi && !esDeMisBots) {
        const veces = contadorRespuestasUsuario.get(message.author.id) || 0;
        if (veces >= 3 || Math.random() > 0.25) return;
        let res = null;
        if (REGEX_VENTA.test(message.content) && conf.respuestasVenta) res = conf.respuestasVenta[Math.floor(Math.random() * conf.respuestasVenta.length)];
        else if (REGEX_MD.test(message.content) && conf.respuestas) res = conf.respuestas[Math.floor(Math.random() * conf.respuestas.length)];
        if (res) {
          await message.channel.sendTyping().catch(() => {});
          await new Promise(r => setTimeout(r, 5000));
          await message.reply(res).catch(() => {});
          contadorRespuestasUsuario.set(message.author.id, veces + 1);
        }
      }
    });

    client.login(conf.token).catch(() => setTimeout(login, 120000));
  };

  const ejecutarBucle = async () => {
    if (!botActivo) return;
    if (estaEnHorarioDeSueño()) {
      log("HORA DE DORMIR - DESTROY");
      botActivo = false;
      client.destroy();
      return setTimeout(login, 3600000);
    }

    try {
      const canales = [...CANALES_IDS].sort(() => Math.random() - 0.5);
      for (const id of canales) {
        if (!botActivo) return;

        if (Math.random() < 0.10) {
          log(`SE LE OLVIDO HABLAR EN #${id}`);
          continue;
        }

        let canal = canalesCache.get(id) || await client.channels.fetch(id).catch(() => null);
        if (!canal) continue;
        canalesCache.set(id, canal);

        const mensajes = await canal.messages.fetch({ limit: 5 }).catch(() => null);
        
        const anuncioAmigo = mensajes?.find(m => MIS_BOTS_IDS.includes(m.author.id) && m.author.id !== client.user.id);
        if (anuncioAmigo && Math.random() < 0.12) {
          await new Promise(r => setTimeout(r, 12000));
          const t = anuncioAmigo.content.toLowerCase();
          let f = "Oye bro ve dm tengo algo q te interese";
          if (t.includes("paypal")) f = "Oye bro ve dm, tengo algo en paypal que te interesa";
          else if (t.includes("robux")) f = "Bro revisa dm, tengo robux para eso";
          await anuncioAmigo.reply(f).catch(() => {});
        }

        if (mensajes?.first()?.author.id !== client.user.id) {
          await canal.sendTyping().catch(() => {});
          await new Promise(r => setTimeout(r, 6000));

          if (Math.random() < 0.15 && conf.frasesError) {
            const msgErr = conf.frasesError[Math.floor(Math.random() * conf.frasesError.length)];
            const enviado = await canal.send({ content: msgErr, files: conf.fotos }).catch(() => null);
            if (enviado) {
              await new Promise(r => setTimeout(r, 5000));
              await enviado.edit(conf.frases).catch(() => {});
            }
          } else {
            await canal.send({ content: conf.frases, files: conf.fotos }).catch(() => null);
          }
        }
        await new Promise(r => setTimeout(r, Math.random() * 20000 + 30000));
      }

      botActivo = false;
      client.destroy();

      let espera = Math.floor(Math.random() * (10 - 4 + 1) + 4) * 60000;
      if (Math.random() < 0.02) {
        espera = Math.floor(Math.random() * (240 - 20 + 1) + 20) * 60000;
        log(`SUERTE 2% - DESTROY LARGO: ${Math.floor(espera / 60000)} MINUTOS`);
      } else {
        log(`REINICIO EN ${Math.floor(espera / 60000)} MINUTOS`);
      }
      setTimeout(login, espera);

    } catch (e) { 
      if (client) client.destroy();
      setTimeout(login, 300000); 
    }
  };

  login();
}

botsConfig.forEach(iniciarBot);
