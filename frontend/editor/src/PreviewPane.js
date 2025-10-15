const PreviewPane = ({ latexCode }) => {
    const { useState, useEffect } = React;
    const [processedContent, setProcessedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Simple LaTeX to HTML converter for basic preview
    const processLaTeX = (latex) => {
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
        return React.createElement('div', { className: 'loading' }, 'Processing LaTeX...');
    }

    return React.createElement('div', { className: 'preview-content' },
        React.createElement('div', {
            dangerouslySetInnerHTML: { __html: processedContent }
        }),
        React.createElement('style', null, `
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
        `)
    );
};

export default PreviewPane;
