let username = null;
let messageQueue = [];
let isConnected = false;
let reconnectInterval = null;
let lastMessageId = 0;
let knownUsers = new Set();

const WEBSOCKET_SERVER = 'wss://echo.websocket.events';

let connectionIndicator;
let connectionText;

function initWebSocket() {

    connectionIndicator = document.getElementById('connection-indicator');
    connectionText = document.getElementById('connection-text');

    if (!username) {
        const storedUsername = localStorage.getItem('chatUsername');
        if (storedUsername) {
            username = storedUsername;
        } else {
            username = 'User_' + Math.floor(Math.random() * 10000);
            localStorage.setItem('chatUsername', username);
        }
    }

    connectWebSocket();

    if (reconnectInterval) {
        clearInterval(reconnectInterval);
    }

    reconnectInterval = setInterval(() => {
        if (!isConnected) {
            console.log('Attempting to reconnect to chat...');
            connectWebSocket();
        }
    }, 5000);
}

function connectWebSocket() {
    try {

        const socket = new WebSocket(WEBSOCKET_SERVER);

        socket.addEventListener('open', () => {
            console.log('Connected to WebSocket server');
            isConnected = true;
            updateConnectionStatus(true);

            const joinMessage = {
                type: 'join',
                username: username,
                id: 'system_' + Date.now(),
                timestamp: new Date().toISOString()
            };

            socket.send(JSON.stringify(joinMessage));

            while (messageQueue.length > 0) {
                const queuedMessage = messageQueue.shift();
                socket.send(JSON.stringify(queuedMessage));
            }
        });

        socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);

                processReceivedMessage(data);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        socket.addEventListener('close', () => {
            console.log('Disconnected from WebSocket server');
            isConnected = false;
            updateConnectionStatus(false);
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            isConnected = false;
            updateConnectionStatus(false);
        });

        window._chatSocket = socket;

    } catch (error) {
        console.error('Failed to connect to WebSocket server:', error);
        isConnected = false;
        updateConnectionStatus(false);
    }
}

function initLocalStorageChat() {

    window.addEventListener('storage', (event) => {
        if (event.key === 'localChatMessage') {
            try {
                const message = JSON.parse(event.newValue);
                if (message.sender !== username) {
                    processReceivedMessage(message);
                }
            } catch (error) {
                console.error('Error processing local message:', error);
            }
        }
    });

    isConnected = true;
    updateConnectionStatus(true);
}

function processReceivedMessage(data) {

    if (data.type === 'chat' && data.sender === username) {
        return;
    }

    switch (data.type) {
        case 'chat':

            addMessageToChat(data, false);
            break;

        case 'join':

            if (data.username !== username) {
                knownUsers.add(data.username);
                addSystemMessage(`${data.username} joined the chat`);
            }
            break;

        case 'leave':

            if (data.username !== username) {
                knownUsers.delete(data.username);
                addSystemMessage(`${data.username} left the chat`);
            }
            break;
    }
}

function updateConnectionStatus(connected) {
    if (connectionIndicator && connectionText) {
        if (connected) {
            connectionIndicator.classList.add('connected');
            connectionText.textContent = 'Connected';
        } else {
            connectionIndicator.classList.remove('connected');
            connectionText.textContent = 'Disconnected';
        }
    }
}

function sendChatMessage(text) {
    if (!text.trim()) return false;

    const messageId = 'msg_' + (++lastMessageId) + '_' + Date.now();
    const message = {
        type: 'chat',
        id: messageId,
        sender: username,
        text: text,
        timestamp: new Date().toISOString()
    };

    if (isConnected && window._chatSocket && window._chatSocket.readyState === WebSocket.OPEN) {
        try {
            window._chatSocket.send(JSON.stringify(message));

            addMessageToChat(message, true);
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    messageQueue.push(message);

    try {
        localStorage.setItem('localChatMessage', JSON.stringify(message));

        addMessageToChat(message, true);
        return true;
    } catch (error) {
        console.error('Error with localStorage fallback:', error);
        return false;
    }
}

function addMessageToChat(message, isOwnMessage) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${isOwnMessage ? 'own-message' : ''}`;
    messageElement.dataset.messageId = message.id;

    const userElement = document.createElement('div');
    userElement.className = 'chat-message-user';
    userElement.textContent = isOwnMessage ? 'You' : message.sender;

    const textElement = document.createElement('div');
    textElement.className = 'chat-message-text';
    textElement.textContent = message.text;

    messageElement.appendChild(userElement);
    messageElement.appendChild(textElement);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addSystemMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message system-message';

    const textElement = document.createElement('div');
    textElement.className = 'chat-message-text system';
    textElement.textContent = text;

    messageElement.appendChild(textElement);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function disconnectWebSocket() {

    if (isConnected && window._chatSocket && window._chatSocket.readyState === WebSocket.OPEN) {
        const leaveMessage = {
            type: 'leave',
            username: username,
            id: 'system_' + Date.now(),
            timestamp: new Date().toISOString()
        };

        try {
            window._chatSocket.send(JSON.stringify(leaveMessage));
        } catch (error) {
            console.error('Error sending leave message:', error);
        }

        try {
            window._chatSocket.close();
        } catch (error) {
            console.error('Error closing WebSocket:', error);
        }
    }

    if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
    }

    isConnected = false;
    updateConnectionStatus(false);
}

window.addEventListener('beforeunload', disconnectWebSocket);

window.WebSocketChat = {
    init: initWebSocket,
    send: sendChatMessage,
    disconnect: disconnectWebSocket,
    setUsername: (name) => {
        username = name;
        localStorage.setItem('chatUsername', username);
    },
    isConnected: () => isConnected
};