
function extractVariableNames(code) {
    const variableNames = new Set();
    const lines = code.split('\n');
    const variableRegex = /^\s*([a-zA-Z_]\w*)\s*=|^def\s+([a-zA-Z_]\w*)\s*\(|^class\s+([a-zA-Z_]\w*)/;

    lines.forEach(line => {
        const match = line.match(variableRegex);
        if (match) {
            const variable = match[1] || match[2] || match[3];
            if (variable) variableNames.add(variable);
        }
    });
    return Array.from(variableNames);
}

function pythonHint(cm) {
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);
    const word = token.string.toLowerCase();

    const hints = [
// Встроенные функции
{text: "True", displayText: "True", className: "hint-boolean"},
{text: "False", displayText: "False", className: "hint-boolean"},
{text: "input", displayText: "input", className: "hint-input"},
{text: "len", displayText: "len", className: "hint-len"},
{text: "range", displayText: "range", className: "hint-range"},
{text: "print", displayText: "print", className: "hint-print"},
{text: "str", displayText: "str", className: "hint-str"},
{text: "class", displayText: "class", className: "hint-class"},
{text: "def", displayText: "def", className: "hint-def"},
{text: "for", displayText: "for", className: "hint-for"},
{text: "if", displayText: "if", className: "hint-if"},
{text: "else", displayText: "else", className: "hint-else"},
{text: "elif", displayText: "elif", className: "hint-elif"},
{text: "return", displayText: "return", className: "hint-return"},
{text: "import", displayText: "import", className: "hint-import"},
{text: "from", displayText: "from", className: "hint-from"},
{text: "try", displayText: "try", className: "hint-try"},
{text: "except", displayText: "except", className: "hint-except"},
{text: "with", displayText: "with", className: "hint-with"},
{text: "map", displayText: "map", className: "hint-map"},
{text: "filter", displayText: "filter", className: "hint-filter"},
{text: "reduce", displayText: "reduce", className: "hint-reduce"},

// Типы данных
{text: "type", displayText: "type", className: "hint-type"},
{text: "list", displayText: "list", className: "hint-list"},
{text: "dict", displayText: "dict", className: "hint-dict"},
{text: "set", displayText: "set", className: "hint-set"},
{text: "tuple", displayText: "tuple", className: "hint-tuple"},
{text: "zip", displayText: "zip", className: "hint-zip"},
{text: "enumerate", displayText: "enumerate", className: "hint-enumerate"},
{text: "sorted", displayText: "sorted", className: "hint-sorted"},
{text: "sum", displayText: "sum", className: "hint-sum"},
{text: "any", displayText: "any", className: "hint-any"},
{text: "all", displayText: "all", className: "hint-all"},
{text: "int", displayText: "int", className: "hint-int"},
{text: "float", displayText: "float", className: "hint-float"},
{text: "max", displayText: "max", className: "hint-max"},
{text: "min", displayText: "min", className: "hint-min"},
{text: "abs", displayText: "abs", className: "hint-abs"},
{text: "round", displayText: "round", className: "hint-round"},
{text: "pow", displayText: "pow", className: "hint-pow"},
{text: "eval", displayText: "eval", className: "hint-eval"},
{text: "exec", displayText: "exec", className: "hint-exec"},
{text: "help", displayText: "help", className: "hint-help"},
{text: "id", displayText: "id", className: "hint-id"},
{text: "reversed", displayText: "reversed", className: "hint-reversed"},
{text: "callable", displayText: "callable", className: "hint-callable"},
{text: "isinstance", displayText: "isinstance", className: "hint-isinstance"},
{text: "issubclass", displayText: "issubclass", className: "hint-issubclass"},
{text: "dir", displayText: "dir", className: "hint-dir"},
{text: "vars", displayText: "vars", className: "hint-vars"},
{text: "globals", displayText: "globals", className: "hint-globals"},
{text: "locals", displayText: "locals", className: "hint-locals"},



// Работа с файлами
{text: "open", displayText: "open", className: "hint-open"},

// Методы списков
{text: "append", displayText: "append", className: "hint-append"},
{text: "pop", displayText: "pop", className: "hint-pop"},
{text: "remove", displayText: "remove", className: "hint-remove"},
{text: "extend", displayText: "extend", className: "hint-extend"},
{text: "insert", displayText: "insert", className: "hint-insert"},
{text: "sort", displayText: "sort", className: "hint-sort"},

// Методы строк
{text: "join", displayText: "join", className: "hint-join"},
{text: "split", displayText: "split", className: "hint-split"},
{text: "strip", displayText: "strip", className: "hint-strip"},
{text: "replace", displayText: "replace", className: "hint-replace"},
{text: "find", displayText: "find", className: "hint-find"},
{text: "format", displayText: "format", className: "hint-format"},

// Методы словарей
{text: "get", displayText: "get", className: "hint-get"},
{text: "keys", displayText: "keys", className: "hint-keys"},
{text: "values", displayText: "values", className: "hint-values"},
{text: "items", displayText: "items", className: "hint-items"},

// Методы множеств
{text: "add", displayText: "add", className: "hint-add"},
{text: "remove", displayText: "remove", className: "hint-remove"},
{text: "union", displayText: "union", className: "hint-union"},
{text: "intersection", displayText: "intersection", className: "hint-intersection"},


    ];

    const code = cm.getValue();
    const variableNames = extractVariableNames(code);
    variableNames.forEach(variable => {
        hints.push({ text: variable, displayText: variable, className: "hint-variable" });
    });

    const filteredHints = hints.filter(hint => hint.text.toLowerCase().startsWith(word));

    if (filteredHints.length === 0) {
        return { list: [], from: cursor, to: cursor };
    }

    return {
        list: filteredHints,
        from: CodeMirror.Pos(cursor.line, token.start),
        to: CodeMirror.Pos(cursor.line, cursor.ch)
    };
}

export function initHints(editor) {
    CodeMirror.registerHelper("hint", "python", pythonHint);

    // Добавляем автоматический вызов автодополнения
    editor.on("inputRead", (cm, change) => {
        if (change.text[0].match(/[a-zA-Z_]/)) {
            CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
        }
    });
}

 