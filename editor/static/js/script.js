document.addEventListener('DOMContentLoaded', () => {
    const editor = CodeMirror(document.getElementById('code-editor'), {
        mode: 'python',
        lineNumbers: true,
        theme: 'default',
        value: '# Введите ваш Python код здесь\nprint("Hello, world!")'
    });

    const ws = new WebSocket('ws://' + window.location.host + '/ws/editor/');
    const output = document.getElementById('output');
    const status = document.getElementById('status');
    const execTime = document.getElementById('exec-time');
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const layoutToggle = document.getElementById('layout-toggle');
    const container = document.getElementById('main-container');
    const resizeHandle = document.getElementById('resize-handle');
    const editorPane = document.querySelector('.editor-pane');
    const outputPane = document.querySelector('.output-pane');

    // Загрузка сохраненной темы
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.classList.add(`${savedTheme}-theme`);
    editor.setOption('theme', savedTheme === 'light' ? 'default' : 'monokai');
    themeToggle.textContent = savedTheme === 'light' ? '🌙 Тема' : '☀ Тема';

    // Загрузка сохраненной раскладки
    const savedLayout = localStorage.getItem('layout') || 'row';
    container.style.flexDirection = savedLayout;
    container.classList.add(savedLayout);
    layoutToggle.textContent = savedLayout === 'row' ? '↕' : '↔';
    updateResizeHandlePosition();

    // Переключение темы
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            editor.setOption('theme', 'monokai');
            themeToggle.textContent = '☀ Тема';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            editor.setOption('theme', 'default');
            themeToggle.textContent = '🌙 Тема';
            localStorage.setItem('theme', 'light');
        }
    });

    // Переключение раскладки
    layoutToggle.addEventListener('click', () => {
        if (container.style.flexDirection === 'row') {
            container.style.flexDirection = 'column';
            container.classList.remove('row');
            container.classList.add('column');
            layoutToggle.textContent = '↔';
            localStorage.setItem('layout', 'column');
        } else {
            container.style.flexDirection = 'row';
            container.classList.remove('column');
            container.classList.add('row');
            layoutToggle.textContent = '↕';
            localStorage.setItem('layout', 'row');
        }
        updateResizeHandlePosition();
    });

    // Перемещение разделителя
    let isResizing = false;
    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const rect = container.getBoundingClientRect();

        if (container.style.flexDirection === 'row') {
            const newEditorWidth = Math.max(100, Math.min(e.clientX - rect.left, rect.width - 100)); // Ограничения
            editorPane.style.flex = `0 0 ${newEditorWidth}px`;
            outputPane.style.flex = `1 0 auto`; // Остальное пространство
            resizeHandle.style.left = `${newEditorWidth}px`;
        } else {
            const newEditorHeight = Math.max(100, Math.min(e.clientY - rect.top, rect.height - 100)); // Ограничения
            editorPane.style.flex = `0 0 ${newEditorHeight}px`;
            outputPane.style.flex = `1 0 auto`; // Остальное пространство
            resizeHandle.style.top = `${newEditorHeight}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });

    function updateResizeHandlePosition() {
        if (container.style.flexDirection === 'row') {
            const editorWidth = editorPane.offsetWidth || container.offsetWidth / 2;
            editorPane.style.flex = `0 0 ${editorWidth}px`;
            outputPane.style.flex = `1 0 auto`;
            resizeHandle.style.left = `${editorWidth}px`;
            resizeHandle.style.top = '0';
            editorPane.style.height = '';
            outputPane.style.height = '';
        } else {
            const editorHeight = editorPane.offsetHeight || container.offsetHeight / 2;
            editorPane.style.flex = `0 0 ${editorHeight}px`;
            outputPane.style.flex = `1 0 auto`;
            resizeHandle.style.top = `${editorHeight}px`;
            resizeHandle.style.left = '0';
            editorPane.style.width = '';
            outputPane.style.width = '';
        }
    }

    // WebSocket события
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        output.textContent = data.output || 'No output';
        status.textContent = '● Ready';
        status.className = 'status-indicator ready';
        execTime.textContent = `Время: ${data.time || 0} сек`;
    };

    // Кнопка Run
    document.getElementById('run-btn').addEventListener('click', () => {
        const code = editor.getValue();
        ws.send(JSON.stringify({ code }));
        status.textContent = '● Running';
        status.className = 'status-indicator running';
        output.textContent = 'Executing...';
    });

    // Кнопка Clear
    document.getElementById('clear-btn').addEventListener('click', () => {
        editor.setValue('');
        output.textContent = '';
        status.textContent = '● Ready';
        status.className = 'status-indicator ready';
        execTime.textContent = 'Время: 0 сек';
    });

    // Загрузка файла
    document.getElementById('load-btn').addEventListener('click', () => {
        document.getElementById('load-file').click();
    });
    document.getElementById('load-file').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => editor.setValue(e.target.result);
            reader.readAsText(file);
        }
    });

    // Сохранение кода
    editor.on('change', () => {
        localStorage.setItem('pythonCode', editor.getValue());
    });
    const savedCode = localStorage.getItem('pythonCode');
    if (savedCode) editor.setValue(savedCode);
});