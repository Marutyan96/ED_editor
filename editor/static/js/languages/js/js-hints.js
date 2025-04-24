// static/js/languages/js-hints.js
export function initHints(editor) {
    const jsCompletions = [
        // Ключевые слова
        { text: "break", displayText: "break", className: "hint-keyword" },
        { text: "case", displayText: "case", className: "hint-keyword" },
        { text: "catch", displayText: "catch", className: "hint-keyword" },
        { text: "class", displayText: "class", className: "hint-keyword" },
        { text: "const", displayText: "const", className: "hint-keyword" },
        { text: "continue", displayText: "continue", className: "hint-keyword" },
        { text: "debugger", displayText: "debugger", className: "hint-keyword" },
        { text: "default", displayText: "default", className: "hint-keyword" },
        { text: "delete", displayText: "delete", className: "hint-keyword" },
        { text: "do", displayText: "do", className: "hint-keyword" },
        { text: "else", displayText: "else", className: "hint-keyword" },
        { text: "export", displayText: "export", className: "hint-keyword" },
        { text: "extends", displayText: "extends", className: "hint-keyword" },
        { text: "finally", displayText: "finally", className: "hint-keyword" },
        { text: "for", displayText: "for", className: "hint-keyword" },
        { text: "function", displayText: "function", className: "hint-keyword" },
        { text: "if", displayText: "if", className: "hint-keyword" },
        { text: "import", displayText: "import", className: "hint-keyword" },
        { text: "in", displayText: "in", className: "hint-keyword" },
        { text: "instanceof", displayText: "instanceof", className: "hint-keyword" },
        { text: "let", displayText: "let", className: "hint-keyword" },
        { text: "new", displayText: "new", className: "hint-keyword" },
        { text: "return", displayText: "return", className: "hint-keyword" },
        { text: "super", displayText: "super", className: "hint-keyword" },
        { text: "switch", displayText: "switch", className: "hint-keyword" },
        { text: "this", displayText: "this", className: "hint-keyword" },
        { text: "throw", displayText: "throw", className: "hint-keyword" },
        { text: "try", displayText: "try", className: "hint-keyword" },
        { text: "typeof", displayText: "typeof", className: "hint-keyword" },
        { text: "var", displayText: "var", className: "hint-keyword" },
        { text: "void", displayText: "void", className: "hint-keyword" },
        { text: "while", displayText: "while", className: "hint-keyword" },
        { text: "with", displayText: "with", className: "hint-keyword" },
        { text: "yield", displayText: "yield", className: "hint-keyword" },

        // Глобальные объекты и методы
        { text: "Array", displayText: "Array", className: "hint-builtin" },
        { text: "Array.from", displayText: "Array.from()", className: "hint-builtin" },
        { text: "Array.isArray", displayText: "Array.isArray()", className: "hint-builtin" },
        { text: "Boolean", displayText: "Boolean", className: "hint-builtin" },
        { text: "console", displayText: "console", className: "hint-builtin" },
        { text: "console.log", displayText: "console.log()", className: "hint-builtin" },
        { text: "console.error", displayText: "console.error()", className: "hint-builtin" },
        { text: "console.warn", displayText: "console.warn()", className: "hint-builtin" },
        { text: "Date", displayText: "Date", className: "hint-builtin" },
        { text: "Date.now", displayText: "Date.now()", className: "hint-builtin" },
        { text: "Error", displayText: "Error", className: "hint-builtin" },
        { text: "JSON", displayText: "JSON", className: "hint-builtin" },
        { text: "JSON.parse", displayText: "JSON.parse()", className: "hint-builtin" },
        { text: "JSON.stringify", displayText: "JSON.stringify()", className: "hint-builtin" },
        { text: "Math", displayText: "Math", className: "hint-builtin" },
        { text: "Math.abs", displayText: "Math.abs()", className: "hint-builtin" },
        { text: "Math.floor", displayText: "Math.floor()", className: "hint-builtin" },
        { text: "Math.ceil", displayText: "Math.ceil()", className: "hint-builtin" },
        { text: "Math.round", displayText: "Math.round()", className: "hint-builtin" },
        { text: "Math.max", displayText: "Math.max()", className: "hint-builtin" },
        { text: "Math.min", displayText: "Math.min()", className: "hint-builtin" },
        { text: "Math.random", displayText: "Math.random()", className: "hint-builtin" },
        { text: "Number", displayText: "Number", className: "hint-builtin" },
        { text: "Number.parseInt", displayText: "Number.parseInt()", className: "hint-builtin" },
        { text: "Number.parseFloat", displayText: "Number.parseFloat()", className: "hint-builtin" },
        { text: "Object", displayText: "Object", className: "hint-builtin" },
        { text: "Object.keys", displayText: "Object.keys()", className: "hint-builtin" },
        { text: "Object.values", displayText: "Object.values()", className: "hint-builtin" },
        { text: "Object.entries", displayText: "Object.entries()", className: "hint-builtin" },
        { text: "Promise", displayText: "Promise", className: "hint-builtin" },
        { text: "Promise.resolve", displayText: "Promise.resolve()", className: "hint-builtin" },
        { text: "Promise.reject", displayText: "Promise.reject()", className: "hint-builtin" },
        { text: "RegExp", displayText: "RegExp", className: "hint-builtin" },
        { text: "Set", displayText: "Set", className: "hint-builtin" },
        { text: "String", displayText: "String", className: "hint-builtin" },
        { text: "String.fromCharCode", displayText: "String.fromCharCode()", className: "hint-builtin" },

        // Функции времени
        { text: "setTimeout", displayText: "setTimeout()", className: "hint-builtin" },
        { text: "clearTimeout", displayText: "clearTimeout()", className: "hint-builtin" },
        { text: "setInterval", displayText: "setInterval()", className: "hint-builtin" },
        { text: "clearInterval", displayText: "clearInterval()", className: "hint-builtin" },
    ];
  // Переменные для контроля навигации
  let currentSelectedIndex = -1;
  let hintWidget = null;

  // Функция для получения подсказок
  function getHints(cm) {
      const cursor = cm.getCursor();
      const token = cm.getTokenAt(cursor);
      const currentWord = token.string;
      
      if (!currentWord || currentWord.trim().length < 1) return null;

      const userVars = extractVariables(cm.getValue());
      const allHints = [...jsCompletions, ...userVars];
      
      const filtered = allHints.filter(hint => 
          hint.text.toLowerCase().includes(currentWord.toLowerCase())
      );

      return filtered.length ? {
          list: filtered,
          from: CodeMirror.Pos(cursor.line, token.start),
          to: CodeMirror.Pos(cursor.line, token.end)
      } : null;
  }

  // Настройки автодополнения
  editor.setOption('hintOptions', {
      completeSingle: false,
      hint: getHints
  });

  // Обработчик открытия подсказок
  editor.on('startCompletion', (cm) => {
      hintWidget = cm.state.completionActive?.widget || null;
      currentSelectedIndex = -1;
  });

  // Обработчик закрытия подсказок
  editor.on('endCompletion', (cm) => {
      hintWidget = null;
      currentSelectedIndex = -1;
  });

  // Надежный обработчик навигации
  editor.on('keydown', (cm, event) => {
      if (!hintWidget || !hintWidget.list || hintWidget.list.length === 0) return;

      const handleNavigation = (direction) => {
          event.preventDefault();
          event.stopPropagation();
          
          const newIndex = currentSelectedIndex + direction;
          
          // Проверяем границы списка
          if (newIndex >= hintWidget.list.length) {
              currentSelectedIndex = 0;
          } else if (newIndex < 0) {
              currentSelectedIndex = hintWidget.list.length - 1;
          } else {
              currentSelectedIndex = newIndex;
          }
          
          // Применяем выбор
          hintWidget.changeActive(currentSelectedIndex);
          
          // Прокручиваем список при необходимости
          const listElement = hintWidget.listElement;
          const selectedElement = listElement.children[currentSelectedIndex];
          if (selectedElement) {
              selectedElement.scrollIntoView({
                  block: 'nearest',
                  behavior: 'smooth'
              });
          }
      };

      switch(event.key) {
          case 'ArrowUp':
              handleNavigation(-1);
              break;
              
          case 'ArrowDown':
              handleNavigation(1);
              break;
              
          case 'Enter':
              if (currentSelectedIndex >= 0) {
                  event.preventDefault();
                  event.stopPropagation();
                  hintWidget.pick();
              }
              break;
              
          case 'Escape':
              hintWidget?.close();
              break;
      }
  });

  // Автоматический показ подсказок
  editor.on('keyup', (cm, event) => {
      if (/[a-zA-Z0-9\.]/.test(event.key)) {
          setTimeout(() => {
              if (!cm.state.completionActive) {
                  cm.showHint({completeSingle: false});
              }
          }, 50);
      }
  });
}

// Функция извлечения переменных (без изменений)
function extractVariables(code) {
  const vars = new Set();
  const patterns = [
      /(?:const|let|var)\s+([a-zA-Z_]\w*)/g,
      /function\s+([a-zA-Z_]\w*)\s*\(/g,
      /class\s+([a-zA-Z_]\w*)/g
  ];

  patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
          if (match[1]) vars.add(match[1]);
      }
  });

  return Array.from(vars).map(name => ({
      text: name,
      displayText: name,
      className: "hint-variable"
  }));
}