require('dotenv').config();
const http = require('http');
const fs = require('fs');
const { Client } = require('discord.js-selfbot-v13');

const PORT = process.env.PORT || 5000;
http.createServer((req, res) => { res.writeHead(200); res.end('Stable'); }).listen(PORT);

const MIS_BOTS_IDS = [];
let ocupadoGlobal = false;

const CANALES_G1 = process.env.CANAL_SV1 ? process.env.CANAL_SV1.split(',') : [];
const CANALES_G2 = process.env.CANAL_SV2 ? process.env.CANAL_SV2.split(',') : [];

const configGrupo1 = {
    canales: CANALES_G1,
    bots: [
        { token: process.env.TOKEN_1, frases: "# SE VAN POR PAYPAL", fotos: ["./image-3-1.webp"] },
        { token: process.env.TOKEN_2, frases: "# ME JUBILO", fotos: ["./img.webp"] },
        { token: process.env.TOKEN_3, frases: "# se van por paypal", fotos: ["./Screenshot_2026.webp"] },
        { token: process.env.TOKEN_4, frases: "busco robux", fotos: ["./1b64c693.webp"] },
        { token: process.env.TOKEN_5, frases: "BUSCO MONEY", fotos: ["./Screenshot_20260408.webp"] }
    ]
};

const configGrupo2 = {
    canales: CANALES_G2,
    bots: [
        { token: process.env.TOKEN_1, frases: "FRASE NUEVA SV 2", fotos: ["./f1.webp"] },
        { token: process.env.TOKEN_2, frases: "FRASE NUEVA SV 2", fotos: ["./f2.webp"] },
        { token: process.env.TOKEN_3, frases: "FRASE NUEVA SV 2", fotos: ["./f3.webp"] },
        { token: process.env.TOKEN_4, frases: "FRASE NUEVA SV 2", fotos: ["./f4.webp"] },
        { token: process.env.TOKEN_5, frases: "FRASE NUEVA SV 2", fotos: ["./f5.webp"] },
        { token: process.env.TOKEN_6, frases: "FRASE BOT 6 UNICO", fotos: ["./f6.webp"] }
    ]
};

function iniciarInstancia(botConf, listaCanales, idLog) {
    const client = new Client({ checkUpdate: false });
    
    client.on('ready', async () => {
        if (!MIS_BOTS_IDS.includes(client.user.id)) MIS_BOTS_IDS.push(client.user.id);
        console.log(`\x1b[32m[${idLog}] ON: ${client.user.username}\x1b[0m`);
        
        const bucle = async () => {
            for (const canalId of listaCanales) {
                try {
                    const canal = await client.channels.fetch(canalId).catch(() => null);
                    if (!canal) continue;

                    const mensajes = await canal.messages.fetch({ limit: 5 }).catch(() => null);
                    
                    if (mensajes?.first()?.author.id !== client.user.id && !ocupadoGlobal) {
                        ocupadoGlobal = true;
                        console.log(`[${idLog}] Publicando en #${canal.name}`);
                        
                        await canal.sendTyping().catch(() => {});
                        await new Promise(r => setTimeout(r, 5000));
                        
                        const adjuntos = botConf.fotos.filter(f => fs.existsSync(f));
                        const payload = { content: botConf.frases };
                        if (adjuntos.length > 0) payload.files = adjuntos;

                        await canal.send(payload).catch(() => {});
                        
                        ocupadoGlobal = false;
                        await new Promise(r => setTimeout(r, 15000));
                    }
                } catch (e) { 
                    ocupadoGlobal = false;
                }
            }
            setTimeout(bucle, (4 + Math.random() * 4) * 60000);
        };
        bucle();
    });

    client.login(botConf.token).catch(() => {});
}

configGrupo1.bots.forEach((b, i) => {
    if (b.token) setTimeout(() => iniciarInstancia(b, configGrupo1.canales, `G1-B${i+1}`), i * 15000);
});

configGrupo2.bots.forEach((b, i) => {
    if (b.token) setTimeout(() => iniciarInstancia(b, configGrupo2.canales, `G2-B${i+1}`), (i + 5) * 15000);
});
