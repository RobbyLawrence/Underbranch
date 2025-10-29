import { Parser } from 'latex.js';

export function checkLatexErrors(latex) {
    const errors = [];
    const stack = [];

    const lines = latex.split("\n");

    lines.forEach((line, i) => {
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === "{") {
                stack.push({ line: i + 1, column: j + 1 });
            } else if (char === "}") {
                if (stack.length === 0) {
                    // unmatched closing brace
                    errors.push({
                        message: "Unmatched closing brace '}'",
                        line: i + 1,
                    });
                } else {
                    stack.pop();
                }
            }
        }
    });

    // any leftover opening braces are errors
    stack.forEach((unclosed) => {
        errors.push({
            message: "Unclosed opening brace '{'",
            line: unclosed.line,
        });
    });

    return errors;
}
