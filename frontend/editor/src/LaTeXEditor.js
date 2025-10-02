const { useEffect, useRef } = React;

const LaTeXEditor = ({ value, onChange, isVisible = true }) => {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const layoutTimeout = useRef(null);

    useEffect(() => {
        // Initialize Monaco Editor
        if (window.require && !monacoRef.current) {
            window.require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });

            window.require(['vs/editor/editor.main'], () => {
                if (editorRef.current && !monacoRef.current) {
                    // Configure LaTeX language (basic syntax highlighting)
                    monaco.languages.register({ id: 'latex' });

                    monaco.languages.setMonarchTokensProvider('latex', {
                        tokenizer: {
                            root: [
                                [/\\[a-zA-Z@]+/, 'keyword'],
                                [/\\begin\{[^}]+\}/, 'keyword'],
                                [/\\end\{[^}]+\}/, 'keyword'],
                                [/\$.*?\$/, 'string'],
                                [/\\\(.*?\\\)/, 'string'],
                                [/\\\[.*?\\\]/, 'string'],
                                [/%.*$/, 'comment'],
                                [/\{/, 'bracket'],
                                [/\}/, 'bracket']
                            ]
                        }
                    });

                    // Register completion provider for common LaTeX environments
                    monaco.languages.registerCompletionItemProvider('latex', {
                        triggerCharacters: ['{'],
                        provideCompletionItems: (model, position) => {
                            const lineContent = model.getLineContent(position.lineNumber);
                            const textBeforeCursor = lineContent.substring(0, position.column - 1);

                            // Check if we just typed \begin{
                            if (textBeforeCursor.match(/\\begin\{$/)) {
                                const environments = [
                                    'document', 'equation', 'align', 'itemize', 'enumerate',
                                    'figure', 'table', 'center', 'abstract', 'theorem',
                                    'proof', 'definition', 'lemma', 'corollary', 'example',
                                    'remark', 'verbatim', 'quote', 'tabular', 'array'
                                ];

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

                            return { suggestions: [] };
                        }
                    });

                    // Register completion provider for auto-closing \begin{...} with \end{...}
                    monaco.languages.registerCompletionItemProvider('latex', {
                        triggerCharacters: ['}'],
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

                            return { suggestions: [] };
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
                        minimap: { enabled: false },
                        wordWrap: 'on',
                        lineHeight: 20,
                        padding: { top: 10, bottom: 10 }
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

    // When the editor becomes visible ensure Monaco recalculates layout.
    useEffect(() => {
        if (!monacoRef.current) return;

        if (isVisible) {
            // Debounce a bit in case of rapid toggles
            if (layoutTimeout.current) clearTimeout(layoutTimeout.current);
            layoutTimeout.current = setTimeout(() => {
                try {
                    monacoRef.current.layout();
                    console.log('[LaTeXEditor] called monaco.layout() because isVisible=true');
                } catch (e) {
                    console.warn('monaco.layout failed', e);
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

    return React.createElement('div', {
        ref: editorRef,
        id: 'monaco-editor'
    });
};

export default LaTeXEditor;
