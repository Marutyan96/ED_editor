let socket = null;

export function runCode() {
    const result = document.getElementById('result');
    if (!window.editor) {
        result.innerHTML = '<div class="execution-line error">Error: editor is not initialized</div>';
        console.error('Editor not found in window.editor');
        return;
    }
    const editor = window.editor;

    // Очищаем предыдущий вывод перед выполнением
    result.innerHTML = '';

    // Если сокет уже открыт, используем его; иначе создаём новый
    if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
        socket = new WebSocket(`ws://${window.location.host}/ws/editor/python/`);

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            
            if (data.type === 'output') {
                addOutput(data.data);
            } else if (data.type === 'input_request') {
                handleInput(data.data.prompt);
            } else if (data.type === 'error') {
                addError(data.data);
            }
        };

        socket.onerror = (error) => {
            addError('WebSocket error: ' + error.message);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };
    }

    // Отправляем код, когда сокет открыт
    if (socket.readyState === WebSocket.OPEN) {
        sendCode();
    } else {
        socket.onopen = () => {
            sendCode();
        };
    }

    function sendCode() {
        const code = editor.getValue();
        socket.send(JSON.stringify({
            type: 'execute_code',
            code: code
        }));
    }

    function addOutput(text) {
        const lines = text.split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                const div = document.createElement('div');
                div.className = 'execution-line output';
                div.textContent = line;
                result.appendChild(div);
            }
        });
        scrollToBottom();
    }
    
    function addError(text) {
        const div = document.createElement('div');
        div.className = 'execution-line error';
        div.textContent = `Error: ${text}`;
        result.appendChild(div);
        scrollToBottom();
    }
    
    function handleInput(prompt) {
        const container = document.createElement('div');
        container.className = 'execution-line input';
        
        const promptSpan = document.createElement('span');
        promptSpan.textContent = prompt || 'Input: ';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'code-input';
        input.autofocus = true;
        
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const value = e.target.value;
                // Добавляем ввод в историю
                const inputLine = document.createElement('div');
                inputLine.className = 'execution-line input-line';
                inputLine.textContent = `${prompt}${value}`;
                result.appendChild(inputLine);
                
                // Отправляем на сервер
                socket.send(JSON.stringify({
                    type: 'user_input',
                    value: value
                }));
                
                // Удаляем поле ввода
                container.remove();
                scrollToBottom();
            }
        };
        
        container.appendChild(promptSpan);
        container.appendChild(input);
        result.appendChild(container);
        input.focus();
        scrollToBottom();
    }
    
    function scrollToBottom() {
        result.scrollTop = result.scrollHeight;
    }
}