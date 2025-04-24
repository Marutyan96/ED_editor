// theme.js
export function initThemeToggle(editor) {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) {
        console.error('Theme toggle button not found');
        return;
    }

    if (!editor || typeof editor.setOption !== 'function') {
        console.error('Invalid CodeMirror editor instance');
        return;
    }

    // Проверяем сохранённую тему
    const savedTheme = localStorage.getItem('editorTheme');
    let isDark = savedTheme === 'dark';

    function applyTheme() {
        if (isDark) {
            document.body.classList.add('dark-theme');
            editor.setOption('theme', 'monokai');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-theme');
            editor.setOption('theme', 'default');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    // Применяем начальную тему
    applyTheme();

    // Обработчик переключения
    themeToggle.addEventListener('click', () => {
        isDark = !isDark;
        localStorage.setItem('editorTheme', isDark ? 'dark' : 'light');
        applyTheme();
    });
}