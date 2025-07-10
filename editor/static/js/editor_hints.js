function extractVariableNames(code) {
    const variableNames = new Set();
    const lines = code.split('\n');

    const assignmentRegex = /^\s*([a-zA-Z_]\w*)\s*=/;
    const defRegex = /^\s*def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/;
    const classRegex = /^\s*class\s+([a-zA-Z_]\w*)/;

    lines.forEach(line => {
        let match;

        // assignment
        match = line.match(assignmentRegex);
        if (match) variableNames.add(match[1]);

        // def + args
        match = line.match(defRegex);
        if (match) {
            variableNames.add(match[1]);
            match[2].split(',').forEach(arg => {
                const argName = arg.trim().split('=')[0].trim();
                if (argName.match(/^[a-zA-Z_]\w*$/)) variableNames.add(argName);
            });
        }

        // class
        match = line.match(classRegex);
        if (match) variableNames.add(match[1]);
    });

    return Array.from(variableNames);
}

function pythonHint(cm) {
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);
    const word = token.string.toLowerCase();

    // --- Группировки ---

    const keywords = [
        "class", "def", "for", "if", "else", "elif", "while", "try", "except", "finally",
        "with", "async", "await", "return", "yield", "import", "from", "as", "pass", "break",
        "continue", "in", "is", "not", "and", "or", "lambda", "global", "nonlocal", "assert", "del", "raise"
    ].map(word => ({ text: word, displayText: word, className: "hint-keyword" }));

    const builtins = [
        "print", "input", "len", "range", "str", "int", "float", "bool", "type",
        "list", "dict", "set", "tuple", "map", "filter", "reduce", "zip", "enumerate",
        "sorted", "sum", "max", "min", "abs", "round", "pow", "eval", "exec", "id",
        "reversed", "callable", "isinstance", "issubclass", "dir", "vars", "globals",
        "locals", "open", "help", "all", "any", "time", "sleep", "asyncio"
    ].map(fn => ({ text: fn, displayText: fn, className: "hint-builtin" }));

    const methods = [
        "append", "pop", "remove", "extend", "insert", "sort", "reverse",
        "join", "split", "strip", "replace", "find", "format", "upper", "lower",
        "get", "keys", "values", "items", "update", "clear",
        "add", "discard", "union", "intersection", "difference"
    ].map(fn => ({ text: fn, displayText: fn, className: "hint-method" }));

    const literals = [
        { text: "True", displayText: "True", className: "hint-keyword" },
        { text: "False", displayText: "False", className: "hint-keyword" },
        { text: "None", displayText: "None", className: "hint-keyword" }
    ];

    // --- Динамические переменные ---
    const code = cm.getValue();
    const variableNames = extractVariableNames(code);
    const dynamicHints = variableNames.map(variable => ({
        text: variable,
        displayText: variable,
        className: "hint-variable"
    }));

    // --- Общий список ---
    const allHints = [
        ...keywords,
        ...builtins,
        ...methods,
        ...literals,
        ...dynamicHints
    ];

    const filteredHints = allHints.filter(hint =>
        hint.text.toLowerCase().startsWith(word)
    );

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

    editor.on("inputRead", (cm, change) => {
        if (change.text[0].match(/[a-zA-Z_]/)) {
            CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
        }
    });
}
