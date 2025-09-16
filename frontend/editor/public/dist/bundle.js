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
const {
  useState,
  useEffect
} = React;
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

  const handleCodeChange = value => {
    setLatexCode(value || '');
  };
  return React.createElement('div', {
    className: 'app'
  }, React.createElement(Toolbar, {
    viewMode: viewMode,
    onViewModeChange: setViewMode,
    latexCode: latexCode
  }), React.createElement('div', {
    className: 'editor-container'
  }, (viewMode === 'editor' || viewMode === 'split') && React.createElement('div', {
    className: `editor-pane ${viewMode === 'split' ? 'split' : 'full'}`
  }, React.createElement(LaTeXEditor, {
    value: latexCode,
    onChange: handleCodeChange
  })), (viewMode === 'preview' || viewMode === 'split') && React.createElement('div', {
    className: `preview-pane ${viewMode === 'split' ? 'split' : 'full'}`
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
  onChange
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  useEffect(() => {
    // Initialize Monaco Editor
    if (window.require && !monacoRef.current) {
      window.require.config({
        paths: {
          vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs'
        }
      });
      window.require(['vs/editor/editor.main'], () => {
        if (editorRef.current && !monacoRef.current) {
          // Configure LaTeX language (basic syntax highlighting)
          monaco.languages.register({
            id: 'latex'
          });
          monaco.languages.setMonarchTokensProvider('latex', {
            tokenizer: {
              root: [[/\\[a-zA-Z@]+/, 'keyword'], [/\\begin\{[^}]+\}/, 'keyword'], [/\\end\{[^}]+\}/, 'keyword'], [/\$.*?\$/, 'string'], [/\\\(.*?\\\)/, 'string'], [/\\\[.*?\\\]/, 'string'], [/%.*$/, 'comment'], [/\{/, 'bracket'], [/\}/, 'bracket']]
            }
          });

          // Create the editor
          monacoRef.current = monaco.editor.create(editorRef.current, {
            value: value,
            language: 'latex',
            theme: 'vs-light',
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: {
              enabled: false
            },
            wordWrap: 'on',
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
        monacoRef.current.setValue('');
      }
    };
    window.addEventListener('clearEditor', handleClearEditor);
    return () => {
      window.removeEventListener('clearEditor', handleClearEditor);
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
  return React.createElement('div', {
    ref: editorRef,
    id: 'monaco-editor'
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
  return React.createElement('div', {
    className: 'toolbar'
  }, React.createElement('h1', null, 'LaTeX Editor'), React.createElement('div', {
    className: 'toolbar-buttons'
  }, React.createElement('button', {
    className: `btn ${viewMode === 'editor' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => onViewModeChange('editor')
  }, 'Editor'), React.createElement('button', {
    className: `btn ${viewMode === 'split' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => onViewModeChange('split')
  }, 'Split'), React.createElement('button', {
    className: `btn ${viewMode === 'preview' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => onViewModeChange('preview')
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