// static/js/languages/java/java-main.js
import { initJavaWebSocket } from "./java-websocket.js";

export function initJavaEditor() {
    const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
        mode: 'text/x-java',
        theme: 'monokai',
        lineNumbers: true,
        indentUnit: 4
    });

    const outputElement = document.getElementById('result');
    let javaWebSocket = null;

    async function executeJavaCode() {
        const code = editor.getValue();
        if (!code.trim()) return;
        
        outputElement.textContent = 'Compiling and running Java code...\n';
        
        try {
            if (!javaWebSocket) {
                javaWebSocket = await initJavaWebSocket(outputElement);
            }
            await javaWebSocket.execute(code);
        } catch (error) {
            outputElement.textContent += `\nError: ${error.message}\n`;
            console.error('Execution error:', error);
        }
    }

    // Назначение обработчика кнопки Run
    document.getElementById('run-btn').addEventListener('click', executeJavaCode);

    return {
        editor,
        executeCode: executeJavaCode,
        cleanup: () => javaWebSocket?.close()
    };
}