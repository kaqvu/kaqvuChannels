const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
    const referer = req.get('Referer');
    const directAccess = !referer || !referer.includes(req.get('host'));
    const protectedExtensions = ['.js', '.mjs', '.css'];
    const ext = path.extname(req.path);
    
    if (directAccess && protectedExtensions.includes(ext)) {
        return res.status(403).send('🚫 Bezpośredni dostęp zabroniony');
    }
    
    next();
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