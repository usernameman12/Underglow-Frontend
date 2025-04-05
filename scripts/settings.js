const defaultSettings = {
    theme: 'light',      
    searchMethod: 'direct'  
};

let currentSettings = { ...defaultSettings };

let settingsPanel;
let themeSelector;
let searchTypeSelector;
let closeSettingsButton;

function initSettings() {
    console.log('Initializing settings...');

    settingsPanel = document.getElementById('settings-panel');
    themeSelector = document.getElementById('theme-selector');
    searchTypeSelector = document.getElementById('search-type');
    closeSettingsButton = document.getElementById('close-settings');

    loadSettings();

    applySettings();

    if (themeSelector) {
        themeSelector.addEventListener('change', () => {
            updateSetting('theme', themeSelector.value);
        });
    } else {
        console.warn('Theme selector element not found');
    }

    if (searchTypeSelector) {
        searchTypeSelector.addEventListener('change', () => {
            updateSetting('searchMethod', searchTypeSelector.value);
        });
    } else {
        console.warn('Search type selector element not found');
    }

    if (closeSettingsButton) {
        closeSettingsButton.addEventListener('click', () => {
            if (settingsPanel) {
                settingsPanel.classList.add('hidden');
            }
        });
    } else {
        console.warn('Close settings button not found');
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            toggleTheme();
        }
    });

    console.log('Settings initialized with theme:', currentSettings.theme);
}

function toggleTheme() {
    const newTheme = currentSettings.theme === 'light' ? 'dark' : 'light';
    updateSetting('theme', newTheme);

    if (themeSelector) {
        themeSelector.value = newTheme;
    }
}

function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('browserSettings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            currentSettings = { ...defaultSettings, ...parsedSettings };
            console.log('Loaded settings:', currentSettings);
        } else {
            console.log('No saved settings found, using defaults');

            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                currentSettings.theme = 'dark';
                console.log('Using system preference for dark mode');
            }
        }
    } catch (error) {
        console.error('Failed to load settings:', error);

        currentSettings = { ...defaultSettings };

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            currentSettings.theme = 'dark';
        }
    }

    updateSettingsControls();
}

function updateSettingsControls() {
    if (themeSelector) {
        themeSelector.value = currentSettings.theme;
    }

    if (searchTypeSelector) {
        searchTypeSelector.value = currentSettings.searchMethod;
    }
}

function saveSettings() {
    try {
        localStorage.setItem('browserSettings', JSON.stringify(currentSettings));
        console.log('Settings saved:', currentSettings);
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}

function updateSetting(key, value) {
    console.log(`Updating setting ${key} to ${value}`);
    if (currentSettings[key] !== value) {
        currentSettings[key] = value;
        saveSettings();
        applySettings();
    }
}

function applySettings() {

    applyTheme(currentSettings.theme);

}

function applyTheme(theme) {
    console.log('Applying theme:', theme);

    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.content = theme === 'dark' ? '#222222' : '#f5f5f5';

    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

function getSearchMethod() {
    return currentSettings.searchMethod;
}

function getSetting(key) {
    return currentSettings[key];
}

function resetSettings() {
    currentSettings = { ...defaultSettings };
    saveSettings();
    updateSettingsControls();
    applySettings();
}

window.BrowserSettings = {
    init: initSettings,
    getSearchMethod,
    getSetting,
    updateSetting,
    resetSettings,
    toggleTheme
};