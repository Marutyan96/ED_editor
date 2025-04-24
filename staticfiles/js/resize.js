// js/resize.js
function initResize() {
    const resizeHandle = document.getElementById('resizer');
    const container = document.getElementById('container');
    const editorPane = document.getElementById('editor');
    const outputPane = document.getElementById('output');
    
    let isDragging = false;
    let startPos = 0;
    let startEditorSize = 0;

    const startDrag = (e) => {
        isDragging = true;
        startPos = container.classList.contains('vertical') ? e.clientY : e.clientX;
        startEditorSize = container.classList.contains('vertical') 
            ? editorPane.offsetHeight 
            : editorPane.offsetWidth;
        document.body.style.cursor = container.classList.contains('vertical') 
            ? 'row-resize' 
            : 'col-resize';
        e.preventDefault();
    };

    const drag = (e) => {
        if (!isDragging) return;
        
        const currentPos = container.classList.contains('vertical') ? e.clientY : e.clientX;
        const delta = currentPos - startPos;
        const containerSize = container.classList.contains('vertical') 
            ? container.offsetHeight 
            : container.offsetWidth;
        const newEditorSize = startEditorSize + delta;
        const percent = (newEditorSize / containerSize) * 100;
        // Allow dragging to the edges with a small minimum (e.g., 5%)
        const constrainedPercent = Math.max(5, Math.min(95, percent));

        if (container.classList.contains('vertical')) {
            editorPane.style.height = `${constrainedPercent}%`;
            outputPane.style.height = `${100 - constrainedPercent}%`;
            resizeHandle.style.top = `${constrainedPercent}%`;
            resizeHandle.style.transform = 'translateY(-50%)';
            editorPane.style.width = '100%';
            outputPane.style.width = '100%';
        } else {
            editorPane.style.width = `${constrainedPercent}%`;
            outputPane.style.width = `${100 - constrainedPercent}%`;
            resizeHandle.style.left = `${constrainedPercent}%`;
            resizeHandle.style.transform = 'translateX(-50%)';
            editorPane.style.height = '100%';
            outputPane.style.height = '100%';
        }
    };

    const stopDrag = () => {
        isDragging = false;
        document.body.style.cursor = '';
    };

    // Remove old listeners to prevent stacking
    resizeHandle.removeEventListener('mousedown', startDrag);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);

    // Add event listeners
    resizeHandle.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    // Initial setup
    if (container.classList.contains('vertical')) {
        editorPane.style.width = '100%';
        editorPane.style.height = '50%';
        outputPane.style.width = '100%';
        outputPane.style.height = '50%';
        resizeHandle.style.top = '50%';
        resizeHandle.style.transform = 'translateY(-50%)';
    } else {
        editorPane.style.width = '50%';
        editorPane.style.height = '100%';
        outputPane.style.width = '50%';
        outputPane.style.height = '100%';
        resizeHandle.style.left = '50%';
        resizeHandle.style.transform = 'translateX(-50%)';
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initResize);