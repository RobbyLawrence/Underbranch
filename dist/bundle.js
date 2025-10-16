/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/App.js":
/*!********************!*\
  !*** ./src/App.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Pull React hooks off the global React object. This file assumes React is
// available globally (e.g. via a <script> tag or bundler that provides it).
const {
  useState,
  useEffect
} = React;

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
  const handleCodeChange = value => {
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
  const editorClass = viewMode === 'split' ? 'split' : viewMode === 'editor' ? 'full' : 'hidden';
  const previewClass = viewMode === 'split' ? 'split' : viewMode === 'preview' ? 'full' : 'hidden';
  const editorVisible = viewMode === 'split' || viewMode === 'editor';
  const previewVisible = viewMode === 'split' || viewMode === 'preview';
  return React.createElement('div', {
    className: 'app'
  }, React.createElement(Toolbar, {
    viewMode: viewMode,
    onViewModeChange: setViewMode,
    latexCode: latexCode
  }), React.createElement('div', {
    className: `editor-container mode-${viewMode}`
  },
  // Editor pane is always present but may be hidden via the
  // 'hidden' class. This keeps Monaco mounted and stable.
  React.createElement('div', {
    className: `editor-pane ${editorClass}`
  }, React.createElement(LaTeXEditor, {
    value: latexCode,
    onChange: handleCodeChange,
    isVisible: editorVisible
  })),
  // Preview pane is always present as well; it will be hidden
  // when not in 'preview' or 'split' modes.
  React.createElement('div', {
    className: `preview-pane ${previewClass}`
  }, React.createElement(PreviewPane, {
    latexCode: latexCode
  }))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);

/***/ }),

/***/ "./src/LaTeXEditor.js":
/*!****************************!*\
  !*** ./src/LaTeXEditor.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const {
  useEffect,
  useRef
} = React;
const LaTeXEditor = ({
  value,
  onChange,
  isVisible = true
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const layoutTimeout = useRef(null);
  useEffect(() => {
    // Initialize Monaco Editor
    if (window.require && !monacoRef.current) {
      window.require.config({
        paths: {
          vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs"
        }
      });
      window.require(["vs/editor/editor.main"], () => {
        if (editorRef.current && !monacoRef.current) {
          // Configure LaTeX language (basic syntax highlighting)
          monaco.languages.register({
            id: "latex"
          });
          monaco.languages.setMonarchTokensProvider("latex", {
            tokenizer: {
              root: [[/\\[a-zA-Z@]+/, "keyword"], [/\\begin\{[^}]+\}/, "keyword"], [/\\end\{[^}]+\}/, "keyword"], [/\$.*?\$/, "string"], [/\\\(.*?\\\)/, "string"], [/\\\[.*?\\\]/, "string"], [/%.*$/, "comment"], [/\{/, "bracket"], [/\}/, "bracket"]]
            }
          });

          // Register completion provider for LaTeX commands starting with backslash
          monaco.languages.registerCompletionItemProvider("latex", {
            triggerCharacters: ["\\"],
            provideCompletionItems: (model, position) => {
              const lineContent = model.getLineContent(position.lineNumber);
              const textBeforeCursor = lineContent.substring(0, position.column - 1);

              // Check if we're typing after a backslash
              const commandMatch = textBeforeCursor.match(/\\([a-zA-Z]*)$/);
              if (commandMatch) {
                const partialCommand = commandMatch[1];

                // LaTeX commands that need curly braces
                const commandsWithBraces = [{
                  command: "begin",
                  insertText: "begin{$0}",
                  documentation: "Begin environment"
                }, {
                  command: "end",
                  insertText: "end{$0}",
                  documentation: "End environment"
                }, {
                  command: "textbf",
                  insertText: "textbf{$0}",
                  documentation: "Bold text"
                }, {
                  command: "textit",
                  insertText: "textit{$0}",
                  documentation: "Italic text"
                }, {
                  command: "underline",
                  insertText: "underline{$0}",
                  documentation: "Underline text"
                }, {
                  command: "section",
                  insertText: "section{$0}",
                  documentation: "Section"
                }, {
                  command: "subsection",
                  insertText: "subsection{$0}",
                  documentation: "Subsection"
                }, {
                  command: "subsubsection",
                  insertText: "subsubsection{$0}",
                  documentation: "Subsubsection"
                }, {
                  command: "chapter",
                  insertText: "chapter{$0}",
                  documentation: "Chapter"
                }, {
                  command: "title",
                  insertText: "title{$0}",
                  documentation: "Document title"
                }, {
                  command: "author",
                  insertText: "author{$0}",
                  documentation: "Document author"
                }, {
                  command: "date",
                  insertText: "date{$0}",
                  documentation: "Document date"
                }, {
                  command: "emph",
                  insertText: "emph{$0}",
                  documentation: "Emphasize text"
                }, {
                  command: "frac",
                  insertText: "frac{$1}{$2}",
                  documentation: "Fraction"
                }, {
                  command: "sqrt",
                  insertText: "sqrt{$0}",
                  documentation: "Square root"
                }];

                // Filter commands that match the partial input
                const suggestions = commandsWithBraces.filter(cmd => cmd.command.startsWith(partialCommand)).map(cmd => {
                  const completionItem = {
                    label: cmd.command,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: cmd.insertText,
                    insertTextFormat: monaco.languages.CompletionItemInsertTextFormat.Snippet,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: cmd.documentation,
                    range: {
                      startLineNumber: position.lineNumber,
                      startColumn: position.column - partialCommand.length,
                      endLineNumber: position.lineNumber,
                      endColumn: position.column
                    }
                  };

                  // For 'begin' command, trigger suggestions after insertion
                  if (cmd.command === 'begin') {
                    completionItem.command = {
                      id: 'editor.action.triggerSuggest',
                      title: 'Trigger Suggest'
                    };
                  }
                  return completionItem;
                });
                return {
                  suggestions
                };
              }
              return {
                suggestions: []
              };
            }
          });

          // Register completion provider for common LaTeX environments
          monaco.languages.registerCompletionItemProvider("latex", {
            triggerCharacters: ["{"],
            provideCompletionItems: (model, position) => {
              const lineContent = model.getLineContent(position.lineNumber);
              const textBeforeCursor = lineContent.substring(0, position.column - 1);

              // Check if we just typed \begin{
              if (textBeforeCursor.match(/\\begin\{$/)) {
                const environments = ["document", "equation", "align", "itemize", "enumerate", "figure", "table", "center", "abstract", "theorem", "proof", "definition", "lemma", "corollary", "example", "remark", "verbatim", "quote", "tabular", "array"];
                return {
                  suggestions: environments.map(env => ({
                    label: env,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: `${env}}\n\t$0\n\\end{${env}}`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: `Insert ${env} environment`,
                    range: {
                      startLineNumber: position.lineNumber,
                      startColumn: position.column,
                      endLineNumber: position.lineNumber,
                      endColumn: position.column
                    }
                  }))
                };
              }
              return {
                suggestions: []
              };
            }
          });

          // Register completion provider for auto-closing \begin{...} with \end{...}
          monaco.languages.registerCompletionItemProvider("latex", {
            triggerCharacters: ["}"],
            provideCompletionItems: (model, position) => {
              const lineContent = model.getLineContent(position.lineNumber);
              const textBeforeCursor = lineContent.substring(0, position.column - 1);

              // Check if we just typed \begin{environmentName}
              const beginMatch = textBeforeCursor.match(/\\begin\{([^}]+)\}$/);
              if (beginMatch) {
                const environmentName = beginMatch[1];
                return {
                  suggestions: [{
                    label: `Auto-close \\end{${environmentName}}`,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: `\n\t$0\n\\end{${environmentName}}`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: `Auto-close with \\end{${environmentName}}`,
                    range: {
                      startLineNumber: position.lineNumber,
                      startColumn: position.column,
                      endLineNumber: position.lineNumber,
                      endColumn: position.column
                    }
                  }]
                };
              }
              return {
                suggestions: []
              };
            }
          });

          // Create the editor
          monacoRef.current = monaco.editor.create(editorRef.current, {
            value: value,
            language: "latex",
            theme: "vs-light",
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: {
              enabled: false
            },
            wordWrap: "on",
            lineHeight: 20,
            padding: {
              top: 10,
              bottom: 10
            }
          });

          // Listen for content changes
          monacoRef.current.onDidChangeModelContent(() => {
            const currentValue = monacoRef.current.getValue();
            if (onChange) {
              onChange(currentValue);
            }
          });
        }
      });
    }

    // Listen for clear editor event
    const handleClearEditor = () => {
      if (monacoRef.current) {
        monacoRef.current.setValue("");
      }
    };
    window.addEventListener("clearEditor", handleClearEditor);
    return () => {
      window.removeEventListener("clearEditor", handleClearEditor);
      if (monacoRef.current) {
        monacoRef.current.dispose();
        monacoRef.current = null;
      }
    };
  }, []);

  // Update editor value when prop changes
  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      monacoRef.current.setValue(value);
    }
  }, [value]);

  // When the editor becomes visible ensure Monaco recalculates layout.
  useEffect(() => {
    if (!monacoRef.current) return;
    if (isVisible) {
      // Debounce a bit in case of rapid toggles
      if (layoutTimeout.current) clearTimeout(layoutTimeout.current);
      layoutTimeout.current = setTimeout(() => {
        try {
          monacoRef.current.layout();
          console.log("[LaTeXEditor] called monaco.layout() because isVisible=true");
        } catch (e) {
          console.warn("monaco.layout failed", e);
        }
      }, 50);
    }
    return () => {
      if (layoutTimeout.current) {
        clearTimeout(layoutTimeout.current);
        layoutTimeout.current = null;
      }
    };
  }, [isVisible]);
  return React.createElement("div", {
    ref: editorRef,
    id: "monaco-editor"
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LaTeXEditor);

/***/ }),

/***/ "./src/PreviewPane.js":
/*!****************************!*\
  !*** ./src/PreviewPane.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const PreviewPane = ({
  latexCode
}) => {
  const {
    useState,
    useEffect
  } = React;
  const [processedContent, setProcessedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simple LaTeX to HTML converter for basic preview
  const processLaTeX = latex => {
    setIsLoading(true);

    // Basic LaTeX processing - this is a simplified version
    let html = latex;

    // Document structure
    html = html.replace(/\\documentclass\{[^}]+\}/, '');
    html = html.replace(/\\usepackage(?:\[[^\]]*\])?\{[^}]+\}/g, '');
    html = html.replace(/\\title\{([^}]+)\}/, '<h1 class="title">$1</h1>');
    html = html.replace(/\\author\{([^}]+)\}/, '<p class="author">By: $1</p>');
    html = html.replace(/\\date\{([^}]+)\}/, '<p class="date">$1</p>');
    html = html.replace(/\\maketitle/, '<div class="titlepage"></div>');

    // Sections
    html = html.replace(/\\section\{([^}]+)\}/g, '<h2>$1</h2>');
    html = html.replace(/\\subsection\{([^}]+)\}/g, '<h3>$1</h3>');
    html = html.replace(/\\subsubsection\{([^}]+)\}/g, '<h4>$1</h4>');

    // Math environments
    html = html.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, '<div class="equation">$$1$</div>');
    html = html.replace(/\$([^$]+)\$/g, '<span class="math">$1</span>');

    // Lists
    html = html.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, content) => {
      const items = content.replace(/\\item\s+/g, '<li>').split('<li>').filter(item => item.trim());
      return '<ul>' + items.map(item => '<li>' + item.trim() + '</li>').join('') + '</ul>';
    });
    html = html.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (match, content) => {
      const items = content.replace(/\\item\s+/g, '<li>').split('<li>').filter(item => item.trim());
      return '<ol>' + items.map(item => '<li>' + item.trim() + '</li>').join('') + '</ol>';
    });

    // Text formatting
    html = html.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
    html = html.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
    html = html.replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>');

    // Clean up LaTeX commands and environments
    html = html.replace(/\\begin\{document\}/, '');
    html = html.replace(/\\end\{document\}/, '');
    html = html.replace(/\\[a-zA-Z]+(?:\[[^\]]*\])?\{[^}]*\}/g, '');
    html = html.replace(/\\[a-zA-Z]+/g, '');

    // Convert line breaks
    html = html.replace(/\n\s*\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p>\s*<\/p>/g, '');
    setProcessedContent(html);
    setIsLoading(false);
  };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      processLaTeX(latexCode);
    }, 500); // Debounce processing

    return () => clearTimeout(timeoutId);
  }, [latexCode]);
  if (isLoading) {
    return React.createElement('div', {
      className: 'loading'
    }, 'Processing LaTeX...');
  }
  return React.createElement('div', {
    className: 'preview-content'
  }, React.createElement('div', {
    dangerouslySetInnerHTML: {
      __html: processedContent
    }
  }), React.createElement('style', null, `
            .preview-content h1.title {
                text-align: center;
                margin-bottom: 10px;
                font-size: 24px;
            }
            .preview-content .author, .preview-content .date {
                text-align: center;
                margin: 5px 0;
                color: #666;
            }
            .preview-content h2 {
                margin: 20px 0 10px 0;
                color: #333;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
            }
            .preview-content h3 {
                margin: 15px 0 8px 0;
                color: #444;
            }
            .preview-content h4 {
                margin: 12px 0 6px 0;
                color: #555;
            }
            .preview-content p {
                margin: 10px 0;
                line-height: 1.6;
            }
            .preview-content .equation {
                text-align: center;
                margin: 20px 0;
                padding: 10px;
                background: #f8f9fa;
                border-left: 4px solid #007bff;
                font-family: 'Times New Roman', serif;
                font-style: italic;
            }
            .preview-content .math {
                font-family: 'Times New Roman', serif;
                font-style: italic;
                background: #f0f0f0;
                padding: 2px 4px;
                border-radius: 3px;
            }
            .preview-content ul, .preview-content ol {
                margin: 10px 0 10px 20px;
            }
            .preview-content li {
                margin: 5px 0;
            }
        `));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PreviewPane);

/***/ }),

/***/ "./src/Toolbar.js":
/*!************************!*\
  !*** ./src/Toolbar.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const Toolbar = ({
  viewMode,
  onViewModeChange,
  latexCode
}) => {
  const handleDownload = () => {
    const blob = new Blob([latexCode], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleClear = () => {
    if (confirm('Are you sure you want to clear the editor?')) {
      onViewModeChange('editor');
      // This will be handled by the parent component
      const event = new CustomEvent('clearEditor');
      window.dispatchEvent(event);
    }
  };

  // Debug helpers - log button clicks
  const handleViewClick = mode => {
    console.log('[Toolbar] button click ->', mode);
    onViewModeChange(mode);
  };
  return React.createElement('div', {
    className: 'toolbar'
  }, React.createElement('h1', null, 'LaTeX Editor'), React.createElement('div', {
    className: 'toolbar-buttons'
  }, React.createElement('button', {
    className: `btn ${viewMode === 'editor' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => handleViewClick('editor')
  }, 'Editor'), React.createElement('button', {
    className: `btn ${viewMode === 'split' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => handleViewClick('split')
  }, 'Split'), React.createElement('button', {
    className: `btn ${viewMode === 'preview' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => handleViewClick('preview')
  }, 'Preview'), React.createElement('button', {
    className: 'btn btn-secondary',
    onClick: handleDownload
  }, 'Download'), React.createElement('button', {
    className: 'btn btn-secondary',
    onClick: handleClear
  }, 'Clear')));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Toolbar);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Toolbar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Toolbar.js */ "./src/Toolbar.js");
/* harmony import */ var _LaTeXEditor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./LaTeXEditor.js */ "./src/LaTeXEditor.js");
/* harmony import */ var _PreviewPane_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PreviewPane.js */ "./src/PreviewPane.js");
/* harmony import */ var _App_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./App.js */ "./src/App.js");





// Make components available globally for backward compatibility
window.Toolbar = _Toolbar_js__WEBPACK_IMPORTED_MODULE_0__["default"];
window.LaTeXEditor = _LaTeXEditor_js__WEBPACK_IMPORTED_MODULE_1__["default"];
window.PreviewPane = _PreviewPane_js__WEBPACK_IMPORTED_MODULE_2__["default"];
window.App = _App_js__WEBPACK_IMPORTED_MODULE_3__["default"];

// Function to initialize the app
const initializeApp = () => {
  try {
    // Wait for React to be available
    if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(_App_js__WEBPACK_IMPORTED_MODULE_3__["default"]));
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
})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map