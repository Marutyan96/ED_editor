export function initPhpEditor() {
    const textarea = document.getElementById('code');
    if (!textarea) {
        console.error('Textarea #code не найдена');
        return null;
    }

    const editor = CodeMirror.fromTextArea(textarea, {
        mode: {
            name: "php",
            startOpen: true,
            version: 3,
            htmlMode: true
        },
        theme: 'monokai',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        scrollbarStyle: 'null',
        viewportMargin: Infinity,
        extraKeys: {
            'Ctrl-Enter': executeCode,
            'Cmd-Enter': executeCode
        }
    });

    // Инициализация WebSocket
    const ws = new WebSocket(`ws://${window.location.host}/ws/php/`);

    function executeCode() {
        if (ws.readyState === WebSocket.OPEN) {
            const code = editor.getValue();
            ws.send(JSON.stringify({ code }));
        } else {
            console.error('WebSocket не подключен');
        }
    }

    // Обработка сообщений от сервера
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const result = document.getElementById('result');
        result.innerHTML = data.output ? `<pre>${data.output}</pre>` : '';
        if (data.error) {
            result.innerHTML += `<pre style="color:red">${data.error}</pre>`;
        }
    };

    // Автоматический ресайз редактора
    const resizeEditor = () => editor.setSize('100%', '100%');
    window.addEventListener('resize', resizeEditor);
    resizeEditor();

    return {
        editor,
        executeCode
    };
}

// Для совместимости
window.initPhpEditor = initPhpEditor;