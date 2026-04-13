require('dotenv').config();
const http = require('http');
const { Client } = require('discord.js-selfbot-v13');

http.createServer((req, res) => { res.writeHead(200); res.end('Stable'); }).listen(5000);

const CANALES_IDS = process.env.CANALES_IDS ? process.env.CANALES_IDS.split(',') : [];

const botsConfig = [
  { token: process.env.TOKEN_1, frases: ["# SE VAN POR PAYPAL"], fotos: ["./image-3-1.webp"] },
  { token: process.env.TOKEN_2, frases: ["# ME JUBILO"], fotos: ["./img.webp"] },
  { token: process.env.TOKEN_3, frases: ["# se van por paypal"], fotos: ["./Screenshot_20260407_214952_Roblox.webp"] },
  { token: process.env.TOKEN_4, frases: ["busco robux"], fotos: ["./1b64c693-25ac-4bf6-9d58-f1e8bfced89e-1.webp"] },
  { token: process.env.TOKEN_5, frases: ["BUSCO MONEY"], fotos: ["./Screenshot_20260408_190805_Roblox-1.webp"] }
];

const COOLDOWN_CANAL_MS = 6 * 60 * 1000;

function iniciarBot(conf) {
  let client = null;
  let isLoggingIn = false;
  let botActivo = false;
  let loginTimeout = null;

  let canalesCache = new Map();
  let fallosCanal = new Map();
  let canalesInvalidos = new Set();
  let cooldownsPersonales = new Map();
  let ultimoAnuncioEnCanal = new Map(); 
  
  let horaDormir = Math.floor(Math.random() * 5) + 20; 
  let horaDespertar = Math.floor(Math.random() * 4) + 7; 

  const log = (msg) => console.log(`[${conf.token.substring(0,10)}...] ${msg}`);

  const limpiarYReconectar = (tiempoMs) => {
    botActivo = false;
    if (loginTimeout) clearTimeout(loginTimeout);
    
    try {
      if (client) {
        client.removeAllListeners();
        client.destroy();
      }
    } catch (e) {}
    client = null;

    loginTimeout = setTimeout(login, tiempoMs);
  };

  const login = async () => {
    if (isLoggingIn) return;
    isLoggingIn = true;

    client = new Client({ checkUpdate: false });

    client.on('ready', () => {
      isLoggingIn = false;
      botActivo = true;
      canalesCache.clear();
      canalesInvalidos.clear();
      fallosCanal.clear();
      log(`OK: ${client.user.username}`);
      ejecutarBucle();
    });

    client.on('shardDisconnect', () => {
      if (!botActivo) return;
      botActivo = false;
      isLoggingIn = false;
      limpiarYReconectar(60000);
    });

    client.login(conf.token).catch(() => {
      isLoggingIn = false;
      limpiarYReconectar(120000);
    });
  };

  const ejecutarBucle = async () => {
    if (!botActivo || !client || !client.user) return;

    if (new Date().getHours() >= horaDormir || new Date().getHours() < horaDespertar) {
      log(`Dormir`);
      return limpiarYReconectar(1200000 + Math.random() * 300000);
    }

    try {
      const canales = [...CANALES_IDS];
      for (let i = canales.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [canales[i], canales[j]] = [canales[j], canales[i]];
      }
      
      for (const id of canales) {
        if (!botActivo || !client || !client.user) return;
        if (canalesInvalidos.has(id)) continue;

        if (ultimoAnuncioEnCanal.get(id) === client.user.id || (Date.now() - (cooldownsPersonales.get(id) || 0)) < COOLDOWN_CANAL_MS) continue;

        let canal = canalesCache.get(id);
        if (!canal) {
          canal = await client.channels.fetch(id).catch(() => null);
          if (canal) canalesCache.set(id, canal);
        }
        
        if (!canal) {
          const f = (fallosCanal.get(id) || 0) + 1;
          fallosCanal.set(id, f);
          if (f >= 3) canalesInvalidos.add(id);
          continue; 
        }

        await canal.sendTyping().catch(() => {});
        await new Promise(r => setTimeout(r, Math.random() * 4000 + 3000));

        if (!conf.frases?.length) continue;
        
        const msgOptions = { content: conf.frases[Math.floor(Math.random() * conf.frases.length)] };
        const imgs = Array.isArray(conf.fotos) ? conf.fotos.filter(Boolean) : [];
        if (imgs.length > 0) msgOptions.files = imgs;

        const enviado = await canal.send(msgOptions).catch(e => {
            if (e.message.includes("permission") || e.message.includes("access")) canalesInvalidos.add(id);
            return null;
        });
        
        if (enviado) {
          log(`Msg en #${canal.name}`);
          ultimoAnuncioEnCanal.set(id, client.user.id);
          cooldownsPersonales.set(id, Date.now());
          await new Promise(r => setTimeout(r, Math.random() * 60000 + 60000));
        }
      }

      if (Math.random() < 0.20) {
        const min = Math.floor(Math.random() * 60 + 30);
        log(`Descanso ${min}m`);
        return limpiarYReconectar((min * 60000) + (Math.random() * 240000 + 60000));
      } else {
        setTimeout(() => { if(botActivo) ejecutarBucle(); }, Math.floor(Math.random() * 15 + 10) * 60000);
      }

    } catch (e) {
      setTimeout(() => { if(botActivo) ejecutarBucle(); }, 10 * 60000);
    }
  };

  login();
}

botsConfig.forEach(iniciarBot);
