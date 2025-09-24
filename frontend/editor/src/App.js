// Pull React hooks off the global React object. This file assumes React is
// available globally (e.g. via a <script> tag or bundler that provides it).
const { useState, useEffect } = React;

// Main application component. This is a small, non-JSX React component that
// uses React.createElement to build the UI. It wires together three pieces:
// - Toolbar: lets the user switch view modes and perform actions
// - LaTeXEditor: an editor component for editing LaTeX source
// - PreviewPane: renders the LaTeX source as HTML or a preview
const App = () => {
    // latexCode holds the current LaTeX source the user is editing. We
    // initialize it with a small sample document so the preview shows
    // something on first load.
    const [latexCode, setLatexCode] = useState(`\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\title{My LaTeX Document}
\\author{Author Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
This is a sample LaTeX document. You can edit this text in the editor.

\\section{Mathematical Equations}
Here's a mathematical equation:
\\begin{equation}
E = mc^2
\\end{equation}

And an inline equation: $\\alpha + \\beta = \\gamma$

\\subsection{More Examples}
\\begin{itemize}
\\item First item
\\item Second item
\\item Third item
\\end{itemize}

\\end{document}`);

    // viewMode controls which panes are visible. Possible values:
    // - 'editor'  -> only the editor is shown
    // - 'preview' -> only the preview is shown
    // - 'split'   -> both are shown side-by-side
    const [viewMode, setViewMode] = useState('split'); // 'editor', 'preview', 'split'

    // handleCodeChange is passed to the editor component. It receives the
    // new text value and updates the latexCode state. We guard against
    // undefined/null by falling back to an empty string.
    const handleCodeChange = (value) => {
        setLatexCode(value || '');
    };

    // Debug: log viewMode transitions so we can trace state changes while
    // reproducing the issue in the browser console.
    useEffect(() => {
        console.log('[App] viewMode changed ->', viewMode);
        // Also update the document title so the current mode is visible
        // in the browser tab (easy to spot without opening devtools).
        try {
            document.title = `LaTeX Editor — ${viewMode}`;
        } catch (e) {
            // ignore (server side or non-browser env)
        }
        // Trigger a resize event to nudge layout systems (Monaco, CSS)
        // to recompute sizes when the view mode changes.
        try {
            window.dispatchEvent(new Event('resize'));
        } catch (e) {
            // ignore in non-browser environments
        }
    }, [viewMode]);

    // The UI layout is built with React.createElement calls instead of JSX.
    // To avoid layout glitches when switching modes we render both panes
    // consistently and toggle their visibility/size using explicit CSS
    // class names: 'split', 'full', or 'hidden'. This prevents frequent
    // unmount/remount of the editor which can cause Monaco/DOM layout issues.
    const editorClass = viewMode === 'split' ? 'split' : (viewMode === 'editor' ? 'full' : 'hidden');
    const previewClass = viewMode === 'split' ? 'split' : (viewMode === 'preview' ? 'full' : 'hidden');

    const editorVisible = viewMode === 'split' || viewMode === 'editor';
    const previewVisible = viewMode === 'split' || viewMode === 'preview';

    return React.createElement('div', { className: 'app' },
        React.createElement(Toolbar, {
            viewMode: viewMode,
            onViewModeChange: setViewMode,
            latexCode: latexCode
        }),

        React.createElement('div', { className: `editor-container mode-${viewMode}` },
            // Editor pane is always present but may be hidden via the
            // 'hidden' class. This keeps Monaco mounted and stable.
            React.createElement('div', {
                className: `editor-pane ${editorClass}`
            },
                React.createElement(LaTeXEditor, {
                    value: latexCode,
                    onChange: handleCodeChange,
                    isVisible: editorVisible
                })
            ),

            // Preview pane is always present as well; it will be hidden
            // when not in 'preview' or 'split' modes.
            React.createElement('div', {
                className: `preview-pane ${previewClass}`
            },
                React.createElement(PreviewPane, {
                    latexCode: latexCode
                })
            )
        )
    );
};

export default App;