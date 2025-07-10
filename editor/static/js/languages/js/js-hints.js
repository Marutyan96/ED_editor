// static/js/languages/js-hints.js
export function initHints(editor) {
    const jsCompletions = new Map([
        ['break', { text: 'break', displayText: 'break', className: 'hint-keyword' }],
        ['case', { text: 'case', displayText: 'case', className: 'hint-keyword' }],
        ['catch', { text: 'catch', displayText: 'catch', className: 'hint-keyword' }],
        ['class', { text: 'class', displayText: 'class', className: 'hint-keyword' }],
        ['const', { text: 'const', displayText: 'const', className: 'hint-keyword' }],
        ['continue', { text: 'continue', displayText: 'continue', className: 'hint-keyword' }],
        ['delete', { text: 'delete', displayText: 'delete', className: 'hint-keyword' }],
        ['do', { text: 'do', displayText: 'do', className: 'hint-keyword' }],
        ['else', { text: 'else', displayText: 'else', className: 'hint-keyword' }],
        ['export', { text: 'export', displayText: 'export', className: 'hint-keyword' }],
        ['extends', { text: 'extends', displayText: 'extends', className: 'hint-keyword' }],
        ['for', { text: 'for', displayText: 'for', className: 'hint-keyword' }],
        ['function', { text: 'function', displayText: 'function', className: 'hint-keyword' }],
        ['if', { text: 'if', displayText: 'if', className: 'hint-keyword' }],
        ['import', { text: 'import', displayText: 'import', className: 'hint-keyword' }],
        ['in', { text: 'in', displayText: 'in', className: 'hint-keyword' }],
        ['instanceof', { text: 'instanceof', displayText: 'instanceof', className: 'hint-keyword' }],
        ['let', { text: 'let', displayText: 'let', className: 'hint-keyword' }],
        ['new', { text: 'new', displayText: 'new', className: 'hint-keyword' }],
        ['return', { text: 'return', displayText: 'return', className: 'hint-keyword' }],
        ['super', { text: 'super', displayText: 'super', className: 'hint-keyword' }],
        ['switch', { text: 'switch', displayText: 'switch', className: 'hint-keyword' }],
        ['this', { text: 'this', displayText: 'this', className: 'hint-keyword' }],
        ['throw', { text: 'throw', displayText: 'throw', className: 'hint-keyword' }],
        ['try', { text: 'try', displayText: 'try', className: 'hint-keyword' }],
        ['typeof', { text: 'typeof', displayText: 'typeof', className: 'hint-keyword' }],
        ['var', { text: 'var', displayText: 'var', className: 'hint-keyword' }],
        ['void', { text: 'void', displayText: 'void', className: 'hint-keyword' }],
        ['while', { text: 'while', displayText: 'while', className: 'hint-keyword' }],
        ['with', { text: 'with', displayText: 'with', className: 'hint-keyword' }],
        ['yield', { text: 'yield', displayText: 'yield', className: 'hint-keyword' }],
        ['Array', { text: 'Array', displayText: 'Array', className: 'hint-builtin' }],
        ['Boolean', { text: 'Boolean', displayText: 'Boolean', className: 'hint-builtin' }],
        ['console', { text: 'console', displayText: 'console', className: 'hint-builtin' }],
        ['Date', { text: 'Date', displayText: 'Date', className: 'hint-builtin' }],
        ['Error', { text: 'Error', displayText: 'Error', className: 'hint-builtin' }],
        ['JSON', { text: 'JSON', displayText: 'JSON', className: 'hint-builtin' }],
        ['Math', { text: 'Math', displayText: 'Math', className: 'hint-builtin' }],
        ['Number', { text: 'Number', displayText: 'Number', className: 'hint-builtin' }],
        ['Object', { text: 'Object', displayText: 'Object', className: 'hint-builtin' }],
        ['Promise', { text: 'Promise', displayText: 'Promise', className: 'hint-builtin' }],
        ['Set', { text: 'Set', displayText: 'Set', className: 'hint-builtin' }],
        ['String', { text: 'String', displayText: 'String', className: 'hint-builtin' }],
    ]);
const builtins = new Map([
  ['console', [
    { text: 'log', displayText: 'log()', className: 'hint-method' },
    { text: 'warn', displayText: 'warn()', className: 'hint-method' },
    { text: 'info', displayText: 'info()', className: 'hint-method' },
    { text: 'error', displayText: 'error()', className: 'hint-method' }
  ]],
  ['Math', [
    { text: 'abs', displayText: 'abs()', className: 'hint-method' },
    { text: 'floor', displayText: 'floor()', className: 'hint-method' },
    { text: 'ceil', displayText: 'ceil()', className: 'hint-method' },
    { text: 'round', displayText: 'round()', className: 'hint-method' },
    { text: 'max', displayText: 'max()', className: 'hint-method' },
    { text: 'min', displayText: 'min()', className: 'hint-method' },
    { text: 'random', displayText: 'random()', className: 'hint-method' }
  ]],
    ['JSON', [
    { text: 'parse', displayText: 'parse()', className: 'hint-method' },
    { text: 'stringify', displayText: 'stringify()', className: 'hint-method' }
  ]],
  ['Array', [
    { text: 'push', displayText: 'push()', className: 'hint-method' },
    { text: 'pop', displayText: 'pop()', className: 'hint-method' },
    { text: 'slice', displayText: 'slice()', className: 'hint-method' },
    { text: 'splice', displayText: 'splice()', className: 'hint-method' },
    { text: 'map', displayText: 'map()', className: 'hint-method' },
    { text: 'filter', displayText: 'filter()', className: 'hint-method' },
    { text: 'reduce', displayText: 'reduce()', className: 'hint-method' }
  ]],
    ['Date', [
    { text: 'now', displayText: 'now()', className: 'hint-method' },
    { text: 'parse', displayText: 'parse()', className: 'hint-method' },
    { text: 'UTC', displayText: 'UTC()', className: 'hint-method' },
    { text: 'toString', displayText: 'toString()', className: 'hint-method' }
  ]],
]);


    let currentSelectedIndex = -1;
    let hintWidget = null;

    // Функция для извлечения переменных из кода
    function extractVariables(code) {
        const variablePattern = /(?:\b(?:var|let|const|function|class)\s+)([a-zA-Z_$][\w$]*)/g;
        const variables = new Set();
        let match;
        
        // Извлекаем объявленные переменные
        while ((match = variablePattern.exec(code)) !== null) {
            variables.add(match[1]);
        }

        // Извлекаем параметры функций
        const functionPattern = /function\s*[^(]*\(([^)]*)\)/g;
        while ((match = functionPattern.exec(code)) !== null) {
            match[1].split(',').forEach(param => {
                const trimmed = param.trim();
                if (trimmed) variables.add(trimmed);
            });
        }

        return Array.from(variables).map(name => ({
            text: name,
            displayText: name,
            className: 'hint-variable'
        }));
    }
function getHints(cm) {
  const cursor = cm.getCursor();
  const token = cm.getTokenAt(cursor);
  const currentWord = token.string.trim().toLowerCase();

  if (!currentWord || currentWord.length < 1) return null;

  if (token.type === 'property') {
    const objectToken = cm.getTokenAt(CodeMirror.Pos(cursor.line, token.start - 1));
    const objectName = objectToken.string.trim();

    if (objectName) {
      const objectHints = getObjectProperties(objectName);
      const filtered = objectHints.filter(hint => hint.text.toLowerCase().startsWith(currentWord));
      if (filtered.length > 0) {
        return {
          list: filtered,
          from: CodeMirror.Pos(cursor.line, token.start),
          to: CodeMirror.Pos(cursor.line, token.end)
        };
      }
    }
  } else {
    const allHints = [
      ...jsCompletions.values(),
      ...extractVariables(cm.getValue())
    ].filter(hint => hint.text.toLowerCase().startsWith(currentWord));
    
    if (allHints.length > 0) {
      return {
        list: allHints,
        from: CodeMirror.Pos(cursor.line, token.start),
        to: CodeMirror.Pos(cursor.line, token.end)
      };
    }
  }
  return null;
}




    function getObjectProperties(objectName) {
        return builtins.get(objectName) || [];
    }

    // Настройка параметров подсказок
    editor.setOption('hintOptions', {
        hint: getHints,
        completeSingle: false,
        closeOnPick: true,
        alignWithWord: true
    });

    // Обработчики событий
    editor.on('startCompletion', cm => {
        hintWidget = cm.state.completionActive?.widget || null;
        currentSelectedIndex = -1;
    });

    editor.on('endCompletion', () => {
        hintWidget = null;
        currentSelectedIndex = -1;
    });

    const validTriggers = new Set(['.', '(']);
    const ignoredKeys = new Set(['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape', 'Shift']);
    let timeoutId;

    editor.on('keyup', (cm, event) => {
        if (event.ctrlKey || event.altKey || event.metaKey || ignoredKeys.has(event.key)) {
            return;
        }

        const cursor = cm.getCursor();
        const token = cm.getTokenAt(cursor);

        if (/[a-zA-Z_]/.test(event.key) ||
            (event.key === '.' && token.type !== 'number') ||
            (event.key === '(' && token.string.endsWith('('))) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (!cm.state.completionActive) {
                    cm.showHint({
                        completeSingle: false,
                        container: document.getElementById('hints-container') || null,
                        hint: getHints
                    });
                }
            }, 200);
        }
    });

    editor.on('keydown', (cm, event) => {
        if (!hintWidget?.list?.length) return;

        const handleNavigation = direction => {
            event.preventDefault();
            currentSelectedIndex = Math.max(0, Math.min(hintWidget.list.length - 1, currentSelectedIndex + direction));
            hintWidget.changeActive(currentSelectedIndex);
            const selectedElement = hintWidget.listElement?.children[currentSelectedIndex];
            selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        };

        switch (event.key) {
            case 'ArrowUp': handleNavigation(-1); break;
            case 'ArrowDown': handleNavigation(1); break;
            case 'Enter':
            case 'Tab':
                if (currentSelectedIndex >= 0) {
                    event.preventDefault();
                    hintWidget.pick();
                }
                break;
            case 'Escape':
                hintWidget.close();
                break;
        }
    });
}