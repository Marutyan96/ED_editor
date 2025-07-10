// static/js/languages/java/java-main.js
import { initJavaWebSocket } from "./java-websocket.js";
import { initJavaHints } from "./java-hints.js";

export function initJavaEditor() {
    const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
        mode: 'text/x-java',
        theme: 'monokai',
        lineNumbers: true,
        indentUnit: 4,
        lineWrapping: true,
        extraKeys: {
            'Ctrl-Enter': executeJavaCode,
            'Cmd-Enter': executeJavaCode,
            'Tab': function(cm) {
                if (cm.state.completionActive && cm.state.completionActive.widget) {
                    cm.state.completionActive.widget.pick();
                } else {
                    cm.execCommand("indentMore");
                }
            }
        }
    });

    // Initialize autocompletion
    initJavaHints(editor);

    const outputElement = document.getElementById('result');
    let javaWebSocket = null;

    async function executeJavaCode() {
        const code = editor.getValue();
        if (!code.trim()) return;

        outputElement.textContent = 'Executing Java code...\n';

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

    document.getElementById('run-btn').addEventListener('click', executeJavaCode);

    return {
        editor,
        executeCode: executeJavaCode,
        cleanup: () => javaWebSocket?.close()
    };
}
