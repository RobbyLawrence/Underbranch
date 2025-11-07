const { useEffect, useRef } = React;
import { latexCommands, latexEnvironments } from "./latexCommands.js";

const LaTeXEditor = ({
<<<<<<< HEAD
  value,
  onChange,
  isVisible = true,
  theme = "light",
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const layoutTimeout = useRef(null);
=======
    value,
    onChange,
    isVisible = true,
    theme = "light",
}) => {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const layoutTimeout = useRef(null);
>>>>>>> 09e6713 (Major changes to editor. The autocomplete system has moved from manual to using latex-utensils library for parsing and autocomplete and environments to better understand what user is actually typing. Better and more robust autocomplete from manual inplementation into latexCommands.js, and environment logic in latexParser.js. Environments are basically 'classes' so we know what tag belongs with what. autocomplete will also work for custom tags)

  useEffect(() => {
    // Initialize Monaco Editor
    if (window.require && !monacoRef.current) {
      window.require.config({
        paths: { vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs" },
      });

      window.require(["vs/editor/editor.main"], () => {
        if (editorRef.current && !monacoRef.current) {
          // Configure LaTeX language
          monaco.languages.register({ id: "latex" });

          // Define light and dark themes so the editor responds to
          // the app-level theme toggle. We keep token rules similar
          // but swap base and color tokens for readability on dark.
          monaco.editor.defineTheme("underbranch-light", {
            base: "vs",
            inherit: true,
            rules: [
              { token: "keyword", foreground: "B5632D" },
              { token: "string", foreground: "218721" },
              {
                token: "comment",
                foreground: "737373",
                fontStyle: "italic",
              },
              { token: "bracket", foreground: "505050" },
            ],
            colors: {
              "editor.background": "#FFFFFF",
              "editor.foreground": "#333333",
              "editor.lineHighlightBackground": "#F5F5F5",
              "editorCursor.foreground": "#B5632D",
              "editor.selectionBackground": "#E8D3C7",
              "editorLineNumber.foreground": "#999999",
            },
          });

          monaco.editor.defineTheme("underbranch-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
              { token: "keyword", foreground: "DCA06B" },
              { token: "string", foreground: "78C179" },
              {
                token: "comment",
                foreground: "94A3B8",
                fontStyle: "italic",
              },
              { token: "bracket", foreground: "9AA6B2" },
            ],
            colors: {
              // Dark background aligned with page dark vars
              "editor.background": "#071122",
              "editor.foreground": "#E6EEF8",
              "editor.lineHighlightBackground": "#0b2230",
              "editorCursor.foreground": "#B5632D",
              "editor.selectionBackground": "#163246",
              "editorLineNumber.foreground": "#6B7280",
            },
          });

          // Syntax highlighting
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

<<<<<<< HEAD
          // LaTeX command definitions
          const latexCommands = [
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

          const latexEnvironments = [
            "document",
            "equation",
            "align",
            "itemize",
            "enumerate",
            "figure",
            "table",
            "center",
            "abstract",
          ];
=======
                    // LaTeX commands and environments are now imported from latexCommands.js
>>>>>>> 09e6713 (Major changes to editor. The autocomplete system has moved from manual to using latex-utensils library for parsing and autocomplete and environments to better understand what user is actually typing. Better and more robust autocomplete from manual inplementation into latexCommands.js, and environment logic in latexParser.js. Environments are basically 'classes' so we know what tag belongs with what. autocomplete will also work for custom tags)

          // Register completion provider for LaTeX commands
          monaco.languages.registerCompletionItemProvider("latex", {
            triggerCharacters: ["\\", "{"],
            provideCompletionItems: (model, position) => {
              const lineContent = model.getLineContent(position.lineNumber);
              const textBeforeCursor = lineContent.substring(
                0,
                position.column - 1
              );

<<<<<<< HEAD
              // Command completions (after \)
              const commandMatch = textBeforeCursor.match(/\\([a-zA-Z]*)$/);
              if (commandMatch) {
                const partialCommand = commandMatch[1];
                const textAfterCursor = lineContent.substring(
                  position.column - 1
=======
                            // Command completions (after \)
                            const commandMatch =
                                textBeforeCursor.match(/\\([a-zA-Z]*)$/);
                            if (commandMatch) {
                                const partialCommand = commandMatch[1];
                                const textAfterCursor = lineContent.substring(
                                    position.column - 1,
                                );

                                const suggestions = latexCommands
                                    .filter((cmd) =>
                                        cmd.command.startsWith(partialCommand),
                                    )
                                    .map((cmd) => {
                                        // Check if cursor is inside braces and there's a closing brace
                                        const hasOpenBrace =
                                            textBeforeCursor.match(/\{[^}]*$/);
                                        const hasClosingBrace =
                                            hasOpenBrace &&
                                            textAfterCursor.startsWith("}");

                                        // If we're inside braces with a closing brace, don't include it in insertText
                                        let insertText = cmd.insertText;
                                        let endColumn = position.column;

                                        if (
                                            hasClosingBrace &&
                                            insertText.includes("{")
                                        ) {
                                            // Remove the closing brace from commands like "textbf{$0}"
                                            insertText = insertText.replace(
                                                /\{([^}]*)\}/,
                                                "{$1",
                                            );
                                            endColumn = position.column + 1; // Include the closing brace in replacement
                                        }

                                        return {
                                            label: cmd.command,
                                            kind: monaco.languages
                                                .CompletionItemKind.Function,
                                            insertText: insertText,
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
                                                endColumn: endColumn,
                                            },
                                        };
                                    });
                                return { suggestions };
                            }

                            // Environment completions (after \begin{)
                            const beginMatch =
                                textBeforeCursor.match(/\\begin\{([^}]*)$/);
                            if (beginMatch) {
                                const partialEnv = beginMatch[1];
                                const textAfterCursor = lineContent.substring(
                                    position.column - 1,
                                );

                                // Check if there's already a closing brace after the cursor
                                const hasClosingBrace =
                                    textAfterCursor.startsWith("}");

                                const suggestions = latexEnvironments
                                    .filter((env) => env.startsWith(partialEnv))
                                    .map((env) => {
                                        // If there's already a closing brace, we need to handle it carefully
                                        let insertText, endColumn;
                                        if (hasClosingBrace) {
                                            // Include the environment content but skip past the existing closing brace
                                            insertText = `${env}}\n\t$0\n\\end{${env}}`;
                                            endColumn = position.column + 1; // Replace up to and including the }
                                        } else {
                                            // No closing brace, add everything including the brace
                                            insertText = `${env}}\n\t$0\n\\end{${env}}`;
                                            endColumn = position.column;
                                        }

                                        return {
                                            label: env,
                                            kind: monaco.languages
                                                .CompletionItemKind.Keyword,
                                            insertText: insertText,
                                            insertTextRules:
                                                monaco.languages
                                                    .CompletionItemInsertTextRule
                                                    .InsertAsSnippet,
                                            documentation: `Insert ${env} environment`,
                                            range: {
                                                startLineNumber:
                                                    position.lineNumber,
                                                startColumn:
                                                    position.column -
                                                    partialEnv.length,
                                                endLineNumber:
                                                    position.lineNumber,
                                                endColumn: endColumn,
                                            },
                                        };
                                    });
                                return { suggestions };
                            }

                            return { suggestions: [] };
                        },
                    });

                    // Auto-close \begin{} with \end{} (with local scope checking)
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

                            const beginMatch =
                                textBeforeCursor.match(/\\begin\{([^}]+)\}$/);

                            if (!beginMatch) {
                                return { suggestions: [] };
                            }

                            const environmentName = beginMatch[1];

                            // Skip known environments
                            if (latexEnvironments.includes(environmentName)) {
                                return { suggestions: [] };
                            }

                            // Check next 50 lines for matching \end{}
                            const totalLines = model.getLineCount();
                            const searchLimit = Math.min(
                                position.lineNumber + 50,
                                totalLines,
                            );
                            const endPattern = `\\end{${environmentName}}`;

                            for (
                                let i = position.lineNumber;
                                i <= searchLimit;
                                i++
                            ) {
                                const line = model.getLineContent(i);
                                if (line.includes(endPattern)) {
                                    return { suggestions: [] }; // Found matching \end{}, don't suggest
                                }
                            }

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
                                        documentation: `Automatically close the ${environmentName} environment`,
                                        range: {
                                            startLineNumber:
                                                position.lineNumber,
                                            startColumn: position.column,
                                            endLineNumber: position.lineNumber,
                                            endColumn: position.column,
                                        },
                                        sortText: "zzz_autoclose",
                                    },
                                ],
                            };
                        },
                    });

                    // Create the editor
                    monacoRef.current = monaco.editor.create(
                        editorRef.current,
                        {
                            value: value,
                            language: "latex",
                            theme:
                                theme === "dark"
                                    ? "underbranch-dark"
                                    : "underbranch-light",
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
                            fontFamily:
                                "'Fira Code', 'SF Mono', Consolas, 'Courier New', monospace",
                            fontLigatures: true,
                            smoothScrolling: true,
                            guides: {
                                indentation: true,
                                bracketPairs: true,
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

    // If the app-level theme changes, update the Monaco theme in-place.
    useEffect(() => {
        try {
            if (monacoRef.current && window.monaco && window.monaco.editor) {
                window.monaco.editor.setTheme(
                    theme === "dark" ? "underbranch-dark" : "underbranch-light",
>>>>>>> 09e6713 (Major changes to editor. The autocomplete system has moved from manual to using latex-utensils library for parsing and autocomplete and environments to better understand what user is actually typing. Better and more robust autocomplete from manual inplementation into latexCommands.js, and environment logic in latexParser.js. Environments are basically 'classes' so we know what tag belongs with what. autocomplete will also work for custom tags)
                );

                const suggestions = latexCommands
                  .filter((cmd) => cmd.command.startsWith(partialCommand))
                  .map((cmd) => {
                    // Check if cursor is inside braces and there's a closing brace
                    const hasOpenBrace = textBeforeCursor.match(/\{[^}]*$/);
                    const hasClosingBrace =
                      hasOpenBrace && textAfterCursor.startsWith("}");

                    // If we're inside braces with a closing brace, don't include it in insertText
                    let insertText = cmd.insertText;
                    let endColumn = position.column;

                    if (hasClosingBrace && insertText.includes("{")) {
                      // Remove the closing brace from commands like "textbf{$0}"
                      insertText = insertText.replace(/\{([^}]*)\}/, "{$1");
                      endColumn = position.column + 1; // Include the closing brace in replacement
                    }

                    return {
                      label: cmd.command,
                      kind: monaco.languages.CompletionItemKind.Function,
                      insertText: insertText,
                      insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                          .InsertAsSnippet,
                      documentation: cmd.documentation,
                      range: {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column - partialCommand.length,
                        endLineNumber: position.lineNumber,
                        endColumn: endColumn,
                      },
                    };
                  });
                return { suggestions };
              }

              // Environment completions (after \begin{)
              const beginMatch = textBeforeCursor.match(/\\begin\{([^}]*)$/);
              if (beginMatch) {
                const partialEnv = beginMatch[1];
                const textAfterCursor = lineContent.substring(
                  position.column - 1
                );

                // Check if there's already a closing brace after the cursor
                const hasClosingBrace = textAfterCursor.startsWith("}");

                const suggestions = latexEnvironments
                  .filter((env) => env.startsWith(partialEnv))
                  .map((env) => {
                    // If there's already a closing brace, we need to handle it carefully
                    let insertText, endColumn;
                    if (hasClosingBrace) {
                      // Include the environment content but skip past the existing closing brace
                      insertText = `${env}}\n\t$0\n\\end{${env}}`;
                      endColumn = position.column + 1; // Replace up to and including the }
                    } else {
                      // No closing brace, add everything including the brace
                      insertText = `${env}}\n\t$0\n\\end{${env}}`;
                      endColumn = position.column;
                    }

                    return {
                      label: env,
                      kind: monaco.languages.CompletionItemKind.Keyword,
                      insertText: insertText,
                      insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                          .InsertAsSnippet,
                      documentation: `Insert ${env} environment`,
                      range: {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column - partialEnv.length,
                        endLineNumber: position.lineNumber,
                        endColumn: endColumn,
                      },
                    };
                  });
                return { suggestions };
              }

              return { suggestions: [] };
            },
          });

          // Auto-close \begin{} with \end{}
          monaco.languages.registerCompletionItemProvider("latex", {
            triggerCharacters: ["}"],
            provideCompletionItems: (model, position) => {
              const lineContent = model.getLineContent(position.lineNumber);
              const textBeforeCursor = lineContent.substring(
                0,
                position.column - 1
              );
              const textAfterCursor = lineContent.substring(
                position.column - 1
              );
              const beginMatch = textBeforeCursor.match(/\\begin\{([^}]+)\}$/);

              // Only suggest auto-close if there's not already an \end{} on the same line
              // or if we haven't already inserted the environment completion
              if (beginMatch && !textAfterCursor.match(/^\s*\n\s*\\end\{/)) {
                const environmentName = beginMatch[1];

                // Check if this is one of our predefined environments
                // If so, don't auto-close as it was already handled by the environment completion
                if (latexEnvironments.includes(environmentName)) {
                  return { suggestions: [] };
                }

                return {
                  suggestions: [
                    {
                      label: `Auto-close \\end{${environmentName}}`,
                      kind: monaco.languages.CompletionItemKind.Snippet,
                      insertText: `\n\t$0\n\\end{${environmentName}}`,
                      insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                          .InsertAsSnippet,
                      documentation: `Auto-close with \\end{${environmentName}}`,
                      range: {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
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
          monacoRef.current = monaco.editor.create(editorRef.current, {
            value: value,
            language: "latex",
            theme: theme === "dark" ? "underbranch-dark" : "underbranch-light",
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
            fontFamily:
              "'Fira Code', 'SF Mono', Consolas, 'Courier New', monospace",
            fontLigatures: true,
            smoothScrolling: true,
            guides: {
              indentation: true,
              bracketPairs: true,
            },
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
  //could you add a useEffect that listens for Ctrl+S or Command+S and calls a compileLatex function passed in as a prop?

  // If the app-level theme changes, update the Monaco theme in-place.
  useEffect(() => {
    try {
      if (monacoRef.current && window.monaco && window.monaco.editor) {
        window.monaco.editor.setTheme(
          theme === "dark" ? "underbranch-dark" : "underbranch-light"
        );
      }
    } catch (e) {
      // Ignore: monaco may not be available during SSR or early loads
    }
  }, [theme]);

  // Update editor value when prop changes
  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      monacoRef.current.setValue(value);
    }
  }, [value]);

  // Recalculate layout when editor becomes visible

  useEffect(() => {
    if (!monacoRef.current) return;

    if (isVisible) {
      if (layoutTimeout.current) clearTimeout(layoutTimeout.current);
      layoutTimeout.current = setTimeout(() => {
        try {
          monacoRef.current.layout();
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
