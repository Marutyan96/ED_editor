export function initAutoClose(editor) {
    editor.on('change', function (cm, change) {
        if (change.origin === "setValue" || change.origin === "paste") return;

        const cursor = cm.getCursor();
        const lastChar = change.text[0];

        let closingChar = '';
        switch (lastChar) {
            case '(':
                closingChar = ')';
                break;
            case '{':
                closingChar = '}';
                break;
            case '[':
                closingChar = ']';
                break;
            case '"':
                closingChar = '"';
                if (cm.getLine(cursor.line).charAt(cursor.ch) === '"') return;
                break;
            case "'":
                closingChar = "'";
                if (cm.getLine(cursor.line).charAt(cursor.ch) === "'") return;
                break;
            case '<':
                closingChar = '>';
                if (cm.getLine(cursor.line).charAt(cursor.ch) === '>') return;
                break;
            case '`':
                closingChar = '`';
                if (cm.getLine(cursor.line).charAt(cursor.ch) === '`') return;
                break;
        }

        if (closingChar) {
            cm.replaceRange(closingChar, cursor);
            cm.setCursor(cursor.line, cursor.ch);
        }
    });
}