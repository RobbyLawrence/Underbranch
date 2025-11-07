// Comprehensive LaTeX commands for autocomplete
// Based on LaTeX-Workshop and common LaTeX packages

export const latexCommands = [
    // Document structure
    { command: "documentclass", insertText: "documentclass{$0}", documentation: "Document class" },
    { command: "usepackage", insertText: "usepackage{$0}", documentation: "Use package" },
    { command: "begin", insertText: "begin{$0}", documentation: "Begin environment" },
    { command: "end", insertText: "end{$0}", documentation: "End environment" },

    // Sectioning
    { command: "part", insertText: "part{$0}", documentation: "Part" },
    { command: "chapter", insertText: "chapter{$0}", documentation: "Chapter" },
    { command: "section", insertText: "section{$0}", documentation: "Section" },
    { command: "subsection", insertText: "subsection{$0}", documentation: "Subsection" },
    { command: "subsubsection", insertText: "subsubsection{$0}", documentation: "Subsubsection" },
    { command: "paragraph", insertText: "paragraph{$0}", documentation: "Paragraph" },
    { command: "subparagraph", insertText: "subparagraph{$0}", documentation: "Subparagraph" },

    // Text formatting
    { command: "textbf", insertText: "textbf{$0}", documentation: "Bold text" },
    { command: "textit", insertText: "textit{$0}", documentation: "Italic text" },
    { command: "texttt", insertText: "texttt{$0}", documentation: "Typewriter text" },
    { command: "textsc", insertText: "textsc{$0}", documentation: "Small caps" },
    { command: "textsf", insertText: "textsf{$0}", documentation: "Sans serif text" },
    { command: "textsl", insertText: "textsl{$0}", documentation: "Slanted text" },
    { command: "emph", insertText: "emph{$0}", documentation: "Emphasized text" },
    { command: "underline", insertText: "underline{$0}", documentation: "Underlined text" },

    // Font sizes
    { command: "tiny", insertText: "tiny ", documentation: "Tiny font size" },
    { command: "scriptsize", insertText: "scriptsize ", documentation: "Script font size" },
    { command: "footnotesize", insertText: "footnotesize ", documentation: "Footnote font size" },
    { command: "small", insertText: "small ", documentation: "Small font size" },
    { command: "normalsize", insertText: "normalsize ", documentation: "Normal font size" },
    { command: "large", insertText: "large ", documentation: "Large font size" },
    { command: "Large", insertText: "Large ", documentation: "Larger font size" },
    { command: "LARGE", insertText: "LARGE ", documentation: "Even larger font size" },
    { command: "huge", insertText: "huge ", documentation: "Huge font size" },
    { command: "Huge", insertText: "Huge ", documentation: "Hugest font size" },

    // Document metadata
    { command: "title", insertText: "title{$0}", documentation: "Document title" },
    { command: "author", insertText: "author{$0}", documentation: "Document author" },
    { command: "date", insertText: "date{$0}", documentation: "Document date" },
    { command: "maketitle", insertText: "maketitle", documentation: "Make title" },

    // Math mode
    { command: "frac", insertText: "frac{$1}{$2}", documentation: "Fraction" },
    { command: "sqrt", insertText: "sqrt{$0}", documentation: "Square root" },
    { command: "sum", insertText: "sum_{$1}^{$2}", documentation: "Summation" },
    { command: "int", insertText: "int_{$1}^{$2}", documentation: "Integral" },
    { command: "prod", insertText: "prod_{$1}^{$2}", documentation: "Product" },
    { command: "lim", insertText: "lim_{$1}", documentation: "Limit" },
    { command: "infty", insertText: "infty", documentation: "Infinity" },
    { command: "partial", insertText: "partial", documentation: "Partial derivative" },
    { command: "nabla", insertText: "nabla", documentation: "Nabla operator" },

    // Greek letters (lowercase)
    { command: "alpha", insertText: "alpha", documentation: "α (alpha)" },
    { command: "beta", insertText: "beta", documentation: "β (beta)" },
    { command: "gamma", insertText: "gamma", documentation: "γ (gamma)" },
    { command: "delta", insertText: "delta", documentation: "δ (delta)" },
    { command: "epsilon", insertText: "epsilon", documentation: "ε (epsilon)" },
    { command: "varepsilon", insertText: "varepsilon", documentation: "ε (epsilon variant)" },
    { command: "zeta", insertText: "zeta", documentation: "ζ (zeta)" },
    { command: "eta", insertText: "eta", documentation: "η (eta)" },
    { command: "theta", insertText: "theta", documentation: "θ (theta)" },
    { command: "vartheta", insertText: "vartheta", documentation: "θ (theta variant)" },
    { command: "iota", insertText: "iota", documentation: "ι (iota)" },
    { command: "kappa", insertText: "kappa", documentation: "κ (kappa)" },
    { command: "lambda", insertText: "lambda", documentation: "λ (lambda)" },
    { command: "mu", insertText: "mu", documentation: "μ (mu)" },
    { command: "nu", insertText: "nu", documentation: "ν (nu)" },
    { command: "xi", insertText: "xi", documentation: "ξ (xi)" },
    { command: "pi", insertText: "pi", documentation: "π (pi)" },
    { command: "varpi", insertText: "varpi", documentation: "π (pi variant)" },
    { command: "rho", insertText: "rho", documentation: "ρ (rho)" },
    { command: "varrho", insertText: "varrho", documentation: "ρ (rho variant)" },
    { command: "sigma", insertText: "sigma", documentation: "σ (sigma)" },
    { command: "varsigma", insertText: "varsigma", documentation: "ς (sigma variant)" },
    { command: "tau", insertText: "tau", documentation: "τ (tau)" },
    { command: "upsilon", insertText: "upsilon", documentation: "υ (upsilon)" },
    { command: "phi", insertText: "phi", documentation: "φ (phi)" },
    { command: "varphi", insertText: "varphi", documentation: "φ (phi variant)" },
    { command: "chi", insertText: "chi", documentation: "χ (chi)" },
    { command: "psi", insertText: "psi", documentation: "ψ (psi)" },
    { command: "omega", insertText: "omega", documentation: "ω (omega)" },

    // Greek letters (uppercase)
    { command: "Gamma", insertText: "Gamma", documentation: "Γ (Gamma)" },
    { command: "Delta", insertText: "Delta", documentation: "Δ (Delta)" },
    { command: "Theta", insertText: "Theta", documentation: "Θ (Theta)" },
    { command: "Lambda", insertText: "Lambda", documentation: "Λ (Lambda)" },
    { command: "Xi", insertText: "Xi", documentation: "Ξ (Xi)" },
    { command: "Pi", insertText: "Pi", documentation: "Π (Pi)" },
    { command: "Sigma", insertText: "Sigma", documentation: "Σ (Sigma)" },
    { command: "Upsilon", insertText: "Upsilon", documentation: "Υ (Upsilon)" },
    { command: "Phi", insertText: "Phi", documentation: "Φ (Phi)" },
    { command: "Psi", insertText: "Psi", documentation: "Ψ (Psi)" },
    { command: "Omega", insertText: "Omega", documentation: "Ω (Omega)" },

    // Math symbols
    { command: "times", insertText: "times", documentation: "× (multiplication)" },
    { command: "div", insertText: "div", documentation: "÷ (division)" },
    { command: "pm", insertText: "pm", documentation: "± (plus-minus)" },
    { command: "mp", insertText: "mp", documentation: "∓ (minus-plus)" },
    { command: "cdot", insertText: "cdot", documentation: "· (centered dot)" },
    { command: "ast", insertText: "ast", documentation: "* (asterisk)" },
    { command: "star", insertText: "star", documentation: "⋆ (star)" },
    { command: "circ", insertText: "circ", documentation: "∘ (circle)" },
    { command: "bullet", insertText: "bullet", documentation: "• (bullet)" },

    // Relations
    { command: "leq", insertText: "leq", documentation: "≤ (less than or equal)" },
    { command: "geq", insertText: "geq", documentation: "≥ (greater than or equal)" },
    { command: "neq", insertText: "neq", documentation: "≠ (not equal)" },
    { command: "approx", insertText: "approx", documentation: "≈ (approximately)" },
    { command: "equiv", insertText: "equiv", documentation: "≡ (equivalent)" },
    { command: "sim", insertText: "sim", documentation: "∼ (similar)" },
    { command: "cong", insertText: "cong", documentation: "≅ (congruent)" },
    { command: "propto", insertText: "propto", documentation: "∝ (proportional)" },
    { command: "ll", insertText: "ll", documentation: "≪ (much less than)" },
    { command: "gg", insertText: "gg", documentation: "≫ (much greater than)" },

    // Logic
    { command: "forall", insertText: "forall", documentation: "∀ (for all)" },
    { command: "exists", insertText: "exists", documentation: "∃ (exists)" },
    { command: "nexists", insertText: "nexists", documentation: "∄ (does not exist)" },
    { command: "neg", insertText: "neg", documentation: "¬ (negation)" },
    { command: "land", insertText: "land", documentation: "∧ (logical and)" },
    { command: "lor", insertText: "lor", documentation: "∨ (logical or)" },
    { command: "implies", insertText: "implies", documentation: "⟹ (implies)" },
    { command: "iff", insertText: "iff", documentation: "⟺ (if and only if)" },

    // Sets
    { command: "in", insertText: "in", documentation: "∈ (element of)" },
    { command: "notin", insertText: "notin", documentation: "∉ (not element of)" },
    { command: "subset", insertText: "subset", documentation: "⊂ (subset)" },
    { command: "supset", insertText: "supset", documentation: "⊃ (superset)" },
    { command: "subseteq", insertText: "subseteq", documentation: "⊆ (subset or equal)" },
    { command: "supseteq", insertText: "supseteq", documentation: "⊇ (superset or equal)" },
    { command: "cup", insertText: "cup", documentation: "∪ (union)" },
    { command: "cap", insertText: "cap", documentation: "∩ (intersection)" },
    { command: "emptyset", insertText: "emptyset", documentation: "∅ (empty set)" },
    { command: "mathbb", insertText: "mathbb{$0}", documentation: "Blackboard bold (e.g., ℝ, ℕ)" },

    // Arrows
    { command: "leftarrow", insertText: "leftarrow", documentation: "← (left arrow)" },
    { command: "rightarrow", insertText: "rightarrow", documentation: "→ (right arrow)" },
    { command: "leftrightarrow", insertText: "leftrightarrow", documentation: "↔ (left-right arrow)" },
    { command: "Leftarrow", insertText: "Leftarrow", documentation: "⇐ (double left arrow)" },
    { command: "Rightarrow", insertText: "Rightarrow", documentation: "⇒ (double right arrow)" },
    { command: "Leftrightarrow", insertText: "Leftrightarrow", documentation: "⇔ (double left-right arrow)" },

    // Delimiters
    { command: "left(", insertText: "left( $0 \\right)", documentation: "Auto-sized parentheses" },
    { command: "left[", insertText: "left[ $0 \\right]", documentation: "Auto-sized brackets" },
    { command: "left{", insertText: "left\\{ $0 \\right\\}", documentation: "Auto-sized braces" },
    { command: "left|", insertText: "left| $0 \\right|", documentation: "Auto-sized vertical bars" },

    // References
    { command: "label", insertText: "label{$0}", documentation: "Label for reference" },
    { command: "ref", insertText: "ref{$0}", documentation: "Reference to label" },
    { command: "eqref", insertText: "eqref{$0}", documentation: "Equation reference" },
    { command: "cite", insertText: "cite{$0}", documentation: "Citation" },
    { command: "bibliography", insertText: "bibliography{$0}", documentation: "Bibliography" },
    { command: "bibliographystyle", insertText: "bibliographystyle{$0}", documentation: "Bibliography style" },

    // Lists
    { command: "item", insertText: "item $0", documentation: "List item" },

    // Spacing
    { command: "vspace", insertText: "vspace{$0}", documentation: "Vertical space" },
    { command: "hspace", insertText: "hspace{$0}", documentation: "Horizontal space" },
    { command: "newpage", insertText: "newpage", documentation: "New page" },
    { command: "linebreak", insertText: "linebreak", documentation: "Line break" },
    { command: "noindent", insertText: "noindent", documentation: "No indentation" },

    // Graphics
    { command: "includegraphics", insertText: "includegraphics{$0}", documentation: "Include graphics" },
    { command: "caption", insertText: "caption{$0}", documentation: "Caption" },

    // Tables
    { command: "hline", insertText: "hline", documentation: "Horizontal line in table" },
    { command: "multicolumn", insertText: "multicolumn{$1}{$2}{$3}", documentation: "Multicolumn cell" },
    { command: "multirow", insertText: "multirow{$1}{$2}{$3}", documentation: "Multirow cell" },

    // Theorems and proofs (amsthm package)
    { command: "newtheorem", insertText: "newtheorem{$1}{$2}", documentation: "Define new theorem environment" },
    { command: "qed", insertText: "qed", documentation: "QED symbol" },
    { command: "qedhere", insertText: "qedhere", documentation: "Place QED symbol here" },
];

export const latexEnvironments = [
    // Basic document
    "document",

    // Math environments
    "equation",
    "equation*",
    "align",
    "align*",
    "gather",
    "gather*",
    "multline",
    "multline*",
    "split",
    "cases",
    "matrix",
    "pmatrix",
    "bmatrix",
    "Bmatrix",
    "vmatrix",
    "Vmatrix",

    // Lists
    "itemize",
    "enumerate",
    "description",

    // Floats
    "figure",
    "table",

    // Text formatting
    "center",
    "flushleft",
    "flushright",
    "quote",
    "quotation",
    "verse",
    "verbatim",

    // Front matter
    "abstract",
    "titlepage",

    // Theorem-like environments (amsthm)
    "theorem",
    "lemma",
    "proposition",
    "corollary",
    "conjecture",
    "definition",
    "example",
    "remark",
    "note",
    "proof",
    "claim",
    "axiom",

    // Beamer
    "frame",
    "block",
    "alertblock",
    "exampleblock",

    // Tabular
    "tabular",
    "tabular*",
    "array",
];
