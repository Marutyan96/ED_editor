// static/js/buttons.js

// Удаляем ненужный импорт, так как runCode будет передаваться параметром
export function initButtons(editor, runCode) {
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');
    const result = document.getElementById('result');
    const runBtn = document.getElementById('run-btn');

    // Очистка редактора
    clearBtn.addEventListener('click', () => {
        if (confirm("Очистить редактор и вывод?")) {
            editor.setValue('');
            result.innerHTML = ''; // Используем innerHTML вместо textContent
        }
    });

    // Сохранение кода
    saveBtn.addEventListener('click', () => {
        const code = editor.getValue();

        // Читаем расширение и MIME-тип из data-атрибутов
        const extension = saveBtn.dataset.fileExtension || 'txt';
        const mimeType = saveBtn.dataset.mimeType || 'text/plain';

        const blob = new Blob([code], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });


    // Запуск кода
    runBtn.addEventListener('click', () => {
        runCode(editor.getValue());
    });

    // Запуск по Ctrl+Enter
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            runCode(editor.getValue());
        }
    });
}