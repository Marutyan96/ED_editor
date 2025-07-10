// js/languages/c/c-main.js

export function initCEditor() {
    const textarea = document.getElementById('code');
    if (!textarea) {
        console.error('Textarea #code not found');
        return null;
    }

    const editor = CodeMirror.fromTextArea(textarea, {
        mode: 'text/x-csrc',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        extraKeys: {
            'Ctrl-Enter': executeCode,
            'Cmd-Enter': executeCode
        }
    });

    const ws = new WebSocket(`ws://${window.location.host}/ws/c/`);

    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const result = document.getElementById('result');
        result.innerHTML = `<pre>${data.output || ''}</pre>`;
        if (data.error) {
            result.innerHTML += `<pre style="color: red;">${data.error}</pre>`;
        }
    };

    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => console.log('WebSocket closed');

    function executeCode() {
        if (ws.readyState === WebSocket.OPEN) {
            const code = editor.getValue();
            ws.send(JSON.stringify({ code }));
        } else {
            console.error('WebSocket is not open');
        }
    }

    return {
        editor,
        executeCode
    };
}

// Для совместимости с legacy-кодом
window.initCEditor = initCEditor;