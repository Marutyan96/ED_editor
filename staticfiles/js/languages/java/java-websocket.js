// static/js/languages/java/java-websocket.js

export function initJavaWebSocket(outputElement) {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = protocol + window.location.host + '/ws/editor/java/';
    
    return new Promise((resolve) => {
        const socket = new WebSocket(wsUrl);
        let isReady = false;
        const messageQueue = [];

        socket.onopen = function() {
            isReady = true;
            // Отправляем все сообщения из очереди
            while (messageQueue.length > 0) {
                socket.send(messageQueue.shift());
            }
            resolve({
                execute: function(code) {
                    return new Promise((executeResolve) => {
                        const messageId = Date.now().toString();
                        
                        const handleMessage = (e) => {
                            const data = JSON.parse(e.data);
                            if (data.messageId === messageId) {
                                socket.removeEventListener('message', handleMessage);
                                outputElement.textContent = data.message; // Заменяем текст вместо добавления
                                outputElement.scrollTop = outputElement.scrollHeight;
                                executeResolve();
                            }
                        };
                        
                        socket.addEventListener('message', handleMessage);
                        
                        if (isReady) {
                            socket.send(JSON.stringify({
                                type: 'execute',
                                code: code,
                                messageId: messageId
                            }));
                        } else {
                            messageQueue.push(JSON.stringify({
                                type: 'execute',
                                code: code,
                                messageId: messageId
                            }));
                        }
                    });
                },
                close: function() {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.close();
                    }
                }
            });
        };

        socket.onerror = function(e) {
            outputElement.textContent = '\nWebSocket connection error\n';
            console.error('Java WebSocket error:', e);
        };
    });
}