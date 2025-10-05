let isLoggedIn = false;
let currentEditingChannel = null;
let channelLookupById = {};
let channelsData = {};

const categories = {
    'Canal+ Channels': ['Canal+'],
    'Eleven Sports Channels': ['Eleven Sports'],
    'Polsat Sport Channels': ['Polsat Sport', 'Polsat Sport Fight', 'Polsat Sport Premium'],
    'Inne Kanały': ['TVP', 'MOTOWIZJA', 'Eurosport']
};

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function initializeChannelLookup() {
    if (channelsData && Object.keys(channelsData).length > 0) {
        Object.entries(channelsData).forEach(([id, channelArray]) => {
            channelLookupById[id] = channelArray[0];
        });
    }
}

async function loadChannelsFromFirestore() {
    try {
        showLoading();
        const data = await window.channelsFirestore.getChannelsData();
        channelsData = data;
        window.channelsData = data;
        initializeChannelLookup();
        hideLoading();
        return true;
    } catch (error) {
        console.error('Błąd ładowania kanałów z Firestore:', error);
        showError('Błąd ładowania kanałów z bazy danych');
        return false;
    }
}

function showLoading() {
    const container = document.getElementById('channelsContainer');
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Ładowanie kanałów...</p>
            </div>
        `;
    }
}

function hideLoading() {
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

function showError(message) {
    const container = document.getElementById('channelsContainer');
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <p style="color: #ff4444;">${message}</p>
            </div>
        `;
    }
}

function checkLoginStatus() {
    const loginTime = getCookie('adminLoginTime');
    
    if (loginTime) {
        const currentTime = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000;
        const timeDiff = currentTime - parseInt(loginTime);
        
        if (timeDiff < sessionDuration) {
            isLoggedIn = true;
            showAdminView();
            return true;
        } else {
            logout();
            return false;
        }
    }
    
    showLoginView();
    return false;
}

function showLoginView() {
    const loginView = document.getElementById('loginView');
    const adminView = document.getElementById('adminView');
    
    if (loginView) loginView.classList.remove('hidden');
    if (adminView) adminView.classList.add('hidden');
}

function showAdminView() {
    const loginView = document.getElementById('loginView');
    const adminView = document.getElementById('adminView');
    
    if (loginView) loginView.classList.add('hidden');
    if (adminView) adminView.classList.remove('hidden');
    
    setTimeout(async () => {
        await loadChannelsFromFirestore();
        renderChannels();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.removeEventListener('input', filterChannels);
            searchInput.addEventListener('input', filterChannels);
        }
    }, 100);
}

function setCookie(name, value, hours) {
    const d = new Date();
    d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function login(event) {
    event.preventDefault();
    
    const loginInput = document.getElementById('loginInput');
    const passwordInput = document.getElementById('passwordInput');
    const errorDiv = document.getElementById('loginError');
    
    if (!loginInput || !passwordInput || !errorDiv) {
        console.error('Nie znaleziono elementów logowania');
        return;
    }
    
    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (login === 'admin' && password === 'kaqvu11') {
        isLoggedIn = true;
        const currentTime = Date.now();
        
        setCookie('adminLoginTime', currentTime.toString(), 24);
        
        errorDiv.textContent = '';
        showAdminView();
    } else {
        errorDiv.textContent = 'Nieprawidłowy login lub hasło';
    }
}

function logout() {
    isLoggedIn = false;
    deleteCookie('adminLoginTime');
    
    showLoginView();
    
    const loginInput = document.getElementById('loginInput');
    const passwordInput = document.getElementById('passwordInput');
    const errorDiv = document.getElementById('loginError');
    
    if (loginInput) loginInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (errorDiv) errorDiv.textContent = '';
}

function goToHome() {
    window.location.href = '../index.html';
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

function playChannel(channelId, channelName, url, event) {
    event.stopPropagation();
    
    history.pushState({channelId: channelId, channelName: channelName, url: url}, channelName, `/channels/${channelId}`);
    showPlayer(url, channelName);
}

function showPlayer(url, channelName) {
    const adminView = document.getElementById('adminView');
    const playerView = document.getElementById('playerView');
    const playerContainer = document.getElementById('playerContainer');
    
    if (!playerView || !playerContainer) {
        console.error('Nie znaleziono elementów playera');
        return;
    }
    
    adminView.classList.add('hidden');
    playerView.classList.remove('hidden');
    playerView.classList.add('active');
    
    // Ustaw style dla playerView i playerContainer
    playerView.style.position = 'fixed';
    playerView.style.top = '0';
    playerView.style.left = '0';
    playerView.style.width = '100vw';
    playerView.style.height = '100vh';
    playerView.style.zIndex = '9999';
    playerView.style.background = '#000';
    
    const iframeHtml = `
        <iframe 
            src="${url}" 
            allowfullscreen 
            frameborder="0"
            allow="autoplay; encrypted-media; fullscreen"
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
        </iframe>
    `;
    
    playerContainer.innerHTML = iframeHtml;
    document.title = `${channelName} - kaqvuChannels Admin`;
    
    const iframe = playerContainer.querySelector('iframe');
    iframe.addEventListener('error', function() {
        console.log('Błąd ładowania iframe');
    });
}

function goBackFromPlayer() {
    const adminView = document.getElementById('adminView');
    const playerView = document.getElementById('playerView');
    const playerContainer = document.getElementById('playerContainer');
    
    if (!playerView || !playerContainer) return;
    
    adminView.classList.remove('hidden');
    playerView.classList.remove('active');
    playerView.classList.add('hidden');
    playerContainer.innerHTML = '';
    
    history.pushState({}, 'kaqvuChannels Admin', '/channels');
    document.title = 'kaqvuChannels - Panel Admina';
}

function handlePopState(event) {
    const path = window.location.pathname;
    
    if (path === '/channels' || path === '/channels/') {
        goBackFromPlayer();
    } else if (path.startsWith('/channels/')) {
        const channelId = path.substring('/channels/'.length);
        const channel = channelLookupById[channelId];
        
        if (channel) {
            showPlayer(channel.url1, channel.name);
        } else {
            goBackFromPlayer();
        }
    }
}

function openEditModal(channelId) {
    if (!isLoggedIn) return;
    
    const channel = channelLookupById[channelId];
    if (!channel) return;
    
    currentEditingChannel = { id: channelId, data: {...channel} };
    
    const modalTitle = document.getElementById('modalTitle');
    const channelNameInput = document.getElementById('channelNameInput');
    
    if (modalTitle) modalTitle.textContent = `Edytowanie Kanału ${channel.name}`;
    if (channelNameInput) channelNameInput.value = channel.name;
    
    renderUrlFields(channel);
    
    const editModal = document.getElementById('editModal');
    if (editModal) editModal.classList.remove('hidden');
}

function renderUrlFields(channel) {
    const urlsContainer = document.getElementById('urlsContainer');
    if (!urlsContainer) return;
    
    urlsContainer.innerHTML = '';
    
    const urls = [];
    for (let i = 1; i <= 10; i++) {
        const urlKey = `url${i}`;
        if (channel[urlKey]) {
            urls.push({key: urlKey, url: channel[urlKey], number: i});
        }
    }
    
    if (urls.length === 0) {
        urls.push({key: 'url1', url: '', number: 1});
    }
    
    urls.forEach(urlData => {
        const urlFieldHtml = `
            <div class="url-field" data-url-key="${urlData.key}">
                <label>URL ${urlData.number}:</label>
                <div class="url-input-group">
                    <input type="text" class="form-input url-input" value="${escapeHtml(urlData.url)}" data-url-key="${urlData.key}">
                    <button class="delete-url-btn" onclick="removeUrlField('${urlData.key}')" ${urls.length <= 1 ? 'disabled' : ''}>🗑️</button>
                </div>
            </div>
        `;
        urlsContainer.insertAdjacentHTML('beforeend', urlFieldHtml);
    });
}

function addUrlField() {
    const urlsContainer = document.getElementById('urlsContainer');
    if (!urlsContainer) return;
    
    const existingFields = urlsContainer.querySelectorAll('.url-field');
    
    let nextNumber = 1;
    for (let i = 1; i <= 10; i++) {
        const exists = Array.from(existingFields).some(field => 
            field.dataset.urlKey === `url${i}`
        );
        if (!exists) {
            nextNumber = i;
            break;
        }
    }
    
    if (nextNumber > 10) return;
    
    const urlFieldHtml = `
        <div class="url-field" data-url-key="url${nextNumber}">
            <label>URL ${nextNumber}:</label>
            <div class="url-input-group">
                <input type="text" class="form-input url-input" value="" data-url-key="url${nextNumber}">
                <button class="delete-url-btn" onclick="removeUrlField('url${nextNumber}')">🗑️</button>
            </div>
        </div>
    `;
    urlsContainer.insertAdjacentHTML('beforeend', urlFieldHtml);
    
    updateDeleteButtons();
}

function removeUrlField(urlKey) {
    const field = document.querySelector(`[data-url-key="${urlKey}"]`);
    if (field) {
        field.remove();
        updateDeleteButtons();
    }
}

function updateDeleteButtons() {
    const urlFields = document.querySelectorAll('.url-field');
    const deleteButtons = document.querySelectorAll('.delete-url-btn');
    
    deleteButtons.forEach(btn => {
        btn.disabled = urlFields.length <= 1;
    });
}

async function saveChannel() {
    if (!currentEditingChannel) return;
    
    const channelNameInput = document.getElementById('channelNameInput');
    if (!channelNameInput) return;
    
    const channelName = channelNameInput.value.trim();
    if (!channelName) {
        alert('Nazwa kanału nie może być pusta');
        return;
    }
    
    const urlInputs = document.querySelectorAll('.url-input');
    const hasEmptyUrl = Array.from(urlInputs).some(input => {
        const value = input.value.trim();
        return value === '';
    });
    
    if (hasEmptyUrl) {
        alert('Wszystkie pola URL muszą być wypełnione lub usunięte');
        return;
    }
    
    const updatedChannel = {
        ...currentEditingChannel.data,
        name: channelName
    };
    
    for (let i = 1; i <= 10; i++) {
        delete updatedChannel[`url${i}`];
    }
    
    urlInputs.forEach(input => {
        const urlKey = input.dataset.urlKey;
        const urlValue = input.value.trim();
        if (urlValue) {
            updatedChannel[urlKey] = urlValue;
        }
    });
    
    channelsData[currentEditingChannel.id] = [updatedChannel];
    channelLookupById[currentEditingChannel.id] = updatedChannel;
    
    try {
        await saveChannelsDataToFirestore();
        closeEditModal();
        renderChannels();
        alert('Kanał został zaktualizowany w bazie danych!');
    } catch (error) {
        alert('Błąd zapisywania: ' + error.message);
    }
}

async function saveChannelsDataToFirestore() {
    try {
        await window.channelsFirestore.saveChannelsData(channelsData);
        return true;
    } catch (error) {
        console.error('Błąd zapisywania do Firestore:', error);
        throw error;
    }
}

function closeEditModal() {
    const editModal = document.getElementById('editModal');
    if (editModal) editModal.classList.add('hidden');
    currentEditingChannel = null;
}

function confirmDeleteChannel() {
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) confirmModal.classList.remove('hidden');
}

function closeConfirmModal() {
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) confirmModal.classList.add('hidden');
}

async function deleteChannel() {
    if (!currentEditingChannel) return;
    
    const channelId = currentEditingChannel.id;
    
    try {
        await window.channelsFirestore.deleteChannel(channelId);
        
        delete channelsData[channelId];
        delete channelLookupById[channelId];
        
        closeConfirmModal();
        closeEditModal();
        renderChannels();
        alert('Kanał został usunięty z bazy danych!');
    } catch (error) {
        alert('Błąd usuwania: ' + error.message);
    }
}

function openAddModal() {
    if (!isLoggedIn) return;
    
    const channelNameInput = document.getElementById('addChannelNameInput');
    if (channelNameInput) channelNameInput.value = '';
    
    renderAddUrlFields();
    
    const addModal = document.getElementById('addModal');
    if (addModal) addModal.classList.remove('hidden');
}

function closeAddModal() {
    const addModal = document.getElementById('addModal');
    if (addModal) addModal.classList.add('hidden');
}

function renderAddUrlFields() {
    const urlsContainer = document.getElementById('addUrlsContainer');
    if (!urlsContainer) return;
    
    urlsContainer.innerHTML = '';
    
    const urlFieldHtml = `
        <div class="url-field" data-url-key="url1">
            <label>URL 1:</label>
            <div class="url-input-group">
                <input type="text" class="form-input url-input-add" value="" data-url-key="url1">
                <button class="delete-url-btn" onclick="removeAddUrlField('url1')" disabled>🗑️</button>
            </div>
        </div>
    `;
    urlsContainer.insertAdjacentHTML('beforeend', urlFieldHtml);
}

function addUrlFieldToAdd() {
    const urlsContainer = document.getElementById('addUrlsContainer');
    if (!urlsContainer) return;
    
    const existingFields = urlsContainer.querySelectorAll('.url-field');
    
    let nextNumber = 1;
    for (let i = 1; i <= 10; i++) {
        const exists = Array.from(existingFields).some(field => 
            field.dataset.urlKey === `url${i}`
        );
        if (!exists) {
            nextNumber = i;
            break;
        }
    }
    
    if (nextNumber > 10) return;
    
    const urlFieldHtml = `
        <div class="url-field" data-url-key="url${nextNumber}">
            <label>URL ${nextNumber}:</label>
            <div class="url-input-group">
                <input type="text" class="form-input url-input-add" value="" data-url-key="url${nextNumber}">
                <button class="delete-url-btn" onclick="removeAddUrlField('url${nextNumber}')">🗑️</button>
            </div>
        </div>
    `;
    urlsContainer.insertAdjacentHTML('beforeend', urlFieldHtml);
    
    updateAddDeleteButtons();
}

function removeAddUrlField(urlKey) {
    const urlsContainer = document.getElementById('addUrlsContainer');
    if (!urlsContainer) return;
    
    const field = urlsContainer.querySelector(`[data-url-key="${urlKey}"]`);
    if (field) {
        field.remove();
        updateAddDeleteButtons();
    }
}

function updateAddDeleteButtons() {
    const urlsContainer = document.getElementById('addUrlsContainer');
    if (!urlsContainer) return;
    
    const urlFields = urlsContainer.querySelectorAll('.url-field');
    const deleteButtons = urlsContainer.querySelectorAll('.delete-url-btn');
    
    deleteButtons.forEach(btn => {
        btn.disabled = urlFields.length <= 1;
    });
}

async function saveNewChannel() {
    const channelNameInput = document.getElementById('addChannelNameInput');
    if (!channelNameInput) return;
    
    const channelName = channelNameInput.value.trim();
    if (!channelName) {
        alert('Nazwa kanału nie może być pusta');
        return;
    }
    
    const urlInputs = document.querySelectorAll('.url-input-add');
    const hasEmptyUrl = Array.from(urlInputs).some(input => {
        const value = input.value.trim();
        return value === '';
    });
    
    if (hasEmptyUrl) {
        alert('Wszystkie pola URL muszą być wypełnione lub usunięte');
        return;
    }
    
    const newChannel = {
        name: channelName,
        language: 'Polski',
        quality: 'ULTRA HD'
    };
    
    urlInputs.forEach(input => {
        const urlKey = input.dataset.urlKey;
        const urlValue = input.value.trim();
        if (urlValue) {
            newChannel[urlKey] = urlValue;
        }
    });
    
    const existingIds = Object.keys(channelsData).map(id => parseInt(id)).sort((a, b) => a - b);
    let newId = 1;
    
    for (let i = 0; i < existingIds.length; i++) {
        if (existingIds[i] !== newId) {
            break;
        }
        newId++;
    }
    
    channelsData[newId.toString()] = [newChannel];
    channelLookupById[newId.toString()] = newChannel;
    
    try {
        await saveChannelsDataToFirestore();
        closeAddModal();
        renderChannels();
        alert('Kanał został dodany do bazy danych!');
    } catch (error) {
        alert('Błąd zapisywania: ' + error.message);
    }
}

function renderChannels(filteredData = null) {
    if (!isLoggedIn || !channelsData || Object.keys(channelsData).length === 0) return;
    
    const container = document.getElementById('channelsContainer');
    if (!container) return;
    
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
                <h2 class="category-title">${escapeHtml(category)}</h2>
                <div class="channels-grid">
        `;
        
        channels.forEach(channel => {
            const availableUrls = getAvailableUrls(channel);
            const escapedChannelName = escapeHtml(channel.name);
            const escapedChannelId = escapeHtml(channel.id);
            
            html += `
                <div class="channel-card">
                    <div class="channel-name">${escapedChannelName}</div>
                    <div class="channel-info">
                        <span class="language">${escapeHtml(channel.language || 'PL')}</span>
                        <span class="quality-badge ${getQualityClass(channel.quality || 'SD')}">${escapeHtml(channel.quality || 'SD')}</span>
                    </div>
                    <div class="channel-buttons">
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
                        <button class="edit-button" onclick="openEditModal('${escapedChannelId}')">Edytuj</button>
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
    if (!isLoggedIn || !channelsData || Object.keys(channelsData).length === 0) return;
    
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
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

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM załadowany - inicjalizacja panelu admina');
    
    const isAdminPage = window.location.pathname === '/channels' || 
                       window.location.pathname === '/channels/' ||
                       window.location.pathname.endsWith('/channels.html') ||
                       document.getElementById('loginView') !== null;
    
    if (!isAdminPage) {
        console.log('Nie jest to strona admina');
        return;
    }
    
    checkLoginStatus();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }
    
    window.addEventListener('popstate', handlePopState);
    
    window.addEventListener('click', function(event) {
        const editModal = document.getElementById('editModal');
        const addModal = document.getElementById('addModal');
        if (event.target === editModal) {
            closeEditModal();
        }
        if (event.target === addModal) {
            closeAddModal();
        }
    });
});