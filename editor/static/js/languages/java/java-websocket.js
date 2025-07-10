export function initJavaWebSocket(outputElement) {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = protocol + window.location.host + '/ws/editor/java/';
    
    function renderErrorWithStyle(text) {
        outputElement.innerHTML = '';
        const lines = text.split('\n');
        lines.forEach(line => {
            const div = document.createElement('div');
            div.className = 'error-line';
            div.textContent = line || '\u00A0';
            outputElement.appendChild(div);
        });
    }

    return new Promise((resolve) => {
        const socket = new WebSocket(wsUrl);
        let isReady = false;
        const messageQueue = [];

        socket.onopen = function() {
            isReady = true;
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

                                if (data.message.toLowerCase().includes('error')) {
                                    renderErrorWithStyle(data.message);
                                } else {
                                    outputElement.textContent = data.message;
                                }
                                
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
