// Import all our components (they're attached to window object)
// These files attach their components to the window object

// Load components in order
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Function to initialize the app
const initializeApp = async () => {
    try {
        // Load all component scripts
        await loadScript('./src/Toolbar.js');
        await loadScript('./src/LaTeXEditor.js');
        await loadScript('./src/PreviewPane.js');
        await loadScript('./src/App.js');

        // Wait for React to be available
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(window.App));
        } else {
            console.error('React or ReactDOM not loaded');
        }
    } catch (error) {
        console.error('Error loading app:', error);
        document.getElementById('root').innerHTML = `
            <div style="padding: 20px; text-align: center; color: red;">
                <h2>Error Loading Editor</h2>
                <p>There was an error loading the LaTeX editor. Please check the console for details.</p>
            </div>
        `;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}