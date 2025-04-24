// static/js/html-runner.js
export function runCode(code) {
    const output = document.getElementById('result');
    output.innerHTML = '';
    
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
    `;
    output.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>body { margin: 0; padding: 10px; }</style>
        </head>
        <body>${code}</body>
        </html>
    `);
    iframeDoc.close();
}