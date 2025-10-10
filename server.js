const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

const sendAccessDenied = (res) => {
    res.status(403).sendFile(path.join(__dirname, 'public', 'directblock.html'))
}

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'))
})

app.get('/channels/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'channels', 'index.html'))
})

app.get('/channels/script.js', (req, res) => {
    const referer = req.get('Referer')
    if (!referer || !referer.includes(req.get('host'))) return sendAccessDenied(res)
    res.sendFile(path.join(__dirname, 'channels', 'script.js'))
})

app.get('/styles.css', (req, res) => {
    const referer = req.get('Referer')
    if (!referer || !referer.includes(req.get('host'))) return sendAccessDenied(res)
    res.sendFile(path.join(__dirname, 'public', 'styles.css'))
})

app.get('/script.js', (req, res) => {
    const referer = req.get('Referer')
    if (!referer || !referer.includes(req.get('host'))) return sendAccessDenied(res)
    res.sendFile(path.join(__dirname, 'public', 'script.js'))
})

app.get('/firebase-config.kaqvuJs', (req, res) => {
    const referer = req.get('Referer')
    if (!referer || !referer.includes(req.get('host'))) return sendAccessDenied(res)
    res.setHeader('Content-Type', 'application/javascript')
    res.sendFile(path.join(__dirname, 'public', 'firebase-config.kaqvuJs'))
})

app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res) => {
    if (path.extname(req.path)) return res.status(404).send('Plik nie znaleziony')
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
    console.log('\n🚀 kaqvuChannels Server (Firestore Edition)')
    console.log('═══════════════════════════════════════════')
    console.log(`📡 Serwer działa na porcie: ${PORT}`)
    console.log('🎬 Panel administracyjny: /channels')
    console.log('☁️  Dane kanałów: Firestore Database')
    console.log('═══════════════════════════════════════════')
    console.log('⚡ Gotowy do działania!\n')
})

process.on('SIGINT', () => {
    console.log('\n👋 Zatrzymywanie serwera...')
    console.log('🔴 Serwer zatrzymany')
    process.exit(0)
})

module.exports = app