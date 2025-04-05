const chatPanel = document.getElementById('chat-panel');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendMessageButton = document.getElementById('send-message');
const chatButton = document.getElementById('chat-button');
const minimizeChatButton = document.getElementById('minimize-chat');
const closeChatButton = document.getElementById('close-chat');

let isChatMinimized = false;

function initChat() {

    if (chatButton) {
        chatButton.addEventListener('click', toggleChat);
    }

    if (minimizeChatButton) {
        minimizeChatButton.addEventListener('click', minimizeChat);
    }

    if (closeChatButton) {
        closeChatButton.addEventListener('click', closeChat);
    }

    if (chatInput && sendMessageButton) {

        sendMessageButton.addEventListener('click', sendMessage);

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

function toggleChat() {
    if (chatPanel) {
        if (chatPanel.classList.contains('hidden')) {

            chatPanel.classList.remove('hidden');
            isChatMinimized = false;
            chatPanel.classList.remove('minimized');

            connectToChat();
        } else {

            chatPanel.classList.add('hidden');
        }
    }
}

function minimizeChat() {
    if (chatPanel) {
        isChatMinimized = !isChatMinimized;

        if (isChatMinimized) {
            chatPanel.classList.add('minimized');
        } else {
            chatPanel.classList.remove('minimized');
        }
    }
}

function closeChat() {
    if (chatPanel) {
        chatPanel.classList.add('hidden');
    }
}

function connectToChat() {

    if (window.WebSocketChat) {
        WebSocketChat.init();
    }
}

function sendMessage() {
    if (!chatInput) return;

    const message = chatInput.value.trim();
    if (!message) return;

    if (window.WebSocketChat) {

        const success = WebSocketChat.send(message);

        if (success) {

            chatInput.value = '';
        }
    }
}

function promptForUsername() {
    if (window.WebSocketChat) {
        let username = localStorage.getItem('chatUsername');

        if (!username) {
            username = prompt('Enter your username for chat:', '');
            if (username) {
                localStorage.setItem('chatUsername', username);
            } else {
                username = 'User_' + Math.floor(Math.random() * 10000);
            }
        }

        WebSocketChat.setUsername(username);
    }
}

function addSystemMessage(message) {
    if (!chatMessages) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'system-message';
    messageElement.textContent = message;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.ChatInterface = {
    init: initChat,
    toggle: toggleChat,
    minimize: minimizeChat,
    close: closeChat,
    promptForUsername
};