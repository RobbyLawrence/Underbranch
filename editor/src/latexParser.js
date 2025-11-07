// LaTeX parsing utilities using latex-utensils
// - Extracting custom commands from the document
// - Validating LaTeX syntax
// - Finding all \label definitions for autocomplete

import { latexParser } from "latex-utensils";

/**
 * Parse LaTeX document and return the list of command from latex-utensils
 * @param {string} texString - The LaTeX source code
 * @returns {object|null} - The parsed latex-utensils or null if parsing fails
 */
export function parseLatex(texString) {
    try {
        const ast = latexParser.parse(texString);
        return ast;
    } catch (error) {
        console.error("LaTeX parsing error:", error);
        return null;
    }
}

/**
 * Extract all \label definitions from a LaTeX document
 * This can be used to provide autocomplete for \ref{} commands
 * @param {string} texString - The LaTeX source code
 * @returns {string[]} - Array of label names
 */
export function extractLabels(texString) {
    const ast = parseLatex(texString);
    if (!ast) return [];

    const labels = [];

    function traverse(node) {
        if (!node) return;

        // Check if this is a \label command
        if (node.kind === "command" && node.name === "label") {
            if (node.args && node.args.length > 0) {
                const labelArg = node.args[0];
                if (labelArg.content && labelArg.content.length > 0) {
                    const labelText = labelArg.content
                        .map((c) => c.content || c.name || "")
                        .join("");
                    if (labelText) {
                        labels.push(labelText);
                    }
                }
            }
        }

        // Recursively traverse child nodes
        if (node.content && Array.isArray(node.content)) {
            node.content.forEach(traverse);
        }
        if (node.args && Array.isArray(node.args)) {
            node.args.forEach((arg) => {
                if (arg.content) {
                    arg.content.forEach(traverse);
                }
            });
        }
    }

    if (ast.content) {
        ast.content.forEach(traverse);
    }

    return labels;
}

/**
 * Extract all custom commands defined with \newcommand
 * This can be used to provide autocomplete for user-defined commands
 * @param {string} texString - The LaTeX source code
 * @returns {object[]} - Array of custom command definitions
 */
export function extractCustomCommands(texString) {
    const ast = parseLatex(texString);
    if (!ast) return [];

    const customCommands = [];

    function traverse(node) {
        if (!node) return;

        // Check if this is a \newcommand
        if (
            node.kind === "command" &&
            (node.name === "newcommand" || node.name === "renewcommand")
        ) {
            if (node.args && node.args.length >= 2) {
                const cmdName = node.args[0];
                const cmdDef = node.args[1];

                // Extract command name
                let name = "";
                if (cmdName.content && cmdName.content.length > 0) {
                    const firstContent = cmdName.content[0];
                    if (firstContent.kind === "command") {
                        name = firstContent.name;
                    }
                }

                if (name) {
                    customCommands.push({
                        command: name,
                        insertText: `${name}{$0}`,
                        documentation: `Custom command (user-defined)`,
                    });
                }
            }
        }

        // Recursively traverse child nodes
        if (node.content && Array.isArray(node.content)) {
            node.content.forEach(traverse);
        }
        if (node.args && Array.isArray(node.args)) {
            node.args.forEach((arg) => {
                if (arg.content) {
                    arg.content.forEach(traverse);
                }
            });
        }
    }

    if (ast.content) {
        ast.content.forEach(traverse);
    }

    return customCommands;
}

/**
 * Validate LaTeX syntax
 * @param {string} texString - The LaTeX source code
 * @returns {boolean} - true if valid, false otherwise
 */
export function validateLatex(texString) {
    const ast = parseLatex(texString);
    return ast !== null;
}
