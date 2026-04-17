require('dotenv').config();
const http = require('http');
const { Client } = require('discord.js-selfbot-v13');

const PORT = process.env.PORT || 5000;
const TOKEN = process.env.TOKEN_1; 
const CANALES_IDS = process.env.CANALES_IDS ? process.env.CANALES_IDS.split(',') : [];

const CONFIG = {
  frases: ["# SE VAN POR PAYPAL"],
  fotos: ["./image-3-1.webp"]
};

const opcionesDormir = [22, 23, 0, 1];
const horaDormir = opcionesDormir[Math.floor(Math.random() * opcionesDormir.length)];
const horasDeSueño = Math.floor(Math.random() * 3) + 7; 
const horaDespertar = (horaDormir + horasDeSueño) % 24;

http.createServer((req, res) => { res.writeHead(200); res.end('Stable'); }).listen(PORT);

let client = null;
let botActivo = false;
let isLoggingIn = false;
let canalesCache = new Map();

const log = (msg) => console.log(`[BOT] ${msg}`);

const estaEnHorarioDeSueño = () => {
  const ahora = new Date().getHours();
  if (horaDormir > horaDespertar) {
    return ahora >= horaDormir || ahora < horaDespertar;
  }
  return ahora >= horaDormir && ahora < horaDespertar;
};

const limpiarYReconectar = (tiempoMs) => {
  botActivo = false;
  if (client) {
    try { client.removeAllListeners(); client.destroy(); } catch (e) {}
  }
  client = null;
  setTimeout(login, tiempoMs);
};

const login = async () => {
  if (isLoggingIn) return;
  
  if (estaEnHorarioDeSueño()) {
    log(`OFF - HORARIO DE SUEÑO (${horaDormir}h - ${horaDespertar}h)`);
    return setTimeout(login, 1800000); 
  }

  isLoggingIn = true;
  client = new Client({ checkUpdate: false });

  client.on('ready', () => {
    isLoggingIn = false;
    botActivo = true;
    console.log('-------------------------');
    console.log(`BOT ON: ${client.user.username}`);
    console.log('-------------------------');
    ejecutarBucle();
  });

  client.on('shardDisconnect', () => limpiarYReconectar(60000));
  
  client.login(TOKEN).catch(() => {
    isLoggingIn = false;
    limpiarYReconectar(120000);
  });
};

const ejecutarBucle = async () => {
  if (!botActivo || !client?.user) return;

  if (estaEnHorarioDeSueño()) {
    log("OFF - INICIANDO SUEÑO");
    return limpiarYReconectar(3600000);
  }

  try {
    const canales = [...CANALES_IDS];
    
    for (const id of canales) {
      if (!botActivo) return;

      let canal = canalesCache.get(id) || await client.channels.fetch(id).catch(() => null);
      if (!canal) continue;
      canalesCache.set(id, canal);

      const mensajes = await canal.messages.fetch({ limit: 1 }).catch(() => null);
      if (mensajes?.first()?.author.id === client.user.id) {
        continue;
      }

      await canal.sendTyping().catch(() => {});
      await new Promise(r => setTimeout(r, 2000));

      const msgOptions = { content: CONFIG.frases[Math.floor(Math.random() * CONFIG.frases.length)] };
      if (CONFIG.fotos?.length > 0) msgOptions.files = CONFIG.fotos;

      await canal.send(msgOptions).catch(() => null);
      log(`ENVIADO EN #${canal.name}`);
      
      await new Promise(r => setTimeout(r, 60000));
    }
    
    setTimeout(() => { if(botActivo) ejecutarBucle(); }, 10000);

  } catch (e) { 
    setTimeout(() => { if(botActivo) ejecutarBucle(); }, 30000); 
  }
};

login();
;

