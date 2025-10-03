const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const sendAccessDenied = (res) => {
    res.status(403).send(`
        <!DOCTYPE html>
        <html lang="pl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dostęp zabroniony</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    background: #2b2b2b;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    color: #e0e0e0;
                }
                .container {
                    text-align: center;
                    padding: 40px;
                    max-width: 600px;
                }
                .icon {
                    font-size: 80px;
                    margin-bottom: 20px;
                }
                h1 {
                    font-size: 32px;
                    margin-bottom: 15px;
                    color: #ff6b6b;
                }
                p {
                    font-size: 18px;
                    line-height: 1.6;
                    color: #b0b0b0;
                    margin-bottom: 30px;
                }
                .home-link {
                    display: inline-block;
                    padding: 12px 30px;
                    background: #4a9eff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    transition: background 0.3s;
                }
                .home-link:hover {
                    background: #3a7ed4;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">🔒</div>
                <h1>Dostęp zabroniony</h1>
                <p>Bezpośredni dostęp do tego pliku jest zablokowany ze względów bezpieczeństwa.</p>
                <a href="/" class="home-link">Wróć do strony głównej</a>
            </div>
        </body>
        </html>
    `);
};

app.get('/styles.css', (req, res) => {
    const referer = req.get('Referer');
    if (!referer || !referer.includes(req.get('host'))) {
        return sendAccessDenied(res);
    }
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    const referer = req.get('Referer');
    if (!referer || !referer.includes(req.get('host'))) {
        return sendAccessDenied(res);
    }
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/firebase-config.mjs', (req, res) => {
    const referer = req.get('Referer');
    if (!referer || !referer.includes(req.get('host'))) {
        return sendAccessDenied(res);
    }
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'firebase-config.mjs'));
});

app.get('/channels/script.js', (req, res) => {
    const referer = req.get('Referer');
    if (!referer || !referer.includes(req.get('host'))) {
        return sendAccessDenied(res);
    }
    res.sendFile(path.join(__dirname, 'channels', 'script.js'));
});

app.use(express.static(__dirname));

app.use((req, res) => {
    if (path.extname(req.path)) {
        return res.status(404).send('Plik nie znaleziony');
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log('\n🚀 kaqvuChannels Server (Firestore Edition)');
    console.log('═══════════════════════════════════════════');
    console.log(`📡 Serwer działa na porcie: ${PORT}`);
    console.log('🎬 Panel administracyjny: /channels');
    console.log('☁️  Dane kanałów: Firestore Database');
    console.log('═══════════════════════════════════════════');
    console.log('⚡ Gotowy do działania!\n');
});

process.on('SIGINT', () => {
    console.log('\n👋 Zatrzymywanie serwera...');
    console.log('🔴 Serwer zatrzymany');
    process.exit(0);
});

module.exports = app;