const categories = {
    'Canal+ Channels': ['Canal+'],
    'Eleven Sports Channels': ['Eleven Sports'],
    'Polsat Sport Channels': ['Polsat Sport', 'Polsat Sport Fight', 'Polsat Sport Premium'],
    'Inne Kanały': ['TVP', 'MOTOWIZJA', 'Eurosport']
};

let channelLookupById = {};
let channelsData = {};

const EXPIRY_DATE = new Date('2025-11-17T16:36:00');

const VERIFICATION_LINKS = [
    'https://www.revenuecpmgate.com/edh6fisc?key=0c99a1d5fe8ce628e3dcaa38ebc0d01b',
    'https://www.revenuecpmgate.com/edh6fisc?key=0c99a1d5fe8ce628e3dcaa38ebc0d01b',
    'https://www.revenuecpmgate.com/edh6fisc?key=0c99a1d5fe8ce628e3dcaa38ebc0d01b',
    'https://www.revenuecpmgate.com/edh6fisc?key=0c99a1d5fe8ce628e3dcaa38ebc0d01b',
    'https://www.revenuecpmgate.com/edh6fisc?key=0c99a1d5fe8ce628e3dcaa38ebc0d01b'
];

function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-content">${message}</div>
        <div class="notification-progress"></div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 10000);
}

async function getServerTime() {
    try {
        const serverTime = await window.channelsFirestore.getServerTime();
        return new Date(serverTime);
    } catch (error) {
        console.error('Błąd pobierania czasu serwera:', error);
        return new Date();
    }
}

async function getDailyCodeFromFirestore() {
    try {
        const code = await window.channelsFirestore.getDailyCode();
        return code;
    } catch (error) {
        console.error('Błąd pobierania kodu:', error);
        return null;
    }
}

async function checkAndResetIfNewDay() {
    const savedTimestamp = localStorage.getItem('codeTimestamp');
    
    if (!savedTimestamp) {
        return;
    }
    
    const serverTime = await getServerTime();
    const savedTime = new Date(parseInt(savedTimestamp));
    
    const serverDate = serverTime.toISOString().split('T')[0];
    const savedDate = savedTime.toISOString().split('T')[0];
    
    if (serverDate !== savedDate) {
        sessionStorage.removeItem('verificationProgress');
        localStorage.removeItem('codeDate');
        localStorage.removeItem('dailyCode');
        localStorage.removeItem('codeTimestamp');
    }
}

async function checkDailyCode() {
    const savedCode = localStorage.getItem('dailyCode');
    const savedTimestamp = localStorage.getItem('codeTimestamp');
    
    if (!savedCode || !savedTimestamp) {
        return false;
    }
    
    const serverTime = await getServerTime();
    const savedTime = new Date(parseInt(savedTimestamp));
    
    const serverDate = serverTime.toISOString().split('T')[0];
    const savedDate = savedTime.toISOString().split('T')[0];
    
    if (serverDate !== savedDate) {
        localStorage.removeItem('dailyCode');
        localStorage.removeItem('codeDate');
        sessionStorage.removeItem('verificationProgress');
        localStorage.removeItem('codeTimestamp');
        return false;
    }
    
    return true;
}

async function isCodeValid(inputCode) {
    const correctCode = await getDailyCodeFromFirestore();
    return inputCode.toUpperCase() === correctCode;
}

function getVerificationProgress() {
    const progress = sessionStorage.getItem('verificationProgress');
    return progress ? JSON.parse(progress) : [false, false, false, false, false];
}

function setVerificationProgress(index) {
    const progress = getVerificationProgress();
    progress[index] = true;
    sessionStorage.setItem('verificationProgress', JSON.stringify(progress));
    return progress;
}

function allVerificationsCompleted() {
    const progress = getVerificationProgress();
    return progress.every(step => step === true);
}

async function showCodeModal() {
    if (checkExpiry()) return;
    
    await checkAndResetIfNewDay();
    
    if (await checkDailyCode()) {
        const modal = document.createElement('div');
        modal.className = 'code-modal';
        modal.id = 'codeModal';
        
        modal.innerHTML = `
            <div class="code-modal-content">
                <div class="code-modal-header">
                    <h2>Status kodu</h2>
                    <button class="close-btn" onclick="closeCodeModal()">×</button>
                </div>
                <div class="code-modal-body">
                    <div class="code-active-status">
                        <div class="check-icon">
                            <svg viewBox="0 0 24 24" width="60" height="60">
                                <circle cx="12" cy="12" r="11" fill="#06ffa5"/>
                                <path d="M7 12l3 3 7-7" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <p class="code-active-text">KOD JEST AKTYWNY!</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return;
    }
    
    const existingModal = document.getElementById('codeModal');
    const progress = getVerificationProgress();
    const allCompleted = allVerificationsCompleted();
    
    if (existingModal && allCompleted) {
        const codeDisplayDiv = existingModal.querySelector('.code-display-wrapper');
        if (!codeDisplayDiv) {
            const code = await getDailyCodeFromFirestore();
            const modalBody = existingModal.querySelector('.code-modal-body');
            const codeHtml = `
                <div class="code-display-wrapper">
                    <div class="code-display">
                        <p>Twój kod na dziś:</p>
                        <div class="code-value">${code}</div>
                    </div>
                    <div class="code-input-group">
                        <input type="text" 
                               class="code-input" 
                               id="codeInput" 
                               placeholder="Wpisz kod"
                               maxlength="8"
                               oninput="this.value = this.value.replace(/[^a-zA-Z0-9]/g, '')">
                        <button class="save-code-btn" onclick="saveCode()">Zapisz</button>
                    </div>
                </div>
            `;
            modalBody.insertAdjacentHTML('beforeend', codeHtml);
            setTimeout(() => {
                const wrapper = modalBody.querySelector('.code-display-wrapper');
                if (wrapper) wrapper.classList.add('show');
            }, 10);
        }
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'code-modal';
    modal.id = 'codeModal';
    
    let codeDisplay = '';
    if (allCompleted) {
        const code = await getDailyCodeFromFirestore();
        codeDisplay = `
            <div class="code-display-wrapper show">
                <div class="code-display">
                    <p>Twój kod na dziś:</p>
                    <div class="code-value">${code}</div>
                </div>
                <div class="code-input-group">
                    <input type="text" 
                           class="code-input" 
                           id="codeInput" 
                           placeholder="Wpisz kod"
                           maxlength="8"
                           oninput="this.value = this.value.replace(/[^a-zA-Z0-9]/g, '')">
                    <button class="save-code-btn" onclick="saveCode()">Zapisz</button>
                </div>
            </div>
        `;
    } else {
        codeDisplay = '<p class="code-locked">🔒 Kod zostanie wyświetlony po kliknięciu wszystkich przycisków weryfikacji</p>';
    }
    
    modal.innerHTML = `
        <div class="code-modal-content">
            <div class="code-modal-header">
                <h2>Odblokuj dostęp</h2>
                <button class="close-btn" onclick="closeCodeModal()">×</button>
            </div>
            <div class="code-modal-body">
                <p class="code-instruction">Kliknij w każdy przycisk weryfikacji i poczekaj 5 sekund:</p>
                <div class="verification-buttons">
                    ${VERIFICATION_LINKS.map((link, i) => `
                        <button class="verify-btn ${progress[i] ? 'completed' : ''}" 
                                onclick="openVerificationLink(${i}, '${link}')"
                                ${progress[i] ? 'disabled' : ''}>
                            W${i + 1}
                        </button>
                    `).join('')}
                </div>
                ${codeDisplay}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeCodeModal() {
    const modal = document.getElementById('codeModal');
    if (modal) modal.remove();
}

async function openVerificationLink(index, link) {
    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '<div class="verify-spinner"></div>';
    
    window.open(link, '_blank');
    
    setTimeout(async () => {
        setVerificationProgress(index);
        btn.classList.add('completed');
        btn.innerHTML = `W${index + 1}`;
        
        if (allVerificationsCompleted()) {
            const lockedMsg = document.querySelector('.code-locked');
            if (lockedMsg) {
                lockedMsg.remove();
            }
            await showCodeModal();
        }
    }, 5000);
}

async function saveCode() {
    const input = document.getElementById('codeInput');
    const code = input.value.trim().toUpperCase();
    
    if (!code) {
        showNotification('Wpisz kod!', 'error');
        return;
    }
    
    const isValid = await isCodeValid(code);
    if (!isValid) {
        showNotification('Nieprawidłowy kod!', 'error');
        return;
    }
    
    const serverTime = await getServerTime();
    const serverDateString = serverTime.toISOString().split('T')[0];
    
    localStorage.setItem('dailyCode', code);
    localStorage.setItem('codeDate', serverDateString);
    localStorage.setItem('codeTimestamp', serverTime.getTime().toString());
    
    showNotification('✅ Kod zapisany! Dostęp odblokowany do północy.', 'success');
    closeCodeModal();
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function checkExpiry() {
    const now = new Date();
    if (now > EXPIRY_DATE) {
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(45deg, #1a1a1a, #2d2d2d);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                color: #ff4444;
                font-family: Arial, sans-serif;
                text-align: center;
            ">
                <div style="
                    background: rgba(255, 68, 68, 0.1);
                    border: 2px solid #ff4444;
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 600px;
                    box-shadow: 0 0 50px rgba(255, 68, 68, 0.3);
                    animation: pulse 2s infinite;
                ">
                    <h1 style="
                        font-size: 48px;
                        margin: 0 0 20px 0;
                        text-shadow: 0 0 20px #ff4444;
                    ">STRONA WYGASŁA</h1>
                    <p style="
                        font-size: 24px;
                        margin: 0 0 20px 0;
                        opacity: 0.9;
                    ">Dostęp do kaqvuChannels wygasł dnia:</p>
                    <p style="
                        font-size: 32px;
                        margin: 0;
                        font-weight: bold;
                        text-shadow: 0 0 10px #ff4444;
                    ">${EXPIRY_DATE.toLocaleDateString('pl-PL')} ${EXPIRY_DATE.toLocaleTimeString('pl-PL')}</p>
                </div>
                <style>
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                    }
                </style>
            </div>
        `;
        return true;
    }
    return false;
}

async function loadChannelsFromFirestore() {
    try {
        showLoading();
        const data = await window.channelsFirestore.getChannelsData();
        channelsData = data;
        window.channelsData = data;
        initializeChannelLookup();
        hideLoading();
        renderChannels();
        return true;
    } catch (error) {
        console.error('Błąd ładowania kanałów z Firestore:', error);
        showError('Błąd ładowania kanałów z bazy danych');
        return false;
    }
}

function showLoading() {
    const container = document.getElementById('channelsContainer');
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Ładowanie kanałów...</p>
        </div>
    `;
}

function hideLoading() {
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

function showError(message) {
    const container = document.getElementById('channelsContainer');
    container.innerHTML = `
        <div class="loading">
            <p style="color: #ff4444;">${message}</p>
        </div>
    `;
}

function initializeChannelLookup() {
    Object.entries(channelsData).forEach(([id, channelArray]) => {
        channelLookupById[id] = channelArray[0];
    });
}

function getQualityClass(quality) {
    const q = quality.toUpperCase();
    if (q.includes('ULTRA')) return 'quality-uhd';
    if (q.includes('SUPER')) return 'quality-shd';
    if (q.includes('HD')) return 'quality-hd';
    return 'quality-sd';
}

function categorizeChannel(channelName) {
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => channelName.includes(keyword))) {
            return category;
        }
    }
    return 'Inne Kanały';
}

async function playChannel(channelId, channelName, url, event) {
    event.stopPropagation();
    
    if (checkExpiry()) return;
    
    if (!(await checkDailyCode())) {
        showNotification('⚠️ Wpisz kod aby odblokować kanały!', 'error');
        showCodeModal();
        return;
    }
    
    history.pushState({channelId: channelId, channelName: channelName, url: url}, channelName, `/${channelId}`);
    showPlayer(url, channelName);
}

function showPlayer(url, channelName) {
    if (checkExpiry()) return;
    
    const mainView = document.getElementById('mainView');
    const playerView = document.getElementById('playerView');
    const playerContainer = document.getElementById('playerContainer');
    
    mainView.classList.add('hidden');
    playerView.classList.add('active');
    
    const iframeHtml = `
        <iframe 
            src="${url}" 
            allowfullscreen 
            frameborder="0"
            allow="autoplay; encrypted-media; fullscreen"
            style="width: 100%; height: 100%; border: none;">
        </iframe>
    `;
    
    playerContainer.innerHTML = iframeHtml;
    document.title = `${channelName} - kaqvuChannels`;
    
    const iframe = playerContainer.querySelector('iframe');
    iframe.addEventListener('error', function() {
        console.log('Błąd ładowania iframe, próba otwarcia w nowym oknie...');
        openInNewWindow(url, channelName);
    });
    
    setTimeout(() => {
        try {
            if (!iframe.contentDocument && !iframe.contentWindow) {
                console.log('Iframe nie załadował się poprawnie, otwieranie w nowym oknie...');
                openInNewWindow(url, channelName);
            }
        } catch (e) {
        }
    }, 3000);
}

function goBack() {
    if (checkExpiry()) return;
    
    const mainView = document.getElementById('mainView');
    const playerView = document.getElementById('playerView');
    const playerContainer = document.getElementById('playerContainer');
    
    mainView.classList.remove('hidden');
    playerView.classList.remove('active');
    playerContainer.innerHTML = '';
    
    history.pushState({}, 'kaqvuChannels', '/');
    document.title = 'kaqvuChannels';
}

async function handlePopState(event) {
    if (checkExpiry()) return;
    
    const path = window.location.pathname;
    
    if (path === '/' || path === '') {
        goBack();
    } else if (path === '/channels') {
        window.location.href = '/channels.html';
    } else {
        const channelId = path.substring(1);
        const channel = channelLookupById[channelId];
        
        if (channel && firstClickTracker.has(channelId)) {
            showPlayer(channel.url1, channel.name);
        } else {
            goBack();
        }
    }
}

function getAvailableUrls(channel) {
    const urls = [];
    for (let i = 1; i <= 10; i++) {
        const urlKey = `url${i}`;
        if (channel[urlKey]) {
            urls.push({key: urlKey, url: channel[urlKey], number: i});
        }
    }
    return urls;
}

function renderChannels(filteredData = null) {
    if (checkExpiry()) return;
    
    const container = document.getElementById('channelsContainer');
    const dataToRender = filteredData || channelsData;
    
    const groupedChannels = {};
    
    Object.entries(dataToRender).forEach(([id, channelArray]) => {
        channelArray.forEach(channel => {
            const category = categorizeChannel(channel.name);
            if (!groupedChannels[category]) {
                groupedChannels[category] = [];
            }
            groupedChannels[category].push({...channel, id: id});
        });
    });

    let html = '';
    Object.entries(groupedChannels).forEach(([category, channels]) => {
        html += `
            <div class="category">
                <h2 class="category-title">${category}</h2>
                <div class="channels-grid">
        `;
        
        channels.forEach(channel => {
            const availableUrls = getAvailableUrls(channel);
            const escapedChannelName = escapeHtml(channel.name);
            const escapedChannelId = escapeHtml(channel.id);
            
            html += `
                <div class="channel-card">
                    <div class="channel-name">${channel.name}</div>
                    <div class="channel-info">
                        <span class="language">${channel.language}</span>
                        <span class="quality-badge ${getQualityClass(channel.quality)}">${channel.quality}</span>
                    </div>
                    <div class="channel-buttons">
                        <button class="play-button" onclick="playChannel('${escapedChannelId}', '${escapedChannelName}', '${availableUrls[0]?.url || ''}', event)">Oglądaj na żywo</button>
                        <div class="url-buttons">
            `;
            
            if (availableUrls.length === 0) {
                html += `<div class="no-channel-bar">Brak kanału</div>`;
            } else {
                for (let i = 0; i < availableUrls.length; i++) {
                    if (i > 0 && i % 5 === 0) {
                        html += `</div><div class="url-buttons">`;
                    }
                    const urlData = availableUrls[i];
                    const escapedUrl = escapeHtml(urlData.url);
                    html += `<button class="url-btn" onclick="playChannel('${escapedChannelId}', '${escapedChannelName}', '${escapedUrl}', event)">L ${urlData.number}</button>`;
                }
            }
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function filterChannels() {
    if (checkExpiry()) return;
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (!searchTerm) {
        renderChannels();
        return;
    }
    const filtered = {};
    Object.entries(channelsData).forEach(([id, channelArray]) => {
        const matchingChannels = channelArray.filter(channel => 
            channel.name.toLowerCase().includes(searchTerm)
        );
        if (matchingChannels.length > 0) {
            filtered[id] = matchingChannels;
        }
    });
    renderChannels(filtered);
}

function openInNewWindow(url, channelName) {
    if (checkExpiry()) return;
    
    const newWindow = window.open('', '_blank', 'width=1920,height=1080,scrollbars=yes,resizable=yes');
    if (newWindow) {
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${channelName}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        background: #000; 
                        overflow: hidden; 
                        font-family: Arial, sans-serif;
                    }
                    iframe { 
                        width: 100vw; 
                        height: 100vh; 
                        border: none; 
                        display: block;
                    }
                    .error-msg {
                        color: white;
                        text-align: center;
                        padding: 20px;
                        font-size: 18px;
                    }
                </style>
            </head>
            <body>
                <iframe 
                    src="${url}" 
                    allowfullscreen
                    allow="autoplay; encrypted-media; fullscreen; payment; geolocation; microphone; camera"
                    referrerpolicy="no-referrer-when-downgrade"
                    onerror="document.body.innerHTML='<div class=&quot;error-msg&quot;>Błąd ładowania strumienia. Spróbuj odświeżyć stronę.</div>'">
                </iframe>
            </body>
            </html>
        `);
        newWindow.document.close();
    } else {
        alert('Zablokowano wyskakujące okno. Proszę pozwolić na wyskakujące okna dla tej strony.');
    }
}

function goToAdminPanel() {
    if (checkExpiry()) return;
    
    window.location.href = '/channels';
}

document.addEventListener('DOMContentLoaded', async function() {
    if (checkExpiry()) return;
    
    await checkAndResetIfNewDay();
    
    setTimeout(async () => {
        if (typeof window.channelsFirestore !== 'undefined') {
            await loadChannelsFromFirestore();
        } else {
            const container = document.getElementById('channelsContainer');
            container.innerHTML = `
                <div class="loading">
                    <p>Błąd ładowania Firebase. Sprawdź konfigurację.</p>
                </div>
            `;
        }
    }, 200);
    
    window.addEventListener('popstate', handlePopState);
    
    const currentPath = window.location.pathname;
    if (currentPath !== '/' && currentPath !== '' && currentPath !== '/channels') {
        const channelId = currentPath.substring(1);
        setTimeout(() => {
            const channel = channelLookupById[channelId];
            if (channel && firstClickTracker.has(channelId)) {
                showPlayer(channel.url1, channel.name);
            } else {
                history.replaceState({}, 'kaqvuChannels', '/');
            }
        }, 300);
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterChannels);
    }
    
    setInterval(checkExpiry, 60000);
});