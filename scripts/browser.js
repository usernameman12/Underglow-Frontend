const urlInput = document.getElementById('url-input');
const goButton = document.getElementById('go-button');
const backButton = document.getElementById('back-button');
const forwardButton = document.getElementById('forward-button');
const refreshButton = document.getElementById('refresh-button');
const homeButton = document.getElementById('home-button');
const bookmarkButton = document.getElementById('bookmark-button');
const settingsButton = document.getElementById('settings-button');

const tabHistory = {};
const tabHistoryPosition = {};

const DEFAULT_HOME_URL = '';  

function initBrowser() {

    if (urlInput && goButton) {
        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                navigateToUrlInput();
            }
        });

        goButton.addEventListener('click', navigateToUrlInput);
    }

    if (backButton) {
        backButton.addEventListener('click', navigateBack);
    }

    if (forwardButton) {
        forwardButton.addEventListener('click', navigateForward);
    }

    if (refreshButton) {
        refreshButton.addEventListener('click', refreshPage);
    }

    if (homeButton) {
        homeButton.addEventListener('click', goHome);
    }

    if (bookmarkButton) {
        bookmarkButton.addEventListener('click', toggleBookmarksPanel);
    }

    if (settingsButton) {
        settingsButton.addEventListener('click', toggleSettingsPanel);
    }
}

function navigateToUrlInput() {
    const url = urlInput.value.trim();
    if (url) {

        const currentTab = TabManager.getCurrentTabId();
        if (currentTab) {

            addToHistory(currentTab, url);

            TabManager.navigateToUrl(url);
        }
    }
}

function addToHistory(tabId, url) {

    if (!tabHistory[tabId]) {
        tabHistory[tabId] = [];
        tabHistoryPosition[tabId] = -1;
    }

    if (tabHistoryPosition[tabId] < tabHistory[tabId].length - 1) {
        tabHistory[tabId] = tabHistory[tabId].slice(0, tabHistoryPosition[tabId] + 1);
    }

    tabHistory[tabId].push(url);
    tabHistoryPosition[tabId] = tabHistory[tabId].length - 1;

    updateNavButtons(tabId);
}

function updateNavButtons(tabId) {
    const position = tabHistoryPosition[tabId] || 0;
    const history = tabHistory[tabId] || [];

    if (backButton) {
        backButton.disabled = position <= 0;
    }

    if (forwardButton) {
        forwardButton.disabled = position >= history.length - 1;
    }
}

function navigateBack() {
    const tabId = TabManager.getCurrentTabId();
    if (!tabId || !tabHistory[tabId] || tabHistoryPosition[tabId] <= 0) return;

    tabHistoryPosition[tabId]--;
    const url = tabHistory[tabId][tabHistoryPosition[tabId]];

    navigateWithoutHistory(url);

    updateNavButtons(tabId);
}

function navigateForward() {
    const tabId = TabManager.getCurrentTabId();
    if (!tabId || !tabHistory[tabId] || tabHistoryPosition[tabId] >= tabHistory[tabId].length - 1) return;

    tabHistoryPosition[tabId]++;
    const url = tabHistory[tabId][tabHistoryPosition[tabId]];

    navigateWithoutHistory(url);

    updateNavButtons(tabId);
}

function navigateWithoutHistory(url) {

    if (urlInput) {
        urlInput.value = url;
    }

    TabManager.navigateToUrl(url);
}

function refreshPage() {
    const currentTab = TabManager.getCurrentTab();
    if (currentTab && currentTab.url) {

        TabManager.navigateToUrl(currentTab.url);
    }
}

function goHome() {

    TabManager.navigateToUrl(DEFAULT_HOME_URL);
}

function toggleBookmarksPanel() {
    const bookmarksPanel = document.getElementById('bookmarks-panel');
    const settingsPanel = document.getElementById('settings-panel');

    if (bookmarksPanel) {

        if (settingsPanel && !settingsPanel.classList.contains('hidden')) {
            settingsPanel.classList.add('hidden');
        }

        bookmarksPanel.classList.toggle('hidden');

        if (!bookmarksPanel.classList.contains('hidden')) {
            BookmarkManager.refreshBookmarksList();
        }
    }
}

function toggleSettingsPanel() {
    const settingsPanel = document.getElementById('settings-panel');
    const bookmarksPanel = document.getElementById('bookmarks-panel');

    if (settingsPanel) {

        if (bookmarksPanel && !bookmarksPanel.classList.contains('hidden')) {
            bookmarksPanel.classList.add('hidden');
        }

        settingsPanel.classList.toggle('hidden');
    }
}

function bookmarkCurrentPage() {
    const currentTab = TabManager.getCurrentTab();
    if (currentTab && currentTab.url) {
        BookmarkManager.addBookmark(currentTab.title, currentTab.url);
    }
}

window.BrowserControls = {
    init: initBrowser,
    navigateToUrlInput,
    navigateBack,
    navigateForward,
    refreshPage,
    goHome,
    toggleBookmarksPanel,
    toggleSettingsPanel,
    bookmarkCurrentPage
};