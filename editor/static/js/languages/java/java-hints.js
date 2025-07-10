export function initJavaHints(editor) {
    const javaCompletions = {
        keywords: [
            'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch',
            'char', 'class', 'const', 'continue', 'default', 'do', 'double',
            'else', 'enum', 'extends', 'final', 'finally', 'float', 'for',
            'goto', 'if', 'implements', 'import', 'instanceof', 'int',
            'interface', 'long', 'native', 'new', 'package', 'private',
            'protected', 'public', 'return', 'short', 'static', 'strictfp',
            'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
            'transient', 'try', 'void', 'volatile', 'while', 'var'
        ],
        builtins : {
            'System': ['out.println', 'out.print', 'err.println', 'currentTimeMillis', 'gc', 'exit'],
            'Math': ['abs', 'ceil', 'floor', 'round', 'random', 'sqrt', 'pow', 'max', 'min'],
            'String': [
                'length', 'charAt', 'substring', 'equals', 'equalsIgnoreCase', 'contains',
                'startsWith', 'endsWith', 'indexOf', 'lastIndexOf', 'toUpperCase', 'toLowerCase', 'trim', 'split'
            ],
            'Arrays': ['sort', 'toString', 'asList', 'copyOf', 'copyOfRange', 'binarySearch'],
            'Collections': ['sort', 'reverse', 'shuffle', 'max', 'min', 'singletonList'],
            'List': ['add', 'remove', 'get', 'set', 'size', 'isEmpty', 'contains'],
            'ArrayList': ['add', 'remove', 'get', 'set', 'clear', 'size', 'isEmpty'],
            'HashMap': ['put', 'get', 'remove', 'containsKey', 'containsValue', 'size', 'isEmpty'],
            'BufferedReader': ['readLine', 'close'],
            'Scanner': ['next', 'nextLine', 'nextInt', 'hasNext', 'close']
        },
        templates: [
            {
                text: 'public static void main(String[] args) {\n    ${cursor}\n}',
                displayText: 'main method'
            },
            {
                text: 'public class ${ClassName} {\n    ${cursor}\n}',
                displayText: 'class template'
            },
            {
                text: 'for (int i = 0; i < ${array}.length; i++) {\n    ${cursor}\n}',
                displayText: 'for loop'
            },
            {
                text: 'try {\n    ${cursor}\n} catch (Exception e) {\n    e.printStackTrace();\n}',
                displayText: 'try-catch block'
            },
            {
                text: 'Scanner sc = new Scanner(System.in);',
                displayText: 'Scanner input'
            },
            {
                text: 'ArrayList<${Type}> list = new ArrayList<>();',
                displayText: 'ArrayList declaration'
            },
            {
                text: 'HashMap<${Key}, ${Value}> map = new HashMap<>();',
                displayText: 'HashMap declaration'
            }
        ]
    };

    // Собираем подсказки (ключевые слова и шаблоны)
    const staticHints = [
        ...javaCompletions.keywords.map(kw => ({
            text: kw,
            displayText: kw,
            className: 'hint-keyword'
        })),
        ...Object.keys(javaCompletions.builtins).map(name => ({
            text: name,
            displayText: name,
            className: 'hint-builtin'
        })),
        ...javaCompletions.templates.map(tpl => ({
            text: tpl.text,
            displayText: tpl.displayText,
            className: 'hint-template'
        }))
    ];

    function getStaticHints(currentWord) {
        if (!currentWord) return staticHints;

        return staticHints.filter(hint =>
            hint.displayText.toLowerCase().startsWith(currentWord.toLowerCase())
        );
    }

    function getObjectMethodHints(objectName, currentWord) {
        const methods = javaCompletions.builtins[objectName] || [];
        return methods
            .filter(m => m.toLowerCase().startsWith(currentWord.toLowerCase()))
            .map(method => ({
                text: method,
                displayText: method,
                className: 'hint-method'
            }));
    }

function getHints(cm) {
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor) || { start: cursor.ch, string: '' };
    const currentWord = token.string;
    const line = cm.getLine(cursor.line);
    const beforeCursor = line.slice(0, cursor.ch);

    const match = beforeCursor.match(/(\w+)\.(\w*)$/); // Math.ra или System.out.pr

    if (match) {
        const [, objectName, methodPrefix] = match;
        const hints = getObjectMethodHints(objectName, methodPrefix);

        const dotIndex = beforeCursor.lastIndexOf('.');
        return {
            list: hints,
            from: CodeMirror.Pos(cursor.line, dotIndex + 1),
            to: CodeMirror.Pos(cursor.line, cursor.ch)
        };
    }

    const hints = getStaticHints(currentWord);
    return {
        list: hints,
        from: CodeMirror.Pos(cursor.line, token.start),
        to: CodeMirror.Pos(cursor.line, cursor.ch)
    };
}


    // Поддержка автозапуска
    editor.on("change", (cm, change) => {
        if (change.origin === "+input") {
            CodeMirror.showHint(cm, getHints, {
                completeSingle: false,
                alignWithWord: true,
                closeOnPick: true,
                completeOnTab: true
            });
        }
    });
}
