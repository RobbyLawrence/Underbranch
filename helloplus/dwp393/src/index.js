import Toolbar from './Toolbar.js';
import LaTeXEditor from './LaTeXEditor.js';
import PreviewPane from './PreviewPane.js';
import App from './App.js';

// Make components available globally for backward compatibility
window.Toolbar = Toolbar;
window.LaTeXEditor = LaTeXEditor;
window.PreviewPane = PreviewPane;
window.App = App;

// Function to initialize the app
const initializeApp = () => {
    try {
        // Wait for React to be available
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(App));
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