// static/js/languages/javascript-main.js
import { initHints } from './js-hints.js';

export function initJSEditor() {
    const textarea = document.getElementById('code');
    if (!textarea) {
        console.error('Textarea element not found');
        return null;
    }

    const editor = CodeMirror.fromTextArea(textarea, {
        mode: 'javascript',
        lineNumbers: true,
        theme: 'default',
        indentUnit: 2,
        tabSize: 2,
        autoCloseBrackets: true,
        matchBrackets: true,
        extraKeys: {
            'Ctrl-Space': 'autocomplete',
            'Ctrl-Enter': executeJSCode, // Добавляем горячую клавишу
            'Tab': function(cm) {
                if (cm.somethingSelected()) {
                    cm.indentSelection("add");
                } else {
                    cm.replaceSelection("  ", "end");
                }
            }
        }
    });

    // Инициализация подсказок
    initHints(editor);

    function executeJSCode() {
        const output = document.getElementById('result');
        if (!output) return;
        
        output.innerHTML = '';
        
        try {
            const sandbox = {
                console: {
                    log: (...args) => output.innerHTML += `<div class="output-line">${args.join(' ')}</div>`,
                    error: (...args) => output.innerHTML += `<div class="error-line">${args.join(' ')}</div>`,
                    warn: (...args) => output.innerHTML += `<div class="warn-line">${args.join(' ')}</div>`
                },
                Math, JSON, setTimeout, clearTimeout, setInterval, clearInterval
            };

            const code = editor.getValue();
            new Function('sandbox', `with(sandbox) { ${code} }`)(sandbox);
            
        } catch (error) {
            output.innerHTML += `<div class="error-line">Error: ${error.message}</div>`;
        } finally {
            output.scrollTop = output.scrollHeight;
        }
    }

    // Добавляем обработчик кнопки Run
    const runBtn = document.getElementById('run-btn');
    if (runBtn) {
        runBtn.addEventListener('click', executeJSCode);
    }

    // Экспортируем функцию для внешнего использования
    window.executeJSCode = executeJSCode;

    return {
        editor,
        executeCode: executeJSCode
    };
}