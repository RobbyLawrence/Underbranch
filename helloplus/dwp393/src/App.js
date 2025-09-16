const { useState, useEffect } = React;

const App = () => {
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

    const [viewMode, setViewMode] = useState('split'); // 'editor', 'preview', 'split'

    const handleCodeChange = (value) => {
        setLatexCode(value || '');
    };

    return React.createElement('div', { className: 'app' },
        React.createElement(Toolbar, {
            viewMode: viewMode,
            onViewModeChange: setViewMode,
            latexCode: latexCode
        }),
        React.createElement('div', { className: 'editor-container' },
            (viewMode === 'editor' || viewMode === 'split') &&
                React.createElement('div', {
                    className: `editor-pane ${viewMode === 'split' ? 'split' : 'full'}`
                },
                    React.createElement(LaTeXEditor, {
                        value: latexCode,
                        onChange: handleCodeChange
                    })
                ),
            (viewMode === 'preview' || viewMode === 'split') &&
                React.createElement('div', {
                    className: `preview-pane ${viewMode === 'split' ? 'split' : 'full'}`
                },
                    React.createElement(PreviewPane, {
                        latexCode: latexCode
                    })
                )
        )
    );
};

export default App;