// static/js/html-main.js
export function initEditor() {
    const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
        lineNumbers: true,
        mode: 'htmlmixed',
        theme: 'monokai',
        indentUnit: 4,
        autoCloseTags: true,
        extraKeys: {
            'Ctrl-Enter': () => document.getElementById('run-btn').click()
        }
    });

    return {
        editor,
        setupRunCode: (runFunction) => {
            document.getElementById('run-btn').onclick = () => {
                runFunction(editor.getValue());
            };
        }
    };
}