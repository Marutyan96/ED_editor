// js/layout.js
function initLayout() {
    document.getElementById('layout-toggle').addEventListener('click', toggleLayout);
}

function toggleLayout() {
    const container = document.getElementById('container');
    const resizeHandle = document.getElementById('resizer');
    const editorPane = document.getElementById('editor');
    const outputPane = document.getElementById('output');
    
    const isVertical = container.classList.toggle('vertical');
    container.classList.toggle('horizontal', !isVertical);
    
    resizeHandle.classList.toggle('vertical', isVertical);
    resizeHandle.classList.toggle('horizontal', !isVertical);
    
    if (isVertical) {
        editorPane.parentNode.insertBefore(resizeHandle, outputPane);
        editorPane.style.width = '100%';
        editorPane.style.height = '50%';
        outputPane.style.width = '100%';
        outputPane.style.height = '50%';
        resizeHandle.style.top = '50%';
        resizeHandle.style.left = '0';
        resizeHandle.style.transform = 'translateY(-50%)';
    } else {
        container.insertBefore(resizeHandle, outputPane);
        editorPane.style.width = '50%';
        editorPane.style.height = '100%';
        outputPane.style.width = '50%';
        outputPane.style.height = '100%';
        resizeHandle.style.left = '50%';
        resizeHandle.style.top = '0';
        resizeHandle.style.transform = 'translateX(-50%)';
    }
    
    initResize(); // Reinitialize resizer logic
}

initLayout();