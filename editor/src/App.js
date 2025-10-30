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
    const [viewMode, setViewMode] = useState("split"); // 'editor', 'preview', 'split'
    const [pdfUrl, setPdfUrl] = useState(null);
    
    // Theme state: 'light' or 'dark'. Persist to localStorage and prefer
    // the user's system preference when no saved preference exists.
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem("ub_theme");
            if (saved) return saved;
            const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
            return prefersDark ? "dark" : "light";
        } catch (e) {
            return "light";
        }
    });
    
    
    // handleCodeChange is passed to the editor component. It receives the
    // new text value and updates the latexCode state. We guard against
    // undefined/null by falling back to an empty string.
    const handleCodeChange = (value) => {
        setLatexCode(value || "");
    };
    // handle compilation
    const handleCompile = async () => {
        try {
            const res = await fetch("/compile/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ latex: latexCode }),
            });

            if (!res.ok) {
                const errText = await res.text();
                alert("Compilation error: server is likely down");
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob) + `#${Date.now()}`;
            // clean up old blobs
            setPdfUrl((prevUrl) => {
                if (prevUrl) URL.revokeObjectURL(prevUrl);
                return url;
            });
        } catch (err) {
            alert("Network or server error: " + err.message);
        }
    };

    // Debug: log viewMode transitions so we can trace state changes while
    // reproducing the issue in the browser console.
    useEffect(() => {
        console.log("[App] viewMode changed ->", viewMode);
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
            window.dispatchEvent(new Event("resize"));
        } catch (e) {
            // ignore in non-browser environments
        }
    }, [viewMode]);

    
    // Apply theme to document root and persist choice
    useEffect(() => {
        try {
            document.documentElement.setAttribute("data-theme", theme);
            localStorage.setItem("ub_theme", theme);
        } catch (e) {
            // ignore when not in browser
        }
    }, [theme]);


    // The UI layout is built with React.createElement calls instead of JSX.
    // To avoid layout glitches when switching modes we render both panes
    // consistently and toggle their visibility/size using explicit CSS
    // class names: 'split', 'full', or 'hidden'. This prevents frequent
    // unmount/remount of the editor which can cause Monaco/DOM layout issues.
    const editorClass =
        viewMode === "split"
            ? "split"
            : viewMode === "editor"
              ? "full"
              : "hidden";
    const previewClass =
        viewMode === "split"
            ? "split"
            : viewMode === "preview"
              ? "full"
              : "hidden";

    const editorVisible = viewMode === "split" || viewMode === "editor";
    const previewVisible = viewMode === "split" || viewMode === "preview";

    return React.createElement(
        "div",
        { className: "app" },
        React.createElement(Toolbar, {
            viewMode: viewMode,
            onViewModeChange: setViewMode,
            latexCode: latexCode,
            // add compilation handler
            onCompile: handleCompile,
            // i want the user to be able to download the pdf
            // - robby
            pdfUrl: pdfUrl,
            theme: theme,
            onToggleTheme: () =>setTheme((t) => (t === "light" ? "dark" : "light")),
        }),

        React.createElement(
            "div",
            { className: `editor-container mode-${viewMode}` },
            // Editor pane is always present but may be hidden via the
            // 'hidden' class. This keeps Monaco mounted and stable.
            React.createElement(
                "div",
                {
                    className: `editor-pane ${editorClass}`,
                },
                React.createElement(LaTeXEditor, {
                    value: latexCode,
                    onChange: handleCodeChange,
                    isVisible: editorVisible,
                    theme: theme,
                }),
            ),

            // Preview pane is always present as well; it will be hidden
            // when not in 'preview' or 'split' modes.
            React.createElement(
                "div",
                { className: `preview-pane ${previewClass}` },
                pdfUrl
                    ? React.createElement("iframe", {
                          src: pdfUrl,
                          style: {
                              width: "100%",
                              height: "100%",
                              border: "none",
                          },
                          title: "PDF Preview",
                      })
                    : React.createElement(
                          "div",
                          { className: "loading" },
                          "No PDF yet",
                      ),
            ),
        ),
    );
};

export default App;
