export function runJSCode() {
    const result = document.getElementById('result');
    // Добавляем анимацию загрузки
    result.innerHTML = `
        <div class="execution-line">
            <div class="loading-animation">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            Выполнение JavaScript...
        </div>
    `;
    
    // Проверяем инициализацию редактора
    if (!window.editor) {
        result.innerHTML += '<div class="error-line">Редактор не инициализирован</div>';
        return;
    }

    const socket = new WebSocket(`ws://${window.location.host}/ws/editor/javascript/`);

    socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'output') {
            result.innerHTML += `<div class="output-line">${data.data}</div>`;
        } else if (data.type === 'error') {
            result.innerHTML += `<div class="error-line">${data.data}</div>`;
        }
        result.scrollTop = result.scrollHeight;
    };
    
    socket.onopen = () => {
        // Отправляем код из редактора
        socket.send(JSON.stringify({
            type: 'execute_code',
            code: window.editor.getValue()
        }));
    };
}