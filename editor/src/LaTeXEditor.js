const { useEffect, useRef } = React;

const LaTeXEditor = ({ value, onChange, isVisible = true }) => {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const layoutTimeout = useRef(null);

    useEffect(() => {
        // Initialize Monaco Editor
        if (window.require && !monacoRef.current) {
            window.require.config({
                paths: { vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs" },
            });

            window.require(["vs/editor/editor.main"], () => {
                if (editorRef.current && !monacoRef.current) {
                    // Configure LaTeX language (basic syntax highlighting)
                    monaco.languages.register({ id: "latex" });

                    // Define custom theme
                    monaco.editor.defineTheme('underbranch-theme', {
                        base: 'vs',
                        inherit: true,
                        rules: [
                            { token: 'keyword', foreground: 'B5632D' }, // Underbranch brand color
                            { token: 'string', foreground: '218721' },  // Soft green for math
                            { token: 'comment', foreground: '737373', fontStyle: 'italic' },
                            { token: 'bracket', foreground: '505050' }
                        ],
                        colors: {
                            'editor.background': '#FFFFFF',
                            'editor.foreground': '#333333',
                            'editor.lineHighlightBackground': '#F5F5F5',
                            'editorCursor.foreground': '#B5632D',
                            'editor.selectionBackground': '#E8D3C7',
                            'editorLineNumber.foreground': '#999999'
                        }
                    });

                    monaco.languages.setMonarchTokensProvider("latex", {
                        tokenizer: {
                            root: [
                                [/\\[a-zA-Z@]+/, "keyword"],
                                [/\\begin\{[^}]+\}/, "keyword"],
                                [/\\end\{[^}]+\}/, "keyword"],
                                [/\$.*?\$/, "string"],
                                [/\\\(.*?\\\)/, "string"],
                                [/\\\[.*?\\\]/, "string"],
                                [/%.*$/, "comment"],
                                [/\{/, "bracket"],
                                [/\}/, "bracket"],
                            ],
                        },
                    });

                    // Register completion provider for LaTeX commands starting with backslash
                    monaco.languages.registerCompletionItemProvider("latex", {
                        triggerCharacters: ["\\"],
                        provideCompletionItems: (model, position) => {
                            const lineContent = model.getLineContent(
                                position.lineNumber,
                            );
                            const textBeforeCursor = lineContent.substring(
                                0,
                                position.column - 1,
                            );

                            // Check if we're typing after a backslash
                            const commandMatch =
                                textBeforeCursor.match(/\\([a-zA-Z]*)$/);

                            if (commandMatch) {
                                const partialCommand = commandMatch[1];

                                // LaTeX commands that need curly braces
                                const commandsWithBraces = [
                                    {
                                        command: "begin",
                                        insertText: "begin{$0}",
                                        documentation: "Begin environment",
                                    },
                                    {
                                        command: "end",
                                        insertText: "end{$0}",
                                        documentation: "End environment",
                                    },
                                    {
                                        command: "textbf",
                                        insertText: "textbf{$0}",
                                        documentation: "Bold text",
                                    },
                                    {
                                        command: "textit",
                                        insertText: "textit{$0}",
                                        documentation: "Italic text",
                                    },
                                    {
                                        command: "underline",
                                        insertText: "underline{$0}",
                                        documentation: "Underline text",
                                    },
                                    {
                                        command: "section",
                                        insertText: "section{$0}",
                                        documentation: "Section",
                                    },
                                    {
                                        command: "subsection",
                                        insertText: "subsection{$0}",
                                        documentation: "Subsection",
                                    },

                                    {
                                        command: "subsubsection",
                                        insertText: "subsubsection{$0}",
                                        documentation: "Subsubsection",
                                    },
                                    {
                                        command: "chapter",
                                        insertText: "chapter{$0}",
                                        documentation: "Chapter",
                                    },
                                    {
                                        command: "title",
                                        insertText: "title{$0}",
                                        documentation: "Document title",
                                    },
                                    {
                                        command: "author",
                                        insertText: "author{$0}",
                                        documentation: "Document author",
                                    },
                                    {
                                        command: "date",
                                        insertText: "date{$0}",
                                        documentation: "Document date",
                                    },
                                    {
                                        command: "emph",
                                        insertText: "emph{$0}",
                                        documentation: "Emphasize text",
                                    },
                                    {
                                        command: "frac",
                                        insertText: "frac{$1}{$2}",
                                        documentation: "Fraction",
                                    },
                                    {
                                        command: "sqrt",
                                        insertText: "sqrt{$0}",
                                        documentation: "Square root",
                                    },
                                ];

                                // Filter commands that match the partial input
                                const suggestions = commandsWithBraces
                                    .filter((cmd) =>
                                        cmd.command.startsWith(partialCommand),
                                    )
                                    .map((cmd) => {
                                        const completionItem = {
                                            label: cmd.command,
                                            kind: monaco.languages
                                                .CompletionItemKind.Function,
                                            insertText: cmd.insertText,
                                            insertTextFormat:
                                                monaco.languages
                                                    .CompletionItemInsertTextFormat
                                                    .Snippet,
                                            insertTextRules:
                                                monaco.languages
                                                    .CompletionItemInsertTextRule
                                                    .InsertAsSnippet,
                                            documentation: cmd.documentation,
                                            range: {
                                                startLineNumber:
                                                    position.lineNumber,
                                                startColumn:
                                                    position.column -
                                                    partialCommand.length,
                                                endLineNumber:
                                                    position.lineNumber,
                                                endColumn: position.column,
                                            },
                                        };

                                        // For 'begin' command, trigger suggestions after insertion
                                        if (cmd.command === "begin") {
                                            completionItem.command = {
                                                id: "editor.action.triggerSuggest",
                                                title: "Trigger Suggest",
                                            };
                                        }

                                        return completionItem;
                                    });

                                return { suggestions };
                            }

                            return { suggestions: [] };
                        },
                    });

                    // Register completion provider for common LaTeX environments
                    monaco.languages.registerCompletionItemProvider("latex", {
                        triggerCharacters: ["{"],
                        provideCompletionItems: (model, position) => {
                            const lineContent = model.getLineContent(
                                position.lineNumber,
                            );
                            const textBeforeCursor = lineContent.substring(
                                0,
                                position.column - 1,
                            );

                            // Check if we just typed \begin{
                            if (textBeforeCursor.match(/\\begin\{$/)) {
                                const environments = [
                                    "document",
                                    "equation",
                                    "align",
                                    "itemize",
                                    "enumerate",
                                    "figure",
                                    "table",
                                    "center",
                                    "abstract",
                                    "theorem",
                                    "proof",
                                    "definition",
                                    "lemma",
                                    "corollary",
                                    "example",
                                    "remark",
                                    "verbatim",
                                    "quote",
                                    "tabular",
                                    "array",
                                ];

                                return {
                                    suggestions: environments.map((env) => ({
                                        label: env,
                                        kind: monaco.languages
                                            .CompletionItemKind.Snippet,
                                        insertText: `${env}}\n\t$0\n\\end{${env}}`,
                                        insertTextRules:
                                            monaco.languages
                                                .CompletionItemInsertTextRule
                                                .InsertAsSnippet,
                                        documentation: `Insert ${env} environment`,
                                        range: {
                                            startLineNumber:
                                                position.lineNumber,
                                            startColumn: position.column,
                                            endLineNumber: position.lineNumber,
                                            endColumn: position.column,
                                        },
                                    })),
                                };
                            }

                            return { suggestions: [] };
                        },
                    });

                    // Register completion provider for auto-closing \begin{...} with \end{...}
                    monaco.languages.registerCompletionItemProvider("latex", {
                        triggerCharacters: ["}"],
                        provideCompletionItems: (model, position) => {
                            const lineContent = model.getLineContent(
                                position.lineNumber,
                            );
                            const textBeforeCursor = lineContent.substring(
                                0,
                                position.column - 1,
                            );

                            // Check if we just typed \begin{environmentName}
                            const beginMatch =
                                textBeforeCursor.match(/\\begin\{([^}]+)\}$/);

                            if (beginMatch) {
                                const environmentName = beginMatch[1];
                                return {
                                    suggestions: [
                                        {
                                            label: `Auto-close \\end{${environmentName}}`,
                                            kind: monaco.languages
                                                .CompletionItemKind.Snippet,
                                            insertText: `\n\t$0\n\\end{${environmentName}}`,
                                            insertTextRules:
                                                monaco.languages
                                                    .CompletionItemInsertTextRule
                                                    .InsertAsSnippet,
                                            documentation: `Auto-close with \\end{${environmentName}}`,
                                            range: {
                                                startLineNumber:
                                                    position.lineNumber,
                                                startColumn: position.column,
                                                endLineNumber:
                                                    position.lineNumber,
                                                endColumn: position.column,
                                            },
                                        },
                                    ],
                                };
                            }

                            return { suggestions: [] };
                        },
                    });

                    // Create the editor
                    monacoRef.current = monaco.editor.create(
                        editorRef.current,
                        {
                            value: value,
                            language: "latex",
                            theme: "underbranch-theme",
                            fontSize: 15,
                            lineNumbers: "on",
                            roundedSelection: true,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            minimap: { enabled: false },
                            wordWrap: "on",
                            lineHeight: 24,
                            padding: { top: 16, bottom: 16 },
                            renderLineHighlight: "all",
                            cursorBlinking: "smooth",
                            cursorWidth: 2,
                            fontFamily: "'Fira Code', 'SF Mono', Consolas, 'Courier New', monospace",
                            fontLigatures: true,
                            smoothScrolling: true,
                            guides: {
                                indentation: true,
                                bracketPairs: true
                            },
                        },
                    );

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
                    console.log(
                        "[LaTeXEditor] called monaco.layout() because isVisible=true",
                    );
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
        id: "monaco-editor",
    });
};

export default LaTeXEditor;
