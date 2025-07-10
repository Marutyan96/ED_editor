// code_editor/staticfiles/js/languages/js/javascript-main.js
import { initHints } from './js-hints.js';

export function initJSEditor() {
    const textarea = document.getElementById('code');
    if (!textarea) {
        console.error('Textarea element not found');
        return null;
    }

    if (!CodeMirror.modes['javascript']) {
        console.error('JavaScript mode not loaded');
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
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        foldGutter: true,
        highlightSelectionMatches: { showToken: /\w/ },
        extraKeys: {
            'Ctrl-Space': cm => {
                if (!cm.state.completionActive) {
                    cm.showHint({
                        completeSingle: false,
                        container: document.getElementById('hints-container') || null
                    });
                }
            },
            'Ctrl-Enter': executeJSCode,
            'Tab': function(cm) {
                if (cm.state.completionActive) {
                    cm.execCommand('autocomplete');
                    return;
                }
                if (cm.somethingSelected()) {
                    cm.indentSelection('add');
                } else {
                    cm.replaceSelection('  ', 'end');
                }
            },
            'Esc': function(cm) {
                if (cm.state.completionActive) {
                    cm.state.completionActive.close();
                }
            }
        }
    });

    initHints(editor);

    function executeJSCode() {
        const output = document.getElementById('result');
        if (!output) {
            console.error('Output element not found');
            return;
        }

        output.innerHTML = '';

        try {
const sandbox = {
    console: {
        log: (...args) => output.innerHTML += `<div class="output-line">${args.join(' ')}</div>`,
        error: (...args) => output.innerHTML += `<div class="error-line">${args.join(' ')}</div>`,
        warn: (...args) => output.innerHTML += `<div class="warn-line">${args.join(' ')}</div>`,
        info: (...args) => output.innerHTML += `<div class="info-line">${args.join(' ')}</div>` // Добавлено
    },
    Math,
    JSON,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
};

            const code = editor.getValue();
            new Function('sandbox', `with(sandbox) { ${code} }`)(sandbox);
        } catch (error) {
            output.innerHTML += `<div class="error-line">Error: ${error.message}</div>`;
        } finally {
            output.scrollTop = output.scrollHeight;
        }
    }

    const runBtn = document.getElementById('run-btn');
    if (runBtn) {
        runBtn.addEventListener('click', executeJSCode);
    }

    window.executeJSCode = executeJSCode;

    return {
        editor,
        executeCode: executeJSCode
    };
}