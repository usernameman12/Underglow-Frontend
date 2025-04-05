let bookmarks = [];

const bookmarksPanel = document.getElementById('bookmarks-panel');
const bookmarksList = document.getElementById('bookmarks-list');
const closeBookmarksButton = document.getElementById('close-bookmarks');

function initBookmarks() {

    loadBookmarks();

    if (closeBookmarksButton) {
        closeBookmarksButton.addEventListener('click', () => {
            bookmarksPanel.classList.add('hidden');
        });
    }
}

function loadBookmarks() {
    try {
        const savedBookmarks = localStorage.getItem('browserBookmarks');
        if (savedBookmarks) {
            bookmarks = JSON.parse(savedBookmarks);
        }
    } catch (error) {
        console.error('Failed to load bookmarks:', error);
        bookmarks = [];
    }
}

function saveBookmarks() {
    try {
        localStorage.setItem('browserBookmarks', JSON.stringify(bookmarks));
    } catch (error) {
        console.error('Failed to save bookmarks:', error);
    }
}

function addBookmark(title, url) {
    const exists = bookmarks.some(bookmark => bookmark.url === url);
    if (exists) {
        alert('This page is already bookmarked!');
        return false;
    }

    if (title.length > 50) {
        title = title.substring(0, 50) + '...';
    }

    const bookmark = {
        id: Date.now(),  
        title: title,
        url: url,
        createdAt: new Date().toISOString()
    };

    bookmarks.push(bookmark);

    saveBookmarks();

    if (bookmarksPanel && !bookmarksPanel.classList.contains('hidden')) {
        refreshBookmarksList();
    }

    return true;
}

function removeBookmark(id) {
    const index = bookmarks.findIndex(bookmark => bookmark.id === id);
    if (index === -1) return false;

    bookmarks.splice(index, 1);

    saveBookmarks();

    refreshBookmarksList();

    return true;
}

function refreshBookmarksList() {
    if (!bookmarksList) return;
    bookmarksList.innerHTML = '';

    if (bookmarks.length === 0) {
        bookmarksList.innerHTML = '<div class="no-bookmarks">No bookmarks yet. Add some by clicking the bookmark icon while viewing a page.</div>';
        return;
    }

    const sortedBookmarks = [...bookmarks].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    sortedBookmarks.forEach(bookmark => {
        const bookmarkElement = document.createElement('div');
        bookmarkElement.className = 'bookmark-item';
        bookmarkElement.dataset.id = bookmark.id;

        bookmarkElement.innerHTML = `
            <div class="bookmark-content">
                <div class="bookmark-title">${bookmark.title}</div>
                <div class="bookmark-url">${bookmark.url}</div>
            </div>
            <div class="bookmark-actions">
                <button class="bookmark-open">Open</button>
                <button class="bookmark-delete">Delete</button>
            </div>
        `;

        const openButton = bookmarkElement.querySelector('.bookmark-open');
        if (openButton) {
            openButton.addEventListener('click', () => {
                openBookmark(bookmark.url);
            });
        }

        const deleteButton = bookmarkElement.querySelector('.bookmark-delete');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                removeBookmark(bookmark.id);
            });
        }

        bookmarksList.appendChild(bookmarkElement);
    });
}

function openBookmark(url) {
    TabManager.navigateToUrl(url);

    if (bookmarksPanel) {
        bookmarksPanel.classList.add('hidden');
    }
}

window.BookmarkManager = {
    init: initBookmarks,
    addBookmark,
    removeBookmark,
    refreshBookmarksList
};
