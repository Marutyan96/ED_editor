// static/js/main.js
import { initHints } from './editor_hints.js';
import { initAutoClose } from './autoClose.js';

// Функция инициализации редактора
export function initEditor() {
    const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
        mode: 'python',
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        theme: 'monokai', 
        extraKeys: {
            'Ctrl-Space': 'autocomplete',
            'Tab': handleTab
        }
    });

    // Установка начального кода
    editor.setValue(`# Добро пожаловать в ProPython!\n# Напишите свой код здесь и нажмите "Run"\n\ndef greet(name):\n    print(f"Привет, {name}!")\n\ngreet("Мир")\n`);

    // Инициализация подсказок и автозакрытия
    initHints(editor);
    initAutoClose(editor);

    function handleTab(cm) {
        if (cm.somethingSelected()) {
            cm.indentSelection("add");
        } else {
            cm.replaceSelection("    ", "end");
        }
    }

    // Функция для настройки выполнения кода
    function setupRunCode(runFunction) {
        editor.setOption('extraKeys', {
            ...editor.getOption('extraKeys'),
            'Ctrl-Enter': runFunction
        });
    }

    return {
        editor,
        setupRunCode // Экспортируем функцию для использования в других модулях
    };
}