document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing browser...');

    if (window.BrowserSettings) {
        BrowserSettings.init();
        console.log('Settings initialized');

        const toggleThemeButton = document.getElementById('toggle-theme-button');
        if (toggleThemeButton) {
            toggleThemeButton.addEventListener('click', () => {
                BrowserSettings.toggleTheme();
            });
        }

        const resetSettingsButton = document.getElementById('reset-settings');
        if (resetSettingsButton) {
            resetSettingsButton.addEventListener('click', () => {
                if (confirm('Reset all settings to defaults?')) {
                    BrowserSettings.resetSettings();
                }
            });
        }
    } else {
        console.error('BrowserSettings module not found!');
    }

    if (window.BookmarkManager) {
        BookmarkManager.init();
        console.log('Bookmarks initialized');

        const addCurrentBookmarkButton = document.getElementById('add-current-bookmark');
        if (addCurrentBookmarkButton) {
            addCurrentBookmarkButton.addEventListener('click', () => {
                BrowserControls.bookmarkCurrentPage();
            });
        }
    } else {
        console.error('BookmarkManager module not found!');
    }

    if (window.TabManager) {
        TabManager.init();
        console.log('Tab Manager initialized');
    } else {
        console.error('TabManager module not found!');
    }

    if (window.BrowserControls) {
        BrowserControls.init();
        console.log('Browser Controls initialized');
    } else {
        console.error('BrowserControls module not found!');
    }

    if (window.ChatInterface) {
        ChatInterface.init();
        console.log('Chat Interface initialized');

        ChatInterface.promptForUsername();
    } else {
        console.error('ChatInterface module not found!');
    }

    setupSandboxedIframes();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

    console.log('Browser initialization complete');
});

function setupSandboxedIframes() {

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];

                    if (node.tagName === 'IFRAME') {
                        secureIframe(node);
                    } else if (node.querySelectorAll) {
                        const iframes = node.querySelectorAll('iframe');
                        iframes.forEach(secureIframe);
                    }
                }
            }
        });
    });

    observer.observe(document, { childList: true, subtree: true });

    document.querySelectorAll('iframe').forEach(secureIframe);
}

function secureIframe(iframe) {

    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups');

    iframe.setAttribute('loading', 'lazy');

    iframe.addEventListener('load', function() {
        console.log('Iframe loaded:', iframe.src);
    });
}