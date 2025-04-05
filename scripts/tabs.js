let tabs = [];
let activeTabId = null;
let tabCounter = 0;

const tabsContainer = document.getElementById('tabs-container');
const tabContent = document.getElementById('tab-content');
const newTabButton = document.getElementById('new-tab-button');

function initTabs() {
    if (newTabButton) {
        newTabButton.addEventListener('click', createNewTab);
    }

    createNewTab();
}

function createNewTab() {
    const tabId = 'tab-' + tabCounter++;

    const tab = {
        id: tabId,
        title: 'New Tab',
        url: '',
        favicon: '',
    };

    tabs.push(tab);

    const tabElement = document.createElement('div');
    tabElement.className = 'tab';
    tabElement.id = tabId;
    tabElement.dataset.tabId = tabId;
    tabElement.innerHTML = `
        <span class="tab-title">${tab.title}</span>
        <button class="tab-close">×</button>
    `;

    tabElement.addEventListener('click', (e) => {
        if (!e.target.matches('.tab-close')) {
            activateTab(tabId);
        }
    });

    const closeButton = tabElement.querySelector('.tab-close');
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(tabId);
    });

    tabsContainer.appendChild(tabElement);

    activateTab(tabId);

    return tabId;
}

function activateTab(tabId) {

    if (activeTabId === tabId) return;

    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    activeTabId = tabId;

    document.querySelectorAll('.tab').forEach(el => {
        el.classList.remove('active');
    });

    const tabElement = document.getElementById(tabId);
    if (tabElement) {
        tabElement.classList.add('active');
    }

    renderTabContent(tab);
}

function renderTabContent(tab) {

    tabContent.innerHTML = '';

    if (!tab.url) {
        showNewTabPage();
    } else {
        const iframe = document.createElement('iframe');
        iframe.className = 'tab-iframe';
        iframe.src = tab.url;
        tabContent.appendChild(iframe);
    }
}

// new rizz page
function showNewTabPage() {
    const newTabPage = document.createElement('div');
    newTabPage.className = 'new-tab-page';

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <form id="search-form">
            <input type="text" id="search-input" placeholder="Search or enter website URL">
            <button type="submit">Search</button>
        </form>
    `;

    // quick links 
    const quickLinks = document.createElement('div');
    quickLinks.className = 'quick-links';

    // quick links
    const sites = [
    ];


    sites.forEach(site => {
        const link = document.createElement('a');
        link.className = 'quick-link';
        link.href = '#';
        link.dataset.url = site.url;
        link.innerHTML = `
            <div class="quick-link-icon">${site.icon}</div>
            <div class="quick-link-name">${site.name}</div>
        `;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToUrl(site.url);
        });

        quickLinks.appendChild(link);
    });
    newTabPage.appendChild(searchContainer);
    newTabPage.appendChild(quickLinks);
    tabContent.appendChild(newTabPage);

    // Add tits
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        });
    }
}

function performSearch(query) {
    let url = query;

    if (!query.match(/^https?:\/\//i)) {
        const searchType = BrowserSettings.getSearchMethod();

        switch (searchType) {
            case 'direct':
                // Direct 
                url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                break;
            case '1dot':
                url = `https://1.com?q=${encodeURIComponent(query)}`;
                break;
            case '3dot':
                url = `https://3.com?q=${encodeURIComponent(query)}`;
                break;
            case '8dot':
                url = `https://8.com?q=${encodeURIComponent(query)}`;
                break;
            case '12dot':
                url = `https://12.com?q=${encodeURIComponent(query)}`;
                break;
            default:
                url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
    }

    navigateToUrl(url);
}

function navigateToUrl(url) {

    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;

    tab.url = url;
    tab.title = url.replace(/^https?:\/\

    const tabElement = document.getElementById(tab.id);
    if (tabElement) {
        const titleElement = tabElement.querySelector('.tab-title');
        if (titleElement) {
            titleElement.textContent = tab.title;
        }
    }

    const urlInput = document.getElementById('url-input');
    if (urlInput) {
        urlInput.value = url;
    }

    renderTabContent(tab);
}

function closeTab(tabId) {

    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    tabs.splice(tabIndex, 1);

    const tabElement = document.getElementById(tabId);
    if (tabElement) {
        tabElement.remove();
    }

    if (tabs.length === 0) {
        createNewTab();
        return;
    }

    if (activeTabId === tabId) {

        const newTabIndex = Math.max(0, tabIndex - 1);
        activateTab(tabs[newTabIndex].id);
    }
}

window.TabManager = {
    init: initTabs,
    createNewTab,
    activateTab,
    navigateToUrl,
    closeTab,
    getCurrentTabId: () => activeTabId,
    getCurrentTab: () => tabs.find(t => t.id === activeTabId)
};